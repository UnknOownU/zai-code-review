import * as core from '@actions/core';
import * as github from '@actions/github';
import { parseConfig } from './config';
import { getOctokit } from './github/client';
import { fetchPullRequestFiles, filterFiles } from './github/diff';
import { createReview, postSummaryComment, cleanOldComments, findSummaryComment } from './github/comments';
import { ZaiClient } from './ai/client';
import { reviewFiles } from './review/reviewer';
import { generateSummary } from './review/summarizer';
import { ReviewVerdict, Severity, FileDiff } from './review/types';
import { extractReviewedSha, getIncrementalDiff, embedReviewedSha } from './review/incremental';
import { handleChatEvent } from './chat/handler';
import { canAutofix, detectForkPR } from './autofix/suggestions';
import { commitSuggestions } from './autofix/commit';

async function run(): Promise<void> {
  core.info('=== Z.ai Code Review Action Starting ===');

  const eventName = github.context.eventName;

  // Route chat events (issue_comment, pull_request_review_comment) to the chat handler
  if (eventName === 'issue_comment' || eventName === 'pull_request_review_comment') {
    // For issue_comment, ensure it's on a PR (not a plain issue)
    if (eventName === 'issue_comment' && !github.context.payload.issue?.pull_request) {
      core.info('Comment is on an issue, not a PR. Skipping.');
      return;
    }

    const config = await parseConfig();
    if (!config.chatEnabled) {
      core.info('Chat commands are disabled (chat_enabled: false). Skipping.');
      return;
    }

    const octokit = getOctokit(config.githubToken);
    const aiClient = new ZaiClient({
      apiKey: config.zaiApiKey,
      baseUrl: config.zaiBaseUrl,
      model: config.zaiModel,
      useCodingPlan: config.useCodingPlan,
      language: config.language,
      enableThinking: config.enableThinking,
    });
    await handleChatEvent(octokit, aiClient, config);
    return;
  }

  // Only process pull_request events for the review flow
  if (eventName !== 'pull_request') {
    core.warning(`Unsupported event type: ${eventName}. Skipping.`);
    return;
  }

  const config = await parseConfig();
  core.info('Configuration parsed successfully.');

  const octokit = getOctokit(config.githubToken);
  const aiClient = new ZaiClient({
    apiKey: config.zaiApiKey,
    baseUrl: config.zaiBaseUrl,
    model: config.zaiModel,
    useCodingPlan: config.useCodingPlan,
    language: config.language,
    enableThinking: config.enableThinking,
  });

  // Find existing summary comment to extract last reviewed SHA
  const existingSummaryBody = await findSummaryComment(octokit, config.repoOwner, config.repoName, config.pullNumber);
  const lastReviewedSha = existingSummaryBody ? extractReviewedSha(existingSummaryBody) : null;

  core.info('Cleaning up old review comments...');
  await cleanOldComments(octokit, config.repoOwner, config.repoName, config.pullNumber);

  core.info('Fetching PR files...');
  let allFiles: FileDiff[];
  let isIncremental = false;

  if (config.incremental && lastReviewedSha && lastReviewedSha !== config.commitId) {
    const incrementalFiles = await getIncrementalDiff(octokit, config.repoOwner, config.repoName, lastReviewedSha, config.commitId);
    if (incrementalFiles !== null) {
      allFiles = incrementalFiles;
      isIncremental = true;
      core.info(`Incremental review: ${allFiles.length} files changed since ${lastReviewedSha.slice(0, 7)}`);
    } else {
      core.info('Force push detected or last SHA unavailable \u2014 performing full review');
      allFiles = await fetchPullRequestFiles(octokit, config.repoOwner, config.repoName, config.pullNumber);
    }
  } else {
    allFiles = await fetchPullRequestFiles(octokit, config.repoOwner, config.repoName, config.pullNumber);
  }

  if (allFiles.length === 0) {
    core.info('No files changed in this PR. Nothing to review.');
    await postSummaryComment(
      octokit,
      config.repoOwner,
      config.repoName,
      config.pullNumber,
      `## ${config.reviewerName} - Summary\n\nNo files to review in this PR.\n\n---\n*Powered by Z.ai*\n<!-- zai-code-review-marker -->`
    );
    return;
  }

  core.info(`Found ${allFiles.length} files in PR.`);

  const filesToReview = filterFiles(allFiles, config.excludePatterns, config.maxFiles);

  if (filesToReview.length === 0) {
    core.info('All files were filtered out. Nothing to review.');
    await postSummaryComment(
      octokit,
      config.repoOwner,
      config.repoName,
      config.pullNumber,
      `## ${config.reviewerName} - Summary\n\nNo files to review after filtering (all files matched exclude patterns or were binary).\n\n---\n*Powered by Z.ai*\n<!-- zai-code-review-marker -->`
    );
    return;
  }

  core.info(`Starting code review of ${filesToReview.length} files...`);
  const fileReviews = await reviewFiles(
    aiClient,
    filesToReview,
    config.zaiSystemPrompt,
    config.language,
    3, // concurrency
    config.customInstructions,
  );

  // Determine effective autofix mode (respects fork PR detection)
  const autofixDecision = canAutofix(config.autofixMode, detectForkPR(github.context.payload));

  const allComments = fileReviews
    .flatMap(r => r.comments)
    // Strip suggestions when autofix is disabled — don't render suggestion blocks
    .map(c => autofixDecision.mode === 'disabled' ? { ...c, suggestion: undefined } : c)
    .sort((a, b) => {
      const severityOrder = { [Severity.Critical]: 0, [Severity.Warning]: 1, [Severity.Info]: 2 };
      return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
    });

  const limitedComments = allComments.slice(0, config.maxComments);

  if (allComments.length > config.maxComments) {
    core.info(`Limited comments from ${allComments.length} to ${config.maxComments} (max_comments setting).`);
  }

  const prTitle = config.prTitle;
  const summary = await generateSummary(
    aiClient,
    prTitle,
    fileReviews,
    config.reviewerName,
    config.language,
    config.customInstructions,
  );

  if (limitedComments.length > 0) {
    core.info(`Creating review with ${limitedComments.length} inline comments...`);

    let reviewEvent: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' = 'COMMENT';
    if (summary.verdict === ReviewVerdict.RequestChanges) {
      reviewEvent = 'REQUEST_CHANGES';
    } else if (summary.verdict === ReviewVerdict.Approve && config.autoApprove) {
      reviewEvent = 'APPROVE';
    }

    const reviewBody = summary.keyFindings.length > 0
      ? `## ${config.reviewerName}\n\n` +
        summary.keyFindings
          .slice(0, 5)
          .map(f => `- **[${f.severity.toUpperCase()}]** \`${f.filePath}:${f.line}\` - ${f.message}`)
          .join('\n') +
        (summary.keyFindings.length > 5 ? `\n... and ${summary.keyFindings.length - 5} more findings.` : '')
      : `## ${config.reviewerName}\n\nReview complete. See inline comments for details.`;

    await createReview(
      octokit,
      config.repoOwner,
      config.repoName,
      config.pullNumber,
      config.commitId,
      limitedComments,
      reviewEvent,
      reviewBody
    );
  } else {
    core.info('No issues found. Posting summary only.');

    // If no issues and auto_approve is enabled, approve the PR
    if (config.autoApprove) {
      try {
        await octokit.pulls.createReview({
          owner: config.repoOwner,
          repo: config.repoName,
          pull_number: config.pullNumber,
          commit_id: config.commitId,
          body: `## ${config.reviewerName}\n\nNo issues found. LGTM! 👍`,
          event: 'APPROVE',
        });
        core.info('PR approved (no issues found).');
      } catch (error: any) {
        core.warning(`Failed to approve PR: ${error.message}`);
      }
    }
  }

  const reviewLabel = isIncremental ? ' [incremental]' : ' [full review]';
  const summaryWithLabel = summary.summaryText.replace(
    `## ${config.reviewerName}`,
    `## ${config.reviewerName}${reviewLabel}`
  );
  const summaryBodyWithSha = embedReviewedSha(summaryWithLabel, config.commitId);
  await postSummaryComment(
    octokit,
    config.repoOwner,
    config.repoName,
    config.pullNumber,
    summaryBodyWithSha
  );

  // Autofix: commit suggestions directly to branch if mode is 'commit'
  if (autofixDecision.mode === 'commit' && limitedComments.some(c => c.suggestion)) {
    core.info('Autofix commit mode: applying suggestion fixes to branch...');
    try {
      const result = await commitSuggestions(
        octokit,
        config.repoOwner,
        config.repoName,
        github.context.payload.pull_request?.head?.ref ?? '',
        limitedComments,
        config.commitId,
        'fix: apply Z.ai code review suggestions'
      );
      if (result.committed) {
        core.info(`Autofix: committed ${result.sha?.slice(0, 7)} to branch`);
      } else {
        core.info(`Autofix: no commit made — ${result.reason}`);
      }
    } catch (error: any) {
      core.warning(`Autofix commit failed: ${error.message}`);
    }
  } else if (autofixDecision.mode !== 'disabled' && autofixDecision.reason) {
    core.info(`Autofix: ${autofixDecision.reason}`);
  }

  core.info('=== Review Complete ===');
  core.info(`Files reviewed: ${fileReviews.length}`);
  core.info(`Comments posted: ${limitedComments.length}`);
  core.info(`Critical: ${summary.criticalCount} | Security: ${summary.securityCount} | Warnings: ${summary.warningCount} | Info: ${summary.suggestionCount}`);
  core.info(`Verdict: ${summary.verdict}`);

  core.setOutput('review_status', summary.verdict);
  core.setOutput('comments_count', limitedComments.length.toString());
  core.setOutput('critical_count', summary.criticalCount.toString());
  core.setOutput('security_count', summary.securityCount.toString());
  core.setOutput('warning_count', summary.warningCount.toString());
}

run().catch((error: Error) => {
  core.error(`Fatal error: ${error.message}`);
  core.error(`Stack trace: ${error.stack}`);
  core.setFailed(`Z.ai Code Review failed: ${error.message}`);
});

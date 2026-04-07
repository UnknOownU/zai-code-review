import * as core from '@actions/core';
import { parseConfig } from './config';
import { getOctokit } from './github/client';
import { fetchPullRequestFiles, filterFiles } from './github/diff';
import { createReview, postSummaryComment, cleanOldComments } from './github/comments';
import { ZaiClient } from './ai/client';
import { reviewFiles } from './review/reviewer';
import { generateSummary } from './review/summarizer';
import { ReviewVerdict, Severity } from './review/types';

async function run(): Promise<void> {
  core.info('=== Z.ai Code Review Action Starting ===');

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

  core.info('Cleaning up old review comments...');
  await cleanOldComments(octokit, config.repoOwner, config.repoName, config.pullNumber);

  core.info('Fetching PR files...');
  const allFiles = await fetchPullRequestFiles(
    octokit,
    config.repoOwner,
    config.repoName,
    config.pullNumber
  );

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

  const allComments = fileReviews
    .flatMap(r => r.comments)
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

  await postSummaryComment(
    octokit,
    config.repoOwner,
    config.repoName,
    config.pullNumber,
    summary.summaryText
  );

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

import { describe, expect, test, vi } from 'vitest';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
}));

import { parseFileReviewResponse, parseSummaryResponse } from './parser';

describe('parseFileReviewResponse', () => {
  test('extracts findings from clean JSON', () => {
    const response = JSON.stringify({
      findings: [
        {
          line: 7,
          severity: 'high',
          category: 'bug',
          title: 'Off-by-one error',
          description: 'Loop skips the last item.',
        },
      ],
    });

    expect(parseFileReviewResponse(response)).toEqual({
      findings: [
        {
          line: 7,
          severity: 'critical',
          category: 'bug',
          title: 'Off-by-one error',
          description: 'Loop skips the last item.',
        },
      ],
    });
  });

  test('returns empty findings for an empty findings array', () => {
    expect(parseFileReviewResponse('{"findings":[]}')).toEqual({ findings: [] });
  });

  test('extracts JSON wrapped in markdown code blocks', () => {
    const response = [
      '```json',
      '{',
      '  "findings": [',
      '    {',
      '      "line": 3,',
      '      "severity": "warning",',
      '      "category": "performance",',
      '      "title": "Repeated query",',
      '      "description": "Consider batching calls."',
      '    }',
      '  ]',
      '}',
      '```',
    ].join('\n');

    expect(parseFileReviewResponse(response).findings).toEqual([
      {
        line: 3,
        severity: 'warning',
        category: 'performance',
        title: 'Repeated query',
        description: 'Consider batching calls.',
      },
    ]);
  });

  test('extracts JSON when extra text appears before and after it', () => {
    const response = [
      'I found one issue worth flagging.',
      '{"findings":[{"line":12,"severity":"medium","category":"style","title":"Naming","description":"Use a clearer variable name."}]}',
      'Please review carefully.',
    ].join('\n');

    expect(parseFileReviewResponse(response).findings).toEqual([
      {
        line: 12,
        severity: 'warning',
        category: 'style',
        title: 'Naming',
        description: 'Use a clearer variable name.',
      },
    ]);
  });

  test('falls back to text parsing for malformed JSON', () => {
    const response = '{"findings":[{"severity":"high",}]\nLine 42: Critical bug in conditional branch';
    const parsed = parseFileReviewResponse(response);

    expect(parsed.findings).toHaveLength(1);
    expect(parsed.findings[0]).toMatchObject({
      line: 42,
      severity: 'critical',
      category: 'improvement',
    });
    expect(parsed.findings[0].description).toContain('Line 42');
  });

  test('uses defaults when fields are missing', () => {
    const parsed = parseFileReviewResponse('{"findings":[{"category":"unknown"}]}');

    expect(parsed.findings).toEqual([
      {
        line: 1,
        severity: 'info',
        category: 'improvement',
        title: 'Issue found',
        description: '',
      },
    ]);
  });

  test('preserves all optional fields including suggestion', () => {
    const suggestion = `const query = sql\`SELECT * FROM users WHERE id = \${id}\`;`;

    const parsed = parseFileReviewResponse(
      JSON.stringify({
        findings: [
          {
            line: 9,
            severity: 'critical',
            category: 'security',
            title: 'Unsafe interpolation',
            description: 'User input reaches SQL directly.',
            suggestion,
          },
        ],
      })
    );

    expect(parsed.findings).toEqual([
      {
        line: 9,
        severity: 'critical',
        category: 'security',
        title: 'Unsafe interpolation',
        description: 'User input reaches SQL directly.',
        suggestion,
      },
    ]);
  });
});

describe('parseSummaryResponse', () => {
  test('extracts valid summary JSON', () => {
    const response = JSON.stringify({
      changes: ['Adds validation for review payloads'],
      attentionPoints: ['Watch large pull requests'],
      verdict: 'approve',
      summary: 'The change is safe and well-scoped.',
    });

    expect(parseSummaryResponse(response)).toEqual({
      changes: ['Adds validation for review payloads'],
      attentionPoints: ['Watch large pull requests'],
      verdict: 'approve',
      summary: 'The change is safe and well-scoped.',
    });
  });

  test('returns empty arrays when arrays are empty or missing', () => {
    const parsed = parseSummaryResponse('{"verdict":"approve","summary":"Looks good."}');

    expect(parsed).toEqual({
      changes: [],
      attentionPoints: [],
      verdict: 'approve',
      summary: 'Looks good.',
    });
  });

  test('defaults invalid verdict values to comment', () => {
    const parsed = parseSummaryResponse('{"changes":[],"attentionPoints":[],"verdict":"ship-it-now","summary":"Needs a manual review."}');

    expect(parsed.verdict).toBe('comment');
    expect(parsed.summary).toBe('Needs a manual review.');
  });

  test('uses raw text as fallback summary for non-JSON responses', () => {
    const response = 'Overall this looks promising, but the retry branch still needs attention.';

    expect(parseSummaryResponse(response)).toEqual({
      changes: [],
      attentionPoints: [],
      verdict: 'comment',
      summary: response,
    });
  });
});

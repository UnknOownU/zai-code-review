import { describe, expect, test } from 'vitest';

import { parseCommand } from './parser';

describe('parseCommand', () => {
  test('parses explain commands with arguments', () => {
    expect(parseCommand('/zai-review explain why is this O(n²)?')).toEqual({
      command: 'explain',
      args: 'why is this O(n²)?',
    });
  });

  test('parses review commands without arguments', () => {
    expect(parseCommand('/zai-review review')).toEqual({
      command: 'review',
      args: '',
    });
  });

  test('ignores normal comments', () => {
    expect(parseCommand('Great PR, looks good!')).toBeNull();
  });

  test('returns null when the subcommand is missing', () => {
    expect(parseCommand('/zai-review')).toBeNull();
  });

  test('returns null for unknown subcommands', () => {
    expect(parseCommand('/zai-review unknown-cmd')).toBeNull();
  });

  test('parses commands case-insensitively', () => {
    expect(parseCommand('/ZAI-REVIEW EXPLAIN this')).toEqual({
      command: 'explain',
      args: 'this',
    });
  });
});

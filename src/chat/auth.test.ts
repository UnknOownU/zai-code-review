import { describe, expect, test } from 'vitest';

import { type CommentActor, isAuthorized } from './auth';

function createActor(authorAssociation: string, userOverrides: Partial<CommentActor['user']> = {}): CommentActor {
  return {
    author_association: authorAssociation,
    user: {
      type: 'User',
      login: 'octocat',
      ...userOverrides,
    },
  };
}

describe('isAuthorized', () => {
  test('allows owners by default', () => {
    expect(isAuthorized(createActor('OWNER'))).toBe(true);
  });

  test('allows members by default', () => {
    expect(isAuthorized(createActor('MEMBER'))).toBe(true);
  });

  test('allows collaborators by default', () => {
    expect(isAuthorized(createActor('COLLABORATOR'))).toBe(true);
  });

  test('rejects contributors by default', () => {
    expect(isAuthorized(createActor('CONTRIBUTOR'))).toBe(false);
  });

  test('rejects actors with no association', () => {
    expect(isAuthorized(createActor('NONE'))).toBe(false);
  });

  test('always rejects bot users', () => {
    expect(isAuthorized(createActor('MEMBER', { type: 'Bot' }))).toBe(false);
  });

  test('supports custom allowed roles', () => {
    expect(isAuthorized(createActor('CONTRIBUTOR'), ['OWNER', 'CONTRIBUTOR'])).toBe(true);
  });

  test('rejects bot-style logins', () => {
    expect(isAuthorized(createActor('OWNER', { login: 'dependabot[bot]' }))).toBe(false);
  });
});

export type AuthorAssociation =
  | 'OWNER'
  | 'MEMBER'
  | 'COLLABORATOR'
  | 'CONTRIBUTOR'
  | 'FIRST_TIME_CONTRIBUTOR'
  | 'FIRST_TIMER'
  | 'NONE';

export interface CommentActor {
  author_association: AuthorAssociation | string;
  user: {
    type: string;
    login: string;
  };
}

const DEFAULT_ALLOWED_ROLES = ['OWNER', 'MEMBER', 'COLLABORATOR'];

// Check if a comment actor is authorized to trigger chat commands
export function isAuthorized(actor: CommentActor, allowedRoles: string[] = DEFAULT_ALLOWED_ROLES): boolean {
  if (actor.user.type === 'Bot') {
    return false;
  }

  if (actor.user.login.endsWith('[bot]')) {
    return false;
  }

  return allowedRoles.includes(actor.author_association);
}

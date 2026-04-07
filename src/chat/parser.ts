export type ChatCommand = 'explain' | 'review' | 'fix' | 'help' | 'config';

export interface ParsedCommand {
  command: ChatCommand;
  args: string;
}

const CHAT_COMMANDS: ReadonlySet<ChatCommand> = new Set(['explain', 'review', 'fix', 'help', 'config']);
const COMMAND_PREFIX = /^\/zai-review\b/i;

// Parse a comment body for /zai-review commands
export function parseCommand(body: string): ParsedCommand | null {
  const trimmedBody = body.trim();
  const prefixMatch = trimmedBody.match(COMMAND_PREFIX);

  if (!prefixMatch) {
    return null;
  }

  const remainder = trimmedBody.slice(prefixMatch[0].length).trim();

  if (!remainder) {
    return null;
  }

  const subcommandMatch = remainder.match(/^(\S+)(?:\s+([\s\S]*))?$/);

  if (!subcommandMatch) {
    return null;
  }

  const command = subcommandMatch[1].toLowerCase() as ChatCommand;

  if (!CHAT_COMMANDS.has(command)) {
    return null;
  }

  return {
    command,
    args: (subcommandMatch[2] ?? '').trim(),
  };
}

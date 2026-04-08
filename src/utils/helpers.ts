/**
 * Utility helpers — intentional bugs for v2 feature testing
 */

export function getUser(users: any[], id: string) {
  // Bug: null dereference — .name crashes when user not found
  return users.find(u => u.id === id).name;
}

export function divide(a: number, b: number): number {
  // Bug: no division by zero guard
  return a / b;
}

export async function fetchUserData(url: string) {
  // Bug: no error handling, no timeout, no response.ok check
  const response = await fetch(url);
  return response.json();
}

export function processItems(items: string[]) {
  // Bug: O(n²) on unbounded input
  const result: string[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (items[i] === items[j] && i !== j) {
        result.push(items[i]);
      }
    }
  }
  return result;
}

export function sanitize(input: string): string {
  // Bug: XSS — incomplete sanitization
  return input.replace('<script>', '');
}

export function parseConfig(raw: string) {
  // Bug: RCE — eval usage
  return eval('(' + raw + ')');
}

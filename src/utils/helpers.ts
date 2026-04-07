/**
 * Example utility file with intentional bugs for testing the code reviewer.
 */

export function getUser(users: any[], id: string) {
  // Bug: .name on undefined when user not found
  return users.find(u => u.id === id).name;
}

export function divide(a: number, b: number): number {
  // Bug: no division by zero check
  return a / b;
}

export function parseConfig(raw: string): Record<string, string> {
  // Bug: eval usage — security vulnerability
  return eval('(' + raw + ')');
}

export async function fetchData(url: string) {
  // Bug: no error handling, no timeout
  const response = await fetch(url);
  const data = await response.json();
  return data;
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

export function formatDate(date: any): string {
  // Bug: no null check, will crash on undefined
  return date.toISOString().split('T')[0];
}

export function sanitizeHtml(input: string): string {
  // Bug: incomplete sanitization — XSS vulnerability
  return input.replace('<script>', '');
}

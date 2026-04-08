// Intentional bugs for validation testing

export function getUser(users: any[], id: string) {
  return users.find(u => u.id === id).name; // null deref
}

export function parseConfig(raw: string) {
  return eval('(' + raw + ')'); // RCE — should be flagged as critical per instructions
}

export function fetchData(url: string) {
  return fetch(url).then(r => r.json()); // missing response.ok check
}

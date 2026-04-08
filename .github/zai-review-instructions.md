# Review Instructions

- This is a TypeScript GitHub Action project. Focus on runtime safety.
- Flag any use of `eval()` as critical security issues.
- Flag any missing `response.ok` checks in fetch calls as bugs.
- Prioritize null dereference risks and missing error handling.
- Mention O(n²) complexity issues on unbounded arrays.

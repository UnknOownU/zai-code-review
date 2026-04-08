# Review Instructions

This is a TypeScript GitHub Action project. Apply these rules on every review:

- Flag any use of `eval()` or `new Function()` as **critical** security issues — suggest `JSON.parse()` instead.
- Flag missing `response.ok` checks in `fetch()` calls as bugs.
- Flag `as any` TypeScript casts as warnings — suggest proper typing.
- Prioritize null/undefined dereference risks and missing error handling.
- Flag O(n²) or worse complexity on unbounded arrays as performance issues.
- Do not comment on test files (`*.test.ts`) unless there is a logic error.

- Task 1: Enforced config size limits after base64 decoding using UTF-8 byte length checks (10KB for YAML config, 20KB for markdown instructions).
- Task 1: Centralized file fetching in `readRepoFile()` so config and instructions share identical 404/error handling while keeping schema validation isolated in `validateConfig()`.

- Audit (2026-04-08): Plan compliance verdict should remain REJECT until autofix mode is integrated into the runtime review path so disabled/suggest/commit modes have observable behavior beyond configuration parsing.

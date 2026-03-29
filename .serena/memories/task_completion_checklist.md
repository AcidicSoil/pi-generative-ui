# Task completion checklist

- Review `package.json`, runtime code in `.pi/extensions/generative-ui/index.ts`, and README for consistency.
- Because no lint/test scripts are defined, use targeted inspection/manual verification for changed areas.
- For cross-platform/W​SL work, verify package metadata, import paths, environment handling, user-visible error surfacing, and docs all agree.
- Preserve the existing widget protocol and streaming pipeline unless a task explicitly requires changing them.
- After code changes, inspect diffs carefully and note any remaining manual runtime checks that require an actual macOS or WSL environment.
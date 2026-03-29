# Style and conventions

- Language: TypeScript in ESM-style source files under `.pi/extensions/generative-ui/`.
- Formatting observed in `index.ts`: semicolons, double-quoted strings, trailing commas in multiline objects/arrays, and 2-space indentation inside object literals/callbacks.
- Code organization: small helper functions near the top (`shellHTML`, `wrapHTML`, `escapeJS`), then the default exported extension function containing lazy initialization, streaming state, event handlers, and tool registration.
- Comments are used as concise section dividers (`// ── ... ──`) and short explanatory notes above helpers/critical logic.
- Runtime/tool definitions rely on TypeBox schemas and pi extension APIs; preserve existing tool contracts unless a task explicitly calls for metadata changes.
- For this repo’s current ticket set, prefer minimal targeted edits and preserve the existing streaming/widget protocol rather than redesigning architecture.
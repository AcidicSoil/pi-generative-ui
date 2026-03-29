# pi-generative-ui overview

- Purpose: A pi extension that renders LLM-generated interactive HTML/SVG widgets through Glimpse, with live streaming updates while the tool call is being generated.
- Main runtime entrypoint: `.pi/extensions/generative-ui/index.ts`.
- Supporting files: `guidelines.ts` provides extracted widget design guidance; `svg-styles.ts` contains shared SVG styles; `claude-guidelines/` stores raw/reference guideline markdown.
- Packaging: `package.json` defines the extension package and peer dependencies on pi packages.
- Platform status in current repo state: README and package metadata are macOS-oriented, but `.plans/` defines a scoped cross-platform/WSL portability cut.
- Codebase shape is small: root docs/package files plus one extension directory with the runtime logic and guideline assets.
- Key runtime concepts retained by the ticket plan: `visualize_read_me`, `show_widget`, `message_update` streaming interception, shell HTML streaming, morphdom-based incremental updates, `window._setContent(...)`, `window._runScripts()`, `window.glimpse.send(data)`, and the `execute()` lifecycle.
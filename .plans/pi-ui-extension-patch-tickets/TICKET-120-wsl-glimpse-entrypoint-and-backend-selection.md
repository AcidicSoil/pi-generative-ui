---
ticket_id: "tkt_a84c6e74_glimpse_entry_backend"
title: "Extension runtime loads Glimpse through the package entrypoint and selects a WSL-safe backend"
agent: "codex"
done: false
goal: "The extension loads Glimpse through its supported package entrypoint and defaults WSL to the Chromium backend without changing the existing widget protocol."
---

## Tasks
- In `.pi/extensions/generative-ui/index.ts`, replace the hardcoded dynamic import of `node_modules/glimpseui/src/glimpse.mjs` with a dynamic import of `glimpseui`.
- Add WSL-aware Linux handling so `GLIMPSE_BACKEND=chromium` is set when running on Linux in WSL unless the user has already set `GLIMPSE_BACKEND`.
- Preserve the existing tool contract and streaming pipeline while making the import and backend-selection changes.

## Acceptance criteria
- `index.ts` no longer depends on a hardcoded internal path under `node_modules/glimpseui/src/`.
- When running on Linux in WSL, the extension defaults to the Chromium backend only if the user has not already overridden `GLIMPSE_BACKEND`.
- The change does not rewrite `visualize_read_me`, `show_widget`, `message_update` interception, `shellHTML()`, `morphdom` streaming updates, `window._setContent(...)`, `window._runScripts()`, `window.glimpse.send(data)`, or the `execute()` promise lifecycle.

## Tests
- Inspect `.pi/extensions/generative-ui/index.ts` and verify the Glimpse import resolves from the package entrypoint rather than a package-internal file path.
- Inspect `.pi/extensions/generative-ui/index.ts` and verify the WSL code path sets `GLIMPSE_BACKEND=chromium` only when the environment has not already set that variable.
- Review the touched code and verify the listed widget protocol and streaming components remain intact.

## Notes
- Source: "Stop importing Glimpse by hardcoded path inside `node_modules`"; "Import the package entrypoint instead"; "if `process.platform === "linux"` and WSL is detected, set `GLIMPSE_BACKEND=chromium` unless already set".
- Constraints: "The core widget pipeline does not need to be redesigned."
- Evidence: The source explicitly lists `open(html, options)`, `win.send(js)`, `message` / `closed` / `error`, and `window.glimpse.send(data)` as the relied-on Glimpse API surface.
- Dependencies: `TICKET-100-cross-platform-glimpse-package-metadata.md`
- Unknowns: The exact existing WSL-detection helper, if any, is not provided.

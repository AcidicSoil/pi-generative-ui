# Cross-platform / WSL port and tooling changes

## Summary
Implemented the scoped cross-platform compatibility cut for `pi-generative-ui`, focused on Glimpse runtime portability to Linux/WSL while preserving the existing widget protocol and streaming architecture. Also added a minimal repo-local validation baseline with TypeScript and Prettier scripts.

## Files changed
- `package.json`
- `package-lock.json`
- `.pi/extensions/generative-ui/index.ts`
- `README.md`
- `tsconfig.json`

## Package and install changes
- Upgraded `glimpseui` from `^0.3.5` to `^0.6.2`.
- Removed the darwin-only package install gate.
- Added `engines.node: >=18`.
- Updated package description to cross-platform wording.
- Refreshed `package-lock.json` to resolve the newer Glimpse package.

## Runtime changes in `.pi/extensions/generative-ui/index.ts`
- Replaced the hardcoded Glimpse import path under `node_modules/glimpseui/src/` with `await import("glimpseui")`.
- Added WSL detection.
- Defaulted WSL to `GLIMPSE_BACKEND=chromium` only when the user has not already set `GLIMPSE_BACKEND`.
- Preserved the existing `visualize_read_me` tool, `show_widget` tool shape, streaming interception, shell HTML, morphdom updates, `window._setContent(...)`, `window._runScripts()`, `window.glimpse.send(data)`, and `execute()` lifecycle.
- Removed the silent streaming failure path and now store/log backend errors so startup/update failures are diagnosable.
- Surfaced stored streaming errors in `show_widget.execute()`.
- Updated `show_widget` model-facing metadata to describe a cross-platform Glimpse renderer rather than a macOS-only WKWebView window.

## Documentation changes
- Removed the README's macOS-only claim.
- Documented WSL/Linux requirements:
  - Node 18+
  - GUI support
  - WSL2 with WSLg enabled
  - Chromium backend expectation on WSL
  - Linux-visible Chromium/Chrome executable requirement
  - `GLIMPSE_CHROME_PATH` override for browser discovery issues
- Updated Glimpse wording to describe macOS and Linux/WSL behavior accurately.

## Tooling added
- Added `typescript` and `prettier` as devDependencies.
- Added `tsconfig.json`.
- Added package scripts:
  - `typecheck`
  - `format`
  - `format:check`
  - `lint`
  - `test`
- Ran formatting and validated that `npm run lint` passes.

## Remaining recommended work
- Perform manual runtime smoke tests on macOS and WSL2 + WSLg.
- Verify the visible-error path for missing Chromium/browser backends on WSL.
- Complete the human review/signoff task corresponding to the final review ticket.
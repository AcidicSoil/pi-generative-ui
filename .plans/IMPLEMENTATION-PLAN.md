# Cross-platform / WSL implementation plan

## Goal
Deliver the scoped WSL/cross-platform portability cut described by the ticket set without redesigning the widget protocol or streaming architecture.

## Constraints to preserve
The following must remain functionally intact unless a later ticket explicitly says otherwise:
- `visualize_read_me`
- `show_widget` tool shape
- `message_update` interception
- `shellHTML()`
- `morphdom` streaming updates
- `window._setContent(...)`
- `window._runScripts()`
- `window.glimpse.send(data)`
- `execute()` promise lifecycle

## Recommended execution order

### 1) Package metadata foundation (`TICKET-100`)
Update `package.json` first so runtime work targets the supported Glimpse package surface.

Work:
- Bump `glimpseui` from `^0.3.5` to `^0.6.2` or newer.
- Remove the `os: ["darwin"]` install gate or broaden it to include Linux.
- Add or align `engines.node` to `>=18` if package metadata records a Node floor.

Why first:
- `TICKET-120` depends on importing the supported Glimpse package entrypoint, which should be aligned with the upgraded package version.

Validation:
- Inspect `package.json` for the new `glimpseui` range.
- Confirm Linux installs are no longer blocked by package metadata.
- Confirm any declared Node floor matches modern Glimpse requirements.

### 2) Runtime import + WSL backend selection (`TICKET-120`)
Make the smallest runtime change needed in `.pi/extensions/generative-ui/index.ts`.

Work:
- Replace the hardcoded dynamic import of `node_modules/glimpseui/src/glimpse.mjs` with `await import("glimpseui")`.
- Add a small WSL detection helper.
- Before opening Glimpse on Linux/WSL, set `process.env.GLIMPSE_BACKEND = "chromium"` only when:
  - `process.platform === "linux"`
  - WSL is detected
  - `process.env.GLIMPSE_BACKEND` is not already set
- Keep the current streaming state machine and widget protocol unchanged.

Implementation notes:
- Prefer a compact helper that checks common WSL markers (for example environment markers and `/proc/version` text) rather than introducing a large dependency.
- Keep backend selection close to Glimpse initialization so the behavior is easy to reason about.

Validation:
- No hardcoded import path under `node_modules/glimpseui/src/` remains.
- WSL defaults to Chromium only when the user has not overridden the backend.
- The streaming pipeline remains structurally the same.

### 3) Error visibility for backend failures (`TICKET-140`)
Make startup/update failures diagnosable without changing the workflow.

Work:
- Remove the empty `catch {}` around streaming window creation and update logic.
- Surface the actual error through the extension’s observable path (throw, log, or otherwise expose the backend failure in a way the caller can see).

Implementation notes:
- Preserve the debounce/update flow.
- Include the original error details so common failures like missing Chromium are understandable.
- Avoid swallowing errors in both first-open and subsequent-send paths.

Validation:
- No empty catch block remains in the streaming path.
- A failed backend launch/update produces a visible error message.

### 4) Cross-platform tool metadata (`TICKET-160`)
Update only model-facing strings in `show_widget`.

Work:
- Rewrite `show_widget.description`.
- Rewrite `show_widget.promptSnippet`.
- Rewrite `show_widget.promptGuidelines` entries that describe the renderer.

Content goals:
- Remove macOS-only framing like “native macOS window” and “WKWebView” as the sole runtime description.
- Replace it with cross-platform Glimpse wording.
- Keep the guidance accurate by noting that macOS uses WKWebView while Linux/WSL uses Chromium or WebKitGTK-backed rendering, without changing the tool contract.

Validation:
- No macOS-only wording remains in those fields.
- The wording matches the actual runtime posture after `TICKET-120`.

### 5) README / installation docs (`TICKET-180`)
Bring docs in line with the implemented runtime behavior.

Work:
- Remove the “macOS only” claim.
- Add WSL guidance covering:
  - WSL2 with WSLg enabled
  - GUI support requirement
  - Chromium backend expectation on WSL
  - Need for a Linux-visible Chromium/Chrome executable
  - `GLIMPSE_CHROME_PATH` as an override when browser discovery fails
  - Node version compatibility with the updated Glimpse requirement
- Keep the docs focused on the supported path rather than proposing a new renderer architecture.

Validation:
- README no longer claims macOS-only support.
- WSL prerequisites and browser/backend expectations are explicit.
- Runtime docs reflect the actual code behavior.

### 6) Final review / signoff (`TICKET-900`)
Do this after the code and docs changes are complete.

Review checklist:
- Confirm all mandatory source changes were implemented:
  - Glimpse upgrade
  - darwin-only package gate removal
  - package-entrypoint import
  - WSL Chromium default
  - surfaced backend errors
  - updated prompt/docs text
- Confirm the retained widget protocol pieces were not rewritten.
- Record any gaps or environment-specific validation still pending.

## Suggested file touch list
- `package.json`
- `.pi/extensions/generative-ui/index.ts`
- `README.md`

## Risk notes
- Runtime validation of the WSL path may still need an actual WSL environment with WSLg and Chromium installed.
- The highest-value failure mode to make visible is missing Chromium/Chrome on Linux/WSL.
- Avoid broad refactors in `index.ts`; the plan’s value comes from a narrow compatibility cut.

## Definition of done
The package installs on Linux/WSL without metadata rejection, the runtime imports Glimpse via its public package entrypoint, WSL defaults to Chromium when appropriate, backend failures are visible, model-facing strings are cross-platform, docs explain the WSL path, and the original widget streaming protocol remains intact.
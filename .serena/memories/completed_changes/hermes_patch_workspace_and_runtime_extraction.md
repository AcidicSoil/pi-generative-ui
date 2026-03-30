Implemented the repo-local portion of the `.plans/pi-generative-ui-hermes-patch-tickets/` effort.

What changed:
- Added `.plans/pi-generative-ui-hermes-patch-tickets/IMPLEMENTATION-PLAN.md` with a staged implementation plan and explicit repo-local scope boundaries.
- Scaffolded package/workspace layout:
  - `packages/runtime-core`
  - `packages/mcp-sidecar`
  - `packages/pi-compat`
  - `packages/hermes-plugin`
  - `tests/fixtures`, `tests/unit`, `tests/integration`
- Extracted reusable runtime pieces from `.pi/extensions/generative-ui/index.ts` into `packages/runtime-core/src/`:
  - `glimpse/platform.ts` for WSL/backend detection and lazy glimpse loading
  - `shell/html.ts` for `shellHTML`, `wrapHTML`, and `escapeJS`
  - `renderer/streaming.ts` for the streaming `show_widget` controller and normalized widget args
  - `sessions/registry.ts` for widget-session tracking
  - `types/index.ts` for host-neutral runtime interfaces
- Replaced the old monolithic Pi extension entrypoint with a thin adapter:
  - `.pi/extensions/generative-ui/index.ts` now delegates to `packages/pi-compat/src/index.ts`
- Implemented `packages/pi-compat/src/index.ts` as the Pi host binding layer that:
  - registers `visualize_read_me`
  - registers `show_widget`
  - wires Pi `message_update` events into the extracted streaming controller
  - preserves shutdown cleanup behavior
- Implemented `packages/mcp-sidecar/src/server/create-sidecar.ts` as a fallback sidecar surface with methods for:
  - `visualizeReadMe`
  - `openWidget`
  - `patchWidget`
  - `finalizeWidget`
  - `widgetEvent`
  - `closeWidget`
  - `cleanupOrphans`
- Added a shallow `packages/hermes-plugin` scaffold with lifecycle hook placeholders only and an explicit no-renderer README.
- Added golden fixtures under `tests/fixtures/golden/` for:
  - streaming show-widget expectations
  - fallback sidecar flow sequence
  - WSL backend expectation
- Added tests:
  - `tests/unit/runtime-core.test.ts`
  - `tests/integration/sidecar-flow.test.ts`
- Updated root config/tooling:
  - `package.json` now includes workspaces and test compile/run scripts
  - `tsconfig.json` now includes packages/tests
  - added `tsconfig.tests.json`
  - `.gitignore` now ignores `.tmp-tests/`

Ticket status updated in plan files:
- `TICKET-010`: `done: true`
- `TICKET-020`: `done: true`
- `TICKET-030`: `done: true`
- `TICKET-040`: `done: true`

Verification:
- Ran `npm test` successfully.
- Passing coverage currently verifies:
  - shell/morphdom streaming hooks exist
  - SVG fallback wrapping stays intact
  - WSL backend expectation resolves to chromium when configured
  - streaming controller opens early and finalizes with script execution
  - sidecar fallback open/patch/finalize/event/close sequence works

Important limitations:
- Did not mark TICKET-050+ done because Hermes core is not present in this repository.
- `packages/hermes-plugin` is only a scaffold; real Hermes lifecycle wiring and structured stream-event patches remain external work.
- Tickets `070`–`090` remain blocked on the Hermes codebase; `100` remains a human review gate.
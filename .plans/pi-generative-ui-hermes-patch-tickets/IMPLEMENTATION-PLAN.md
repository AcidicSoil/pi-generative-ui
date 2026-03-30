# Hermes patch ticket implementation plan

## Scope
This repository does not contain Hermes itself, so the implementation here focuses on the ticket work that can be completed inside `pi-generative-ui` without inventing a second renderer:

1. scaffold the host-adapter workspace layout,
2. freeze the current Pi runtime behavior with local fixtures/tests,
3. extract the reusable widget/runtime pieces into a host-neutral TypeScript core,
4. add a TypeScript sidecar fallback surface around that core,
5. add a thin Pi compatibility adapter and a shallow Hermes plugin scaffold.

Tickets `070`–`100` depend on a separate Hermes codebase or a human review gate, so this repo will leave them prepared but not falsely marked complete.

## Ordered work plan

### Phase 1 — workspace and package boundaries
- Add `packages/runtime-core`, `packages/mcp-sidecar`, `packages/pi-compat`, `packages/hermes-plugin`, and `tests`.
- Keep the existing Glimpse renderer/runtime behavior as the source of truth.
- Make `.pi/extensions/generative-ui/index.ts` a thin adapter entrypoint.

### Phase 2 — freeze current behavior
- Capture golden expectations for:
  - WSL backend resolution,
  - shell HTML behavior,
  - streaming `show_widget` early-open / patch / finalize flow,
  - sidecar fallback open / patch / finalize / close flow.
- Add regression tests that run without Hermes.

### Phase 3 — extract host-neutral runtime core
- Move platform helpers, shell helpers, streaming controller, and session registry into `runtime-core`.
- Keep host bindings injected through interfaces (`open`, `window.send`, `window.close`, event listeners).
- Preserve the existing Pi semantics: debounced updates, early shell open, final `window._runScripts()`, and shutdown cleanup.

### Phase 4 — add adapters
- Implement `pi-compat` as the thin host binding layer that registers Pi tools/events but delegates runtime behavior to `runtime-core`.
- Implement `mcp-sidecar` as the fallback session-oriented tool surface (`open_widget`, `patch_widget`, `finalize_widget`, `close_widget`, `widget_event`, `visualize_read_me`).
- Implement `hermes-plugin` as a no-renderer scaffold for lifecycle glue and future tool/session cleanup integration.

### Phase 5 — verification and ticket status
- Update root tooling/scripts to include the new package layout and tests.
- Mark the tickets that are materially satisfied in this repository.
- Leave Hermes-core-patch tickets explicitly pending.

## Expected repo-local outcomes
- `TICKET-010`: complete
- `TICKET-020`: complete for repo-local regression coverage
- `TICKET-030`: complete for extractable runtime pieces in this repo
- `TICKET-040`: complete as a local TypeScript sidecar/fallback implementation
- `TICKET-050`: partial scaffold only, because real Hermes hooks are outside this repo
- `TICKET-060`: partial, covered by local fallback integration tests but not a real Hermes run
- `TICKET-070`–`TICKET-090`: blocked on Hermes repo
- `TICKET-100`: blocked on user review

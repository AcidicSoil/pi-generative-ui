---
ticket_id: "tkt_wsl_hermes_040_build_sidecar_fallback"
title: "TypeScript sidecar owns widget sessions and exposes fallback MCP widget tools"
agent: "codex"
done: true
goal: "A TypeScript sidecar wraps the runtime core, owns all window state, and provides the no-core-patch MCP tool surface needed for Hermes integration."
---

## Tasks
- Implement a TypeScript sidecar around `runtime-core` as the only process allowed to open, patch, finalize, and close widget windows.
- Expose an MCP surface for `visualize_read_me`, `open_widget`, `patch_widget`, `finalize_widget`, `close_widget`, and `widget_event`.
- Add a local control/event surface for session start/end, telemetry/debug, and orphan cleanup.
- Keep `show_widget` out of the primary model-facing path until Hermes streaming events exist.

## Acceptance criteria
- The sidecar owns window state and widget sessions instead of Hermes rendering directly.
- The fallback MCP tool suite can open a widget session, apply incremental updates, finalize the widget, receive widget events, and close the session.
- The sidecar exposes a Hermes-only control/event surface for lifecycle and cleanup concerns.

## Tests
- Verify the sidecar can execute `open_widget` → `patch_widget` → `finalize_widget` → `widget_event`/`close_widget` for a single widget session.
- Verify orphan cleanup can be triggered through the local control/event surface.

## Notes
- Source:
  - "TypeScript sidecar"
  - "Fallback path: no Hermes core patch, use a session-oriented widget tool model"
- Constraints:
  - Hermes never renders; Hermes only calls or advises.
  - Preserve the existing shell and morphdom runtime instead of introducing a second renderer protocol.
- Evidence:
  - Fallback tools named explicitly: `visualize_read_me`, `open_widget`, `patch_widget`, `finalize_widget`, `close_widget`, `widget_event`
  - Control/event API responsibilities: session start/end, telemetry/debug, orphan cleanup
- Dependencies:
  - TICKET-030-extract-host-neutral-runtime-core.md
- Unknowns:
  - Exact transport for the local control/event surface is not provided.

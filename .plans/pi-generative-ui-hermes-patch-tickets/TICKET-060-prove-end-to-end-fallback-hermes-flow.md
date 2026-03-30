---
ticket_id: "tkt_wsl_hermes_060_e2e_fallback_flow"
title: "Fallback Hermes integration works end-to-end under WSL before any core patching"
agent: "codex"
done: false
goal: "Hermes can drive the sidecar-backed fallback widget flow end-to-end under WSL, proving the adapter architecture before risky core changes."
---

## Tasks
- Wire the sidecar and Hermes plugin together so Hermes can use the fallback MCP widget tool suite in a full end-to-end flow.
- Validate sidecar stability, Glimpse stability under Hermes, skill prompt quality, window/session cleanup, and WSL parity using the fallback path.
- Preserve the fallback tool model as a shippable path even after the aggressive streaming path is introduced.

## Acceptance criteria
- Hermes can complete a widget session end-to-end through the fallback tool sequence under WSL.
- Window/session cleanup works when the session completes or is shut down.
- The fallback path is usable as a no-core-patch shipping path, even though it remains the non-preferred UX.

## Tests
- Run an end-to-end Hermes session using `visualize_read_me`, `open_widget`, `patch_widget`, `finalize_widget`, `widget_event`, and `close_widget` under WSL and verify the widget lifecycle completes successfully.
- Verify Glimpse window behavior and cleanup remain stable during and after the session.

## Notes
- Source:
  - "Phase 4 — ship fallback tools first"
  - "That proves: sidecar stability, Glimpse stability under Hermes, skill prompt quality, window/session cleanup, WSL parity"
- Constraints:
  - This is a viable fallback, not the end state.
  - Do not lose the fallback path after introducing the aggressive path.
- Evidence:
  - Fallback tradeoff list in source: worse UX, explicit session state management, loss of streaming reveal, more tokens and failure modes
- Dependencies:
  - TICKET-050-add-hermes-plugin-lifecycle-and-skill-bridge.md
- Unknowns:
  - Not provided

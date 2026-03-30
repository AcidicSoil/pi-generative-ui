---
ticket_id: "tkt_genui_direction_review"
title: "Review and sign off on the sessionized GenUI direction"
agent: "user"
done: false
goal: "The chosen GenUI direction is explicitly accepted with the tradeoff that token-delta interception is not preserved."
---

## Tasks
- Review the implemented GenUI direction against the source plan.
- Confirm that the accepted architecture is: extracted shared runtime, MCP sidecar, thin Hermes plugin, bundled skill, sessionized widget protocol, and optional event tool follow-up.
- Confirm that not preserving Pi's token-by-token partial argument streaming is an accepted tradeoff.

## Acceptance criteria
- The session-based MCP direction is explicitly accepted or rejected.
- The `show_widget` decision is explicitly acknowledged: it is not the primary public tool, and if retained it is only a compatibility wrapper.
- The tradeoff around token-delta interception is explicitly acknowledged.

## Tests
- Review the delivered components against the source plan and confirm whether they match the intended architecture.
- Verify the accepted public tool model is based on `visualize_read_me`, `open_widget`, `patch_widget`, and `close_widget`, with event tooling added separately if implemented.

## Notes
- Source: "The native Hermes-facing protocol should be session-based." and "What you lose is only token-delta interception."
- Constraints:
  - No Hermes patching.
  - No Hermes core surgery.
- Evidence:
  - Final source direction: keep the working WSL renderer, move it behind MCP, and use a thin Hermes plugin plus bundled skill.
- Dependencies:
  - `TICKET-100-extract-genui-core.md`
  - `TICKET-120-build-mcp-widget-lifecycle.md`
  - `TICKET-140-add-hermes-plugin-and-skill.md`
  - `TICKET-160-enforce-session-namespacing.md`
  - `TICKET-180-add-widget-event-loop.md`
- Unknowns:
  - Not provided.

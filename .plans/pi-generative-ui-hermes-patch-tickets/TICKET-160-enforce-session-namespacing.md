---
ticket_id: "tkt_genui_session_namespace"
title: "Map each Hermes session to an isolated GenUI session namespace"
agent: "codex"
done: true
goal: "Each Hermes session has its own GenUI session namespace so widget state is isolated and orphan handling is predictable."
---

## Tasks
- Map each Hermes session to one GenUI session namespace.
- Ensure the session mapping prevents stale widget collisions, cross-chat contamination, and orphaned windows.
- Apply the session mapping consistently across the MCP service and Hermes plugin cleanup flow.

## Acceptance criteria
- A Hermes session resolves to a distinct GenUI session namespace.
- Widget state is isolated between sessions.
- The namespace design addresses the collision, contamination, and orphan problems called out in the source plan.

## Tests
- Verify separate Hermes sessions do not reuse the same GenUI widget namespace.
- Verify widgets from one session are not visible or addressable from another session.
- Verify orphan cleanup operates within the correct session namespace.

## Notes
- Source: "Each Hermes session should map to one GenUI session namespace."
- Constraints:
  - Prevent stale widget collisions.
  - Prevent cross-chat contamination.
  - Prevent orphaned windows.
- Evidence:
  - Risks explicitly listed in the source plan: collisions, contamination, orphaned windows.
- Dependencies:
  - `TICKET-120-build-mcp-widget-lifecycle.md`
  - `TICKET-140-add-hermes-plugin-and-skill.md`
- Unknowns:
  - Exact session identifier format is not provided.

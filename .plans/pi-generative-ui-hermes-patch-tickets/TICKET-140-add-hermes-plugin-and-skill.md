---
ticket_id: "tkt_genui_hermes_plugin_skill"
title: "Add thin Hermes session glue with a bundled GenUI skill"
agent: "codex"
done: false
goal: "Hermes has a minimal plugin and bundled skill that shape GenUI behavior without moving rendering logic into the plugin."
---

## Tasks
- Implement a small `hermes-genui-plugin` that installs a bundled `SKILL.md`.
- Use Hermes plugin hooks to inject ephemeral context in `pre_llm_call`, track whether `visualize_read_me` has already been loaded for the session, and close orphaned widgets on `on_session_end`.
- Keep rendering logic out of the plugin.
- Write the bundled skill so it teaches this workflow: call `visualize_read_me` silently before first UI action, use `open_widget` first, use `patch_widget` for iterative refinement, prefer HTML fragments or raw `<svg>`, use the bridge for user interactions, and keep the assistant reply short while the UI carries the explanation.

## Acceptance criteria
- Hermes has plugin-based session glue for GenUI without requiring Hermes core changes.
- The plugin is limited to skill installation, prompt shaping, session tracking, and cleanup responsibilities from the source plan.
- The bundled skill explicitly teaches the required call order and content constraints for widget updates.
- Rendering logic does not live in the plugin.

## Tests
- Verify the plugin installs the bundled `SKILL.md` and injects the intended ephemeral context before LLM calls.
- Verify session state tracks whether `visualize_read_me` has already been loaded.
- Verify orphaned widgets are closed on session end.
- Verify the skill text directs the model to open first, patch iteratively, prefer fragments/raw SVG, and use the bridge for interactions.

## Notes
- Source: "The skill matters more than the plugin" and "This plugin should be intentionally thin. The renderer should not live here."
- Constraints:
  - No Hermes core surgery.
  - Plugin is intentionally thin.
  - Renderer must not live in the plugin.
- Evidence:
  - Required hooks/behavior: `pre_llm_call`, session tracking for read-me loading, `on_session_end` cleanup.
  - Required skill workflow steps are explicitly listed in the source plan.
- Dependencies:
  - `TICKET-120-build-mcp-widget-lifecycle.md`
- Unknowns:
  - Exact plugin packaging layout is not provided.

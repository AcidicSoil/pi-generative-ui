---
ticket_id: "tkt_wsl_hermes_050_hermes_plugin_bridge"
title: "Hermes plugin provides lifecycle glue, skill installation, and session cleanup without rendering"
agent: "codex"
done: false
goal: "Hermes can host the sidecar-backed widget flow through a small plugin that installs instructions, observes lifecycle hooks, and cleans up widget sessions."
---

## Tasks
- Implement the Hermes plugin package with bundled skill/instructions and configuration required to enable the widget tool flow.
- Add lifecycle handling for `pre_llm_call`, `pre_tool_call`, `post_tool_call`, and `on_session_end` to inject usage guidance, observe widget tool usage, maintain session mapping, and close orphaned windows.
- Add only lightweight Hermes status/progress output where needed; do not add renderer logic to the plugin.

## Acceptance criteria
- The Hermes plugin can install the skill/instructions needed for widget tool usage.
- The plugin tracks widget-related session state well enough to support cleanup and diagnostics.
- Session shutdown through Hermes closes sidecar-owned windows for the matching session.
- No renderer implementation lives in the plugin.

## Tests
- Verify the plugin loads with the bundled skill/instructions.
- Run `uv run pytest tests/integration/test_hermes_session_cleanup.py` and confirm session shutdown closes the matching widget sessions.
- Verify widget-tool observation occurs through Hermes lifecycle hooks rather than direct rendering code.

## Notes
- Source:
  - "Small Hermes plugin"
  - "The plugin should do four things only"
- Constraints:
  - No renderer logic in Python.
  - Replace `pi.on("session_shutdown", ...)` with Hermes `on_session_end`.
  - Replace Pi TUI hooks with minimal Hermes status/progress output only.
- Evidence:
  - Hook list in source: `pre_llm_call`, `pre_tool_call`, `post_tool_call`, `on_session_end`
- Dependencies:
  - TICKET-040-build-mcp-sidecar-with-fallback-widget-tools.md
- Unknowns:
  - Exact Hermes branch or commit target is not provided.

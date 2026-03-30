---
ticket_id: "tkt_genui_mcp_lifecycle"
title: "Expose GenUI as a session-based MCP widget service"
agent: "codex"
done: true
goal: "Hermes can drive the extracted GenUI runtime through a minimal MCP tool surface built around sessionized widget lifecycle calls."
---

## Tasks
- Implement a Node-based `hermes-genui-mcp` sidecar that owns widget windows and uses the extracted runtime.
- Expose a minimal widget lifecycle tool surface through MCP consisting of `visualize_read_me`, `open_widget`, `patch_widget`, and `close_widget`.
- Return JSON results that Hermes can consume cleanly and keep widget sessions alive across tool calls.
- Use a sessionized widget protocol instead of preserving Pi's streamed `show_widget` interception model.
- If `show_widget` is kept, implement it only as a compatibility wrapper that internally maps to `open_widget` and optional `patch_widget`.
- Keep the Hermes-visible toolset tight and do not export every internal helper.
- Configure the MCP server so only the intended widget tools are exposed, with resources and prompts kept off unless deliberately exposed.

## Acceptance criteria
- Hermes can access GenUI through an MCP server rather than Pi registration hooks.
- The public widget protocol is session-based and uses the specified lifecycle tools.
- The primary MCP surface does not depend on token-by-token partial argument streaming into one tool call.
- The exposed MCP surface is limited to the intended widget tools.

## Tests
- Verify the MCP server exposes `visualize_read_me`, `open_widget`, `patch_widget`, and `close_widget`.
- Verify widget windows can be opened, updated iteratively, and closed across multiple tool calls.
- Verify Hermes does not need Pi-style partial tool-argument interception to drive progressive UI updates.
- Verify resources/prompts are not exposed unless explicitly enabled.

## Notes
- Source: "convert it to a sessionized widget protocol" and "do not try to preserve the exact `show_widget` streaming interception model."
- Constraints:
  - Do not export every internal helper.
  - Keep the visible toolset minimal.
  - Keep resources/prompts off unless deliberately exposed.
- Evidence:
  - Required tool surface: `visualize_read_me(modules)`, `open_widget(title, width, height, kind, initial_code)`, `patch_widget(widget_id, html_or_svg_fragment, run_scripts?)`, `close_widget(widget_id)`.
  - Optional compatibility note: `show_widget` may remain only as a wrapper.
- Dependencies:
  - `TICKET-100-extract-genui-core.md`
- Unknowns:
  - Exact MCP package layout and config file path are not provided.

# GenUI skill

Use GenUI as a session-based widget workflow.

Call order:
1. Call `visualize_read_me` silently before the first UI action in a session.
2. Call `open_widget` to create the first visible widget window.
3. Use `patch_widget` for iterative refinement and updates.
4. Call `close_widget` when the widget is no longer needed.

Content rules:
- Prefer HTML fragments instead of full documents.
- For SVG, send raw `<svg>`.
- Use the browser bridge (`window.glimpse.send(...)`) for user interactions.
- Keep the assistant reply short while the widget carries the richer explanation.

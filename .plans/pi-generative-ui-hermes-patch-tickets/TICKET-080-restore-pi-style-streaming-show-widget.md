---
ticket_id: "tkt_wsl_hermes_080_restore_streaming_show_widget"
title: "Pi-style streaming `show_widget` behavior is restored on Hermes"
agent: "codex"
done: false
goal: "The Hermes integration reuses the current Pi-style streaming widget logic with early open, incremental patching, and finalization behavior close to the existing fork."
---

## Tasks
- Forward `toolcall_start`, `toolcall_delta`, and `toolcall_end` from Hermes into the sidecar for `show_widget`.
- Reuse the current Pi-style streaming logic to initialize streaming widget state, debounce updates, open the window early, apply morphdom patches, and finalize the widget at the end of the tool-call stream.
- Restore `show_widget` as the primary render tool while keeping the fallback session-oriented tools as compatibility or debug tools.

## Acceptance criteria
- A widget appears during tool-argument streaming rather than only after explicit fallback tool sequencing.
- The streaming path preserves the current early-open, incremental patch, and finalization semantics from the existing fork.
- `visualize_read_me` plus `show_widget` becomes the primary model-facing path again.

## Tests
- Replay a streaming `show_widget` tool-call and verify early window open, debounced incremental patching, and finalization behavior match the preserved runtime contract.
- Verify the fallback tools remain available for compatibility or debug use after `show_widget` is restored.

## Notes
- Source:
  - "Then patch Hermes to emit structured `toolcall_start` / `toolcall_delta` / `toolcall_end` events and restore the Pi-style `show_widget` streaming path."
  - "Once that lands, map the existing Pi streaming logic almost directly onto Hermes"
- Constraints:
  - Reuse the current Pi logic nearly line-for-line where possible.
  - Keep `visualize_read_me` and `show_widget` as the preferred mental model.
- Evidence:
  - Source mapping: `toolcall_start` → initialize state, `toolcall_delta` → update `widget_code` and patch, `toolcall_end` → finalize and run scripts
- Dependencies:
  - TICKET-070-patch-hermes-for-structured-toolcall-stream-events.md
- Unknowns:
  - Not provided

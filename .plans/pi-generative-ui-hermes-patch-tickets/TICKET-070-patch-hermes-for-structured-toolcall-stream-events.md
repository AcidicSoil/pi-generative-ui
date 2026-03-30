---
ticket_id: "tkt_wsl_hermes_070_patch_stream_events"
title: "Hermes emits structured tool-call stream events for plugin and future RPC consumers"
agent: "codex"
done: false
goal: "Hermes core produces normalized `toolcall_start`, `toolcall_delta`, and `toolcall_end` events so Pi-style streaming widget logic can be reused."
---

## Tasks
- Patch Hermes core where provider deltas are normalized to emit a structured stream-event surface rather than only text callbacks.
- Normalize provider output into `toolcall_start`, `toolcall_delta`, and `toolcall_end` with `call_id`, `tool_name`, `content_index`, partial or final parsed arguments, and changed keys when cheap to compute.
- Expose the new stream events to plugins and future RPC clients.

## Acceptance criteria
- Hermes emits normalized structured tool-call stream events across the supported provider modes covered by the source plan.
- The event payload includes the fields called out in the source plan.
- The new event surface is consumable by the Hermes plugin without introducing renderer logic into Hermes.

## Tests
- Verify supported provider modes emit `toolcall_start`, `toolcall_delta`, and `toolcall_end` with the expected payload shape.
- Verify plugin consumers can observe the new events without relying on text-only callbacks.

## Notes
- Source:
  - "Aggressive path: patch Hermes core to expose `toolcall_start`, `toolcall_delta`, `toolcall_end`"
  - "That is the prize."
- Constraints:
  - This is the highest-risk, highest-reward path.
  - Maintain a stable structured event contract across provider modes.
- Evidence:
  - Event fields listed in source: `call_id`, `tool_name`, `content_index`, partial/final parsed arguments, changed keys if cheap to compute
  - Source notes Hermes currently lacks Pi-style `toolcall_start` events
- Dependencies:
  - TICKET-060-prove-end-to-end-fallback-hermes-flow.md
- Unknowns:
  - Exact insertion point for provider-normalized tool-stream events is not provided.
  - Exact Hermes branch or commit target is not provided.

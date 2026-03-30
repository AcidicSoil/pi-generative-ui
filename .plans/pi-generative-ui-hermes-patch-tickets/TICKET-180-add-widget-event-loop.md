---
ticket_id: "tkt_genui_widget_event_loop"
title: "Add widget-to-Hermes event delivery after core rendering is stable"
agent: "codex"
done: false
goal: "Interactive widgets can send events back into Hermes through an explicit event tool after the base rendering path is working."
---

## Tasks
- Add one event-delivery tool to the MCP service using either `widget_wait_event` or `widget_event_poll`.
- Buffer UI events coming from the browser bridge so buttons, sliders, and forms can send state back into Hermes.
- Keep this work sequenced after the first rendering path is stable.

## Acceptance criteria
- Hermes can receive widget-originated events through an explicit MCP event tool.
- The event path is backed by buffered browser-bridge events.
- Buttons, sliders, and forms can send state back into Hermes through the selected event mechanism.

## Tests
- Verify a widget interaction can be emitted from the browser bridge and received through the event tool.
- Verify the selected event tool returns pending interaction data for a widget.
- Verify this event path is added only after the base open/patch/close rendering flow is working.

## Notes
- Source: "Once rendering is stable, add: `widget_wait_event` or `widget_event_poll` so buttons/sliders/forms can send state back into Hermes."
- Constraints:
  - Sequence this after the first rendering path works.
- Evidence:
  - Browser bridge/event buffering is part of the planned MCP responsibilities.
  - Candidate event tools: `widget_wait_event` or `widget_event_poll`.
- Dependencies:
  - `TICKET-120-build-mcp-widget-lifecycle.md`
  - `TICKET-160-enforce-session-namespacing.md`
- Unknowns:
  - The source plan does not choose between polling and waiting.

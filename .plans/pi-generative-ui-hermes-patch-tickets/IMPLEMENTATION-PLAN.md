# Sessionized GenUI refactoring implementation plan

## Direction confirmed from the current tickets
The current ticket set changes direction in three important ways:

1. the shared runtime should be extracted as `genui-core`,
2. the Hermes-facing API should be a sessionized MCP lifecycle built around `open_widget` / `patch_widget` / `close_widget`,
3. Pi-style token-delta `show_widget` interception is no longer the primary model and may only remain as a compatibility wrapper.

That means the earlier `runtime-core` / streaming-first scaffold needs to be cleaned up and replaced with the sessionized architecture described in the active tickets.

## Refactoring plan

### Phase 1 — remove mismatched scaffolding
- Remove the earlier `runtime-core`, `mcp-sidecar`, and `hermes-plugin` package layout.
- Remove the accidental brace-literal directories and the tests that encode the old streaming-first direction.
- Reset the implementation plan and ticket statuses so they reflect the current ticket set, not the superseded one.

### Phase 2 — extract `genui-core`
- Create `packages/genui-core` as the shared TypeScript runtime.
- Move the reusable GenUI responsibilities there:
  - WSL-capable Glimpse loading/backend selection
  - HTML/SVG shell and morphdom patch helpers
  - widget session/window registry
  - buffered browser-bridge event queue
  - guideline loader surface
- Keep Pi imports out of `genui-core`.

### Phase 3 — build the sessionized MCP sidecar
- Create `packages/hermes-genui-mcp`.
- Implement a minimal MCP-style service object whose public tool surface is:
  - `visualize_read_me`
  - `open_widget`
  - `patch_widget`
  - `close_widget`
- Keep prompts/resources disabled by default.
- Add `widget_event_poll` only as an optional follow-up tool after the base lifecycle is in place.
- Make `show_widget` a compatibility wrapper only, not a primary public tool.

### Phase 4 — add thin Hermes plugin glue
- Create `packages/hermes-genui-plugin` with a bundled `SKILL.md`.
- Implement thin hooks for:
  - `pre_llm_call`
  - `post_tool_call`
  - `on_session_end`
- Track whether `visualize_read_me` has already been loaded per session.
- Route session cleanup to the MCP sidecar.

### Phase 5 — enforce session namespacing and event delivery
- Namespace every widget session by Hermes session id.
- Prevent cross-session widget access.
- Buffer browser bridge events and expose them through an explicit `widget_event_poll` tool.

### Phase 6 — preserve Pi compatibility without re-centering it
- Keep the Pi extension as a thin adapter around `genui-core`.
- Retain `show_widget` only as a compatibility wrapper that opens a widget through the extracted runtime rather than depending on token-delta interception.

### Phase 7 — verification
- Add regression tests for:
  - extracted runtime behavior and no-Pi-import boundaries
  - MCP tool exposure and iterative open/patch/close flow
  - Hermes plugin skill/session cleanup behavior
  - session namespace isolation
  - event polling via buffered widget bridge events

## Expected outcomes
- `TICKET-100`: done
- `TICKET-120`: done
- `TICKET-140`: done
- `TICKET-160`: done
- `TICKET-180`: done
- `TICKET-900`: still user review

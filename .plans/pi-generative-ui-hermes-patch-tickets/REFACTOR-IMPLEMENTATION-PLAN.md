# Refactoring implementation plan for the sessionized GenUI direction

## Why this refactor is needed
The active ticket set is no longer the older host-adapter / Hermes-core-patch plan. The repository now targets a different architecture:
- extract a Pi-independent `genui-core`,
- expose it through a session-based `hermes-genui-mcp` service,
- add a thin `hermes-genui-plugin` with a bundled skill,
- isolate state by Hermes session namespace,
- add widget-to-Hermes event delivery after the base lifecycle is stable.

That means the recent `runtime-core` / `mcp-sidecar` / `pi-compat` / `hermes-plugin` work needs cleanup and renaming so it matches the new source direction instead of the old one.

## Refactoring steps

### 1. Clean up the previous scaffold
- Remove the accidental brace-named directories.
- Remove the standalone `pi-compat` package.
- Rename packages to match the new ticket language:
  - `runtime-core` -> `genui-core`
  - `mcp-sidecar` -> `hermes-genui-mcp`
  - `hermes-plugin` -> `hermes-genui-plugin`

### 2. Rebuild the extracted core around the new contract
- Keep the existing browser-backed renderer behavior.
- Move shared styling/guideline assets into `genui-core` so the extracted runtime has no Pi imports.
- Add a reusable `GenUIRuntime` that owns:
  - WSL/backend selection,
  - HTML/SVG shell generation,
  - widget open/patch/close operations,
  - session namespacing,
  - buffered bridge events,
  - optional streaming compatibility helpers for Pi.

### 3. Collapse Pi integration back to a thin extension entrypoint
- Keep `.pi/extensions/generative-ui/index.ts` as a thin Pi-specific wrapper.
- Have it use `genui-core` directly instead of a dedicated `pi-compat` package.
- Preserve the existing Pi `visualize_read_me` + `show_widget` behavior for local compatibility.

### 4. Implement the sessionized MCP-facing service
- Replace the old sidecar naming and API with `hermes-genui-mcp`.
- Expose only the intended public tool surface:
  - `visualize_read_me`
  - `open_widget`
  - `patch_widget`
  - `close_widget`
- Add session namespace handling and a buffered event API internally.
- Keep `show_widget` only as an internal compatibility wrapper.

### 5. Implement the thin Hermes plugin and bundled skill
- Bundle `SKILL.md` in `hermes-genui-plugin`.
- Add plugin hooks for ephemeral context, read-me tracking, and session-end cleanup.
- Keep renderer logic out of the plugin.

### 6. Replace the tests so they match the new tickets
- Verify `genui-core` is Pi-independent and still launches the renderer behavior.
- Verify the sessionized MCP tool surface, namespace isolation, and resources/prompts-off posture.
- Verify plugin skill installation, read-me tracking, and orphan cleanup.
- Verify buffered widget event delivery through an explicit poll tool.

## Planned ticket outcome in this repo
- `TICKET-100`: implement
- `TICKET-120`: implement
- `TICKET-140`: implement
- `TICKET-160`: implement
- `TICKET-180`: implement with `widget_event_poll`
- `TICKET-900`: leave for user review/signoff

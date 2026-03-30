---
ticket_id: "tkt_wsl_hermes_030_extract_runtime_core"
title: "Widget runtime is extracted into a host-neutral TypeScript core"
agent: "codex"
done: false
goal: "The existing Pi-based widget engine runs from a TypeScript core package with no Pi-specific or Hermes-specific bindings."
---

## Tasks
- Move the existing renderer, HTML/SVG shell, morphdom incremental patch pipeline, Glimpse launcher/backend selection, widget session registry, guideline loading, widget bridge handling, and WSL/Linux/macOS logic into `runtime-core`.
- Remove Pi-specific names and bindings from the extracted core package while preserving current runtime semantics.
- Keep streaming window reuse, debounce/update cadence, and `window.glimpse.send(...)` behavior aligned with the current fork.
- Leave Pi-specific hosting concerns to a thin compatibility adapter rather than keeping them in the core package.

## Acceptance criteria
- `runtime-core` contains the preserved widget engine behavior without direct Pi or Hermes host bindings.
- The extracted core preserves the current shell, patch, bridge, and window lifecycle behavior verified by the frozen regression tests.
- Host-specific concerns remain outside `runtime-core`.

## Tests
- Run the regression coverage from TICKET-020 against the extracted runtime and confirm behavior remains unchanged.
- Verify the extracted core has no direct Pi-specific binding usage.

## Notes
- Source:
  - "Host-neutral TypeScript widget runtime"
  - "The widget engine should be transplanted, not translated."
- Constraints:
  - Make the existing `pi-generative-ui` runtime the source of truth.
  - Do not rewrite the renderer.
- Evidence:
  - Extract list: Glimpse launcher, HTML/SVG shell, morphdom, widget session registry, `window.glimpse.send(...)`, guideline loading, WSL/Linux/macOS logic, streaming window reuse/finalization behavior.
- Dependencies:
  - TICKET-020-freeze-current-pi-runtime-behavior.md
- Unknowns:
  - Exact module/file boundaries inside the current fork are not provided.

---
ticket_id: "tkt_genui_runtime_extract"
title: "Extract a Pi-independent GenUI runtime module"
agent: "codex"
done: false
goal: "The renderer/runtime needed for generative UI exists as shared TypeScript code that no longer depends on Pi integration hooks."
---

## Tasks
- Extract the non-Pi renderer/runtime logic from `.pi/extensions/generative-ui/index.ts` into a reusable `genui-core` TypeScript module.
- Preserve the existing WSL-capable window/renderer launch, HTML/SVG shell, morphdom patching, `window.glimpse.send(...)` bridge, design-guideline loader, and widget-generation contract inside the extracted runtime.
- Ensure the extracted renderer/runtime layer has no Pi imports.

## Acceptance criteria
- A shared runtime module exists for GenUI that contains the renderer/runtime responsibilities described in the source plan.
- The extracted runtime preserves the existing browser-backed rendering behavior and bridge capabilities called out in the source plan.
- The renderer/runtime layer is separable from Pi-specific registration and session hooks.

## Tests
- Verify the extracted runtime module contains the window manager, HTML wrapper, morphdom shell, script rerun logic, SVG/HTML detection, guideline modules, and bridge/event queue.
- Verify no Pi imports remain in the extracted renderer/runtime layer.
- Verify the existing browser-backed renderer can still be launched through the extracted runtime.

## Notes
- Source: "Pull the non-Pi code out of `.pi/extensions/generative-ui/index.ts` into a reusable TS module."
- Constraints:
  - No Hermes patching.
  - Preserve the existing WSL-capable renderer/runtime behavior.
- Evidence:
  - Existing source file: `.pi/extensions/generative-ui/index.ts`
  - Preserved behaviors: WSL renderer launch, HTML/SVG shell, morphdom patching, `window.glimpse.send(...)`, design-guideline loader, widget generation contract.
- Dependencies: Not provided
- Unknowns:
  - Final module path/name beyond `genui-core` is not provided.

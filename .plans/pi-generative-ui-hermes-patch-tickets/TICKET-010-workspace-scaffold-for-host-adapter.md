---
ticket_id: "tkt_wsl_hermes_010_workspace_scaffold"
title: "Workspace scaffolding reflects the host-adapter package boundaries"
agent: "codex"
done: true
goal: "The repository contains the package and test layout needed for a TypeScript runtime core, MCP sidecar, Pi compatibility adapter, and Hermes plugin without rewriting the renderer."
---

## Tasks
- Create the workspace/package structure for `runtime-core`, `mcp-sidecar`, `pi-compat`, `hermes-plugin`, and `tests` using the suggested repo layout from the source plan.
- Add the initial directories and entrypoints needed for `renderer`, `shell`, `glimpse`, `sessions`, `bridge`, `guidelines`, `types`, `server`, `tools`, `control`, and integration test fixtures.
- Preserve the existing renderer and widget runtime as the source of truth rather than re-implementing them in Hermes or Python.

## Acceptance criteria
- The repository layout matches the source plan closely enough that later extraction and integration work can land into the named package boundaries without reorganization.
- No new renderer implementation is introduced in the Hermes plugin package.
- The scaffold makes `runtime-core` the intended TypeScript source of truth for the existing widget engine.

## Tests
- Verify the repository tree contains the package and directory structure called out in the source plan.
- Confirm no renderer logic has been added under the Hermes plugin package.

## Notes
- Source:
  - "Suggested repo layout" with `runtime-core`, `mcp-sidecar`, `pi-compat`, `hermes-plugin`, and `tests`
  - "Do not port the widget runtime into Hermes/Python."
- Constraints:
  - Preserve the existing renderer, Glimpse/browser window manager, HTML/SVG shell, morphdom path, widget bridge, and WSL launch/backend logic.
  - Treat this as a host-adapter problem, not a renderer rewrite.
- Evidence:
  - File and directory names listed in the suggested repo layout.
- Dependencies:
  - Not provided
- Unknowns:
  - Exact workspace tooling and package-manager configuration are not provided.

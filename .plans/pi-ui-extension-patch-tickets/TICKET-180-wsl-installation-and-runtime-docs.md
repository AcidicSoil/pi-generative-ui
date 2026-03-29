---
ticket_id: "tkt_2a191c54_wsl_install_docs"
title: "Repository docs explain WSL requirements and no longer claim macOS-only support"
agent: "codex"
done: false
goal: "The README and install docs describe the supported WSL path, prerequisites, and backend expectations without retaining macOS-only guidance."
---

## Tasks
- Update the README and any install documentation to remove the "macOS only" claim.
- Document that WSL requires GUI support.
- Document that WSL should use the Chromium backend.
- Document that a Chromium-based browser must be available in the Linux environment or provided through `GLIMPSE_CHROME_PATH`.
- Document the practical WSL requirements called out in the source: WSL2 with WSLg enabled, a Linux-visible Chromium/Chrome executable, and Node compatibility with the updated Glimpse version.

## Acceptance criteria
- README/install docs no longer state the project is macOS-only.
- README/install docs explicitly describe the WSL GUI requirement and the Chromium backend expectation.
- README/install docs explicitly mention `GLIMPSE_CHROME_PATH` as an option when the browser is not otherwise discoverable.
- README/install docs include the listed WSL prerequisites from the source.

## Tests
- Inspect the README/install docs and verify the macOS-only claim is removed.
- Inspect the README/install docs and verify the WSL requirements, backend guidance, browser requirement, and `GLIMPSE_CHROME_PATH` guidance are present.
- Inspect the README/install docs and verify they include WSL2 with WSLg, a Linux-visible Chromium/Chrome executable, and Node compatibility guidance.

## Notes
- Source: "remove `macOS only`"; "state that WSL requires GUI support"; "state that WSL should use the Chromium backend"; "state that a Chromium-based browser must be available in the Linux environment or provided through `GLIMPSE_CHROME_PATH`"; "WSL2 with WSLg enabled"; "a Linux-visible Chromium/Chrome executable"; "Node version compatible with current Glimpse".
- Constraints: Documentation should reflect the implemented WSL path and should not imply a custom browser-tab renderer rewrite.
- Evidence: The source treats README/install docs as a mandatory update area.
- Dependencies: `TICKET-100-cross-platform-glimpse-package-metadata.md`, `TICKET-120-wsl-glimpse-entrypoint-and-backend-selection.md`, `TICKET-160-cross-platform-tool-metadata.md`
- Unknowns: The exact doc file set beyond the README is not provided.

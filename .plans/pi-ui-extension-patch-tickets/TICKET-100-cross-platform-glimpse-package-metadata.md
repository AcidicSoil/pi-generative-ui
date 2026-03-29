---
ticket_id: "tkt_4c0f6d4e_pkg_glimpse_linux"
title: "Package metadata allows modern cross-platform Glimpse installs"
agent: "codex"
done: false
goal: "The repo can install modern Glimpse on Linux/WSL without being blocked by darwin-only package metadata."
---

## Tasks
- Update `package.json` to bump `glimpseui` from `^0.3.5` to `^0.6.2` or newer.
- Remove the darwin-only install gate in `package.json` by deleting `os` or changing it to include `"linux"`.
- Align any declared Node version floor in package metadata with modern Glimpse compatibility, using `>=18` if the repo records a floor.

## Acceptance criteria
- `package.json` no longer restricts installation to darwin-only environments.
- `package.json` references `glimpseui` `^0.6.2` or newer.
- Any declared Node compatibility metadata is consistent with the updated Glimpse requirement.

## Tests
- Inspect `package.json` and verify the `glimpseui` version is `^0.6.2` or newer.
- Inspect `package.json` and verify the darwin-only `os` gate is absent or explicitly includes Linux.
- Inspect package metadata and verify any declared Node version floor is compatible with modern Glimpse.

## Notes
- Source: "Bump `glimpseui` from `^0.3.5` to `^0.6.2` or newer"; "Remove the darwin-only install gate"; "add a Node floor matching modern Glimpse, such as `>=18`".
- Constraints: Preserve source scope; do not introduce unrelated package changes.
- Evidence: Source references `package.json` as the first mandatory change area.
- Dependencies: Not provided.
- Unknowns: Whether the repo already declares a Node engine floor is not provided.

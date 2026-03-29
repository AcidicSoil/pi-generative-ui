---
ticket_id: "tkt_61d5a2fb_glimpse_error_visibility"
title: "Streaming window failures expose backend errors instead of silently swallowing them"
agent: "codex"
done: false
goal: "Glimpse startup and streaming-update failures are visible to the caller instead of failing silently."
---

## Tasks
- In `.pi/extensions/generative-ui/index.ts`, remove the empty `catch {}` around streaming window creation and update paths.
- Surface the actual backend error when window creation or streaming updates fail.

## Acceptance criteria
- The streaming window creation and update paths no longer contain an empty `catch {}` that hides backend failures.
- A real backend error is surfaced when Glimpse cannot start or update the window.
- Failure behavior makes the common missing-browser case diagnosable instead of appearing randomly broken.

## Tests
- Inspect `.pi/extensions/generative-ui/index.ts` and verify the empty `catch {}` has been removed from the streaming window creation/update path.
- Trigger or simulate a Glimpse backend failure and verify the resulting error is visible rather than silently swallowed.

## Notes
- Source: "remove the empty `catch {}` around streaming window creation and updates"; "surface the actual backend error"; "the most common failure will be `no Chromium/Chrome found`".
- Constraints: Keep the existing streaming pipeline shape; change error visibility, not overall workflow design.
- Evidence: The source identifies silent failure handling as a high-value fix for WSL reliability.
- Dependencies: `TICKET-120-wsl-glimpse-entrypoint-and-backend-selection.md`
- Unknowns: The exact user-facing or log-facing error surface is not provided.

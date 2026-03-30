---
ticket_id: "tkt_wsl_hermes_090_shallow_patch_surface"
title: "Hermes patch surface stays shallow, isolated, and covered across provider modes"
agent: "codex"
done: false
goal: "The Hermes-specific delta required for streaming widgets remains small enough to upstream cleanly or maintain as a shallow fork with confidence."
---

## Tasks
- Isolate the Hermes-side changes to the smallest practical patch surface aligned with the source plan.
- Ensure the Hermes delta is limited to the event normalization patch, plugin hook registration changes if needed, and tests covering the supported provider modes.
- Prepare the implementation so it can be upstreamed if the patch is clean, or maintained as a shallow fork if it is not.

## Acceptance criteria
- The Hermes-specific changes are isolated and easy to describe as a small patch surface.
- Provider-mode coverage exists for the supported streaming-event behavior.
- The resulting implementation can support either upstream submission or shallow-fork maintenance without hidden dependencies.

## Tests
- Verify the supported provider-mode coverage still passes with the isolated Hermes patch surface.
- Review the Hermes-side diff and confirm it is limited to the intended patch areas from the source plan.

## Notes
- Source:
  - "If the patch is clean, upstream it."
  - "If not, keep the fork extremely shallow and isolated"
- Constraints:
  - Keep the fork limited to an event normalization patch, a plugin hook registration patch, and tests covering the supported provider modes.
- Evidence:
  - Source explicitly names the desired shallow-fork components.
- Dependencies:
  - TICKET-080-restore-pi-style-streaming-show-widget.md
- Unknowns:
  - Criteria for deciding whether the patch is "clean" enough to upstream are not provided.

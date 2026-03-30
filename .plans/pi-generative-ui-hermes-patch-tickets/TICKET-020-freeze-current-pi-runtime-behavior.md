---
ticket_id: "tkt_wsl_hermes_020_freeze_pi_behavior"
title: "Current Pi runtime behavior is frozen behind golden fixtures and regression tests"
agent: "codex"
done: true
goal: "The existing WSL-working Pi fork has regression coverage for the behaviors that must survive the Hermes integration."
---

## Tasks
- Capture golden fixtures for the current fork covering streaming tool-call transcripts, non-streaming provider behavior, widget bridge message flow, close behavior, and WSL backend resolution.
- Add regression tests that assert expected window lifecycle behavior from those fixtures before any host-adapter extraction begins.
- Record the expected early-open, incremental patch, reuse, and finalization behavior that later tickets must preserve.

## Acceptance criteria
- The current fork has reproducible fixtures or transcripts for streaming and non-streaming widget flows.
- Regression tests fail on behavior changes that would break the preserved widget runtime contract.
- WSL backend resolution and widget bridge behavior are covered by explicit checks.

## Tests
- Replay a captured streaming tool-call transcript and verify the expected window lifecycle matches the golden result.
- Replay a non-streaming provider path and verify the fallback open/render path matches the golden result.
- Verify widget bridge message and close behavior against the captured expectations.
- Verify WSL backend resolution against the captured expectations.

## Notes
- Source:
  - "Phase 0 — freeze behavior"
  - "Create golden tests around the current fork before moving anything"
- Constraints:
  - Preserve streaming window reuse/finalization behavior where a partially opened window is finalized in `execute()`.
  - Preserve the design rule that useful structure appears before script execution.
- Evidence:
  - Source checks listed: streaming tool-call transcript, non-streaming provider path, widget bridge message/close behavior, WSL backend resolution.
- Dependencies:
  - TICKET-010-workspace-scaffold-for-host-adapter.md
- Unknowns:
  - Exact fixture capture format is not provided.

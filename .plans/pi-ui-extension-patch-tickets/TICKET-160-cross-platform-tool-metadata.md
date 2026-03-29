---
ticket_id: "tkt_5e77a0bf_cross_platform_prompt_text"
title: "Tool metadata describes a cross-platform Glimpse renderer instead of a macOS-only window"
agent: "codex"
done: false
goal: "The model-facing tool descriptions match the cross-platform runtime instead of anchoring behavior to macOS and WKWebView."
---

## Tasks
- Update `show_widget.description` in `.pi/extensions/generative-ui/index.ts` to remove macOS-only wording.
- Update `show_widget.promptSnippet` in `.pi/extensions/generative-ui/index.ts` to remove macOS-only wording.
- Update `show_widget.promptGuidelines` in `.pi/extensions/generative-ui/index.ts` to remove macOS-only wording and describe the renderer as cross-platform via Glimpse.

## Acceptance criteria
- `show_widget.description`, `show_widget.promptSnippet`, and `show_widget.promptGuidelines` no longer describe the runtime as a native macOS window or as `WKWebView`-only.
- The updated text describes the renderer in cross-platform terms consistent with the source, including the platform distinction that macOS uses `WKWebView` while Linux/WSL uses Chromium or WebKitGTK.

## Tests
- Inspect `.pi/extensions/generative-ui/index.ts` and verify the three named fields no longer contain macOS-only wording.
- Inspect `.pi/extensions/generative-ui/index.ts` and verify the new wording matches the cross-platform Glimpse framing from the source.

## Notes
- Source: "Update every mac-specific phrase in `show_widget.description`, `show_widget.promptSnippet`, `show_widget.promptGuidelines`"; replace "native macOS window", "`WKWebView`", and "macOS window" with cross-platform Glimpse wording.
- Constraints: This ticket updates model-facing contract text only; it is not a runtime backend rewrite.
- Evidence: The source states the generation policy remains anchored to a mac-only worldview unless these fields are updated.
- Dependencies: `TICKET-120-wsl-glimpse-entrypoint-and-backend-selection.md`
- Unknowns: Final wording is not provided verbatim.

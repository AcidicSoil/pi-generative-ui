import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { resolveGlimpseBackend } from "../../packages/runtime-core/src/glimpse/platform.js";
import { shellHTML, wrapHTML } from "../../packages/runtime-core/src/shell/html.js";
import { StreamingWidgetController } from "../../packages/runtime-core/src/renderer/streaming.js";

class FakeWindow {
  public readonly sent: string[] = [];
  private readonly listeners = new Map<string, Array<(...args: any[]) => void>>();

  send(js: string) {
    this.sent.push(js);
  }

  close() {}

  on(event: string, listener: (...args: any[]) => void) {
    const current = this.listeners.get(event) ?? [];
    current.push(listener);
    this.listeners.set(event, current);
  }

  emit(event: string, ...args: any[]) {
    for (const listener of this.listeners.get(event) ?? []) {
      listener(...args);
    }
  }
}

test("shell HTML preserves morphdom streaming hooks", () => {
  const html = shellHTML();
  assert.match(html, /window\._setContent/);
  assert.match(html, /window\._runScripts/);
  assert.match(html, /morphdom/);
});

test("wrapHTML preserves svg full-document fallback", () => {
  const wrapped = wrapHTML("<svg></svg>", true);
  assert.match(wrapped, /<!DOCTYPE html>/);
  assert.match(wrapped, /<svg>/);
});

test("WSL backend fixture expects chromium fallback", () => {
  const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/golden/wsl-backend.json"), "utf8"));
  assert.equal(resolveGlimpseBackend({ GLIMPSE_BACKEND: fixture.fallbackBackend } as NodeJS.ProcessEnv), fixture.fallbackBackend);
});

test("streaming controller opens early and finalizes with script execution", async () => {
  const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/golden/streaming-show-widget.json"), "utf8"));
  const fakeWindow = new FakeWindow();
  let openedHtml = "";
  const controller = new StreamingWidgetController({
    debounceMs: fixture.expectations.debounceMs,
    async getGlimpse() {
      return {
        open(html: string) {
          openedHtml = html;
          return fakeWindow as any;
        },
      };
    },
  });

  await controller.handleEvent({
    type: "toolcall_start",
    contentIndex: 0,
    partial: { content: [{ type: "toolCall", name: "show_widget" }] },
  });

  await controller.handleEvent({
    type: "toolcall_delta",
    contentIndex: 0,
    partial: {
      content: [{
        type: "toolCall",
        name: "show_widget",
        arguments: {
          title: "test_widget",
          widget_code: "<div>abcdefghijklmnopqrstuvwxyz</div>",
          width: 640,
          height: 480,
        },
      }],
    },
  });

  await new Promise((resolve) => setTimeout(resolve, fixture.expectations.debounceMs + 30));
  assert.match(openedHtml, /<!DOCTYPE html>/);
  fakeWindow.emit("ready");
  assert.equal(fakeWindow.sent.length, 1);
  assert.match(fakeWindow.sent[0], /window\._setContent/);

  await controller.handleEvent({
    type: "toolcall_end",
    contentIndex: 0,
    toolCall: {
      arguments: {
        widget_code: "<div>abcdefghijklmnopqrstuvwxyz<script>1<\/script></div>",
      },
    },
  });

  assert.match(fakeWindow.sent.at(-1) ?? "", /window\._runScripts/);
});

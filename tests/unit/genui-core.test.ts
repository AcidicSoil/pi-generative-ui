import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  shellHTML,
  wrapHTML,
  resolveGlimpseBackend,
  GenUIRuntime,
  AVAILABLE_MODULES,
} from "../../packages/genui-core/src/index.js";

class FakeWindow {
  public readonly sent: string[] = [];
  private readonly listeners = new Map<string, Array<(...args: any[]) => void>>();
  public closed = false;

  send(js: string) { this.sent.push(js); }
  close() { this.closed = true; }
  on(event: string, listener: (...args: any[]) => void) {
    const current = this.listeners.get(event) ?? [];
    current.push(listener);
    this.listeners.set(event, current);
  }
  emit(event: string, ...args: any[]) {
    for (const listener of this.listeners.get(event) ?? []) listener(...args);
  }
}

test("genui-core keeps the morphdom shell and wrapper behavior", () => {
  const shell = shellHTML();
  assert.match(shell, /window\._setContent/);
  assert.match(shell, /window\._runScripts/);
  assert.match(shell, /morphdom/);
  const wrapped = wrapHTML("<svg></svg>", true);
  assert.match(wrapped, /<!DOCTYPE html>/);
  assert.match(wrapped, /<svg>/);
});

test("genui-core remains Pi-independent", () => {
  const files = ["index.ts", "guidelines.ts", "svg-styles.ts", "platform.ts", "runtime.ts", "shell.ts", "types.ts"];
  for (const relative of files) {
    const content = readFileSync(path.join(process.cwd(), "packages/genui-core/src", relative), "utf8");
    assert.doesNotMatch(content, /@mariozechner\/pi-/);
    assert.doesNotMatch(content, /\.pi\/extensions\/generative-ui/);
  }
});

test("genui-core still exposes guideline modules and WSL backend behavior", () => {
  assert.ok(Array.isArray(AVAILABLE_MODULES));
  assert.ok(AVAILABLE_MODULES.length > 0);
  assert.equal(resolveGlimpseBackend({ GLIMPSE_BACKEND: "chromium" } as NodeJS.ProcessEnv), "chromium");
});

test("genui runtime launches widgets and buffers bridge events", async () => {
  const fakeWindow = new FakeWindow();
  let openedHtml = "";
  const runtime = new GenUIRuntime({
    async getGlimpse() {
      return { open(html: string) { openedHtml = html; return fakeWindow as any; } };
    },
  });

  const opened = await runtime.openWidget({
    sessionNamespace: "session-a",
    title: "demo_widget",
    initialCode: "<div>hello</div>",
  });
  assert.match(openedHtml, /<!DOCTYPE html>/);

  runtime.patchWidget({
    widgetId: opened.widgetId,
    htmlOrSvgFragment: "<div>patched<script>1<\/script></div>",
    runScripts: true,
  });
  assert.match(fakeWindow.sent.at(-1) ?? "", /window\._runScripts/);

  fakeWindow.emit("message", { clicked: true });
  const event = runtime.pollWidgetEvent(opened.widgetId);
  assert.deepEqual(event?.data, { clicked: true });

  const closed = runtime.closeWidget(opened.widgetId);
  assert.equal(closed, true);
  assert.equal(fakeWindow.closed, true);
});

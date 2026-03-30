import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createWidgetSidecar } from "../../packages/mcp-sidecar/src/index.js";

class FakeWindow {
  public readonly sent: string[] = [];
  public closed = false;
  private readonly listeners = new Map<string, Array<(...args: any[]) => void>>();

  send(js: string) {
    this.sent.push(js);
  }

  close() {
    this.closed = true;
  }

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

test("sidecar fallback flow matches golden sequence", async () => {
  const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/golden/fallback-sidecar-flow.json"), "utf8"));
  const fakeWindow = new FakeWindow();
  const sidecar = createWidgetSidecar({
    async getGlimpse() {
      return {
        open() {
          return fakeWindow as any;
        },
      };
    },
  });

  const sessionId = "session-1";
  const opened = await sidecar.openWidget(sessionId, {
    title: "demo_widget",
    widget_code: "<div>hello</div>",
  });
  assert.equal(opened.sessionId, sessionId);

  const patched = sidecar.patchWidget(sessionId, "<div>patched</div>");
  assert.equal(patched.sessionId, sessionId);

  const finalized = sidecar.finalizeWidget(sessionId, "<div>final<script>1<\/script></div>");
  assert.equal(finalized.finalized, true);

  sidecar.widgetEvent(sessionId, { clicked: true });
  assert.deepEqual(sidecar.registry.get(sessionId)?.messageData, { clicked: true });

  const closed = sidecar.closeWidget(sessionId);
  assert.equal(closed, true);
  assert.equal(fakeWindow.closed, true);

  assert.deepEqual(fixture.sequence, [
    "open_widget",
    "patch_widget",
    "finalize_widget",
    "widget_event",
    "close_widget",
  ]);
});

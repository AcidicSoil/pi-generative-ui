import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { GenUIRuntime } from "../../packages/genui-core/src/index.js";
import { createHermesGenuiMcpService } from "../../packages/hermes-genui-mcp/src/index.js";
import { createHermesGenuiPlugin, loadBundledSkill } from "../../packages/hermes-genui-plugin/src/index.js";

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

function createRuntimeWithWindows() {
  const windows: FakeWindow[] = [];
  const runtime = new GenUIRuntime({
    async getGlimpse() {
      return { open() { const window = new FakeWindow(); windows.push(window); return window as any; } };
    },
  });
  return { runtime, windows };
}

test("sessionized MCP service exposes only the intended tool surface", () => {
  const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/golden/sessionized-mcp-tools.json"), "utf8"));
  const service = createHermesGenuiMcpService(new GenUIRuntime({ async getGlimpse() { throw new Error("not needed"); } }));
  assert.deepEqual(service.listTools(), fixture.tools);
  assert.equal(service.config.exposeResources, fixture.resourcesExposed);
  assert.equal(service.config.exposePrompts, fixture.promptsExposed);
});

test("MCP widget lifecycle works across tool calls and sessions stay isolated", async () => {
  const { runtime, windows } = createRuntimeWithWindows();
  const service = createHermesGenuiMcpService(runtime);

  const first = await service.callTool("open_widget", {
    session_namespace: "session-1",
    title: "demo",
    initial_code: "<div>one</div>",
  });
  const second = await service.callTool("open_widget", {
    session_namespace: "session-2",
    title: "demo",
    initial_code: "<div>two</div>",
  });

  assert.notEqual(first.widget_id, second.widget_id);
  assert.notEqual(first.session_namespace, second.session_namespace);

  await service.callTool("patch_widget", {
    widget_id: first.widget_id,
    html_or_svg_fragment: "<div>patched</div>",
    run_scripts: false,
  });
  assert.match(windows[0].sent.at(-1) ?? "", /window\._setContent/);

  windows[0].emit("message", { slider: 42 });
  const polled = await service.callTool("widget_event_poll", { widget_id: first.widget_id });
  assert.deepEqual(polled.event?.data, { slider: 42 });

  const closed = await service.callTool("close_widget", { widget_id: first.widget_id });
  assert.equal(closed.ok, true);
  assert.equal(windows[0].closed, true);
  assert.equal(runtime.registry.get(second.widget_id)?.sessionNamespace, "session-2");
});

test("Hermes plugin bundles the skill, tracks read-me loading, and cleans up namespace orphans", async () => {
  const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/golden/plugin-skill-checks.json"), "utf8"));
  const { runtime } = createRuntimeWithWindows();
  const service = createHermesGenuiMcpService(runtime);
  const plugin = createHermesGenuiPlugin({
    closeSessionNamespace(sessionNamespace: string) {
      return service.closeSessionNamespace(sessionNamespace);
    },
  });

  const skill = loadBundledSkill();
  for (const fragment of fixture.mustMention) {
    assert.match(skill, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const pre = plugin.hooks.pre_llm_call({ sessionId: "session-1" });
  assert.match(pre.ephemeralContext, /visualize_read_me/);

  plugin.hooks.post_tool_call({ sessionId: "session-1", toolName: "visualize_read_me" });
  assert.equal(plugin.sessionState.get("session-1")?.readMeLoaded, true);

  const opened = await service.callTool("open_widget", {
    session_namespace: "session-1",
    title: "demo",
    initial_code: "<div>one</div>",
  });
  assert.ok(runtime.registry.get(opened.widget_id));

  await plugin.hooks.on_session_end({ sessionId: "session-1" });
  assert.equal(runtime.registry.get(opened.widget_id), undefined);
  assert.equal(plugin.sessionState.has("session-1"), false);
});

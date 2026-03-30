import { getGuidelines } from "./guidelines.js";
import { loadGlimpse } from "./platform.js";
import { escapeJS, shellHTML, wrapHTML } from "./shell.js";
import type {
  GlimpseLike,
  OpenWidgetParams,
  PatchWidgetParams,
  ShowWidgetArgs,
  StreamingToolCallDelta,
  StreamingWidgetState,
  WidgetEventRecord,
  WidgetSession,
  WidgetWindow,
} from "./types.js";

class WidgetEventQueue {
  private readonly eventsByWidget = new Map<string, WidgetEventRecord[]>();

  push(event: WidgetEventRecord): void {
    const queue = this.eventsByWidget.get(event.widgetId) ?? [];
    queue.push(event);
    this.eventsByWidget.set(event.widgetId, queue);
  }

  poll(widgetId: string): WidgetEventRecord | null {
    const queue = this.eventsByWidget.get(widgetId) ?? [];
    const event = queue.shift() ?? null;
    if (queue.length === 0) this.eventsByWidget.delete(widgetId);
    else this.eventsByWidget.set(widgetId, queue);
    return event;
  }

  clear(widgetId: string): void {
    this.eventsByWidget.delete(widgetId);
  }
}

class WidgetSessionRegistry {
  private readonly sessions = new Map<string, WidgetSession>();
  private readonly namespaces = new Map<string, Set<string>>();

  register(session: WidgetSession): WidgetSession {
    this.sessions.set(session.widgetId, session);
    const ids = this.namespaces.get(session.sessionNamespace) ?? new Set<string>();
    ids.add(session.widgetId);
    this.namespaces.set(session.sessionNamespace, ids);
    return session;
  }

  get(widgetId: string): WidgetSession | undefined {
    return this.sessions.get(widgetId);
  }

  listByNamespace(sessionNamespace: string): WidgetSession[] {
    return [...(this.namespaces.get(sessionNamespace) ?? new Set<string>())]
      .map((widgetId) => this.sessions.get(widgetId))
      .filter((session): session is WidgetSession => Boolean(session));
  }

  close(widgetId: string): boolean {
    const session = this.sessions.get(widgetId);
    if (!session) return false;
    this.sessions.delete(widgetId);
    const ids = this.namespaces.get(session.sessionNamespace);
    ids?.delete(widgetId);
    if (ids && ids.size === 0) this.namespaces.delete(session.sessionNamespace);
    try {
      session.window.close();
    } catch {}
    return true;
  }

  closeNamespace(sessionNamespace: string): number {
    const ids = [...(this.namespaces.get(sessionNamespace) ?? new Set<string>())];
    for (const widgetId of ids) this.close(widgetId);
    return ids.length;
  }
}

export class GenUIRuntime {
  readonly registry = new WidgetSessionRegistry();
  private readonly eventQueue = new WidgetEventQueue();
  private glimpseModule: any = null;

  constructor(
    private readonly options: {
      importer?: () => Promise<any>;
      getGlimpse?: () => Promise<GlimpseLike>;
    } = {},
  ) {}

  visualizeReadMe(modules: string[]) {
    return { modules, content: getGuidelines(modules as any) };
  }

  async openWidget(params: OpenWidgetParams): Promise<WidgetSession> {
    const glimpse = await this.acquireGlimpse();
    const isSVG =
      params.kind === "svg" ||
      (params.kind !== "html" && params.initialCode.trimStart().startsWith("<svg"));
    const width = params.width ?? 800;
    const height = params.height ?? 600;
    const title = params.title.replace(/_/g, " ");
    const widgetId = `${params.sessionNamespace}:${params.title}:${Date.now()}`;
    const window = glimpse.open(wrapHTML(params.initialCode, isSVG), {
      width,
      height,
      title,
      floating: params.floating ?? false,
    });

    const session = this.registry.register({
      widgetId,
      sessionNamespace: params.sessionNamespace,
      window,
      title,
      width,
      height,
      isSVG,
    });

    window.on("message", (data: unknown) => {
      this.eventQueue.push({
        widgetId,
        sessionNamespace: params.sessionNamespace,
        data,
        timestamp: Date.now(),
      });
    });

    window.on("closed", () => {
      this.eventQueue.clear(widgetId);
      if (this.registry.get(widgetId)) this.registry.close(widgetId);
    });

    return session;
  }

  patchWidget(params: PatchWidgetParams): WidgetSession {
    const session = this.registry.get(params.widgetId);
    if (!session) throw new Error(`Unknown widget: ${params.widgetId}`);
    const suffix = params.runScripts ? "; window._runScripts();" : "";
    session.window.send(`window._setContent('${escapeJS(params.htmlOrSvgFragment)}')${suffix}`);
    return session;
  }

  closeWidget(widgetId: string): boolean {
    this.eventQueue.clear(widgetId);
    return this.registry.close(widgetId);
  }

  closeNamespace(sessionNamespace: string): number {
    for (const session of this.registry.listByNamespace(sessionNamespace)) {
      this.eventQueue.clear(session.widgetId);
    }
    return this.registry.closeNamespace(sessionNamespace);
  }

  pollWidgetEvent(widgetId: string) {
    return this.eventQueue.poll(widgetId);
  }

  async showWidgetCompat(params: OpenWidgetParams): Promise<WidgetSession> {
    return this.openWidget(params);
  }

  async acquireGlimpse(): Promise<GlimpseLike> {
    if (this.options.getGlimpse) return this.options.getGlimpse();
    if (!this.glimpseModule) {
      const importer = this.options.importer ?? (() => import("glimpseui"));
      this.glimpseModule = await loadGlimpse(importer);
    }
    return this.glimpseModule;
  }
}

export class StreamingWidgetController {
  private streaming: StreamingWidgetState | null = null;
  private readonly debounceMs: number;

  constructor(
    private readonly options: {
      getGlimpse: () => Promise<GlimpseLike>;
      onWindowOpened?: (window: WidgetWindow) => void;
      debounceMs?: number;
    },
  ) {
    this.debounceMs = options.debounceMs ?? 150;
  }

  async handleEvent(event: StreamingToolCallDelta): Promise<void> {
    const raw: any = event;
    if (raw.type === "toolcall_start") {
      const block = raw.partial?.content?.[raw.contentIndex];
      if (block?.type === "toolCall" && block?.name === "show_widget") {
        this.streaming = {
          contentIndex: raw.contentIndex,
          window: null,
          lastHTML: "",
          updateTimer: null,
          ready: false,
          error: null,
        };
      }
      return;
    }

    if (!this.streaming || raw.contentIndex !== this.streaming.contentIndex) return;

    if (raw.type === "toolcall_delta") {
      const block = raw.partial?.content?.[raw.contentIndex];
      const html = block?.arguments?.widget_code;
      if (!html || html.length < 20 || html === this.streaming.lastHTML) return;
      this.streaming.lastHTML = html;
      if (this.streaming.updateTimer) return;

      this.streaming.updateTimer = setTimeout(async () => {
        const state = this.streaming;
        if (!state) return;
        state.updateTimer = null;
        try {
          if (!state.window) {
            const args = block?.arguments ?? {};
            const title = (args.title ?? "Widget").replace(/_/g, " ");
            const width = args.width ?? 800;
            const height = args.height ?? 600;
            const glimpse = await this.options.getGlimpse();
            state.window = glimpse.open(shellHTML(), { width, height, title });
            this.options.onWindowOpened?.(state.window);
            state.window.on("ready", () => {
              const current = this.streaming;
              if (!current) return;
              current.ready = true;
              try {
                current.window?.send(`window._setContent('${escapeJS(current.lastHTML)}')`);
              } catch (error) {
                current.error = error instanceof Error ? error : new Error(String(error));
              }
            });
            return;
          }
          if (state.ready) {
            state.window.send(`window._setContent('${escapeJS(state.lastHTML)}')`);
          }
        } catch (error) {
          state.error = error instanceof Error ? error : new Error(String(error));
        }
      }, this.debounceMs);
      return;
    }

    if (raw.type === "toolcall_end") {
      if (this.streaming.updateTimer) {
        clearTimeout(this.streaming.updateTimer);
        this.streaming.updateTimer = null;
      }
      const toolCall = raw.toolCall;
      if (toolCall?.arguments?.widget_code && this.streaming.window && this.streaming.ready) {
        this.streaming.window.send(
          `window._setContent('${escapeJS(toolCall.arguments.widget_code)}'); window._runScripts();`,
        );
      }
    }
  }

  claimWindowForExecution(code: string): WidgetWindow | null {
    if (this.streaming?.error) {
      const error = this.streaming.error;
      this.streaming = null;
      throw error;
    }
    if (!this.streaming?.window) return null;
    const window = this.streaming.window;
    if (this.streaming.ready) {
      window.send(`window._setContent('${escapeJS(code)}'); window._runScripts();`);
    }
    this.streaming = null;
    return window;
  }

  reset(): void {
    if (this.streaming?.updateTimer) clearTimeout(this.streaming.updateTimer);
    this.streaming = null;
  }
}

export function normalizeShowWidgetArgs(params: ShowWidgetArgs) {
  const code = params.widget_code;
  return {
    code,
    isSVG: code.trimStart().startsWith("<svg"),
    title: params.title.replace(/_/g, " "),
    width: params.width ?? 800,
    height: params.height ?? 600,
    floating: params.floating ?? false,
  };
}

import { escapeJS, shellHTML } from "../shell/html.js";
import type { GlimpseLike, ShowWidgetArgs, StreamingToolCallDelta, StreamingWidgetState, WidgetWindow } from "../types/index.js";

export interface StreamingControllerOptions {
  getGlimpse: () => Promise<GlimpseLike>;
  onWindowOpened?: (window: WidgetWindow) => void;
  debounceMs?: number;
}

export class StreamingWidgetController {
  private streaming: StreamingWidgetState | null = null;
  private readonly debounceMs: number;

  constructor(private readonly options: StreamingControllerOptions) {
    this.debounceMs = options.debounceMs ?? 150;
  }

  getState(): StreamingWidgetState | null {
    return this.streaming;
  }

  async handleEvent(event: StreamingToolCallDelta): Promise<void> {
    const raw: any = event;

    if (raw.type === "toolcall_start") {
      const partial: any = raw.partial;
      const block = partial?.content?.[raw.contentIndex];
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

    if (!this.streaming || raw.contentIndex !== this.streaming.contentIndex) {
      return;
    }

    if (raw.type === "toolcall_delta") {
      const partial: any = raw.partial;
      const block = partial?.content?.[raw.contentIndex];
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
    if (this.streaming?.updateTimer) {
      clearTimeout(this.streaming.updateTimer);
    }
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

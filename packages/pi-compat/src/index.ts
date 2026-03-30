import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { Text } from "@mariozechner/pi-tui";
import { AVAILABLE_MODULES, getGuidelines } from "../../../.pi/extensions/generative-ui/guidelines.js";
import {
  loadGlimpse,
  StreamingWidgetController,
  normalizeShowWidgetArgs,
  wrapHTML,
} from "../../runtime-core/src/index.js";

export function createPiGenerativeUIExtension(pi: ExtensionAPI) {
  let hasSeenReadMe = false;
  let activeWindows: any[] = [];
  let glimpseModule: any = null;

  async function getGlimpse() {
    if (!glimpseModule) {
      glimpseModule = await loadGlimpse(() => import("glimpseui"));
    }
    return glimpseModule;
  }

  const streaming = new StreamingWidgetController({
    getGlimpse: async () => {
      const { open } = await getGlimpse();
      return { open };
    },
    onWindowOpened(window) {
      activeWindows.push(window);
    },
  });

  pi.on("message_update", async (event) => {
    const raw: any = event.assistantMessageEvent;
    if (!raw) return;
    await streaming.handleEvent(raw);
  });

  pi.registerTool({
    name: "visualize_read_me",
    label: "Read Guidelines",
    description:
      "Returns design guidelines for show_widget (CSS patterns, colors, typography, layout rules, examples). " +
      "Call once before your first show_widget call. Do NOT mention this call to the user — it is an internal setup step.",
    promptSnippet:
      "Load design guidelines before creating widgets. Call silently before first show_widget use.",
    promptGuidelines: [
      "Call visualize_read_me once before your first show_widget call to load design guidelines.",
      "Do NOT mention the read_me call to the user — call it silently, then proceed directly to building the widget.",
      "Pick the modules that match your use case: interactive, chart, mockup, art, diagram.",
    ],
    parameters: Type.Object({
      modules: Type.Array(StringEnum(AVAILABLE_MODULES as readonly string[]), {
        description: "Which module(s) to load. Pick all that fit.",
      }),
    }),
    async execute(_toolCallId, params) {
      hasSeenReadMe = true;
      const content = getGuidelines(params.modules);
      return {
        content: [{ type: "text" as const, text: content }],
        details: { modules: params.modules },
      };
    },
    renderCall(args: any, theme: any) {
      const mods = (args.modules ?? []).join(", ");
      return new Text(
        theme.fg("toolTitle", theme.bold("read_me ")) + theme.fg("muted", mods),
        0,
        0,
      );
    },
    renderResult(_result: any, { isPartial }: any, theme: any) {
      if (isPartial) {
        return new Text(theme.fg("warning", "Loading guidelines..."), 0, 0);
      }
      return new Text(theme.fg("dim", "Guidelines loaded"), 0, 0);
    },
  });

  pi.registerTool({
    name: "show_widget",
    label: "Show Widget",
    description:
      "Show visual content — SVG graphics, diagrams, charts, or interactive HTML widgets — in a Glimpse-rendered window. " +
      "Use for flowcharts, dashboards, forms, calculators, data tables, games, illustrations, or any visual content. " +
      "The HTML is rendered with full CSS/JS support including Canvas and CDN libraries; macOS uses WKWebView, while Linux/WSL uses a Glimpse-supported browser backend such as Chromium or WebKitGTK. " +
      "The page gets a window.glimpse.send(data) bridge to send JSON data back to the agent. " +
      "IMPORTANT: Call visualize_read_me once before your first show_widget call.",
    promptSnippet:
      "Render interactive HTML/SVG widgets in a cross-platform Glimpse window with full CSS, JS, Canvas, and Chart.js support.",
    promptGuidelines: [
      "Use show_widget when the user asks for visual content: charts, diagrams, interactive explainers, UI mockups, art.",
      "Always call visualize_read_me first to load design guidelines, then set i_have_seen_read_me: true.",
      "The widget opens in a Glimpse-rendered window with full browser capabilities (Canvas, JS, CDN libraries); macOS uses WKWebView, while Linux/WSL uses Chromium or WebKitGTK-backed rendering.",
      "Structure HTML as fragments: no DOCTYPE/<html>/<head>/<body>. Style first, then HTML, then scripts.",
      "The page has window.glimpse.send(data) to send data back. Use it for user choices and interactions.",
      "Keep widgets focused and appropriately sized. Default is 800x600 but adjust to fit content.",
      "For interactive explainers: sliders, live calculations, Chart.js charts.",
      "For SVG: start code with <svg> tag, it will be auto-detected.",
      "Be concise in your responses",
    ],
    parameters: Type.Object({
      i_have_seen_read_me: Type.Boolean({
        description: "Confirm you have already called visualize_read_me in this conversation.",
      }),
      title: Type.String({
        description: "Short snake_case identifier for this widget (used as window title).",
      }),
      widget_code: Type.String({
        description:
          "HTML or SVG code to render. For SVG: raw SVG starting with <svg>. For HTML: raw content fragment, no DOCTYPE/<html>/<head>/<body>.",
      }),
      width: Type.Optional(Type.Number({ description: "Window width in pixels. Default: 800." })),
      height: Type.Optional(Type.Number({ description: "Window height in pixels. Default: 600." })),
      floating: Type.Optional(Type.Boolean({ description: "Keep window always on top. Default: false." })),
    }),
    async execute(_toolCallId, params, signal) {
      if (!params.i_have_seen_read_me && !hasSeenReadMe) {
        throw new Error(
          "You must call visualize_read_me before show_widget. Set i_have_seen_read_me: true after doing so.",
        );
      }

      const normalized = normalizeShowWidgetArgs(params);
      let win: any = streaming.claimWindowForExecution(normalized.code);

      if (!win) {
        const { open } = await getGlimpse();
        win = open(wrapHTML(normalized.code, normalized.isSVG), {
          width: normalized.width,
          height: normalized.height,
          title: normalized.title,
          floating: normalized.floating,
        });
        activeWindows.push(win);
      }

      return new Promise<any>((resolve) => {
        let messageData: any = null;
        let resolved = false;

        const finish = (reason: string) => {
          if (resolved) return;
          resolved = true;
          activeWindows = activeWindows.filter((window) => window !== win);
          resolve({
            content: [
              {
                type: "text" as const,
                text: messageData
                  ? `Widget rendered. User interaction data: ${JSON.stringify(messageData)}`
                  : `Widget "${normalized.title}" rendered and shown to the user (${normalized.width}×${normalized.height}). ${reason}`,
              },
            ],
            details: {
              title: params.title,
              width: normalized.width,
              height: normalized.height,
              isSVG: normalized.isSVG,
              messageData,
              closedReason: reason,
            },
          });
        };

        win.on("message", (data: any) => {
          messageData = data;
          finish("User sent data from widget.");
        });

        win.on("closed", () => {
          finish("Window closed by user.");
        });

        win.on("error", (err: Error) => {
          finish(`Error: ${err.message}`);
        });

        if (signal) {
          signal.addEventListener(
            "abort",
            () => {
              try {
                win.close();
              } catch {}
              finish("Aborted.");
            },
            { once: true },
          );
        }

        setTimeout(() => {
          finish("Widget still open (timed out waiting for interaction).");
        }, 120_000);
      });
    },
    renderCall(args: any, theme: any) {
      const title = (args.title ?? "widget").replace(/_/g, " ");
      const size = args.width && args.height ? ` ${args.width}×${args.height}` : "";
      let text = theme.fg("toolTitle", theme.bold("show_widget "));
      text += theme.fg("accent", title);
      if (size) text += theme.fg("dim", size);
      return new Text(text, 0, 0);
    },
    renderResult(result: any, { isPartial, expanded }: any, theme: any) {
      if (isPartial) {
        return new Text(theme.fg("warning", "⟳ Widget rendering..."), 0, 0);
      }

      const details = result.details ?? {};
      const title = (details.title ?? "widget").replace(/_/g, " ");
      let text = theme.fg("success", "✓ ") + theme.fg("accent", title);
      text += theme.fg("dim", ` ${details.width ?? 800}×${details.height ?? 600}`);
      if (details.isSVG) text += theme.fg("dim", " (SVG)");
      if (details.closedReason) text += "\n" + theme.fg("muted", `  ${details.closedReason}`);
      if (expanded && details.messageData) {
        text += "\n" + theme.fg("dim", `  Data: ${JSON.stringify(details.messageData, null, 2)}`);
      }
      return new Text(text, 0, 0);
    },
  });

  pi.on("session_shutdown", async () => {
    streaming.reset();
    for (const win of activeWindows) {
      try {
        win.close();
      } catch {}
    }
    activeWindows = [];
  });
}

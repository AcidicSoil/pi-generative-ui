import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { Text } from "@mariozechner/pi-tui";
import {
  AVAILABLE_MODULES,
  GenUIRuntime,
  StreamingWidgetController,
  normalizeShowWidgetArgs,
} from "../../../packages/genui-core/src/index.js";

export default function (pi: ExtensionAPI) {
  let hasSeenReadMe = false;
  let activeWindows: any[] = [];
  const runtime = new GenUIRuntime();

  const streaming = new StreamingWidgetController({
    getGlimpse: async () => runtime.acquireGlimpse(),
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
      "Returns design guidelines for show_widget. Call once before your first show_widget call.",
    promptSnippet:
      "Load design guidelines before creating widgets.",
    promptGuidelines: [
      "Call visualize_read_me once before your first show_widget call.",
      "Do not mention the call to the user.",
      "Pick the guideline modules that match your use case.",
    ],
    parameters: Type.Object({
      modules: Type.Array(StringEnum(AVAILABLE_MODULES as readonly string[]), {
        description: "Which module(s) to load.",
      }),
    }),
    async execute(_toolCallId, params) {
      hasSeenReadMe = true;
      const result = runtime.visualizeReadMe(params.modules);
      return {
        content: [{ type: "text" as const, text: result.content }],
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
      if (isPartial) return new Text(theme.fg("warning", "Loading guidelines..."), 0, 0);
      return new Text(theme.fg("dim", "Guidelines loaded"), 0, 0);
    },
  });

  pi.registerTool({
    name: "show_widget",
    label: "Show Widget",
    description:
      "Show visual HTML or SVG content in a Glimpse-rendered window. Call visualize_read_me first.",
    promptSnippet:
      "Render interactive HTML/SVG widgets in a Glimpse window.",
    promptGuidelines: [
      "Use show_widget for visual content.",
      "Call visualize_read_me first.",
      "Send HTML fragments or raw <svg>.",
      "Use window.glimpse.send(data) for interactions.",
    ],
    parameters: Type.Object({
      i_have_seen_read_me: Type.Boolean({
        description: "Confirm you have already called visualize_read_me.",
      }),
      title: Type.String({
        description: "Short snake_case identifier for the widget.",
      }),
      widget_code: Type.String({
        description: "HTML fragment or raw SVG code.",
      }),
      width: Type.Optional(Type.Number({ description: "Window width in pixels. Default 800." })),
      height: Type.Optional(Type.Number({ description: "Window height in pixels. Default 600." })),
      floating: Type.Optional(Type.Boolean({ description: "Keep window always on top. Default false." })),
    }),
    async execute(_toolCallId, params, signal) {
      if (!params.i_have_seen_read_me && !hasSeenReadMe) {
        throw new Error("You must call visualize_read_me before show_widget.");
      }

      const normalized = normalizeShowWidgetArgs(params);
      let win: any = streaming.claimWindowForExecution(normalized.code);

      if (!win) {
        const session = await runtime.showWidgetCompat({
          sessionNamespace: "pi-session",
          title: params.title,
          initialCode: normalized.code,
          kind: normalized.isSVG ? "svg" : "html",
          width: normalized.width,
          height: normalized.height,
          floating: normalized.floating,
        });
        win = session.window;
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
            content: [{
              type: "text" as const,
              text: messageData
                ? `Widget rendered. User interaction data: ${JSON.stringify(messageData)}`
                : `Widget \"${normalized.title}\" rendered and shown to the user (${normalized.width}×${normalized.height}). ${reason}`,
            }],
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
        win.on("closed", () => finish("Window closed by user."));
        win.on("error", (err: Error) => finish(`Error: ${err.message}`));

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
      if (isPartial) return new Text(theme.fg("warning", "⟳ Widget rendering..."), 0, 0);
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

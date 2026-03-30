import { AVAILABLE_MODULES, GenUIRuntime } from "../../genui-core/src/index.js";

export const MCP_WIDGET_TOOLS = [
  "visualize_read_me",
  "open_widget",
  "patch_widget",
  "close_widget",
  "widget_event_poll",
] as const;

export function createHermesGenuiMcpService(runtime = new GenUIRuntime()) {
  return {
    runtime,
    config: {
      exposeResources: false,
      exposePrompts: false,
      tools: [...MCP_WIDGET_TOOLS],
    },
    listTools() {
      return [...MCP_WIDGET_TOOLS];
    },
    async callTool(name: string, args: any) {
      switch (name) {
        case "visualize_read_me":
          return {
            ok: true,
            modules: args.modules,
            availableModules: AVAILABLE_MODULES,
            content: runtime.visualizeReadMe(args.modules ?? []).content,
          };
        case "open_widget": {
          const session = await runtime.openWidget({
            sessionNamespace: args.session_namespace,
            title: args.title,
            initialCode: args.initial_code,
            kind: args.kind ?? "auto",
            width: args.width,
            height: args.height,
          });
          return {
            ok: true,
            widget_id: session.widgetId,
            session_namespace: session.sessionNamespace,
            title: session.title,
            width: session.width,
            height: session.height,
            is_svg: session.isSVG,
          };
        }
        case "patch_widget": {
          const session = runtime.patchWidget({
            widgetId: args.widget_id,
            htmlOrSvgFragment: args.html_or_svg_fragment,
            runScripts: args.run_scripts ?? false,
          });
          return {
            ok: true,
            widget_id: session.widgetId,
            session_namespace: session.sessionNamespace,
          };
        }
        case "close_widget":
          return { ok: runtime.closeWidget(args.widget_id), widget_id: args.widget_id };
        case "widget_event_poll":
          return { ok: true, event: runtime.pollWidgetEvent(args.widget_id) };
        default:
          throw new Error(`Unknown MCP tool: ${name}`);
      }
    },
    async showWidgetCompat(args: any) {
      const session = await runtime.showWidgetCompat({
        sessionNamespace: args.session_namespace,
        title: args.title,
        initialCode: args.widget_code,
        kind: args.widget_code?.trimStart().startsWith("<svg") ? "svg" : "html",
        width: args.width,
        height: args.height,
      });
      return { ok: true, widget_id: session.widgetId };
    },
    closeSessionNamespace(sessionNamespace: string) {
      return runtime.closeNamespace(sessionNamespace);
    },
  };
}

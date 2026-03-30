import {
  WidgetSessionRegistry,
  escapeJS,
  normalizeShowWidgetArgs,
  wrapHTML,
  type GlimpseLike,
} from "../../../runtime-core/src/index.js";
import { getGuidelines, AVAILABLE_MODULES } from "../../../../.pi/extensions/generative-ui/guidelines.js";

export interface SidecarOptions {
  getGlimpse: () => Promise<GlimpseLike>;
  registry?: WidgetSessionRegistry;
}

export function createWidgetSidecar(options: SidecarOptions) {
  const registry = options.registry ?? new WidgetSessionRegistry();

  return {
    registry,
    availableModules: AVAILABLE_MODULES,

    visualizeReadMe(modules: string[]) {
      return {
        modules,
        content: getGuidelines(modules as any),
      };
    },

    async openWidget(sessionId: string, params: {
      title: string;
      widget_code: string;
      width?: number;
      height?: number;
      floating?: boolean;
    }) {
      const normalized = normalizeShowWidgetArgs(params);
      const glimpse = await options.getGlimpse();
      const window = glimpse.open(wrapHTML(normalized.code, normalized.isSVG), {
        width: normalized.width,
        height: normalized.height,
        title: normalized.title,
        floating: normalized.floating,
      });

      const session = registry.register({
        sessionId,
        window,
        title: normalized.title,
        width: normalized.width,
        height: normalized.height,
        finalized: false,
        messageData: null,
      });

      window.on("message", (data) => {
        session.messageData = data;
      });

      return session;
    },

    patchWidget(sessionId: string, widgetCode: string) {
      const session = registry.get(sessionId);
      if (!session) throw new Error(`Unknown widget session: ${sessionId}`);
      session.window.send(`window._setContent('${escapeJS(widgetCode)}')`);
      return session;
    },

    finalizeWidget(sessionId: string, widgetCode: string) {
      const session = registry.finalize(sessionId);
      if (!session) throw new Error(`Unknown widget session: ${sessionId}`);
      session.window.send(`window._setContent('${escapeJS(widgetCode)}'); window._runScripts();`);
      return session;
    },

    widgetEvent(sessionId: string, data: unknown) {
      const session = registry.get(sessionId);
      if (!session) throw new Error(`Unknown widget session: ${sessionId}`);
      session.messageData = data;
      return session;
    },

    closeWidget(sessionId: string) {
      return registry.close(sessionId);
    },

    cleanupOrphans() {
      registry.closeAll();
    },
  };
}

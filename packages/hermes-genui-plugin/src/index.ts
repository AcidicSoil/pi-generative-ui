import { readFileSync } from "node:fs";
import path from "node:path";

export interface HermesGenuiPluginOptions {
  closeSessionNamespace: (sessionNamespace: string) => number | Promise<number>;
}

export interface HermesGenuiPluginSessionState {
  readMeLoaded: boolean;
}

export function loadBundledSkill(): string {
  return readFileSync(path.join(process.cwd(), "packages/hermes-genui-plugin/SKILL.md"), "utf8");
}

export function createHermesGenuiPlugin(options: HermesGenuiPluginOptions) {
  const sessionState = new Map<string, HermesGenuiPluginSessionState>();
  const skill = loadBundledSkill();

  return {
    skill,
    sessionState,
    hooks: {
      pre_llm_call({ sessionId }: { sessionId: string }) {
        const state = sessionState.get(sessionId) ?? { readMeLoaded: false };
        sessionState.set(sessionId, state);
        return {
          ephemeralContext: state.readMeLoaded
            ? "GenUI guidelines already loaded for this session. Use open_widget first, then patch_widget for iterative updates."
            : "Before the first UI action, silently call visualize_read_me. Then use open_widget first and patch_widget for iterative updates.",
        };
      },
      post_tool_call({ sessionId, toolName }: { sessionId: string; toolName: string }) {
        const state = sessionState.get(sessionId) ?? { readMeLoaded: false };
        if (toolName === "visualize_read_me") state.readMeLoaded = true;
        sessionState.set(sessionId, state);
      },
      async on_session_end({ sessionId }: { sessionId: string }) {
        await options.closeSessionNamespace(sessionId);
        sessionState.delete(sessionId);
      },
    },
  };
}

export interface HermesLifecycleHooks {
  pre_llm_call?(context: unknown): Promise<void> | void;
  pre_tool_call?(context: unknown): Promise<void> | void;
  post_tool_call?(context: unknown): Promise<void> | void;
  on_session_end?(context: unknown): Promise<void> | void;
}

export interface HermesWidgetPluginOptions {
  instructions: string;
  sidecarEndpoint?: string;
}

export function createHermesWidgetPlugin(options: HermesWidgetPluginOptions): {
  instructions: string;
  hooks: HermesLifecycleHooks;
} {
  return {
    instructions: options.instructions,
    hooks: {
      pre_llm_call() {},
      pre_tool_call() {},
      post_tool_call() {},
      on_session_end() {},
    },
  };
}

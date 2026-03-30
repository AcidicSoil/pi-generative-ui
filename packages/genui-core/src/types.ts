export interface WidgetWindow {
  send(js: string): void;
  close(): void;
  on(event: "ready" | "message" | "closed" | "error", listener: (...args: any[]) => void): void;
}

export interface GlimpseLike {
  open(html: string, options: {
    width: number;
    height: number;
    title: string;
    floating?: boolean;
  }): WidgetWindow;
}

export interface ShowWidgetArgs {
  title: string;
  widget_code: string;
  width?: number;
  height?: number;
  floating?: boolean;
}

export interface OpenWidgetParams {
  sessionNamespace: string;
  title: string;
  initialCode: string;
  kind?: "html" | "svg" | "auto";
  width?: number;
  height?: number;
  floating?: boolean;
}

export interface PatchWidgetParams {
  widgetId: string;
  htmlOrSvgFragment: string;
  runScripts?: boolean;
}

export interface WidgetEventRecord {
  widgetId: string;
  sessionNamespace: string;
  data: unknown;
  timestamp: number;
}

export interface WidgetSession {
  widgetId: string;
  sessionNamespace: string;
  window: WidgetWindow;
  title: string;
  width: number;
  height: number;
  isSVG: boolean;
}

export interface StreamingToolCallDelta {
  type: "toolcall_start" | "toolcall_delta" | "toolcall_end";
  contentIndex: number;
  partial?: any;
  toolCall?: any;
}

export interface StreamingWidgetState {
  contentIndex: number;
  window: WidgetWindow | null;
  lastHTML: string;
  updateTimer: ReturnType<typeof setTimeout> | null;
  ready: boolean;
  error: Error | null;
}

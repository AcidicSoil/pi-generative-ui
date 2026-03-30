import type { WidgetWindow } from "../types/index.js";

export interface WidgetSession {
  sessionId: string;
  window: WidgetWindow;
  title: string;
  width: number;
  height: number;
  finalized: boolean;
  messageData: any;
}

export class WidgetSessionRegistry {
  private readonly sessions = new Map<string, WidgetSession>();

  register(session: WidgetSession): WidgetSession {
    this.sessions.set(session.sessionId, session);
    return session;
  }

  get(sessionId: string): WidgetSession | undefined {
    return this.sessions.get(sessionId);
  }

  finalize(sessionId: string): WidgetSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.finalized = true;
    }
    return session;
  }

  close(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    try {
      session.window.close();
    } catch {}
    return this.sessions.delete(sessionId);
  }

  closeAll(): void {
    for (const sessionId of this.sessions.keys()) {
      this.close(sessionId);
    }
  }

  list(): WidgetSession[] {
    return [...this.sessions.values()];
  }
}

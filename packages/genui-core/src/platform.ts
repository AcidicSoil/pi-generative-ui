import { existsSync, readFileSync } from "node:fs";

export function isWSL(): boolean {
  if (process.platform !== "linux") return false;
  if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) return true;
  try {
    if (existsSync("/proc/version")) {
      return /microsoft/i.test(readFileSync("/proc/version", "utf8"));
    }
  } catch {}
  return false;
}

export function resolveGlimpseBackend(env: NodeJS.ProcessEnv = process.env): string | undefined {
  if (env.GLIMPSE_BACKEND) return env.GLIMPSE_BACKEND;
  return isWSL() ? "chromium" : undefined;
}

export async function loadGlimpse(importer: () => Promise<any>): Promise<any> {
  const backend = resolveGlimpseBackend();
  if (backend && !process.env.GLIMPSE_BACKEND) {
    process.env.GLIMPSE_BACKEND = backend;
  }
  return importer();
}

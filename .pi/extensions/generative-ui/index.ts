import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createPiGenerativeUIExtension } from "../../../packages/pi-compat/src/index.js";

export default function (pi: ExtensionAPI) {
  return createPiGenerativeUIExtension(pi);
}

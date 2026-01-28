import type { ClaudeSettings } from "../utils/settings.js";

export function parseSandbox(settings: ClaudeSettings): string[] {
  const tools: string[] = [];

  if (!settings.sandbox?.excludedCommands) {
    return tools;
  }

  for (const command of settings.sandbox.excludedCommands) {
    if (typeof command === "string" && command.trim()) {
      const toolName = command.trim();
      if (!tools.includes(toolName)) {
        tools.push(toolName);
      }
    }
  }

  return tools;
}

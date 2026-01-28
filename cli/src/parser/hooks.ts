import type { ClaudeSettings } from "../utils/settings.js";

export function parseHooks(settings: ClaudeSettings): string[] {
  const tools: string[] = [];

  if (!settings.hooks) {
    return tools;
  }

  for (const hookGroup of Object.values(settings.hooks)) {
    if (hookGroup.hooks && Array.isArray(hookGroup.hooks)) {
      for (const hook of hookGroup.hooks) {
        if (typeof hook === "string" && hook.trim()) {
          const toolName = hook.split(/\s/)[0];
          if (toolName && !tools.includes(toolName)) {
            tools.push(toolName);
          }
        }
      }
    }
  }

  return tools;
}

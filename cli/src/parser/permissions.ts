import type { ClaudeSettings } from "../utils/settings.js";

const BASH_PATTERN = /^Bash\(([^)]+)\)$/;

export function parsePermissions(settings: ClaudeSettings): string[] {
  const tools: string[] = [];

  if (!settings.permissions) {
    return tools;
  }

  const allPermissions = [
    ...(settings.permissions.allow || []),
    ...(settings.permissions.deny || []),
    ...(settings.permissions.ask || []),
  ];

  for (const permission of allPermissions) {
    const match = permission.match(BASH_PATTERN);
    if (match) {
      const pattern = match[1];
      const toolName = pattern.split(/\s/)[0].replace(/[:*]+$/, "");
      if (toolName && !tools.includes(toolName)) {
        tools.push(toolName);
      }
    }
  }

  return tools;
}

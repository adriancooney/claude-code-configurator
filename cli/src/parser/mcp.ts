import type { ClaudeSettings } from "../utils/settings.js";

export function parseMcpServers(settings: ClaudeSettings): string[] {
  const servers: string[] = [];

  if (!settings.enabledMcpjsonServers) {
    return servers;
  }

  for (const server of settings.enabledMcpjsonServers) {
    if (typeof server === "string" && server.trim()) {
      if (!servers.includes(server)) {
        servers.push(server);
      }
    }
  }

  return servers;
}

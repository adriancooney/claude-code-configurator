import type { ClaudeSettings } from "../utils/settings.js";
import { parseHooks } from "./hooks.js";
import { parsePermissions } from "./permissions.js";
import { parseSandbox } from "./sandbox.js";
import { parseMcpServers } from "./mcp.js";

export interface ParsedToolReferences {
  hooks: string[];
  permissions: string[];
  sandbox: string[];
  mcpServers: string[];
}

export function parseSettings(settings: ClaudeSettings): ParsedToolReferences {
  return {
    hooks: parseHooks(settings),
    permissions: parsePermissions(settings),
    sandbox: parseSandbox(settings),
    mcpServers: parseMcpServers(settings),
  };
}

export function getAllToolNames(refs: ParsedToolReferences): string[] {
  const all = [...refs.hooks, ...refs.permissions, ...refs.sandbox];
  return [...new Set(all)];
}

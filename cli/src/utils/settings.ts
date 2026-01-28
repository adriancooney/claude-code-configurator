import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface ClaudeSettings {
  hooks?: Record<string, { hooks?: string[] }>;
  permissions?: {
    allow?: string[];
    deny?: string[];
    ask?: string[];
  };
  sandbox?: {
    excludedCommands?: string[];
  };
  enabledMcpjsonServers?: string[];
}

export interface LoadSettingsOptions {
  global?: boolean;
  local?: boolean;
}

export function getSettingsPath(options: LoadSettingsOptions): string {
  if (options.global) {
    return join(homedir(), ".claude", "settings.json");
  }
  return join(process.cwd(), ".claude", "settings.json");
}

export async function loadSettings(
  options: LoadSettingsOptions
): Promise<{ settings: ClaudeSettings; path: string }> {
  const path = getSettingsPath(options);

  if (!existsSync(path)) {
    throw new Error(`Settings file not found: ${path}`);
  }

  const content = await readFile(path, "utf-8");
  const settings = JSON.parse(content) as ClaudeSettings;

  return { settings, path };
}

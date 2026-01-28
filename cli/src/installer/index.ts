import { exec } from "child_process";
import { promisify } from "util";
import type { ToolDefinition } from "../registry/index.js";

const execAsync = promisify(exec);

export interface InstallResult {
  tool: string;
  success: boolean;
  error?: string;
}

export async function installTool(tool: ToolDefinition): Promise<InstallResult> {
  const platform = process.platform as "darwin" | "linux" | "win32";
  const installCommand = tool.install[platform];

  if (!installCommand) {
    return {
      tool: tool.name,
      success: false,
      error: `No install command for platform: ${platform}`,
    };
  }

  try {
    await execAsync(installCommand, {
      shell: "/bin/bash",
      env: {
        ...process.env,
        PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}`,
      },
    });
    return { tool: tool.name, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { tool: tool.name, success: false, error: message };
  }
}

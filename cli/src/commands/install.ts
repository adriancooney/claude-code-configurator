import chalk from "chalk";
import * as readline from "readline";
import { loadSettings, type LoadSettingsOptions } from "../utils/settings.js";
import { parseSettings } from "../parser/index.js";
import { lookupTool, lookupMcpServer, type ToolDefinition } from "../registry/index.js";
import { isToolInstalled } from "../utils/detect.js";
import { installTool } from "../installer/index.js";

interface InstallOptions extends LoadSettingsOptions {
  yes?: boolean;
}

interface ToolStatus {
  name: string;
  category: string;
  installed: boolean | null;
  inRegistry: boolean;
  definition?: ToolDefinition;
}

interface McpStatus {
  name: string;
  inRegistry: boolean;
  instructions?: string;
  url?: string;
}

async function prompt(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.toLowerCase().trim();
      resolve(normalized === "" || normalized === "y" || normalized === "yes");
    });
  });
}

export async function installCommand(options: InstallOptions): Promise<void> {
  const resolvedOptions = {
    global: options.global ?? false,
    local: options.local ?? !options.global,
  };

  try {
    const { settings, path } = await loadSettings(resolvedOptions);
    console.log(chalk.dim(`Loading settings from ${path}...\n`));

    const refs = parseSettings(settings);
    const toolStatuses: ToolStatus[] = [];
    const mcpStatuses: McpStatus[] = [];

    const addToolStatus = async (
      name: string,
      category: string
    ): Promise<void> => {
      if (toolStatuses.some((t) => t.name === name)) return;

      const def = lookupTool(name);
      if (def) {
        const installed = await isToolInstalled(def.detect);
        toolStatuses.push({
          name,
          category,
          installed,
          inRegistry: true,
          definition: def,
        });
      } else {
        toolStatuses.push({
          name,
          category,
          installed: null,
          inRegistry: false,
        });
      }
    };

    for (const tool of refs.hooks) await addToolStatus(tool, "HOOKS");
    for (const tool of refs.permissions)
      await addToolStatus(tool, "PERMISSIONS");
    for (const tool of refs.sandbox) await addToolStatus(tool, "SANDBOX");

    for (const server of refs.mcpServers) {
      const def = lookupMcpServer(server);
      mcpStatuses.push({
        name: server,
        inRegistry: !!def,
        instructions: def?.instructions,
        url: def?.url,
      });
    }

    console.log(chalk.bold("Tools detected in settings:\n"));

    const platform = process.platform as "darwin" | "linux" | "win32";
    const categories = ["HOOKS", "PERMISSIONS", "SANDBOX"];

    for (const cat of categories) {
      const tools = toolStatuses.filter((t) => t.category === cat);
      if (tools.length === 0) continue;

      const label =
        cat === "PERMISSIONS"
          ? "PERMISSIONS (Bash patterns)"
          : cat === "SANDBOX"
            ? "SANDBOX (Excluded commands)"
            : cat;
      console.log(chalk.cyan(`  ${label}`));

      for (const tool of tools) {
        if (!tool.inRegistry) {
          console.log(
            chalk.yellow(`    ? ${tool.name.padEnd(15)} unknown tool (skipping)`)
          );
        } else if (tool.installed) {
          console.log(chalk.green(`    \u2713 ${tool.name.padEnd(15)} installed`));
        } else {
          console.log(chalk.red(`    \u2717 ${tool.name.padEnd(15)} not installed`));
          const cmd = tool.definition?.install[platform];
          if (cmd) {
            console.log(chalk.dim(`      Install: ${cmd}`));
          }
        }
      }
      console.log();
    }

    if (mcpStatuses.length > 0) {
      console.log(chalk.cyan("  MCP SERVERS"));
      for (const mcp of mcpStatuses) {
        console.log(chalk.blue(`    \u2139 ${mcp.name} (MCP server)`));
        if (mcp.instructions) {
          console.log(chalk.dim(`      Setup: ${mcp.instructions}`));
        }
        if (mcp.url) {
          console.log(chalk.dim(`      Docs: ${mcp.url}`));
        }
      }
      console.log();
    }

    const installed = toolStatuses.filter((t) => t.installed === true).length;
    const toInstall = toolStatuses.filter(
      (t) => t.installed === false && t.inRegistry
    );
    const unknown = toolStatuses.filter((t) => !t.inRegistry).length;
    const mcpCount = mcpStatuses.length;

    console.log(
      chalk.dim(
        `Summary: ${installed} installed, ${toInstall.length} to install, ${unknown} unknown (skipped), ${mcpCount} MCP server(s) (manual)`
      )
    );

    if (toInstall.length === 0) {
      console.log(chalk.green("\nAll known tools are already installed."));
      return;
    }

    console.log();

    const shouldProceed = options.yes || (await prompt("Proceed with installation? [Y/n] "));

    if (!shouldProceed) {
      console.log(chalk.yellow("Installation cancelled."));
      return;
    }

    console.log();

    let successCount = 0;
    let failCount = 0;

    for (const tool of toInstall) {
      if (!tool.definition) continue;

      console.log(chalk.bold(`Installing ${tool.name}...`));
      const cmd = tool.definition.install[platform];
      if (cmd) {
        console.log(chalk.dim(`  Running: ${cmd}`));
      }

      const result = await installTool(tool.definition);

      if (result.success) {
        console.log(chalk.green(`  \u2713 ${tool.name} installed successfully\n`));
        successCount++;
      } else {
        console.log(chalk.red(`  \u2717 ${tool.name} installation failed`));
        if (result.error) {
          console.log(chalk.dim(`    Error: ${result.error}\n`));
        }
        failCount++;
      }
    }

    console.log(
      chalk.bold(
        `Done! ${successCount} tool(s) installed${failCount > 0 ? `, ${failCount} failed` : ""}.`
      )
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`Error: ${message}`));
    process.exit(1);
  }
}

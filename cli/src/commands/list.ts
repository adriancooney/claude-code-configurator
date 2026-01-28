import chalk from "chalk";
import { loadSettings, type LoadSettingsOptions } from "../utils/settings.js";
import { parseSettings } from "../parser/index.js";

export async function listCommand(options: LoadSettingsOptions): Promise<void> {
  const resolvedOptions = {
    global: options.global ?? false,
    local: options.local ?? !options.global,
  };

  try {
    const { settings, path } = await loadSettings(resolvedOptions);
    console.log(chalk.dim(`Loading settings from ${path}...\n`));

    const refs = parseSettings(settings);

    console.log(chalk.bold("Tool references in settings:\n"));

    if (refs.hooks.length > 0) {
      console.log(chalk.cyan("  HOOKS"));
      for (const tool of refs.hooks) {
        console.log(`    ${tool}`);
      }
      console.log();
    }

    if (refs.permissions.length > 0) {
      console.log(chalk.cyan("  PERMISSIONS (Bash patterns)"));
      for (const tool of refs.permissions) {
        console.log(`    ${tool}`);
      }
      console.log();
    }

    if (refs.sandbox.length > 0) {
      console.log(chalk.cyan("  SANDBOX (Excluded commands)"));
      for (const tool of refs.sandbox) {
        console.log(`    ${tool}`);
      }
      console.log();
    }

    if (refs.mcpServers.length > 0) {
      console.log(chalk.cyan("  MCP SERVERS"));
      for (const server of refs.mcpServers) {
        console.log(`    ${server}`);
      }
      console.log();
    }

    const totalTools =
      refs.hooks.length + refs.permissions.length + refs.sandbox.length;
    const totalMcp = refs.mcpServers.length;

    console.log(
      chalk.dim(`Found ${totalTools} tool reference(s), ${totalMcp} MCP server(s)`)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`Error: ${message}`));
    process.exit(1);
  }
}

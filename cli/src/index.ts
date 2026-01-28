#!/usr/bin/env node
import { Command } from "commander";
import { installCommand } from "./commands/install.js";
import { checkCommand } from "./commands/check.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program
  .name("configure-claude-code")
  .description("Detect and install tools referenced in Claude Code settings")
  .version("0.1.0");

program
  .command("install")
  .description("Install missing tools referenced in settings")
  .option("--global", "Use global settings (~/.claude/settings.json)")
  .option("--local", "Use local settings (.claude/settings.json)")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(installCommand);

program
  .command("check")
  .description("Check tool status without installing")
  .option("--global", "Use global settings (~/.claude/settings.json)")
  .option("--local", "Use local settings (.claude/settings.json)")
  .action(checkCommand);

program
  .command("list")
  .description("List tool references from settings")
  .option("--global", "Use global settings (~/.claude/settings.json)")
  .option("--local", "Use local settings (.claude/settings.json)")
  .action(listCommand);

program.parse();

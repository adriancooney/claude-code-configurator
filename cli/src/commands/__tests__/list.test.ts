import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("listCommand", () => {
  const testDir = join(tmpdir(), `ccc-list-test-${Date.now()}`);
  const settingsDir = join(testDir, ".claude");
  const settingsPath = join(settingsDir, "settings.json");
  let originalCwd: string;
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];

  beforeEach(() => {
    originalCwd = process.cwd();
    mkdirSync(settingsDir, { recursive: true });
    process.chdir(testDir);
    consoleLogs = [];
    consoleErrors = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      consoleLogs.push(args.join(" "));
    });
    vi.spyOn(console, "error").mockImplementation((...args) => {
      consoleErrors.push(args.join(" "));
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(testDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("lists hooks from settings", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        hooks: { UserPromptSubmit: { hooks: ["dcg", "other-tool"] } },
      })
    );

    const { listCommand } = await import("../list.js");
    await listCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("HOOKS");
    expect(output).toContain("dcg");
    expect(output).toContain("other-tool");
  });

  it("lists permissions from settings", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        permissions: { allow: ["Bash(npm *)"] },
      })
    );

    const { listCommand } = await import("../list.js");
    await listCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("PERMISSIONS");
    expect(output).toContain("npm");
  });

  it("lists MCP servers from settings", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        enabledMcpjsonServers: ["next-devtools"],
      })
    );

    const { listCommand } = await import("../list.js");
    await listCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("MCP SERVERS");
    expect(output).toContain("next-devtools");
  });

  it("shows summary count", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        hooks: { UserPromptSubmit: { hooks: ["dcg"] } },
        enabledMcpjsonServers: ["next-devtools"],
      })
    );

    const { listCommand } = await import("../list.js");
    await listCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("1 tool reference");
    expect(output).toContain("1 MCP server");
  });
});

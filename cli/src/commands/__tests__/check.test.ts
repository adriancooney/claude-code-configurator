import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("checkCommand", () => {
  const testDir = join(tmpdir(), `ccc-check-test-${Date.now()}`);
  const settingsDir = join(testDir, ".claude");
  const settingsPath = join(settingsDir, "settings.json");
  let originalCwd: string;
  let consoleLogs: string[] = [];

  beforeEach(() => {
    originalCwd = process.cwd();
    mkdirSync(settingsDir, { recursive: true });
    process.chdir(testDir);
    consoleLogs = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      consoleLogs.push(args.join(" "));
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(testDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("shows dcg as not installed when missing", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        hooks: { UserPromptSubmit: { hooks: ["dcg"] } },
      })
    );

    const { checkCommand } = await import("../check.js");
    await checkCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("dcg");
    expect(output).toMatch(/not installed|Install:/);
  });

  it("shows unknown tools as skipped", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        permissions: { allow: ["Bash(unknown-tool *)"] },
      })
    );

    const { checkCommand } = await import("../check.js");
    await checkCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("unknown-tool");
    expect(output).toContain("unknown tool (skipping)");
  });

  it("shows MCP server setup instructions", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        enabledMcpjsonServers: ["next-devtools"],
      })
    );

    const { checkCommand } = await import("../check.js");
    await checkCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("next-devtools");
    expect(output).toContain("MCP server");
    expect(output).toContain("Setup:");
  });

  it("shows summary with counts", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        hooks: { UserPromptSubmit: { hooks: ["dcg"] } },
        permissions: { allow: ["Bash(npm *)"] },
        enabledMcpjsonServers: ["next-devtools"],
      })
    );

    const { checkCommand } = await import("../check.js");
    await checkCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("Summary:");
    expect(output).toContain("to install");
    expect(output).toContain("unknown (skipped)");
    expect(output).toContain("MCP server");
  });
});

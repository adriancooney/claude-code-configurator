import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

vi.mock("readline", () => ({
  createInterface: () => ({
    question: (_q: string, cb: (answer: string) => void) => cb("n"),
    close: () => {},
  }),
}));

describe("installCommand", () => {
  const testDir = join(tmpdir(), `ccc-install-test-${Date.now()}`);
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

  it("shows all tools are installed when nothing to install", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        permissions: { allow: ["Bash(node *)"] },
      })
    );

    const { installCommand } = await import("../install.js");
    await installCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("unknown tool (skipping)");
  });

  it("shows plan before asking for confirmation", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        hooks: { UserPromptSubmit: { hooks: ["dcg"] } },
      })
    );

    const { installCommand } = await import("../install.js");
    await installCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("dcg");
    expect(output).toContain("not installed");
    expect(output).toContain("to install");
  });

  it("reports cancelled when user declines", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        hooks: { UserPromptSubmit: { hooks: ["dcg"] } },
      })
    );

    const { installCommand } = await import("../install.js");
    await installCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("cancelled");
  });

  it("shows MCP server information", async () => {
    writeFileSync(
      settingsPath,
      JSON.stringify({
        enabledMcpjsonServers: ["next-devtools"],
      })
    );

    const { installCommand } = await import("../install.js");
    await installCommand({ local: true });

    const output = consoleLogs.join("\n");
    expect(output).toContain("next-devtools");
    expect(output).toContain("MCP server");
    expect(output).toContain("manual");
  });
});

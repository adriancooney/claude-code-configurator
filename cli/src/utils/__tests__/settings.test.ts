import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getSettingsPath, loadSettings } from "../settings.js";

describe("getSettingsPath", () => {
  it("returns local path by default", () => {
    const path = getSettingsPath({});
    expect(path).toContain(".claude/settings.json");
    expect(path).not.toContain(".claude/.claude");
  });

  it("returns local path when local is true", () => {
    const path = getSettingsPath({ local: true });
    expect(path).toContain(".claude/settings.json");
  });

  it("returns global path when global is true", () => {
    const path = getSettingsPath({ global: true });
    expect(path).toContain(".claude/settings.json");
    expect(path).toMatch(/^\/Users|^\/home|^C:\\/);
  });
});

describe("loadSettings", () => {
  const testDir = join(tmpdir(), `ccc-test-${Date.now()}`);
  const settingsDir = join(testDir, ".claude");
  const settingsPath = join(settingsDir, "settings.json");
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    mkdirSync(settingsDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(testDir, { recursive: true, force: true });
  });

  it("loads valid settings file", async () => {
    const testSettings = {
      hooks: { UserPromptSubmit: { hooks: ["dcg"] } },
    };
    writeFileSync(settingsPath, JSON.stringify(testSettings));

    const { settings, path } = await loadSettings({ local: true });

    expect(path).toContain(".claude/settings.json");
    expect(settings.hooks).toBeDefined();
    expect(settings.hooks?.UserPromptSubmit?.hooks).toEqual(["dcg"]);
  });

  it("throws error for missing file", async () => {
    rmSync(settingsPath, { force: true });

    await expect(loadSettings({ local: true })).rejects.toThrow(
      /Settings file not found/
    );
  });

  it("throws error for invalid JSON", async () => {
    writeFileSync(settingsPath, "not valid json {{{");

    await expect(loadSettings({ local: true })).rejects.toThrow();
  });

  it("handles empty settings object", async () => {
    writeFileSync(settingsPath, "{}");

    const { settings } = await loadSettings({ local: true });

    expect(settings).toEqual({});
  });

  it("loads settings with all sections", async () => {
    const testSettings = {
      hooks: { UserPromptSubmit: { hooks: ["dcg"] } },
      permissions: { allow: ["Bash(npm *)"] },
      sandbox: { excludedCommands: ["docker"] },
      enabledMcpjsonServers: ["next-devtools"],
    };
    writeFileSync(settingsPath, JSON.stringify(testSettings));

    const { settings } = await loadSettings({ local: true });

    expect(settings.hooks).toBeDefined();
    expect(settings.permissions).toBeDefined();
    expect(settings.sandbox).toBeDefined();
    expect(settings.enabledMcpjsonServers).toBeDefined();
  });
});

import { describe, it, expect } from "vitest";
import { parseSettings, getAllToolNames } from "../index.js";

describe("parseSettings", () => {
  it("returns empty arrays for empty settings", () => {
    const result = parseSettings({});
    expect(result).toEqual({
      hooks: [],
      permissions: [],
      sandbox: [],
      mcpServers: [],
    });
  });

  it("parses all sections of settings", () => {
    const settings = {
      hooks: {
        UserPromptSubmit: { hooks: ["dcg"] },
      },
      permissions: {
        allow: ["Bash(npm *)"],
      },
      sandbox: {
        excludedCommands: ["docker"],
      },
      enabledMcpjsonServers: ["next-devtools"],
    };

    const result = parseSettings(settings);

    expect(result.hooks).toEqual(["dcg"]);
    expect(result.permissions).toEqual(["npm"]);
    expect(result.sandbox).toEqual(["docker"]);
    expect(result.mcpServers).toEqual(["next-devtools"]);
  });
});

describe("getAllToolNames", () => {
  it("returns empty array when no tools", () => {
    const refs = {
      hooks: [],
      permissions: [],
      sandbox: [],
      mcpServers: [],
    };
    expect(getAllToolNames(refs)).toEqual([]);
  });

  it("combines tools from all sources except MCP", () => {
    const refs = {
      hooks: ["dcg"],
      permissions: ["npm", "git"],
      sandbox: ["docker"],
      mcpServers: ["next-devtools"],
    };
    expect(getAllToolNames(refs)).toEqual(["dcg", "npm", "git", "docker"]);
  });

  it("deduplicates tools across sources", () => {
    const refs = {
      hooks: ["dcg"],
      permissions: ["dcg", "npm"],
      sandbox: ["npm"],
      mcpServers: [],
    };
    expect(getAllToolNames(refs)).toEqual(["dcg", "npm"]);
  });
});

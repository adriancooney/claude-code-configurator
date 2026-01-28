import { describe, it, expect } from "vitest";
import { parseMcpServers } from "../mcp.js";

describe("parseMcpServers", () => {
  it("returns empty array for settings without enabledMcpjsonServers", () => {
    expect(parseMcpServers({})).toEqual([]);
  });

  it("extracts single MCP server", () => {
    const settings = {
      enabledMcpjsonServers: ["next-devtools"],
    };
    expect(parseMcpServers(settings)).toEqual(["next-devtools"]);
  });

  it("extracts multiple MCP servers", () => {
    const settings = {
      enabledMcpjsonServers: ["next-devtools", "custom-server"],
    };
    expect(parseMcpServers(settings)).toEqual(["next-devtools", "custom-server"]);
  });

  it("deduplicates servers", () => {
    const settings = {
      enabledMcpjsonServers: ["next-devtools", "next-devtools"],
    };
    expect(parseMcpServers(settings)).toEqual(["next-devtools"]);
  });

  it("ignores empty strings", () => {
    const settings = {
      enabledMcpjsonServers: ["next-devtools", "", "custom-server"],
    };
    expect(parseMcpServers(settings)).toEqual(["next-devtools", "custom-server"]);
  });
});

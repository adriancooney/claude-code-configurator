import { describe, it, expect } from "vitest";
import {
  lookupTool,
  lookupMcpServer,
  getAllTools,
  getAllMcpServers,
} from "../index.js";

describe("lookupTool", () => {
  it("returns dcg tool definition", () => {
    const tool = lookupTool("dcg");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("dcg");
    expect(tool?.detect).toBe("which dcg");
    expect(tool?.install.darwin).toContain("curl");
    expect(tool?.install.linux).toContain("curl");
  });

  it("returns undefined for unknown tool", () => {
    expect(lookupTool("unknown-tool")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(lookupTool("")).toBeUndefined();
  });
});

describe("lookupMcpServer", () => {
  it("returns next-devtools server definition", () => {
    const server = lookupMcpServer("next-devtools");
    expect(server).toBeDefined();
    expect(server?.name).toBe("next-devtools");
    expect(server?.instructions).toContain("Next.js");
    expect(server?.url).toContain("nextjs.org");
  });

  it("returns undefined for unknown server", () => {
    expect(lookupMcpServer("unknown-server")).toBeUndefined();
  });
});

describe("getAllTools", () => {
  it("returns array of all tools", () => {
    const tools = getAllTools();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some((t) => t.name === "dcg")).toBe(true);
  });

  it("returns a copy, not the original array", () => {
    const tools1 = getAllTools();
    const tools2 = getAllTools();
    expect(tools1).not.toBe(tools2);
    expect(tools1).toEqual(tools2);
  });
});

describe("getAllMcpServers", () => {
  it("returns array of all MCP servers", () => {
    const servers = getAllMcpServers();
    expect(Array.isArray(servers)).toBe(true);
    expect(servers.length).toBeGreaterThan(0);
    expect(servers.some((s) => s.name === "next-devtools")).toBe(true);
  });

  it("returns a copy, not the original array", () => {
    const servers1 = getAllMcpServers();
    const servers2 = getAllMcpServers();
    expect(servers1).not.toBe(servers2);
    expect(servers1).toEqual(servers2);
  });
});

import { describe, it, expect } from "vitest";
import { parsePermissions } from "../permissions.js";

describe("parsePermissions", () => {
  it("returns empty array for settings without permissions", () => {
    expect(parsePermissions({})).toEqual([]);
  });

  it("returns empty array for empty permissions object", () => {
    expect(parsePermissions({ permissions: {} })).toEqual([]);
  });

  it("extracts tool from Bash(tool *) pattern", () => {
    const settings = {
      permissions: {
        allow: ["Bash(npm *)"],
      },
    };
    expect(parsePermissions(settings)).toEqual(["npm"]);
  });

  it("extracts tool from Bash(tool:*) pattern", () => {
    const settings = {
      permissions: {
        allow: ["Bash(git:*)"],
      },
    };
    expect(parsePermissions(settings)).toEqual(["git"]);
  });

  it("extracts tools from allow, deny, and ask arrays", () => {
    const settings = {
      permissions: {
        allow: ["Bash(npm *)"],
        deny: ["Bash(rm -rf *)"],
        ask: ["Bash(docker *)"],
      },
    };
    expect(parsePermissions(settings)).toEqual(["npm", "rm", "docker"]);
  });

  it("deduplicates tools across permission types", () => {
    const settings = {
      permissions: {
        allow: ["Bash(npm install *)"],
        ask: ["Bash(npm publish *)"],
      },
    };
    expect(parsePermissions(settings)).toEqual(["npm"]);
  });

  it("ignores non-Bash permissions", () => {
    const settings = {
      permissions: {
        allow: ["Read", "Write", "Bash(git:*)"],
      },
    };
    expect(parsePermissions(settings)).toEqual(["git"]);
  });

  it("handles compound commands like 'npx tsc'", () => {
    const settings = {
      permissions: {
        allow: ["Bash(npx tsc:*)"],
      },
    };
    expect(parsePermissions(settings)).toEqual(["npx"]);
  });

  it("handles multiple tools in allow array", () => {
    const settings = {
      permissions: {
        allow: [
          "Bash(ls:*)",
          "Bash(cat:*)",
          "Bash(grep:*)",
        ],
      },
    };
    expect(parsePermissions(settings)).toEqual(["ls", "cat", "grep"]);
  });

  it("strips trailing colons and asterisks from tool names", () => {
    const settings = {
      permissions: {
        allow: ["Bash(git:*)"],
      },
    };
    const result = parsePermissions(settings);
    expect(result[0]).toBe("git");
    expect(result[0]).not.toContain(":");
    expect(result[0]).not.toContain("*");
  });

  it("handles WebFetch and other patterns without extracting tools", () => {
    const settings = {
      permissions: {
        allow: [
          "WebFetch(domain:github.com)",
          "Bash(curl:*)",
        ],
      },
    };
    expect(parsePermissions(settings)).toEqual(["curl"]);
  });
});

import { describe, it, expect } from "vitest";
import { parseSandbox } from "../sandbox.js";

describe("parseSandbox", () => {
  it("returns empty array for settings without sandbox", () => {
    expect(parseSandbox({})).toEqual([]);
  });

  it("returns empty array for sandbox without excludedCommands", () => {
    expect(parseSandbox({ sandbox: {} })).toEqual([]);
  });

  it("extracts single excluded command", () => {
    const settings = {
      sandbox: {
        excludedCommands: ["docker"],
      },
    };
    expect(parseSandbox(settings)).toEqual(["docker"]);
  });

  it("extracts multiple excluded commands", () => {
    const settings = {
      sandbox: {
        excludedCommands: ["docker", "ssh", "kubectl"],
      },
    };
    expect(parseSandbox(settings)).toEqual(["docker", "ssh", "kubectl"]);
  });

  it("deduplicates commands", () => {
    const settings = {
      sandbox: {
        excludedCommands: ["docker", "docker", "ssh"],
      },
    };
    expect(parseSandbox(settings)).toEqual(["docker", "ssh"]);
  });

  it("trims whitespace from command names", () => {
    const settings = {
      sandbox: {
        excludedCommands: ["  docker  ", "ssh"],
      },
    };
    expect(parseSandbox(settings)).toEqual(["docker", "ssh"]);
  });

  it("ignores empty strings", () => {
    const settings = {
      sandbox: {
        excludedCommands: ["docker", "", "  ", "ssh"],
      },
    };
    expect(parseSandbox(settings)).toEqual(["docker", "ssh"]);
  });
});

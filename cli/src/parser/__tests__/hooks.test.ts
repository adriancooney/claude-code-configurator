import { describe, it, expect } from "vitest";
import { parseHooks } from "../hooks.js";

describe("parseHooks", () => {
  it("returns empty array for settings without hooks", () => {
    expect(parseHooks({})).toEqual([]);
  });

  it("returns empty array for empty hooks object", () => {
    expect(parseHooks({ hooks: {} })).toEqual([]);
  });

  it("extracts single hook tool", () => {
    const settings = {
      hooks: {
        UserPromptSubmit: {
          hooks: ["dcg"],
        },
      },
    };
    expect(parseHooks(settings)).toEqual(["dcg"]);
  });

  it("extracts multiple hooks from same event", () => {
    const settings = {
      hooks: {
        UserPromptSubmit: {
          hooks: ["dcg", "another-tool"],
        },
      },
    };
    expect(parseHooks(settings)).toEqual(["dcg", "another-tool"]);
  });

  it("extracts hooks from multiple events", () => {
    const settings = {
      hooks: {
        UserPromptSubmit: {
          hooks: ["dcg"],
        },
        PreToolUse: {
          hooks: ["validator"],
        },
      },
    };
    expect(parseHooks(settings)).toEqual(["dcg", "validator"]);
  });

  it("deduplicates hooks appearing in multiple events", () => {
    const settings = {
      hooks: {
        UserPromptSubmit: {
          hooks: ["dcg"],
        },
        PreToolUse: {
          hooks: ["dcg"],
        },
      },
    };
    expect(parseHooks(settings)).toEqual(["dcg"]);
  });

  it("extracts tool name from hook with arguments", () => {
    const settings = {
      hooks: {
        UserPromptSubmit: {
          hooks: ["dcg --strict --verbose"],
        },
      },
    };
    expect(parseHooks(settings)).toEqual(["dcg"]);
  });

  it("ignores empty strings in hooks array", () => {
    const settings = {
      hooks: {
        UserPromptSubmit: {
          hooks: ["dcg", "", "  "],
        },
      },
    };
    expect(parseHooks(settings)).toEqual(["dcg"]);
  });

  it("handles hook groups without hooks array", () => {
    const settings = {
      hooks: {
        UserPromptSubmit: {},
      },
    };
    expect(parseHooks(settings)).toEqual([]);
  });
});

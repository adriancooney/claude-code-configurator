import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { installTool } from "../index.js";
import type { ToolDefinition } from "../../registry/index.js";
import * as childProcess from "child_process";
import { promisify } from "util";

vi.mock("child_process", async () => {
  const actual = await vi.importActual<typeof childProcess>("child_process");
  return {
    ...actual,
    exec: vi.fn(),
  };
});

describe("installTool", () => {
  const mockExec = vi.mocked(childProcess.exec);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns success when install command succeeds", async () => {
    mockExec.mockImplementation((_cmd, _opts, callback) => {
      if (typeof callback === "function") {
        callback(null, { stdout: "success", stderr: "" } as any, "");
      }
      return {} as any;
    });

    const tool: ToolDefinition = {
      name: "test-tool",
      detect: "which test-tool",
      install: {
        darwin: "echo install",
        linux: "echo install",
      },
    };

    const result = await installTool(tool);

    expect(result.success).toBe(true);
    expect(result.tool).toBe("test-tool");
    expect(result.error).toBeUndefined();
  });

  it("returns failure when no install command for platform", async () => {
    const tool: ToolDefinition = {
      name: "windows-only",
      detect: "which windows-only",
      install: {
        win32: "echo install",
      },
    };

    const result = await installTool(tool);

    expect(result.success).toBe(false);
    expect(result.tool).toBe("windows-only");
    expect(result.error).toContain("No install command for platform");
  });

  it("returns failure with error message when install fails", async () => {
    mockExec.mockImplementation((_cmd, _opts, callback) => {
      if (typeof callback === "function") {
        callback(new Error("Command failed") as any, null as any, "");
      }
      return {} as any;
    });

    const tool: ToolDefinition = {
      name: "failing-tool",
      detect: "which failing-tool",
      install: {
        darwin: "exit 1",
        linux: "exit 1",
      },
    };

    const result = await installTool(tool);

    expect(result.success).toBe(false);
    expect(result.tool).toBe("failing-tool");
    expect(result.error).toBeDefined();
  });
});

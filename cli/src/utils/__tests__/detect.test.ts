import { describe, it, expect } from "vitest";
import { isToolInstalled } from "../detect.js";

describe("isToolInstalled", () => {
  it("returns true for installed tools (node)", async () => {
    const result = await isToolInstalled("which node");
    expect(result).toBe(true);
  });

  it("returns false for non-existent tools", async () => {
    const result = await isToolInstalled("which definitely-not-a-real-command-12345");
    expect(result).toBe(false);
  });

  it("returns true for successful command", async () => {
    const result = await isToolInstalled("true");
    expect(result).toBe(true);
  });

  it("returns false for failed command", async () => {
    const result = await isToolInstalled("false");
    expect(result).toBe(false);
  });
});

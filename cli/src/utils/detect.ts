import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function isToolInstalled(detectCommand: string): Promise<boolean> {
  try {
    await execAsync(detectCommand);
    return true;
  } catch {
    return false;
  }
}

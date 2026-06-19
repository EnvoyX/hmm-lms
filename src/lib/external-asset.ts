import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * True if a file exists under /public (use for optional editorial imagery).
 */
export function publicFileExists(relativeToPublic: string): boolean {
  const path = join(process.cwd(), "public", relativeToPublic);
  return existsSync(path);
}

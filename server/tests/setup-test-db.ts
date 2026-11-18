
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default function setup() {
  const directory = mkdtempSync(
    join(tmpdir(), "coy-discover-test-")
  );

  const databasePath = join(directory, "test.db");

  // Point Prisma to a temporary SQLite database.
  process.env.DATABASE_URL =
    `file:${databasePath.replace(/\\/g, "/")}`;

  try {
    execFileSync(
      "npx",
      ["prisma", "db", "push", "--skip-generate"],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: "inherit",
        shell: process.platform === "win32",
      }
    );
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }

  return () => {
    rmSync(directory, { recursive: true, force: true });
  };
}

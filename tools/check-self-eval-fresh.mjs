#!/usr/bin/env node
import { mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const reportPath = "self-evaluations/foundation-20260614/report.md";
const renderCommand = [
  "self-eval:render",
  "--silent"
];

const before = await readFile(reportPath, "utf8");
const tempDir = await mkdtemp(join(tmpdir(), "ai-native-eval-self-eval-"));
const backupPath = join(tempDir, "report.md");

try {
  await writeFile(backupPath, before);
  const result = spawnSync("pnpm", renderCommand, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe"
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  const after = await readFile(reportPath, "utf8");
  if (after !== before) {
    await writeFile(reportPath, before);
    console.error(
      `${reportPath} is stale. Run pnpm self-eval:render and commit the updated report.`
    );
    process.exit(1);
  }

  await rename(backupPath, join(dirname(backupPath), "checked-report.md"));
  console.log(`${reportPath} is fresh`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

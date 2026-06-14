import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { chromium } from "playwright";

test(
  "real agent e2e invokes Codex to run ai-native-eval and opens the generated report",
  { timeout: 900_000 },
  async (t) => {
    if (process.env.RUN_REAL_CODEX_E2E !== "1") {
      t.skip("Set RUN_REAL_CODEX_E2E=1 or run pnpm test:agent to invoke Codex.");
      return;
    }

    const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-real-agent-e2e-"));
    const projectDir = join(tempRoot, "project");
    const fixtureProject = join(process.cwd(), "fixtures/real-agent-project");
    const sourceSkillsDir = join(process.cwd(), "../../..");
    const projectSkillsDir = join(projectDir, ".agents/skills");
    const runFolder = join(projectDir, ".ai-native-eval/artifacts/runs/real-agent-e2e");
    const reportPath = join(projectDir, ".ai-native-eval/artifacts/reports/real-agent-e2e.html");
    const lastMessagePath = join(
      projectDir,
      ".ai-native-eval/artifacts/real-agent-last-message.md"
    );
    const logPath = join(projectDir, ".ai-native-eval/artifacts/real-agent-codex.log");
    let keepArtifacts = process.env.KEEP_REAL_AGENT_E2E_ARTIFACTS === "1";

    try {
      await cp(fixtureProject, projectDir, { recursive: true });
      await copySkillsForFixture(sourceSkillsDir, projectSkillsDir);
      await runProcess("git", ["init"], { cwd: projectDir, timeoutMs: 30_000 });
      await runProcess("git", ["add", "."], { cwd: projectDir, timeoutMs: 30_000 });
      await runProcess("git", ["commit", "-m", "Initial fixture"], {
        cwd: projectDir,
        timeoutMs: 30_000,
        env: {
          GIT_AUTHOR_NAME: "AI Native Test",
          GIT_AUTHOR_EMAIL: "ai-native-test@example.com",
          GIT_COMMITTER_NAME: "AI Native Test",
          GIT_COMMITTER_EMAIL: "ai-native-test@example.com"
        }
      });

      const prompt = realAgentPrompt();
      await runProcess(
        "codex",
        [
          "exec",
          "--dangerously-bypass-approvals-and-sandbox",
          "--skip-git-repo-check",
          "-C",
          projectDir,
          "--output-last-message",
          lastMessagePath,
          prompt
        ],
        {
          cwd: projectDir,
          timeoutMs: 780_000,
          logPath,
          env: { RUN_REAL_CODEX_E2E: "1" }
        }
      );

      await assertFile(runFolder);
      await assertFile(join(runFolder, "run.json"));
      await assertFile(reportPath);

      const evaluatorFiles = await readdir(join(runFolder, "evaluators"));
      assert.ok(
        evaluatorFiles.includes("ai-native-local-runtime-command-evaluator.json"),
        `expected local runtime evaluator output; got ${evaluatorFiles.join(", ")}`
      );
      assert.ok(
        evaluatorFiles.includes(
          "ai-native-local-environment-reproducibility-evaluator.json"
        ),
        `expected local environment evaluator output; got ${evaluatorFiles.join(", ")}`
      );

      await runProcess(
        process.execPath,
        [
          join(projectSkillsDir, "ai-native-eval/scripts/eval/dist/src/cli.js"),
          "validate-folder",
          runFolder,
          "--skills-dir",
          projectSkillsDir
        ],
        { cwd: projectDir, timeoutMs: 60_000 }
      );

      const runtimeOutput = JSON.parse(
        await readFile(
          join(runFolder, "evaluators/ai-native-local-runtime-command-evaluator.json"),
          "utf8"
        )
      ) as { deductions?: Array<{ groupId: string; deductionId: string; applies: boolean }> };
      const environmentOutput = JSON.parse(
        await readFile(
          join(
            runFolder,
            "evaluators/ai-native-local-environment-reproducibility-evaluator.json"
          ),
          "utf8"
        )
      ) as { deductions?: Array<{ groupId: string; deductionId: string; applies: boolean }> };

      assert.ok(
        !runtimeOutput.deductions?.some(
          (deduction) =>
            deduction.groupId === "runtime-entrypoints" &&
            deduction.deductionId === "missing-runtime-entrypoints" &&
            deduction.applies === true
        ),
        "expected the real agent not to claim runtime entrypoints are missing"
      );
      assert.ok(
        environmentOutput.deductions?.some((deduction) => deduction.applies),
        "expected the real agent to apply at least one environment reproducibility deduction"
      );

      const browser = await chromium.launch();
      try {
        const page = await browser.newPage();
        await page.goto(pathToFileURL(reportPath).href);
        await page.getByText("Score", { exact: false }).first().waitFor();
        await page.getByText("Run Configuration", { exact: false }).first().waitFor();
        await page.getByText("Evaluation Tree", { exact: false }).first().waitFor();
        await page
          .getByText("Local runtime command evaluator", { exact: false })
          .first()
          .waitFor();
        await page
          .getByText("Local environment reproducibility evaluator", {
            exact: false
          })
          .first()
          .waitFor();
      } finally {
        await browser.close();
      }
    } catch (error) {
      keepArtifacts = true;
      console.error(`Real agent fixture preserved at ${projectDir}`);
      throw error;
    } finally {
      if (!keepArtifacts) {
        await rm(tempRoot, { recursive: true, force: true });
      }
    }
  }
);

function realAgentPrompt(): string {
  return `
Use the local project skill at .agents/skills/ai-native-eval/SKILL.md to run a real AI-native eval evaluation for this repository.

This is an automated real-agent E2E test. Do not ask for clarification. Do not use prewritten evaluator outputs. You must inspect this repo and write fresh evaluator JSON files yourself.

Required artifact paths:
- run folder: .ai-native-eval/artifacts/runs/real-agent-e2e
- HTML report: .ai-native-eval/artifacts/reports/real-agent-e2e.html

Required workflow:
1. Read .agents/skills/ai-native-eval/SKILL.md.
2. Install/build the bundled eval tool if needed.
3. Run init-run for this repo using the required run folder. The repo already has .ai-native-eval/config.json; use it.
4. Evaluate the enabled leaf evaluators from the runtime-resolved tree. The project config disables all built-in roots except repo operability, so the enabled leaves should be local runtime command and local environment reproducibility.
5. Write one JSON output file per enabled leaf under .ai-native-eval/artifacts/runs/real-agent-e2e/evaluators/.
6. Validate the folder with the bundled tool.
7. Render the static HTML report to .ai-native-eval/artifacts/reports/real-agent-e2e.html.

Acceptance expectations:
- The local runtime command evaluator should recognize that package scripts for dev, build, and test exist.
- The local environment reproducibility evaluator should notice at least one gap, because README intentionally does not document reset, cleanup, or local machine state recovery.

Keep your final answer short and include the run folder and report path.
`.trim();
}

async function copySkillsForFixture(source: string, destination: string): Promise<void> {
  await cp(source, destination, {
    recursive: true,
    filter: (sourcePath) => {
      const rel = relative(source, sourcePath);
      if (!rel) return true;
      const parts = rel.split("/");
      return (
        !parts.includes("node_modules") &&
        !parts.includes("dist") &&
        !parts.includes(".ai-native-eval")
      );
    }
  });
}

async function assertFile(path: string): Promise<void> {
  await access(path);
  const info = await stat(path);
  assert.ok(info.isFile() || info.isDirectory(), `${path} should exist`);
}

async function runProcess(
  command: string,
  args: string[],
  options: {
    cwd: string;
    timeoutMs: number;
    env?: NodeJS.ProcessEnv;
    logPath?: string;
  }
): Promise<void> {
  await mkdir(dirname(options.logPath ?? join(options.cwd, ".unused")), {
    recursive: true
  });
  const log = options.logPath ? createWriteStream(options.logPath, { flags: "a" }) : undefined;
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const timer = setTimeout(() => child.kill("SIGTERM"), options.timeoutMs);
  child.stdout.pipe(log ?? process.stdout);
  child.stderr.pipe(log ?? process.stderr);

  const code = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  clearTimeout(timer);
  log?.end();
  if (code !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with code ${code}`);
  }
}

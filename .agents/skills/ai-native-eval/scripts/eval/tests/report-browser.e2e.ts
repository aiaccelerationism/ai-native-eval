import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { chromium } from "playwright";

const execFileAsync = promisify(execFile);

test("browser report e2e opens a CLI-rendered report and exercises basic UI", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ai-native-browser-e2e-"));
  const reportPath = join(tempRoot, "report.html");
  const pageErrors: string[] = [];

  try {
    await execFileAsync(
      process.execPath,
      [
        "dist/src/cli.js",
        "render-folder",
        "fixtures/folder-run.browser-e2e",
        "--out",
        reportPath,
        "--skills-dir",
        "../../../"
      ],
      { timeout: 30_000 }
    );

    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await page.goto(pathToFileURL(reportPath).href);

      await assertVisibleText(page, "AI Native Eval Report");
      await assertVisibleText(page, "Score");
      await assertVisibleText(page, "Run Configuration");
      await assertVisibleText(page, "Evaluation Tree");
      await assertVisibleText(page, "additional");
      await assertVisibleText(page, "disabled");
      await assertVisibleText(page, "Incomplete runtime command validation");

      const runtimeRow = page.locator(
        '[data-node-id="ai-native-local-runtime-command-evaluator"]'
      );
      await assert.equal(await runtimeRow.isVisible(), true);

      const toggle = runtimeRow.locator("[data-toggle-node]");
      await toggle.click();
      await assert.equal(
        await page.locator('[data-detail-for="ai-native-local-runtime-command-evaluator"]').isVisible(),
        false
      );
      await toggle.click();
      await assert.equal(
        await page.locator('[data-detail-for="ai-native-local-runtime-command-evaluator"]').isVisible(),
        true
      );

      await page.locator("[data-language-select]").selectOption("zh-TW");
      await assertVisibleText(page, "AI Native 段位報告");
      await assertVisibleText(page, "執行設定");

      await page.locator("[data-copy-prompt]").first().click();
      assert.deepEqual(pageErrors, []);
    } finally {
      await browser.close();
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

async function assertVisibleText(
  page: import("playwright").Page,
  text: string
): Promise<void> {
  await page.getByText(text, { exact: false }).first().waitFor({
    state: "visible",
    timeout: 5_000
  });
}

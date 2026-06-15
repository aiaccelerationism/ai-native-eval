# Runtime And Command Surface

This repo uses a thin root `package.json` wrapper around the bundled TypeScript eval tool in `.agents/skills/ai-native-eval/scripts/eval/`.

## Prerequisites

- Node.js compatible with the checked-in lockfiles.
- `pnpm`.
- A local `codex` CLI only for live skill evals or real-agent E2E tests.

Install dependencies from the repo root:

```sh
pnpm install --frozen-lockfile
```

The default test command also installs the nested eval tool dependencies with a frozen lockfile:

```sh
pnpm test
```

Expected result: Node test output from root tests and the nested eval tool tests, ending with a passing exit code.

## Core Commands

```sh
pnpm build
```

Builds the nested eval TypeScript tool.

```sh
pnpm test
```

Runs deterministic root packaging checks and nested eval tests. This is the stable default CI-like command and does not invoke a real AI agent.

```sh
pnpm render:example
pnpm score:example
pnpm persist:example
```

Render, score, or persist bundled fixtures for smoke testing the report pipeline.

```sh
pnpm skill-eval:contract
```

Validates every skill eval fixture through `skillgrade` without invoking a real agent.

```sh
pnpm skill-eval:live
```

Runs skill evals through the real local Codex CLI. This is intentionally slower and less deterministic than contract mode.

```sh
pnpm test:human
```

Runs the real-agent human E2E path. This invokes a real Codex agent against a fixture repository, requires it to use the local `ai-native-eval` skill, generate fresh evaluator outputs, validate the run folder, render the HTML report, and open the report with Playwright. Use this when a change affects user-facing flows, agent-facing routing, lifecycle evaluator entrypoints, generated reports, or anything a human developer would otherwise manually test.

## Self-Evaluation Commands

The committed self-evaluation baseline lives under `self-evaluations/foundation-20260614/`.

```sh
pnpm self-eval:validate
```

Validates the committed run folder against installed evaluator skills, the run config snapshot, and each leaf evaluator rubric.

```sh
pnpm self-eval:render
```

Regenerates [self-evaluations/foundation-20260614/report.md](../self-evaluations/foundation-20260614/report.md) from the validated run folder.

```sh
pnpm self-eval:check
```

Regenerates the compact self-evaluation report in a temporary check flow and fails if the committed report is stale. Use this before opening a PR that changes evaluator outputs, report rendering, or the self-evaluation run folder.

The CLI can still generate local HTML or JSON reports with `render-folder --out <report.html>` or `render-folder --json-out <report.json>`, but those larger artifacts are not committed for the baseline.

For ordinary repository evaluations, the default generated output is a copyable artifact bundle:

```text
.ai-native-eval/artifacts/<timestamp>-<commit>/
  run/
  report.html
  report.md
  report.json
  snapshot.json
  manifest.json
```

`init-run <repo-root>` creates `.ai-native-eval/artifacts/<timestamp>-<commit>/run` when `--out` is omitted. `render-folder` writes `report.html`, `report.md`, `report.json`, `snapshot.json`, and `manifest.json` beside `run/` when the input path is a bundle run folder.

Targeted runs can record evaluation context for routing and auditability:

```sh
pnpm --dir .agents/skills/ai-native-eval/scripts/eval exec ai-native-eval init-run . \
  --review-type event \
  --target pull_request \
  --target-ref PR-123 \
  --phase opened \
  --trigger user \
  --trigger-mode external_event \
  --trigger-source github \
  --trigger-event pull_request.opened \
  --target-surface pr \
  --output-intent advisory \
  --affects-overall-score false
```

The context is stored in `run.json`, carried into rendered reports, snapshots,
and manifests, and selects a lifecycle evaluator root such as
`ai-native-pr-lifecycle-evaluator`.

Trigger mode flags are optional. When a target is explicit and no trigger mode
is supplied, ordinary repo, PR, issue, thread, and turn runs default to
`one_shot`; periodic targets default to `periodic`. Trigger metadata is an
integration contract only: the tool records mode, source, event, threshold, and
max iteration values, but external systems own scheduling, enforcement, comment
posting, and self-iteration reruns.

Self-iteration wrappers can pass threshold metadata without asking the tool to
run the loop:

```sh
pnpm --dir .agents/skills/ai-native-eval/scripts/eval exec ai-native-eval init-run . \
  --review-type thread \
  --target agent_thread \
  --phase closeout \
  --trigger-mode self_iteration \
  --trigger-source wrapper \
  --threshold 0.85 \
  --max-iterations 3
```

Project config should scope evaluator-specific behavior by plugin id:

```json
{
  "schemaVersion": 1,
  "evaluators": {
    "ai-native-pr-lifecycle-evaluator": {
      "enabled": true,
      "additionalChildren": [],
      "disabledChildren": [
        {
          "pluginId": "ai-native-thread-closeout-evaluator",
          "reason": "Closeout is checked only after merge."
        }
      ],
      "settings": {
        "defaultPhase": "opened",
        "outputMode": "advisory",
        "rules": {
          "pr-readiness-min-score": ["error", { "threshold": 10 }],
          "thread-closeout-min-score": "off"
        },
        "triggers": {
          "external_event": {
            "events": ["pull_request.opened", "pull_request.synchronize"]
          },
          "self_iteration": {
            "minimumScore": 0.85,
            "maxIterations": 3
          }
        }
      }
    }
  }
}
```

The core tool persists `settings.triggers` as evaluator-owned configuration. The
selected evaluator skill, not the orchestrator, decides what those settings mean.
`settings.rules` follows the ESLint shape. Severity is `off`, `warn`, or
`error`; a triggered `error` makes the rendered policy status `blocked` while
leaving the numeric score unchanged.

Legacy global `additionalRoots`, `disabled`, and `contextRoutes` are still read
for compatibility, but generated reports show non-fatal deprecation warnings.

## CI

GitHub Actions runs deterministic gates on pull requests and pushes to `main`:

- `pnpm test`
- `pnpm self-eval:validate`
- `pnpm self-eval:check`
- `pnpm skill-eval:contract`

## Failure Handling

- If dependency install fails, rerun `pnpm install --frozen-lockfile` at the root and inspect the nested eval lockfile under `.agents/skills/ai-native-eval/scripts/eval/`.
- If `self-eval:validate` fails, fix only the reported evaluator JSON files or the referenced evaluator skill rubric, then rerun validation.
- If `self-eval:render` fails, inspect validation errors first. Rendering is intentionally blocked when the folder contract is invalid.
- If `self-eval:check` fails, run `pnpm self-eval:render`, inspect the report diff, and commit it when the change is intentional.
- If live evals fail due to missing Codex CLI access, keep the contract eval evidence and document that live evidence was deferred.

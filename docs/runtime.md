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

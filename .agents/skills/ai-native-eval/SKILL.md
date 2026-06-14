---
name: ai-native-eval
description: Evaluate a repository or project for AI-native development maturity. Use when the user asks for AI-native eval, repo evaluation, project evaluation, agent-readiness evaluation, development-process score, evidence-based repo review, issue/PR/CI/test/docs maturity review, or recommendations to improve how well a project supports AI-assisted development.
---

# AI Native Eval

Evaluate how AI-native a repository's development system is. This is a repo/project evaluation, not a human operator assessment.

The evaluation should answer:

> Can an AI agent and a human collaborator repeatedly make reviewable, high-quality progress in this repository using its docs, issues, PRs, tests, CI, and evidence practices?

## Role

`ai-native-eval` is an orchestrator, not a leaf evaluator and not the owner of evaluator rules.

- Consume each evaluator plugin's own `SKILL.md` declarations for its manifest, direct children, extension points, execution expectations, run records, and normalized node output.
- Start from built-in evaluator pack roots, then resolve only their direct children recursively.
- Do not maintain a central list of all descendant evaluators.
- Do not require every evaluator plugin to spawn its own agent. Group plugins into cost-aware execution batches.
- Preserve per-evaluator output records even when one agent runs multiple plugins.
- Aggregate normalized evaluation nodes deterministically into score, confidence, maturity level, and report artifacts.

Built-in top-level evaluator packs are `ai-native-foundation-evaluator` and `bmad-method-evaluator`. These are pack roots, not a registry of descendants. The eval should not know the fine-grained evaluators below those packs.

## Evidence

Inspect evidence that is available in the current environment:

- Repo files: `README.md`, `AGENTS.md`, `.agents/skills/**`, `docs/**`, `.github/workflows/**`, package scripts, test/E2E configs, deployment configs, architecture or decision records.
- Git/worktree: current branch, dirty state, worktree list, branch naming conventions, thread/worktree tracking docs, conflict-avoidance guidance, subagent capacity guidance.
- GitHub, when available: issues, labels, PR bodies, review comments, requested changes, check runs, workflow history, linked screenshots, traces, videos, reports, and artifacts.
- Quality evidence: lint, typecheck, unit/integration/E2E/build gates, production-like runtime commands, policy skips, review contracts, and acceptance proof.

If access is missing, emit `missing` evidence nodes and lower confidence. Do not score unavailable GitHub/CI history as a factual failure unless the review scope explicitly requires it.

## Workflow

Choose the review type first:

- **Baseline review**: use when no previous state exists, state is stale, or the user asks for a full evaluation.
- **Incremental review**: use when `.ai-native-eval/state.json` or prior snapshots exist. Inspect changed files and external cursors first, re-evaluate affected nodes, carry forward unchanged nodes, and re-aggregate the full tree.
- **Event review**: use for one PR, issue, milestone, workflow run, or completed task. State whether the event should affect the overall evaluation now or wait for more evidence.

Default steps:

1. Determine scope, repo root, current commit, and available evidence surfaces.
2. Read previous eval state if present.
3. Resolve the effective eval config from built-in roots, optional person config, optional project config, and optional explicit override config.
4. Write a run folder with `run.json` as the audit snapshot for this exact evaluation.
5. Resolve installed evaluator plugins through direct child references from the run snapshot.
6. Group resolved plugins into execution batches; default to a single agent batch unless evidence size, risk, or user request justifies fan-out.
7. Write each enabled leaf evaluator's judgment to its own JSON file under the run folder.
8. Validate the run folder against the run snapshot, installed evaluator manifests, and leaf skill rubrics before rendering.
9. Carry forward unchanged leaf outputs on incremental runs.
10. Aggregate recursively and deterministically only after validation passes.
11. Produce a static HTML report and optional JSON report artifact.
12. Persist append-only artifacts only when writing is allowed.

## Bundled Tool

Use the bundled TypeScript tool under `scripts/eval/` for deterministic aggregation, HTML rendering, and persistence artifacts.

From the `ai-native-eval` skill directory:

```sh
pnpm --dir scripts/eval install
pnpm --dir scripts/eval build
pnpm --dir scripts/eval exec ai-native-eval init-run <repo-root>
pnpm --dir scripts/eval validate-folder <run-folder> --skills-dir ../..
pnpm --dir scripts/eval render-folder <run-folder> --skills-dir ../..
```

By default, a normal repository evaluation writes a timestamped, repo-local artifact
bundle under `.ai-native-eval/artifacts/<timestamp>-<commit>/`. The bundle is
generated output and is ignored by default; it does not require extra user
permission beyond the evaluation request. Use `/tmp` only for dry runs, tests, or
when the user explicitly asks not to write generated artifacts into the repository.

The default bundle layout is:

```text
.ai-native-eval/artifacts/<run-id>/
  run/
    run.json
    evaluators/
      <leaf-evaluator>.json
  report.html
  report.md
  report.json
  snapshot.json
  manifest.json
```

The preferred workflow accepts a folder with `run.json` and per-leaf evaluator outputs:

```text
<run-folder>/
  run.json
  evaluators/
    ai-native-local-runtime-command-evaluator.json
    ai-native-worktree-isolation-evaluator.json
    ...
```

`run.json` declares `rootPluginIds`, report metadata, language, scope, reproducibility, and the effective config snapshot for this evaluation. The snapshot should record built-in roots, additional roots, disabled plugins or subtrees, config sources, and a config hash.

Config resolution is deterministic:

- Built-in top-level evaluator roots are enabled by default.
- The built-in roots are `ai-native-foundation-evaluator` and `bmad-method-evaluator`.
- Optional person config can add roots or disable plugins.
- Optional project config is read from `<repo>/.ai-native-eval/config.json` unless an explicit project config path is supplied.
- Optional explicit config is a one-run override.
- Additional roots are appended after built-in roots.
- Disabled plugin ids disable that plugin and its runtime-resolved descendants. Disabled nodes appear in the report as `not_applicable`, do not require evaluator output, and do not affect score.

Each leaf evaluator JSON must contain only judgments against that evaluator's own `SKILL.md` `ai-native-deduction-groups` rubric. It must not repeat or redefine the rubric.

The tool reads installed evaluator skills, parses each leaf evaluator's `ai-native-deduction-groups` JSON fence, validates every judgment, assembles the runtime tree from plugin `directChildren`, and only renders when validation passes. Validation is intentionally strict: if a config-disabled evaluator output exists, an enabled leaf output is missing, an output is unreachable from the effective config, a file name does not match `pluginId`, or a deduction id does not match the skill rubric, rendering must fail and report all errors together.

Legacy commands remain available for already-normalized tree JSON:

```sh
pnpm --dir scripts/eval score <evaluation-tree.json>
pnpm --dir scripts/eval render <evaluation-tree.json> --out <report.html>
pnpm --dir scripts/eval persist <evaluation-tree.json> --root .ai-native-eval/artifacts
```

Do not hand-calculate final scores when the bundled tool is available. Evaluator plugins should produce per-leaf folder outputs; the bundled tool should validate, aggregate, and render.

## Scoring

Never manually choose a score from vibes. Scores come from the evaluation node tree.

- Leaf evaluators should output judgments against checklist-style deduction rubrics. AI selects applicable deductions and supplies evidence/reasons; the bundled tool retrieves the rubric from the evaluator skill and calculates points deterministically.
- A deduction group `budget` is the maximum same-group penalty. Applied deductions in the same group are capped at the group budget to prevent duplicate penalties.
- Deduction groups must be able to deduct their full budget. Do not create fallback scoring where a required capability can be entirely missing but the group cannot deduct its full budget.
- If a leaf is not `10.0 / 10`, it must have applied deductions explaining why not.
- `pointsEarned` is a legacy/manual fallback only when `deductionGroups` are absent. Do not use it for new evaluator checklist scoring.
- Parent score: weighted average of applicable child scores.
- Dimension score: aggregate leaf nodes that declare the same dimension.
- Overall score: aggregate the root tree; present HTML scores as `0.0 / 10`.
- Confidence is separate from score. It reflects evidence coverage and must not secretly modify points.

High scores require repeated evidence across docs, issues/PRs, CI/tests, artifacts, and workflow history. Recommend improvement actions that address the weakest high-leverage evidence gaps first.

## Folder Output Contract

Each leaf evaluator output file must look like:

```json
{
  "pluginId": "ai-native-parallel-agent-capacity-evaluator",
  "confidence": "high",
  "reason": "Capacity policy is explicit, with one evidence gap.",
  "deductions": [
    {
      "groupId": "batch-planning",
      "deductionId": "incomplete-batch-planning",
      "applies": true,
      "reason": "Large task plans do not consistently record actual capacity decisions.",
      "evidence": [
        {
          "source": "docs/engineering/agent-native-project-management.md",
          "locator": "並行規則",
          "summary": "Parallelism policy exists."
        }
      ],
      "recommendation": {
        "summary": "Record actual worker/reviewer/repair capacity in large task plans.",
        "priority": "medium"
      }
    }
  ]
}
```

The `groupId` and `deductionId` must come from that evaluator skill's `ai-native-deduction-groups` fence. Do not invent generic deductions such as `Evidence-backed deduction`. If validation fails, fix only the reported evaluator JSON files or re-run those leaf evaluators, then retry `validate-folder` or `render-folder`.

## Persistence

Persist shared repo-local state under `.ai-native-eval/` only when the user allows writes.

- `.ai-native-eval/config.json` is source-controlled shared project policy by default.
- `state.json` may point to the latest artifacts.
- Normal evaluation requests are permission to write generated, ignored artifacts under `.ai-native-eval/artifacts/<run-id>/`.
- Generated reports, snapshots, manifests, run folders, logs, and temporary files belong in the timestamped artifact bundle.
- `.ai-native-eval/artifacts/` is ignored by default; promote reviewed results into `self-evaluations/` or project docs when they should become durable repo evidence.
- Ask before promoting artifacts into source-controlled docs, `self-evaluations/**`, shared config, or other durable repository state.
- Reports, snapshots, manifests, and ledger entries are append-only once promoted.
- JSON report is the source of truth; HTML report is a static render.
- Snapshots should preserve the normalized tree, score, confidence, commit, evaluator lock/config hash, plugin resolution, execution batches, and evaluator run records.
- Incremental manifests should record base/head commit, changed files, changed evidence surfaces, affected nodes, and carried-forward nodes.
- Do not persist secrets, tokens, raw private logs, large binary artifacts, or unrelated user data.

## Test Layers

Keep the test names honest. The eval should have stable deterministic tests and real agent tests.

- `pnpm --dir scripts/eval test:tool`: deterministic eval tool pipeline tests. These do not call an AI agent. They validate config snapshots, evaluator folder validation, rubric parsing, aggregation, and HTML rendering from known inputs.
- `pnpm --dir scripts/eval test:browser`: browser report E2E. This runs the real CLI to render a report, opens the generated HTML with Playwright, and checks that the report can be viewed and interacted with.
- `pnpm --dir scripts/eval test:agent`: real agent E2E. This intentionally invokes `codex exec`, asks a real Codex agent to use the local `ai-native-eval` skill against a fixture repo, expects the agent to create fresh evaluator JSON outputs, validates the generated run folder, and opens the generated report with Playwright.

Real agent tests may be slower and less deterministic than tool tests. Do not remove them just because they involve AI behavior. Keep them separate from default `pnpm test` so the stable test suite remains fast while the true user path remains testable on demand.

## Output

For normal repo evaluations, include:

```text
Repo AI-native eval:
Score:
Confidence:
Review scope:
Evidence reviewed:
Evaluation tree:
Strong areas:
Weak areas:
Missing or stale evidence:
Recommended actions:
Level-up requirements:
Persistence update:
```

Use the requested content language for human-facing evaluator text such as `reason`, `evidence.summary`, `recommendations[].summary`, and `references[].summary`. Keep machine-readable fields such as ids, dimensions, statuses, config keys, artifact paths, and snapshot references stable and English-oriented.

## Guardrails

- Do not claim a high-confidence level from docs alone.
- Do not scan huge repositories exhaustively by default when prior state exists.
- Do not mutate source-controlled repository files unless the user asked to persist state or promote reports. Generated eval bundles under `.ai-native-eval/artifacts/<run-id>/` are the default output for ordinary evaluations.
- Do not let evaluator plugins depend on `ai-native-eval` internals.
- Do not reintroduce a shared protocol skill as a required dependency for evaluator plugins.
- Do not conflate polished docs with actual quality gates.

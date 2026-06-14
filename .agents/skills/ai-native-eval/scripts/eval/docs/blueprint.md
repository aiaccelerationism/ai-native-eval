# ai-native-eval Blueprint

`ai-native-eval` evaluates the AI-native maturity of a repository or project workflow.

It is intentionally separate from human-operator coaching because repo-level evaluation is deep enough to be its own system. Human-growth tools can recommend or invoke it, but should not own the full evaluator.

The eval must be evidence-based and deterministic. It should not produce wildly different scores across runs unless the evidence changed. LLM judgment can inspect evidence and decide whether an evaluation node is satisfied, but parent scores and final score calculation must follow stable aggregation rules.

`ai-native-eval` is also multi-skill by design. The main skill is an orchestrator and aggregator; focused evaluator plugins own their own direct children, extension points, evidence rules, scoring rules, and recommendations. Plugin graph boundaries do not imply agent execution boundaries.

The central unit is the evaluation node:

- Any node can be an evaluator, rule group, rule, probe, or external custom evaluator.
- Any node can have children, so the hierarchy is unlimited.
- Each node owns its own children and scoring meaning.
- Parent nodes aggregate children deterministically.
- The eval does not centralize all rules.
- The plugin manifest contract is part of the contract. New evaluators should attach through a direct child reference or extension point instead of requiring a central registry update.

The system should support hot-pluggable evaluators. External users can add evaluator packs as long as each evaluator skill's `SKILL.md` declares its own plugin manifest, direct children or extension points, scoring rules, evidence expectations, and compatible evaluation node output. User config can enable, disable, or reweight evaluators, subtrees, or individual nodes.

Evaluator plugins should stay fine-grained. Parent evaluators group direct child evaluators; leaf evaluators score one responsibility such as issue readiness, worktree isolation, local runtime commands, UX mock contract, E2E artifact proof, or recurrence prevention. Do not collapse mature workflows into one broad evaluator when they can be scored independently.

The HTML report is a core artifact, not decoration. It should render the entire evaluation tree with score, status, confidence, evidence links, reasoning, recommended actions, improvement references, lost points, and reproducibility metadata.

The eval must support multilingual use without weakening reproducibility. Machine-readable fields such as node ids, dimensions, evaluator ids, statuses, config keys, and snapshot references stay stable and English-oriented. Human-facing evaluator text such as reasons, evidence summaries, recommendations, and reference summaries can be produced in the requested content language. The static HTML report has its own UI chrome language switch for fixed labels and headings.

## Scope

Evaluate:

- Whether repo docs are enough for AI-assisted work.
- Whether agent instructions and skills make the repo operable.
- Whether issues contain context, non-goals, acceptance criteria, and review expectations.
- Whether PRs include evidence, artifacts, and clear review surfaces.
- Whether CI and tests prove meaningful behavior.
- Whether E2E, screenshots, traces, reports, or human approvals exist where needed.
- Whether runtime and deployment commands are reproducible.
- Whether architecture and ownership boundaries are clear.
- Whether worktree and branch management supports safe parallel agent work.
- Whether bug intake, known-issue memory, design workflow, PR publishing, and thread closeout are explicit enough for repeated agent operation.
- Whether the repo persists learning across reviews.

## Non-Scope

- It is not a generic code quality score.
- It is not a security audit unless security gates affect AI-native maturity.
- It is not a human personality or intelligence evaluation.
- It is not a one-time vibe check.

## Persistence

The eval should support incremental operation:

1. Baseline review scans broad repo evidence.
2. State is persisted under `.ai-native-eval/`.
3. Later reviews inspect changed files, new issues/PRs, CI deltas, and new artifacts first.
4. Each event appends to an evidence ledger.
5. Overall level changes only when accumulated evidence justifies it.

Persistence must be append-only for review artifacts. `state.json` may point to the latest run, but snapshots, manifests, JSON reports, and HTML reports must not overwrite each other. Incremental review compares the previous snapshot and git commit to the current repo state, re-runs affected evaluator subtrees, carries forward unchanged node results, and then re-aggregates the full tree.

## First Milestone

The first version is a document-driven skill:

- Define level dimensions.
- Define evidence sources.
- Define persistence model.
- Define output contracts.
- Define deterministic scoring.
- Define focused evaluator skills and their output contracts.
- Define evaluator plugin manifests, extension points, execution batches, and per-evaluator run records for bootstrapping, planning, issue readiness, PR readiness, review, CI/tests, runtime, local environment, deployment, UX/product/design, bug intake, known issues, skill evals, worktree management, privacy, and closeout.
- Define the evaluation node protocol.
- Generate JSON and HTML reports.
- Support evaluator content language metadata and report UI language switching.
- Produce manual but structured repo level reports.

Later versions can add scripts for scanning git diffs, GitHub metadata, CI status, and test artifacts.

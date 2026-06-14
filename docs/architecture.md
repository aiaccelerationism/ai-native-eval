# Architecture

`ai-native-eval` has two boundaries: the skill pack and the deterministic tool.

## Skill Pack Boundary

Skills live under `.agents/skills/**`.

- `ai-native-eval` is the orchestrator skill.
- `ai-native-repo-maturity-evaluator`, `ai-native-pr-lifecycle-evaluator`, `ai-native-issue-lifecycle-evaluator`, `ai-native-thread-checkpoint-evaluator`, `ai-native-turn-guardrail-evaluator`, and `ai-native-periodic-health-evaluator` are built-in lifecycle entry roots.
- `ai-native-foundation-evaluator` is the built-in foundation evaluator pack used by lifecycle roots.
- `bmad-method-evaluator` is the built-in BMAD evaluator pack used by repo-level lifecycle roots.
- `ai-native-eval-self-evaluator` is a project-specific evaluator-system pack used by this repo's own `.ai-native-eval/config.json`, not a default root for ordinary repositories.
- `ai-native-research-evaluator` is a project-specific research-readiness pack used by this repo's own `.ai-native-eval/config.json`, not a default root for ordinary repositories.
- Fine-grained evaluator skills own their own direct children and deduction rubric.

There is no central canonical evaluator hierarchy. The runtime tree is resolved from installed skill manifests:

1. Start from the selected lifecycle root and configured evaluator-specific children.
2. Read each root skill's direct children.
3. Recursively resolve only the direct children declared by each child.
4. Stop at leaf evaluator skills.
5. Validate each leaf output against that leaf skill's own deduction groups.

## Tool Boundary

The TypeScript tool lives at `.agents/skills/ai-native-eval/scripts/eval/`.

The tool owns deterministic behavior:

- config resolution
- evaluation context snapshotting
- evaluator-specific config resolution
- run folder initialization
- plugin graph validation
- evaluator folder validation
- deduction-group scoring
- aggregation
- HTML and JSON report rendering
- persistence helpers

The tool must not contain domain-specific scoring opinions that belong in evaluator skills. Evaluator skills provide rubrics and judgments; the tool validates and aggregates.

## Evaluation Context Routing

The orchestrator first determines the evaluation context, then resolves evaluator
detail. Full repository maturity is one supported context, not the only entry
point.

Context fields are intentionally open-ended strings so projects can add lifecycle
stages without changing the core tool. Common built-in meanings include:

- `reviewType`: `baseline`, `incremental`, `event`, `thread`, `turn`, `periodic`, or project-specific values.
- `target`: `repo`, `issue`, `pull_request`, `workflow_run`, `agent_thread`, `user_turn`, or project-specific values.
- `phase`: lifecycle stage such as `intake`, `opened`, `review`, `pre_merge`, `post_merge`, or `closeout`.
- `trigger`: who or what initiated the run, such as `user`, `agent`, `github`, `schedule`, or `manual`.
- `triggerMetadata.mode`: how the run is being used, such as `one_shot`, `turn_inline`, `self_iteration`, `periodic`, or `external_event`.
- `triggerMetadata.source`: the external owner that initiated the run, such as `user`, `agent`, `github`, `scheduler`, `wrapper`, or a project-specific source.
- `triggerMetadata.event`: an optional external event name such as `pull_request.opened` or `weekly.health`.
- `triggerMetadata.threshold` and `triggerMetadata.maxIterations`: optional values for external self-iteration wrappers. The core tool records them but does not execute the loop.
- `targetSurfaces`: evidence areas emphasized by the run.
- `outputIntents`: artifact, markdown, comment, advisory, blocking, score update, or project-specific outputs.
- `affectsOverallScore`: whether a targeted run should update repository maturity state.

Config files should define `evaluators[pluginId]`. Each evaluator can receive
`additionalChildren`, `disabledChildren`, and opaque `settings` that only that
evaluator skill owns. Legacy global `additionalRoots`, `disabled`, and
`contextRoutes` remain readable for compatibility but are reported as deprecated
warnings. The orchestrator may know the six lifecycle entry roots, but evaluator
packs still own lifecycle-specific rubrics, direct children, and evidence rules.

Trigger modes are integration metadata, not a central runtime registry. The
orchestrator may default explicit non-periodic targets to `one_shot` and
explicit periodic targets to `periodic`, then pass trigger metadata through to
the selected lifecycle evaluator. Each lifecycle evaluator owns its supported
trigger modes and settings under `evaluators[pluginId].settings.triggers`.
External systems own scheduling, webhooks, per-turn hooks, GitHub comments,
blocking policy, repair loops, and reruns.

Unknown contexts should not fall back to a heavy baseline by default. The safe
fallback is a targeted advisory run with no public posting and no overall score
update unless a route or user instruction says otherwise.

## Data Flow

```text
evaluation context + repo evidence
  -> selected lifecycle evaluator root
  -> evaluator-specific config
  -> evaluator skill judgment JSON files
  -> run folder validation
  -> normalized evaluation node tree
  -> deterministic aggregation
  -> report JSON
  -> static HTML report
```

The report JSON is the source of truth. The HTML report is a static inspection surface generated from the same validated report.

Generated repository evaluations are grouped as copyable bundles under
`.ai-native-eval/artifacts/<run-id>/`. The bundle root contains the human-facing
reports plus snapshot and manifest metadata, while `run/` contains `run.json` and
per-leaf evaluator output files.

## Ownership Rules

- Evaluator plugin manifests and deduction rubrics belong in each evaluator skill's `SKILL.md`.
- The orchestrator may know built-in lifecycle root pack ids, but it must not know every descendant evaluator.
- Additional evaluator children are configured under the owning evaluator rather than modifying built-in skill files.
- Disabled plugins and subtrees are recorded in the run snapshot and rendered as disabled nodes.
- Tool tests should exercise deterministic contracts. Real-agent tests should stay separate and explicit.

## Current Non-Goals

- No external package discovery implementation yet.
- No hosted service or database runtime.
- No BMAD self-evaluation for this repository's baseline.
- No product UI implementation beyond report HTML generation.

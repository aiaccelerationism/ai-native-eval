# Contributing

Thanks for helping improve `ai-native-eval`.

This project is an agent skills repo plus a deterministic TypeScript eval tool. Contributions should keep the public README approachable while keeping detailed evaluator, runtime, and artifact policy in the docs and skill instructions.

## Development Flow

1. Create a branch for your change.
2. Keep evaluator rules inside the owning evaluator skill.
3. Keep deterministic aggregation, validation, rendering, and persistence behavior inside the eval tool.
4. Update docs when behavior changes.
5. Run the relevant validation commands before opening a pull request.

Useful commands:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm render:example
pnpm self-eval:validate
pnpm self-eval:check
pnpm skill-eval:contract
```

Live skill evals intentionally run the real Codex path and may be slower or less deterministic:

```sh
pnpm skill-eval:live
```

## Evaluator Changes

When changing an evaluator:

- Update that evaluator's `SKILL.md`.
- Keep deduction rubric ids stable when possible.
- Add or update skill eval fixtures when instructions change.
- Regenerate self-evaluation artifacts when the change affects the committed baseline.
- Do not move domain-specific scoring rules into the orchestrator.

## Pull Requests

Pull requests should explain:

- What changed.
- Why the change is needed.
- Which commands were run.
- Whether evaluator rubrics, report output, or self-evaluation artifacts changed.
- Any follow-up work that remains.

## Governance Notes

- [README.md](README.md) should stay user-facing.
- [docs/architecture.md](docs/architecture.md) owns evaluator boundary and plugin resolution details.
- [docs/runtime.md](docs/runtime.md) owns command and runtime details.
- [docs/evidence.md](docs/evidence.md) owns artifact and evidence policy.
- [docs/foundation-self-evaluation.md](docs/foundation-self-evaluation.md) owns dogfooding baseline details.

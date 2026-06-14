# Real Agent Eval Fixture

This fixture is a tiny Node.js project used by `ai-native-eval` real-agent tests.

## Quickstart

Install dependencies and run the local checks:

```sh
pnpm install
pnpm dev
pnpm build
pnpm test
```

`pnpm dev` prints `real-agent-fixture dev server ready`.
`pnpm build` prints `real-agent-fixture build ok`.
`pnpm test` prints `real-agent-fixture tests ok`.

## Known Gap

This project intentionally does not document reset, environment cleanup, or local machine state recovery. The real-agent eval test expects the agent to notice at least one environment reproducibility gap.

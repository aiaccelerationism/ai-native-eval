![AI Native Eval](docs/assets/ai-native-eval-title.jpg)

*Eval is all you need* — AI agent は、最適化すべき明確な評価ターゲットがあると、はるかに速く改善します。

[English](README.md) | [中文](README_CN.md) | [Español](README_ES.md) | [Deutsch](README_DE.md) | 日本語

[![CI](https://github.com/aiaccelerationism/ai-native-eval/actions/workflows/ci.yml/badge.svg)](https://github.com/aiaccelerationism/ai-native-eval/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)

**Make Repositories AI-Native** — AI agent がリポジトリの開発ワークフローを理解し、採点し、改善できるようにする、エビデンス駆動の評価・修復システムです。人間と agent が、レビュー可能で高品質な変更を繰り返し出荷できる状態を目指します。

**自己改善するリポジトリのために。** 決定的な `0.0 / 10` の AI-native maturity score を取得し、なぜまだ `10 / 10` ではないのかを確認し、agent が実行できる修復パスを run ごとに渡せます。リポジトリ全体を評価することも、PR、issue、agent thread、user turn、periodic health check など、今重要なタイミングだけを評価することもできます。

## なぜ ai-native-eval なのか？

従来のリポジトリチェックは、コードがビルドできるかを教えてくれます。`ai-native-eval` は、人間と AI agent がこのリポジトリで高品質な作業を継続して出荷できるかを問います。

- **AI-native score**: リポジトリの maturity score を `0.0 / 10` で取得できます。
- **なぜ 10/10 ではないのか**: 満点を妨げているエビデンス付きの減点理由を確認できます。
- **Agent repair loop**: 推奨事項を agent が実行できる修復タスクに変換できます。
- **正しい scope を評価**: リポジトリ全体、PR、issue、agent thread、単一 user turn、periodic health check を選んで評価できます。
- **Workflow policy signals**: 重要な findings を `warn` または `error` として表示しつつ、元の数値 score は保持できます。
- **Lifecycle coverage**: docs、agent instructions、issues、PRs、CI、tests、runtime commands、review artifacts、historical evidence を評価します。
- **決定的な集約**: 最終 score は evaluator rubrics から計算されます。
- **プラグイン可能な evaluators**: built-in、BMAD、プロジェクト固有の evaluator packs を追加できます。

## Quick Start

次の prompt を agent に渡してください:

```text
Evaluate my repository with ai-native-eval from https://github.com/aiaccelerationism/ai-native-eval.
```

## Report Preview

![AI Native Eval report preview](docs/assets/report-preview.png)

```text
Score: 8.2 / 10
Policy: BLOCKED (1 error · 1 warning)
Selected evaluator pack: ai-native-pr-lifecycle-evaluator
PR lifecycle: 8.2 / 10
  PR readiness: 8.0 / 10 [ERROR]
  Required checks: 9.0 / 10
  Acceptance proof: 7.6 / 10 [WARN]
    Why not 10/10:
      - PR evidence does not link every acceptance criterion to proof.
      - The closeout plan does not name the post-merge follow-up owner.
      - Visual or trace evidence is missing for the changed user-facing path.
```

レポートは、人間と agent に同じレビュー面を提供します:

- 選択された scope の `0.0 / 10` AI-native maturity score。
- full repo、PR、issue、thread、turn、periodic、またはプロジェクト固有 context に対応する selected evaluator pack。
- docs、agent readiness、GitHub workflow、CI/tests、local runtime、evidence quality、architecture、BMAD adoption、lifecycle workflow checks、optional evaluator packs を含むネストされた evaluator tree。
- エビデンス付きの "Why not 10/10" deductions。
- agent repair tasks に変換できる recommendations。
- 静的 HTML とコンパクトな Markdown output。
- evaluator packs の有効化、無効化、weight 変更、追加を管理できる source-controlled config。
- 過去の evidence を再利用できる incremental evaluations。
- one-shot、turn-inline、self-iteration、periodic、external-event integrations 用の trigger metadata。hooks、schedulers、comments、repair loops は外部システムが担当します。
- `off`、`warn`、`error` を持つ ESLint-style policy rules。数値 score を変えずに blocked/warning 状態を表示できます。

## Built-In Evaluator Packs

`ai-native-eval` には、lifecycle entry packs と、repo foundation / BMAD Method adoption 用の再利用可能な evaluator packs が含まれています。

| Pack | 目的 |
| --- | --- |
| `ai-native-repo-maturity-evaluator` | リポジトリ全体の baseline と incremental repo-level review。 |
| `ai-native-pr-lifecycle-evaluator` | PR opened、review、pre-merge、post-merge、closeout の評価。 |
| `ai-native-issue-lifecycle-evaluator` | issue intake、planning、follow-up、handoff の評価。 |
| `ai-native-thread-checkpoint-evaluator` | agent thread checkpoint、handoff、collaboration trace、closeout の評価。 |
| `ai-native-turn-guardrail-evaluator` | 単一 user turn または agent response の guardrail 評価。 |
| `ai-native-periodic-health-evaluator` | scheduled または ad hoc な repository health / drift 評価。 |
| `ai-native-foundation-evaluator` | 一般的な AI-native repo foundation: operability、docs、agent readiness、GitHub workflow、CI/test gates、product UX evidence、architecture、evidence discipline。 |
| `bmad-method-evaluator` | BMAD Method adoption と artifact maturity。 |

リポジトリは built-in packs を使うことも、プロジェクト固有の evaluator packs を追加することも、不要な evaluator areas を無効化することもできます。root の `ai-native-eval` skill は first-level pack だけを選び、各 pack が child evaluators、phase defaults、policy rules、evaluator-specific settings を管理します。

## 仕組み

eval flow は再現可能で監査可能になるよう設計されています。

1. scope、repo root、current commit、available evidence を解決します。
2. evaluation context を判断します: full baseline、incremental run、issue/PR event、thread checkpoint、user turn、periodic scan、project-specific lifecycle。
3. previous eval state があれば読み込みます。
4. selected lifecycle root、optional user config、project config、explicit run overrides、`evaluators[pluginId]` 配下の evaluator-specific config から effective config を解決します。
5. `run.json` を audit snapshot とする run folder を書き出します。
6. direct child references から installed evaluator plugins を解決します。
7. 必要に応じて evaluators を execution batches にまとめます。
8. enabled leaf evaluator ごとの judgment を個別 JSON に書き出します。
9. run snapshot、installed manifests、leaf rubrics に対して folder を検証します。
10. normalized evaluator nodes を決定的に集約します。
11. 静的 HTML と optional Markdown/JSON artifacts を render します。

validation は rendering 前に不整合な evaluator outputs を検出するため、壊れた run や不完全な run が見た目だけ整った report になることを防ぎます。

"use ai-native-eval" のような bare request の場合、root skill はどの evaluator pack を使うかを質問します。repo、PR、issue、thread、turn、periodic check など target がすでに明確な場合は直接 route し、phase が未指定ならその pack の default phase を使います。

## Scoring

score は evaluator rubrics から計算されます。

- Leaf evaluators は checklist-style deduction groups に対する judgments を出力します。
- AI は適用される deductions を選び、理由と evidence を提供します。
- 同梱の TypeScript tool は evaluator skill から rubric を取得し、points を決定的に計算します。
- deduction group の `budget` は同じ group 内の重複減点を制限します。
- deduction groups は full budget を減点できる必要があります。
- leaf が `10.0 / 10` でない場合、applied deductions によって理由を説明する必要があります。
- parent scores は applicable child scores の weighted averages です。
- confidence は score と独立しており、evidence coverage を表します。
- policy rules は score と独立しています。score が configured threshold を下回ったときに `warn` または `error` として結果をマークできます。`error` は report では blocked と表示されますが、数値 score は変わりません。

高い score には、docs、issues/PRs、CI/tests、artifacts、workflow history 全体にわたる繰り返しの evidence が必要です。きれいな docs だけで high-confidence な `10 / 10` になるべきではありません。

## Reports

同梱の TypeScript renderer は、scoring と同じ evaluation tree から drill-down HTML report を生成します。report には nested node results、evidence links、recommendations、improvement references、copyable repair prompts、policy status、selected evaluator pack、evaluation context、trigger metadata、evaluator config、reproducibility metadata が含まれます。

## Configuration And Persistence

評価対象の repo は eval state を次の場所に保存できます:

```text
.ai-native-eval/
  config.json
  state.json
  evidence-ledger.jsonl
  artifacts/
    20260614T183012Z-a1b2c3d4e5f6/
      run/
        run.json
        evaluators/
      report.html
      report.md
      report.json
      snapshot.json
      manifest.json
```

`config.json`、`state.json`、小さな evidence ledgers は、shared project policy や durable evaluation state を定義する場合に source-control できます。evaluator-specific config は `evaluators[pluginId]` 配下に置かれ、pack ごとに `additionalChildren`、`disabledChildren`、`settings` を受け取れます。legacy global fields の `additionalRoots`、`disabled`、`contextRoutes` は互換性のため読み込まれますが、report には non-fatal deprecation warnings が表示されます。

通常の evaluation は、timestamped generated bundle を `artifacts/` 配下に書き出します。これにより complete run を 1 つの directory としてコピー、添付、レビュー、削除できます。`artifacts/` 配下の generated output はデフォルトで ignore されます。repo history の一部にする必要がある reviewed reports は、安定した committed evidence folder に昇格させてください。

## Repo Layout

```text
ai-native-eval/
  .agents/
    skills/
      ai-native-eval/
        SKILL.md
        agents/openai.yaml
        scripts/
          eval/
            package.json
            pnpm-lock.yaml
            tsconfig.json
            src/
            fixtures/
            tests/
      ai-native-foundation-evaluator/
      ai-native-repo-maturity-evaluator/
      ai-native-pr-lifecycle-evaluator/
      ai-native-issue-lifecycle-evaluator/
      ai-native-thread-checkpoint-evaluator/
      ai-native-turn-guardrail-evaluator/
      ai-native-periodic-health-evaluator/
      bmad-method-evaluator/
      _eval-support/
        bin/codex
        grade-response.mjs
  tools/
    skill-eval.sh
  tests/
    skill-packaging.test.mjs
  package.json
```

report renderer と deterministic aggregation source は、`.agents/skills/ai-native-eval/scripts/eval/` の `ai-native-eval` skill bundle にあります。evaluator boundaries と plugin resolution の詳細は [docs/architecture.md](docs/architecture.md) を参照してください。

## Foundation Self-Evaluation

この repo は自分自身を評価し、厳格な baseline report を公開しています。

- Score: `3.4 / 10`
- Level: `3`
- Confidence: `high`
- Scope: foundation maturity と AI Native Eval evaluator-system quality、research readiness。`bmad-method-evaluator` はこの self-evaluation では disabled。
- AI participation: foundation scoring は 40% を AI participation に割り当てます。agent threads、source control AI participation、skill activation、AI self-assessment、human follow-through、collaboration trace を含みます。
- Research readiness: repo には research plan、pilot protocol、metrics/data schema があります。pilot execution と recent-change follow-through が未完了なため strict deductions が残ります。
- Recent-change evidence: baseline がまだ各 evaluator を最近 5 件の PR-equivalent substantive changes の proof にリンクしていないため、strict deductions が適用されます。
- Run folder: `self-evaluations/foundation-20260614/run/`
- Compact report: [self-evaluations/foundation-20260614/report.md](self-evaluations/foundation-20260614/report.md)

baseline は per-leaf evaluator JSON files から生成され、次のコマンドで再生成できます:

```sh
pnpm self-eval:validate
pnpm self-eval:render
```

## Research Plan

この repo は、eval-guided AI-native adoption が informal AI-native intent よりも measurable development outcomes を改善するかを検証する research plan も管理しています。

- Research plan: [docs/research-plan.md](docs/research-plan.md)
- Pilot protocol: [docs/research-pilot-protocol.md](docs/research-pilot-protocol.md)
- Metrics and data schema: [docs/research-data-schema.md](docs/research-data-schema.md)

## Skill Evaluations

各 skill は `SKILL.md` の隣に eval cases を持ちます:

```text
.agents/skills/<skill>/evals/
  eval.yaml
  expectations/
  solutions/
```

```sh
pnpm skill-eval:contract
pnpm skill-eval:live
pnpm skill-eval:skill contract ai-native-eval
pnpm skill-eval:skill live ai-native-eval
```

Contract evals は skill fixtures を検証します。Live evals は real Codex path を実行し、default deterministic test suite とは分離されています。
`contract` mode は real agent を呼びません。`live` mode は意図的に real Codex CLI を呼ぶため、遅く、より非決定的になる場合があります。

## Development Commands

この repository の開発でよく使うコマンド:

```sh
pnpm test
pnpm render:example
pnpm score:example
pnpm persist:example
pnpm self-eval:validate
pnpm self-eval:render
pnpm test:human
```

## Contributing

Contributions are welcome. 開発フロー、evaluator-change expectations、pull request checklist は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## Security

脆弱性は非公開で報告してください。報告方法と eval artifact safety notes は [SECURITY.md](SECURITY.md) を参照してください。

## License

MIT License. 詳細は [LICENSE](LICENSE) を参照してください。

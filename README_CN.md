![AI Native Eval](docs/assets/ai-native-eval-title.jpg)

[English](README.md) | 中文

[![CI](https://github.com/aiaccelerationism/ai-native-eval/actions/workflows/ci.yml/badge.svg)](https://github.com/aiaccelerationism/ai-native-eval/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)

**让仓库变得 AI-Native** - 一个以证据为核心的评估与修复系统，帮助 AI agent 理解、评分并改进仓库的开发工作流，直到人类与 agent 可以持续交付可审查、高质量的变更。

**为自我改进的仓库而生。** 获取确定性的 `0.0 / 10` AI-native 成熟度评分，清楚看到仓库为什么还不是 `10 / 10`，并把修复路径交给 agent 一轮轮执行。

## 为什么选择 ai-native-eval？

传统仓库检查会告诉你代码是否能构建。`ai-native-eval` 关心的是：人类与 AI agent 是否能在这个仓库中持续协作，反复交付高质量工作。

- **AI-native 评分**：为仓库生成 `0.0 / 10` 成熟度评分。
- **为什么不是 10/10**：明确列出哪些有证据支撑的扣分项阻止仓库达到满分。
- **Agent 修复循环**：把建议转化为 agent 可以执行的修复任务。
- **全生命周期覆盖**：评估文档、agent 指令、issue、PR、CI、测试、运行命令、审查产物与历史证据。
- **确定性聚合**：最终分数由 evaluator rubric 计算而来。
- **可插拔 evaluator**：支持内置、BMAD 或项目自定义 evaluator 包。

## 快速开始

把下面这段提示词交给你的 agent：

```text
Evaluate my repository with ai-native-eval from https://github.com/aiaccelerationism/ai-native-eval.
```

## 报告预览

![AI Native Eval report preview](docs/assets/report-preview.png)

```text
Score: 8.2 / 10
AI-native foundation: 8.2 / 10
  Local runtime and commands: 8.6 / 10
  Agent readiness: 8.7 / 10
  GitHub workflow: 7.8 / 10
  Evidence and artifact discipline: 7.6 / 10
    Why not 10/10:
      - Runtime failure recovery steps are not complete.
      - Evaluator findings are not always converted into tracked follow-up work.
      - Report screenshots or traces are not consistently linked from PR evidence.
```

报告会让人类和 agent 看到同一个审查界面：

- 仓库的 `0.0 / 10` AI-native 成熟度评分。
- 覆盖文档、agent readiness、GitHub 工作流、CI/测试、本地运行、证据质量、架构、BMAD 采用情况与可选 evaluator 包的嵌套 evaluator 树。
- 有证据支持的 "Why not 10/10" 扣分说明。
- 可转化为 agent 修复任务的建议。
- 静态 HTML 与紧凑 Markdown 输出。
- 可提交到源码中的配置，用于启用、禁用、重新加权或新增 evaluator 包。
- 可复用历史证据的增量评估，避免每次从零开始。

## 内置 Evaluator 包

`ai-native-eval` 自带面向通用 AI-native 仓库 readiness 与 BMAD Method 采用情况的 evaluator 包。

| 包 | 用途 |
| --- | --- |
| `ai-native-foundation-evaluator` | 通用 AI-native 仓库基础能力：可运行性、文档、agent readiness、GitHub 工作流、CI/测试 gate、产品 UX 证据、架构与证据纪律。 |
| `bmad-method-evaluator` | BMAD Method 采用情况与产物成熟度。 |

仓库可以使用内置包，添加项目自定义 evaluator 包，或禁用与当前工作流无关的评估区域。

## 工作原理

评估流程被设计为可重复、可审计：

1. 解析评估范围、仓库根目录、当前 commit 与可用证据。
2. 如果存在历史评估状态，则读取它。
3. 从内置 roots、可选用户配置、项目配置与本次运行覆盖项中解析有效配置。
4. 写入包含 `run.json` 的运行目录，作为本次评估的审计快照。
5. 通过 direct child references 解析已安装的 evaluator 插件。
6. 在有意义时把 evaluator 分成执行批次。
7. 为每个启用的叶子 evaluator 写入独立 JSON 判断文件。
8. 根据运行快照、已安装 manifest 与叶子 rubric 验证运行目录。
9. 确定性聚合 normalized evaluator nodes。
10. 渲染静态 HTML，并可选输出 Markdown/JSON 产物。

验证会在渲染前捕捉不一致的 evaluator 输出，避免损坏或不完整的运行结果被包装成看似可靠的报告。

## 评分

分数来自 evaluator rubrics。

- 叶子 evaluator 根据 checklist 风格的 deduction groups 输出判断。
- AI 选择适用的扣分项，并提供原因与证据。
- 内置 TypeScript 工具会从 evaluator skill 读取 rubric，并确定性计算分数。
- deduction group 的 `budget` 会限制同组扣分上限，避免重复过度扣分。
- deduction groups 必须能够扣完整个预算。
- 如果叶子节点不是 `10.0 / 10`，它必须通过已应用的扣分项说明原因。
- 父节点分数是适用子节点的加权平均。
- Confidence 与分数分离，用于表达证据覆盖度。

高分需要文档、issue/PR、CI/测试、产物与工作流历史中反复出现的证据。只有漂亮文档不应该产生高置信度的 `10 / 10`。

## 报告

内置 TypeScript renderer 会从同一棵评分用 evaluation tree 生成可钻取的 HTML 报告。报告包含嵌套节点结果、证据链接、建议、改进引用、可复制的修复提示词与可复现性元数据。

## 配置与持久化

被评估的仓库可以把 eval state 存在：

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

当 `config.json`、`state.json` 与小型 evidence ledger 定义共享项目策略或持久评估状态时，可以纳入源码管理。普通评估默认会在 `artifacts/` 下写入带时间戳的生成 bundle，方便把完整 run 作为一个目录复制、附加、审查或删除。默认情况下，`artifacts/` 下的生成输出会被忽略。需要成为仓库历史一部分的已审查报告，应提升到稳定的已提交证据目录。

## 仓库结构

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

报告 renderer 与确定性聚合源码位于 `ai-native-eval` skill 包：`.agents/skills/ai-native-eval/scripts/eval/`。关于 evaluator 边界与插件解析细节，请参阅 [docs/architecture.md](docs/architecture.md)。

## Foundation 自评估

本仓库会评估自身，并发布严格的 baseline 报告。

- Score: `3.1 / 10`
- Level: `3`
- Confidence: `high`
- Scope: foundation maturity plus AI Native Eval evaluator-system quality；本次自评估禁用了 `bmad-method-evaluator`。
- Recent-change evidence: 因为 baseline 尚未把每个 evaluator 连接到最近五个 PR 等级实质变更的遵循证据，所以会严格扣分。
- Run folder: `self-evaluations/foundation-20260614/run/`
- Compact report: [self-evaluations/foundation-20260614/report.md](self-evaluations/foundation-20260614/report.md)

baseline 由每个叶子 evaluator 的 JSON 文件生成，可通过以下命令重新生成：

```sh
pnpm self-eval:validate
pnpm self-eval:render
```

## Skill 评估

每个 skill 都在自己的 `SKILL.md` 旁边维护 eval cases：

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

Contract evals 会验证 skill fixtures。Live evals 会运行真实 Codex 路径，并与默认确定性测试套件保持分离。
`contract` 模式不会调用真实 agent。`live` 模式会有意调用真实 Codex CLI，因此可能更慢，也更不确定。

## 开发命令

开发本仓库时常用命令：

```sh
pnpm test
pnpm render:example
pnpm score:example
pnpm persist:example
pnpm self-eval:validate
pnpm self-eval:render
```

## 贡献

欢迎贡献。请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，了解开发流程、evaluator 变更要求与 PR checklist。

## 安全

请私下报告安全漏洞。报告方式与 eval artifact 安全注意事项见 [SECURITY.md](SECURITY.md)。

## 许可证

MIT License。详见 [LICENSE](LICENSE)。

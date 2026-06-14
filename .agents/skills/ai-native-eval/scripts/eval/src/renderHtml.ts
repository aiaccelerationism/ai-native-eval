import type {
  EvaluationNodeResult,
  EvaluationReport,
  EvaluationStatus,
  ReportUiLanguage
} from "./types.js";

const translations = {
  en: {
    reportTitle: "AI Native Eval Report",
    generated: "generated",
    score: "Score",
    confidence: "Confidence",
    evaluationTree: "Evaluation Tree",
    evaluationContext: "Evaluation Context",
    runConfiguration: "Run Configuration",
    reproducibility: "Reproducibility",
    points: "Points",
    node: "Node",
    status: "Status",
    action: "Action",
    evidence: "Evidence",
    whyNot10: "Why Not 10/10",
    cappedAt: "Capped at",
    recommendedActions: "Recommended Actions",
    improvementReferences: "Improvement References",
    copyAgentPrompt: "Copy agent prompt",
    language: "Language"
  },
  "zh-TW": {
    reportTitle: "AI Native 段位報告",
    generated: "產生於",
    score: "分數",
    confidence: "信心",
    evaluationTree: "評估樹",
    evaluationContext: "評估情境",
    runConfiguration: "執行設定",
    reproducibility: "可重現資訊",
    points: "點數",
    node: "節點",
    status: "狀態",
    action: "操作",
    evidence: "證據",
    whyNot10: "為什麼不是 10/10",
    cappedAt: "上限",
    recommendedActions: "建議動作",
    improvementReferences: "改善參考",
    copyAgentPrompt: "複製 agent prompt",
    language: "語言"
  }
} satisfies Record<ReportUiLanguage, Record<string, string>>;

type TranslationKey = keyof (typeof translations)["en"];
type TranslationDictionary = Record<TranslationKey, string>;

export function renderHtmlReport(report: EvaluationReport): string {
  const uiLanguage = supportedUiLanguage(report.uiLanguage ?? report.language);
  const tr = translations[uiLanguage];
  return `<!doctype html>
<html lang="${escapeAttr(uiLanguage)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(tr.reportTitle)}</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; background: #f6f7f9; color: #18202f; }
    main { max-width: 1160px; margin: 0 auto; padding: 32px 20px 56px; }
    h1, h2, h3 { margin: 0; letter-spacing: 0; }
    h1 { font-size: 32px; }
    h2 { font-size: 20px; margin-top: 28px; }
    .report-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    .report-meta { color: #667085; font-size: 12px; line-height: 1.35; margin: 5px 0 0; }
    .language-switch { display: inline-flex; align-items: center; gap: 6px; color: #667085; font-size: 12px; font-weight: 650; }
    .language-switch select { appearance: none; border: 1px solid #d0d5dd; border-radius: 7px; background-color: #fff; background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2020%2020%27%20fill%3D%27none%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M6%208l4%204%204-4%27%20stroke%3D%27%23667085%27%20stroke-width%3D%271.6%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 7px center; background-size: 14px 14px; color: #344054; cursor: pointer; font: inherit; line-height: 1.3; min-height: 30px; padding: 5px 28px 5px 9px; }
    .language-switch select:hover { background: #f9fafb; }
    .language-switch select:focus { outline: 2px solid #84caff; outline-offset: 2px; }
    .section-body { margin-top: 12px; }
    .summary { display: grid; grid-template-columns: minmax(220px, 360px); gap: 12px; margin: 20px 0 24px; }
    .metric, .panel { background: #fff; border: 1px solid #dfe4ec; border-radius: 8px; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04); }
    .metric { padding: 16px 18px; }
    .metric .label { color: #667085; font-size: 12px; text-transform: uppercase; }
    .metric .value { font-size: 34px; font-weight: 750; margin-top: 8px; font-variant-numeric: tabular-nums; }
    .metric .subvalue { color: #667085; font-size: 13px; font-weight: 600; margin-top: 4px; text-transform: capitalize; }
    .panel { padding: 16px; }
    .tree-panel { background: #fff; border: 1px solid #dfe4ec; border-radius: 8px; margin-top: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04); }
    .tree-table { width: 100%; border-collapse: collapse; margin: 0; table-layout: fixed; }
    .tree-table th { background: #f8fafc; border-bottom: 1px solid #dfe4ec; }
    .tree-table th:nth-child(1) { width: auto; }
    .tree-table th:nth-child(2) { width: 118px; }
    .tree-table th:nth-child(3) { width: 104px; }
    .tree-table th:nth-child(4) { width: 96px; }
    .tree-table th:nth-child(5) { width: 112px; }
    .tree-table th:nth-child(6) { width: 64px; }
    .tree-row td { background: #fff; }
    .tree-row.collapsed-descendant, .detail-row.collapsed-descendant { display: none; }
    .tree-row:hover td { background: #f9fafb; }
    .tree-row.status-missing td, .tree-row.status-fail td, .tree-row.status-stale td { background: #fffafa; }
    .tree-row.status-partial td { background: #fffdf5; }
    .node-cell { padding-left: calc(12px + var(--depth) * 22px); }
    .node-main { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .node-toggle { border: 0; background: transparent; color: #667085; cursor: pointer; font-size: 12px; width: 18px; height: 18px; line-height: 18px; padding: 0; flex: 0 0 18px; border-radius: 4px; }
    .node-toggle:hover { background: #eef2f7; color: #344054; }
    .node-toggle.empty { cursor: default; visibility: hidden; }
    .status-dot { width: 9px; height: 9px; border-radius: 50%; flex: 0 0 9px; background: #98a2b3; }
    .tree-row.status-pass .status-dot { background: #12b76a; }
    .tree-row.status-partial .status-dot { background: #f79009; }
    .tree-row.status-fail .status-dot, .tree-row.status-missing .status-dot, .tree-row.status-stale .status-dot { background: #f04438; }
    .node-label { font-size: 13px; font-weight: 650; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .anchor-link { color: #98a2b3; font-size: 12px; opacity: 0; text-decoration: none; }
    .tree-row:hover .anchor-link { opacity: 1; }
    .node-sub { margin-top: 3px; color: #667085; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .node-kind { border: 1px solid #d0d5dd; border-radius: 999px; color: #475467; font-size: 11px; padding: 1px 6px; background: #f9fafb; }
    .node-badge { border: 1px solid #d0d5dd; border-radius: 999px; color: #475467; font-size: 11px; padding: 1px 6px; background: #fff; }
    .node-badge.additional { background: #eef4ff; border-color: #b2ccff; color: #175cd3; }
    .node-badge.disabled { background: #f2f4f7; border-color: #d0d5dd; color: #475467; }
    .config-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .config-list h3 { color: #667085; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .config-list ul { padding-left: 0; list-style: none; }
    .config-list li { margin-top: 6px; overflow-wrap: anywhere; }
    .metric-cell { font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .metric-chip { display: inline-flex; align-items: center; border-radius: 999px; padding: 2px 7px; line-height: 1.35; background: #f2f4f7; color: #344054; }
    .metric-chip.good { background: #dcfae6; color: #067647; }
    .metric-chip.warn { background: #fef0c7; color: #93370d; }
    .metric-chip.bad { background: #fee4e2; color: #b42318; }
    .metric-chip.neutral { background: transparent; color: #344054; padding-left: 0; padding-right: 0; }
    .detail-row td { background: #fcfcfd; padding: 0; }
    .node-detail { margin-left: calc(12px + var(--depth) * 22px); padding: 10px 16px 12px 30px; border-left: 2px solid #d0d5dd; }
    .node-detail p { margin: 0 0 8px; color: #475467; font-size: 13px; line-height: 1.45; }
    .node-detail h3 { margin: 10px 0 4px; color: #667085; font-size: 11px; font-weight: 700; line-height: 1.2; text-transform: uppercase; }
    .deduction-groups, .deduction-list, .deduction-evidence { list-style: none; margin: 6px 0 0; padding-left: 0; }
    .deduction-group { border-left: 2px solid #f79009; margin-top: 8px; padding-left: 10px; }
    .deduction-item { margin-top: 8px; }
    .deduction-title { color: #18202f; font-size: 13px; font-weight: 700; line-height: 1.35; }
    .deduction-detail { margin-top: 6px; }
    .deduction-detail-label { color: #667085; display: block; font-size: 11px; font-weight: 700; line-height: 1.25; margin-top: 7px; text-transform: uppercase; }
    .deduction-detail p { margin: 2px 0 0; }
    .deduction-evidence li { margin-top: 3px; }
    .muted { color: #667085; }
    .pill { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 3px 8px; font-size: 12px; font-weight: 650; background: #eef2f7; white-space: nowrap; }
    .copy-button { border: 0; border-radius: 5px; background: transparent; color: #667085; cursor: pointer; width: 26px; height: 26px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
    .copy-button:hover { background: #eef2f7; color: #175cd3; }
    .copy-button svg { width: 15px; height: 15px; stroke: currentColor; }
    .copy-button.copied { color: #067647; background: #dcfae6; }
    .score { min-width: 78px; text-align: center; }
    .status-pass { background: #dcfae6; color: #067647; }
    .status-partial { background: #fef0c7; color: #93370d; }
    .status-fail, .status-missing, .status-stale { background: #fee4e2; color: #b42318; }
    .status-not_applicable { background: #eef2f7; color: #475467; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { text-align: left; border-bottom: 1px solid #e6eaf0; padding: 9px 8px; vertical-align: top; }
    tr:last-child td { border-bottom: 0; }
    th { font-size: 12px; color: #667085; text-transform: uppercase; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; background: #f2f4f7; border-radius: 4px; padding: 1px 4px; }
    ul { margin: 4px 0 0; padding-left: 18px; color: #344054; font-size: 13px; line-height: 1.45; }
    pre { background: #f8fafc; border: 1px solid #e6eaf0; border-radius: 6px; padding: 10px; overflow: auto; }
    a { color: #175cd3; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media (max-width: 860px) {
      .summary { grid-template-columns: 1fr; }
      .tree-panel { overflow-x: auto; }
      .tree-table { min-width: 820px; }
    }
  </style>
</head>
<body>
  <main>
    <header class="report-header">
      <div>
        <h1 data-i18n="reportTitle">${escapeHtml(tr.reportTitle)}</h1>
        <p class="report-meta">${escapeHtml(report.scope)} · <span data-i18n="generated">${escapeHtml(tr.generated)}</span> ${escapeHtml(report.generatedAt)}</p>
      </div>
      <label class="language-switch">
        <select data-language-select aria-label="${escapeAttr(tr.language)}" data-i18n-aria-label="language">
          <option value="en"${uiLanguage === "en" ? " selected" : ""}>English</option>
          <option value="zh-TW"${uiLanguage === "zh-TW" ? " selected" : ""}>繁體中文</option>
        </select>
      </label>
    </header>
    <section class="summary">
      ${scoreMetric(tr, report)}
    </section>
    ${renderEvaluationContext(report, tr)}
    ${renderRunConfiguration(report, tr)}
    <section>
      <h2 data-i18n="evaluationTree">${escapeHtml(tr.evaluationTree)}</h2>
      <div class="tree-panel">${renderTreeTable(report.root, report.reproducibility?.repoUrl, tr)}</div>
    </section>
    <section>
      <h2 data-i18n="reproducibility">${escapeHtml(tr.reproducibility)}</h2>
      <div class="panel section-body"><pre>${escapeHtml(JSON.stringify(report.reproducibility ?? {}, null, 2))}</pre></div>
    </section>
  </main>
<script>
(() => {
  const translations = ${JSON.stringify(translations)};
  let currentLanguage = ${JSON.stringify(uiLanguage)};
  const rows = Array.from(document.querySelectorAll("[data-node-id]"));
  const byParent = new Map();
  for (const row of rows) {
    const parent = row.getAttribute("data-parent-id");
    if (!parent) continue;
    const list = byParent.get(parent) || [];
    list.push(row);
    byParent.set(parent, list);
  }

  function setDetailHidden(nodeId, hidden) {
    for (const detail of document.querySelectorAll('[data-detail-for="' + CSS.escape(nodeId) + '"]')) {
      detail.classList.toggle("collapsed-descendant", hidden);
    }
  }

  function setSubtreeHidden(nodeId, hidden) {
    for (const child of byParent.get(nodeId) || []) {
      child.classList.toggle("collapsed-descendant", hidden);
      const childId = child.getAttribute("data-node-id");
      if (!childId) continue;
      const childCollapsed = child.getAttribute("data-collapsed") === "true";
      setDetailHidden(childId, hidden);
      setSubtreeHidden(childId, hidden || childCollapsed);
    }
  }

  for (const button of document.querySelectorAll("[data-toggle-node]")) {
    button.addEventListener("click", () => {
      const nodeId = button.getAttribute("data-toggle-node");
      const row = nodeId ? document.querySelector('[data-node-id="' + CSS.escape(nodeId) + '"]') : null;
      if (!nodeId || !row) return;
      const collapsed = row.getAttribute("data-collapsed") === "true";
      const nextCollapsed = !collapsed;
      row.setAttribute("data-collapsed", String(nextCollapsed));
      button.textContent = nextCollapsed ? "▸" : "▾";
      button.setAttribute("aria-expanded", String(!nextCollapsed));
      setDetailHidden(nodeId, nextCollapsed);
      setSubtreeHidden(nodeId, nextCollapsed);
    });
  }

  for (const button of document.querySelectorAll("[data-copy-prompt]")) {
    button.addEventListener("click", async () => {
      const prompt = button.getAttribute("data-copy-prompt") || "";
      try {
        await navigator.clipboard.writeText(prompt);
        const original = button.innerHTML;
        button.innerHTML = '${checkIcon()}';
        button.classList.add("copied");
        setTimeout(() => {
          button.innerHTML = original;
          button.classList.remove("copied");
        }, 1200);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = prompt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
    });
  }

  function applyLanguage(language) {
    const dictionary = translations[language] || translations.en;
    currentLanguage = language;
    document.documentElement.lang = language;
    document.title = dictionary.reportTitle;
    for (const node of document.querySelectorAll("[data-i18n]")) {
      const key = node.getAttribute("data-i18n");
      if (key && dictionary[key]) node.textContent = dictionary[key];
    }
    for (const node of document.querySelectorAll("[data-i18n-title]")) {
      const key = node.getAttribute("data-i18n-title");
      if (key && dictionary[key]) node.setAttribute("title", dictionary[key]);
    }
    for (const node of document.querySelectorAll("[data-i18n-aria-label]")) {
      const key = node.getAttribute("data-i18n-aria-label");
      if (key && dictionary[key]) node.setAttribute("aria-label", dictionary[key]);
    }
    for (const select of document.querySelectorAll("[data-language-select]")) {
      select.value = language;
    }
  }

  for (const select of document.querySelectorAll("[data-language-select]")) {
    select.addEventListener("change", () => {
      applyLanguage(select.value || currentLanguage);
    });
  }
})();
</script>
</body>
</html>`;
}

function scoreMetric(tr: TranslationDictionary, report: EvaluationReport): string {
  return `<div class="metric"><div class="label" data-i18n="score">${escapeHtml(
    tr.score
  )}</div><div class="value">${escapeHtml(displayScore10(report.root.score0To10))}</div><div class="subvalue"><span data-i18n="confidence">${escapeHtml(
    tr.confidence
  )}</span>: ${escapeHtml(report.summary.confidence)}</div></div>`;
}

function renderEvaluationContext(
  report: EvaluationReport,
  tr: TranslationDictionary
): string {
  const context = report.evaluationContext;
  if (!context) return "";
  const rows = [
    ["Review type", context.reviewType],
    ["Target", context.target],
    ["Target ref", context.targetRef],
    ["Phase", context.phase],
    ["Trigger", context.trigger],
    ["Trigger mode", context.triggerMetadata?.mode],
    ["Trigger source", context.triggerMetadata?.source],
    ["Trigger event", context.triggerMetadata?.event],
    [
      "Trigger threshold",
      context.triggerMetadata?.threshold === undefined
        ? undefined
        : String(context.triggerMetadata.threshold)
    ],
    [
      "Trigger max iterations",
      context.triggerMetadata?.maxIterations === undefined
        ? undefined
        : String(context.triggerMetadata.maxIterations)
    ],
    [
      "Trigger owner",
      context.triggerMetadata
        ? "External systems own scheduling, enforcement, and iteration loops."
        : undefined
    ],
    ["Target surfaces", context.targetSurfaces?.join(", ")],
    ["Output intents", context.outputIntents?.join(", ")],
    [
      "Affects overall score",
      context.affectsOverallScore === undefined
        ? undefined
        : String(context.affectsOverallScore)
    ],
    ["Assumption", context.assumption]
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return `<section><h2 data-i18n="evaluationContext">${escapeHtml(
    tr.evaluationContext
  )}</h2><div class="panel section-body"><table><tbody>${rows
    .map(
      ([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
    )
    .join("")}</tbody></table></div></section>`;
}

function renderRunConfiguration(
  report: EvaluationReport,
  tr: TranslationDictionary
): string {
  if (!report.runConfig) return "";
  const builtIn = report.runConfig.roots.filter((root) => root.origin === "built-in");
  const additional = report.runConfig.roots.filter(
    (root) => root.origin === "additional"
  );
  const disabled = report.runConfig.disabled;
  const routes = report.runConfig.appliedContextRoutes ?? [];
  const evaluatorConfigs = report.runConfig.evaluatorConfigs ?? [];
  const warnings = report.runConfig.warnings ?? [];
  return `<section><h2 data-i18n="runConfiguration">${escapeHtml(
    tr.runConfiguration
  )}</h2><div class="panel section-body config-list">
    <div><h3>Built-in</h3><ul>${builtIn
      .map((root) => `<li><code>${escapeHtml(root.pluginId)}</code></li>`)
      .join("")}</ul></div>
    <div><h3>Additional</h3><ul>${
      additional.length > 0
        ? additional
            .map(
              (root) =>
                `<li><code>${escapeHtml(root.pluginId)}</code>${root.reason ? ` <span class="muted">${escapeHtml(root.reason)}</span>` : ""}</li>`
            )
            .join("")
        : `<li class="muted">None</li>`
    }</ul></div>
    <div><h3>Disabled</h3><ul>${
      disabled.length > 0
        ? disabled
            .map(
              (item) =>
                `<li><code>${escapeHtml(item.pluginId)}</code><br><span class="muted">${escapeHtml(item.reason)} (${escapeHtml(item.source)})</span></li>`
            )
            .join("")
        : `<li class="muted">None</li>`
    }</ul></div>
    <div><h3>Context routes</h3><ul>${
      routes.length > 0
        ? routes
            .map(
              (route) =>
                `<li><code>${escapeHtml(route.id)}</code><br><span class="muted">${escapeHtml(route.description ?? route.source)}</span></li>`
            )
            .join("")
        : `<li class="muted">None</li>`
    }</ul></div>
    <div><h3>Evaluator configs</h3><ul>${
      evaluatorConfigs.length > 0
        ? evaluatorConfigs
            .map((config) => {
              const details = [
                config.enabled === false ? "disabled" : "enabled",
                config.additionalChildren?.length
                  ? `+${config.additionalChildren.map((child) => child.pluginId).join(", ")}`
                  : "",
                config.disabledChildren?.length
                  ? `-${config.disabledChildren.map((child) => child.pluginId).join(", ")}`
                  : ""
              ].filter(Boolean).join(" · ");
              return `<li><code>${escapeHtml(config.pluginId)}</code><br><span class="muted">${escapeHtml(config.source)} · ${escapeHtml(details)}</span></li>`;
            })
            .join("")
        : `<li class="muted">None</li>`
    }</ul></div>
    <div><h3>Warnings</h3><ul>${
      warnings.length > 0
        ? warnings
            .map(
              (warning) =>
                `<li><code>${escapeHtml(warning.code)}</code><br><span class="muted">${escapeHtml(warning.message)} (${escapeHtml(warning.source)})</span></li>`
            )
            .join("")
        : `<li class="muted">None</li>`
    }</ul></div>
  </div></section>`;
}

function renderTreeTable(
  root: EvaluationNodeResult,
  repoUrl: string | undefined,
  tr: TranslationDictionary
): string {
  return `<table class="tree-table">
    <thead><tr><th data-i18n="node">${escapeHtml(tr.node)}</th><th data-i18n="status">${escapeHtml(tr.status)}</th><th data-i18n="score">${escapeHtml(tr.score)}</th><th data-i18n="points">${escapeHtml(tr.points)}</th><th data-i18n="confidence">${escapeHtml(tr.confidence)}</th><th data-i18n="action">${escapeHtml(tr.action)}</th></tr></thead>
    <tbody>${renderNodeRows(root, 0, undefined, repoUrl, tr)}</tbody>
  </table>`;
}

function renderNodeRows(
  node: EvaluationNodeResult,
  depth: number,
  parentId: string | undefined,
  repoUrl: string | undefined,
  tr: TranslationDictionary
): string {
  const hasDetail = hasNodeDetail(node);
  const hasChildren = node.children.length > 0;
  const canToggle = hasChildren || hasDetail;
  const rows = [`<tr class="tree-row status-${node.status}" style="--depth:${depth}" data-node-id="${escapeAttr(
    node.id
  )}"${parentId ? ` data-parent-id="${escapeAttr(parentId)}"` : ""} data-collapsed="false">
    <td class="node-cell" id="${escapeAttr(nodeAnchor(node.id))}">
      <div class="node-main">
        ${
          canToggle
            ? `<button class="node-toggle" type="button" data-toggle-node="${escapeAttr(
                node.id
              )}" aria-label="Toggle ${escapeAttr(node.label)}" aria-expanded="true">▾</button>`
            : `<span class="node-toggle empty"></span>`
        }
        <span class="status-dot" aria-hidden="true"></span>
        <span class="node-label">${escapeHtml(node.label)}</span>
        <a class="anchor-link" href="#${escapeAttr(nodeAnchor(node.id))}" aria-label="Permalink to ${escapeAttr(node.label)}">#</a>
        ${node.kind ? `<span class="node-kind">${escapeHtml(node.kind)}</span>` : ""}
        ${node.origin === "additional" ? `<span class="node-badge additional">additional</span>` : ""}
        ${node.disabledReason ? `<span class="node-badge disabled">disabled</span>` : ""}
      </div>
      <div class="node-sub"><code>${escapeHtml(node.id)}</code>${node.dimension ? ` · ${escapeHtml(node.dimension)}` : ""}</div>
    </td>
    <td><span class="pill status-${node.status}">${escapeHtml(node.status)}</span></td>
    <td class="metric-cell">${metricChip(displayScore10(node.score0To10), scoreTone(node.score0To10))}</td>
    <td class="metric-cell">${metricChip(`${node.pointsEarned} / ${node.pointsAvailable}`, pointsTone(node.pointsEarned, node.pointsAvailable))}</td>
    <td class="metric-cell">${metricChip(node.confidence, confidenceTone(node.confidence))}</td>
    <td><button class="copy-button" type="button" data-copy-prompt="${escapeAttr(buildAgentPrompt(node, repoUrl))}" title="${escapeAttr(tr.copyAgentPrompt)}" data-i18n-title="copyAgentPrompt" aria-label="${escapeAttr(tr.copyAgentPrompt)}" data-i18n-aria-label="copyAgentPrompt">${copyIcon()}</button></td>
  </tr>`];

  if (hasDetail) {
    rows.push(`<tr class="detail-row" style="--depth:${depth}" data-detail-for="${escapeAttr(
      node.id
    )}">
      <td colspan="6"><div class="node-detail">
        ${node.reason ? `<p>${escapeHtml(node.reason)}</p>` : ""}
        ${renderDeductions(node, tr, repoUrl)}
        ${renderEvidence(node, repoUrl, tr)}
        ${renderRecommendations(node, tr)}
        ${renderReferences(node, repoUrl, tr)}
      </div></td>
    </tr>`);
  }

  for (const child of node.children) {
    rows.push(renderNodeRows(child, depth + 1, node.id, repoUrl, tr));
  }

  return rows.join("");
}

function hasNodeDetail(node: EvaluationNodeResult): boolean {
  return Boolean(
    node.reason ||
      hasAppliedDeductions(node) ||
      (node.evidence && node.evidence.length > 0) ||
      (node.recommendations && node.recommendations.length > 0) ||
      (node.references && node.references.length > 0)
  );
}

function hasAppliedDeductions(node: EvaluationNodeResult): boolean {
  return Boolean(
    node.deductionGroups?.some((group) => group.appliedDeductions.length > 0)
  );
}

function renderDeductions(
  node: EvaluationNodeResult,
  tr: TranslationDictionary,
  repoUrl: string | undefined
): string {
  const groups = node.deductionGroups?.filter(
    (group) => group.appliedDeductions.length > 0
  );
  if (!groups || groups.length === 0) return "";
  return `<h3 data-i18n="whyNot10">${escapeHtml(tr.whyNot10)}</h3><ul class="deduction-groups">${groups
    .map((group) => {
      const cap = group.capped
        ? ` <span class="muted">(${escapeHtml(tr.cappedAt)} ${group.budget})</span>`
        : "";
      const deductions = group.appliedDeductions
        .map((deduction) => renderDeductionItem(deduction, repoUrl))
        .join("");
      return `<li class="deduction-group"><div class="deduction-title">${escapeHtml(group.label)} <span class="muted">-${group.pointsLost}${cap}</span></div><ul class="deduction-list">${deductions}</ul></li>`;
    })
    .join("")}</ul>`;
}

type AppliedDeduction = NonNullable<
  EvaluationNodeResult["deductionGroups"]
>[number]["appliedDeductions"][number];

function renderDeductionItem(
  deduction: AppliedDeduction,
  repoUrl: string | undefined
): string {
  const evidence = renderDeductionEvidenceList(deduction.evidence, repoUrl);
  const recommendation = deduction.recommendation?.summary
    ? `<span class="deduction-detail-label">Recommendation</span><p>${escapeHtml(deduction.recommendation.summary)}</p>`
    : "";
  const reason = deduction.reason
    ? `<span class="deduction-detail-label">Reason</span><p>${escapeHtml(deduction.reason)}</p>`
    : "";
  return `<li class="deduction-item"><div class="deduction-title">${escapeHtml(deduction.label)} <span class="muted">-${deduction.pointsLost}</span></div><div class="deduction-detail">${reason}${evidence}${recommendation}</div></li>`;
}

function renderDeductionEvidenceList(
  evidence: EvaluationNodeResult["evidence"],
  repoUrl: string | undefined
): string {
  if (!evidence || evidence.length === 0) return "";
  return `<span class="deduction-detail-label">Evidence</span><ul class="deduction-evidence">${evidence
    .map((item) => {
      const label = item.locator ? `${item.source} ${item.locator}` : item.source;
      const url = item.url ?? synthesizeRepoUrl(item.source, repoUrl);
      const linked = url
        ? `<a href="${escapeAttr(url)}">${escapeHtml(label)}</a>`
        : escapeHtml(label);
      return `<li>${linked}</li>`;
    })
    .join("")}</ul>`;
}

function renderEvidence(
  node: EvaluationNodeResult,
  repoUrl: string | undefined,
  tr: TranslationDictionary
): string {
  if (!node.evidence || node.evidence.length === 0) return "";
  return `<h3 data-i18n="evidence">${escapeHtml(tr.evidence)}</h3><ul>${node.evidence
    .map((evidence) => {
      const label = evidence.locator
        ? `${evidence.source} ${evidence.locator}`
        : evidence.source;
      const url = evidence.url ?? synthesizeRepoUrl(evidence.source, repoUrl);
      const linked = url
        ? `<a href="${escapeAttr(url)}">${escapeHtml(label)}</a>`
        : escapeHtml(label);
      return `<li>${linked}: ${escapeHtml(evidence.summary)}</li>`;
    })
    .join("")}</ul>`;
}

function renderRecommendations(
  node: EvaluationNodeResult,
  tr: TranslationDictionary
): string {
  if (!node.recommendations || node.recommendations.length === 0) return "";
  return `<h3 data-i18n="recommendedActions">${escapeHtml(tr.recommendedActions)}</h3><ul>${node.recommendations
    .map((item) => `<li>${escapeHtml(item.summary)}</li>`)
    .join("")}</ul>`;
}

function renderReferences(
  node: EvaluationNodeResult,
  repoUrl: string | undefined,
  tr: TranslationDictionary
): string {
  if (!node.references || node.references.length === 0) return "";
  return `<h3 data-i18n="improvementReferences">${escapeHtml(tr.improvementReferences)}</h3><ul>${node.references
    .map((ref) => {
      const url = ref.url ?? synthesizeRepoUrl(ref.source ?? ref.label, repoUrl);
      const label = url
        ? `<a href="${escapeAttr(url)}">${escapeHtml(ref.label)}</a>`
        : escapeHtml(ref.label);
      return `<li>${label}${ref.summary ? `: ${escapeHtml(ref.summary)}` : ""}</li>`;
    })
    .join("")}</ul>`;
}

function metricChip(value: string, tone: "good" | "warn" | "bad" | "neutral"): string {
  return `<span class="metric-chip ${tone}">${escapeHtml(value)}</span>`;
}

function scoreTone(score: number | null): "good" | "warn" | "bad" | "neutral" {
  if (score === null) return "neutral";
  if (score < 5) return "bad";
  if (score < 8) return "warn";
  return "good";
}

function pointsTone(
  pointsEarned: number,
  pointsAvailable: number
): "good" | "warn" | "bad" | "neutral" {
  if (pointsAvailable <= 0) return "neutral";
  const ratio = pointsEarned / pointsAvailable;
  if (ratio < 0.5) return "bad";
  if (ratio < 1) return "warn";
  return "good";
}

function confidenceTone(confidence: string): "good" | "warn" | "bad" | "neutral" {
  const normalized = confidence.toLowerCase();
  if (normalized === "high") return "good";
  if (normalized === "medium") return "warn";
  if (normalized === "low") return "bad";
  return "neutral";
}

function supportedUiLanguage(language: string | undefined): ReportUiLanguage {
  if (!language) return "en";
  if (language === "zh-TW" || language.toLowerCase().startsWith("zh")) {
    return "zh-TW";
  }
  return "en";
}

function copyIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2" stroke-width="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" stroke-linecap="round"></path></svg>`;
}

function checkIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6 9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
}

function buildAgentPrompt(node: EvaluationNodeResult, repoUrl: string | undefined): string {
  const lines = [
    "You are an AI coding agent. Fix the AI-native eval finding represented by this evaluation subtree.",
    "",
    "Scope:",
    formatNodeForPrompt(node, 0, repoUrl),
    "",
    "Instructions:",
    "- Use the evidence links and recommendations below.",
    "- Preserve existing behavior unless the finding requires a change.",
    "- Produce reviewable changes with tests or evidence where appropriate.",
    "- Do not claim the finding is fixed unless the acceptance evidence is present."
  ];
  return lines.join("\n");
}

function formatNodeForPrompt(
  node: EvaluationNodeResult,
  depth: number,
  repoUrl: string | undefined
): string {
  const prefix = "  ".repeat(depth);
  const parts = [
    `${prefix}- ${node.label} (${node.id})`,
    `${prefix}  status=${node.status}; score=${displayScore10(node.score0To10)}; points=${node.pointsEarned}/${node.pointsAvailable}; confidence=${node.confidence}`
  ];
  if (node.reason) parts.push(`${prefix}  reason: ${node.reason}`);
  for (const group of node.deductionGroups ?? []) {
    if (group.appliedDeductions.length === 0) continue;
    parts.push(`${prefix}  why-not-10 group=${group.label}; lost=${group.pointsLost}; budget=${group.budget}${group.capped ? "; capped=true" : ""}`);
    for (const deduction of group.appliedDeductions) {
      parts.push(`${prefix}    deduction=${deduction.label}; lost=${deduction.pointsLost}; reason=${deduction.reason ?? ""}`);
      if (deduction.recommendation) {
        parts.push(`${prefix}    recommendation: ${deduction.recommendation.summary}`);
      }
    }
  }
  for (const evidence of node.evidence ?? []) {
    const url = evidence.url ?? synthesizeRepoUrl(evidence.source, repoUrl);
    parts.push(`${prefix}  evidence: ${evidence.source}${evidence.locator ? ` ${evidence.locator}` : ""}${url ? ` ${url}` : ""} - ${evidence.summary}`);
  }
  for (const recommendation of node.recommendations ?? []) {
    parts.push(`${prefix}  recommendation: ${recommendation.summary}`);
  }
  for (const reference of node.references ?? []) {
    const url = reference.url ?? synthesizeRepoUrl(
      reference.source ?? reference.label,
      repoUrl
    );
    parts.push(`${prefix}  reference: ${reference.label}${url ? ` ${url}` : ""}${reference.summary ? ` - ${reference.summary}` : ""}`);
  }
  for (const child of node.children) {
    parts.push(formatNodeForPrompt(child, depth + 1, repoUrl));
  }
  return parts.join("\n");
}

function synthesizeRepoUrl(
  source: string | undefined,
  repoUrl: string | undefined
): string | undefined {
  if (!source) return undefined;
  if (source.startsWith("http://") || source.startsWith("https://")) return source;
  if (!looksLikeRepoPath(source)) return undefined;
  const base = repoUrl ?? "https://github.com/example/ai-native-eval";
  return `${base.replace(/\/$/, "")}/blob/main/${encodeURI(source)}`;
}

function looksLikeRepoPath(source: string): boolean {
  return (
    source.endsWith(".md") ||
    source.endsWith(".json") ||
    source.endsWith(".ts") ||
    source.endsWith(".yml") ||
    source.endsWith(".yaml") ||
    source.includes("/")
  );
}

function nodeAnchor(id: string): string {
  return `node-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function displayScore10(score0To10: number | null): string {
  return score0To10 === null ? "N/A" : `${score0To10.toFixed(1)} / 10`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

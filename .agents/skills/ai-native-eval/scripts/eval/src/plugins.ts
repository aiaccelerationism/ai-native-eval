import type {
  EvaluatorPluginManifest,
  PluginResolution
} from "./types.js";

export function resolvePluginGraph(input: {
  rootPluginIds: string[];
  manifests: EvaluatorPluginManifest[];
}): PluginResolution {
  const byId = new Map(
    input.manifests.map((manifest) => [manifest.pluginId, manifest])
  );
  const resolvedPluginIds: string[] = [];
  const missingPluginIds: string[] = [];
  const seen = new Set<string>();

  function visit(pluginId: string): void {
    if (seen.has(pluginId)) return;
    seen.add(pluginId);

    const manifest = byId.get(pluginId);
    if (!manifest) {
      missingPluginIds.push(pluginId);
      return;
    }

    resolvedPluginIds.push(pluginId);
    for (const child of manifest.directChildren ?? []) {
      visit(child.pluginId);
    }
  }

  for (const rootPluginId of input.rootPluginIds) {
    visit(rootPluginId);
  }

  return {
    rootPluginIds: input.rootPluginIds,
    resolvedPluginIds,
    missingPluginIds
  };
}

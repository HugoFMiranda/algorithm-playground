import { getAlgorithmRuntime } from "@/algorithms/registry";

export type RendererMode = "advanced" | "simple";
export const RENDERER_MODE_STORAGE_KEY = "algorithm-playground.renderer-mode";

const SIMPLE_ARRAY_SLUGS = new Set([
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "merge-sort",
  "quick-sort",
  "heap-sort",
  "counting-sort",
  "binary-search",
]);

const SIMPLE_GRID_SLUGS = new Set([
  "bfs",
  "dfs",
  "dijkstra",
  "a-star",
  "bidirectional-bfs",
]);

export function supportsSimpleRenderer(slug: string | null): boolean {
  if (!slug) {
    return false;
  }

  return SIMPLE_ARRAY_SLUGS.has(slug) || SIMPLE_GRID_SLUGS.has(slug);
}

export function getSimpleRendererFamily(slug: string | null): "array" | "grid" | null {
  if (!slug || !supportsSimpleRenderer(slug)) {
    return null;
  }

  const runtime = getAlgorithmRuntime(slug);
  if (!runtime) {
    return null;
  }

  if (runtime.rendererFamily === "array" || runtime.rendererFamily === "grid") {
    return runtime.rendererFamily;
  }

  if (slug === "binary-search") {
    return "array";
  }

  return null;
}

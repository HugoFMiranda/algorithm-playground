import { createAStarRun } from "@/algorithms/a-star/engine";
import { A_STAR_DEFAULT_PARAMS } from "@/algorithms/a-star/spec";
import { createBinarySearchRun } from "@/algorithms/binary-search/engine";
import { BINARY_SEARCH_DEFAULT_PARAMS } from "@/algorithms/binary-search/spec";
import { createBfsRun } from "@/algorithms/bfs/engine";
import { BFS_DEFAULT_PARAMS } from "@/algorithms/bfs/spec";
import { createBubbleSortRun } from "@/algorithms/bubble-sort/engine";
import { BUBBLE_SORT_DEFAULT_PARAMS } from "@/algorithms/bubble-sort/spec";
import { createDijkstraRun } from "@/algorithms/dijkstra/engine";
import { DIJKSTRA_DEFAULT_PARAMS } from "@/algorithms/dijkstra/spec";
import { createDfsRun } from "@/algorithms/dfs/engine";
import { DFS_DEFAULT_PARAMS } from "@/algorithms/dfs/spec";
import { createHeapSortRun } from "@/algorithms/heap-sort/engine";
import { HEAP_SORT_DEFAULT_PARAMS } from "@/algorithms/heap-sort/spec";
import { createInsertionSortRun } from "@/algorithms/insertion-sort/engine";
import { INSERTION_SORT_DEFAULT_PARAMS } from "@/algorithms/insertion-sort/spec";
import { createMergeSortRun } from "@/algorithms/merge-sort/engine";
import { MERGE_SORT_DEFAULT_PARAMS } from "@/algorithms/merge-sort/spec";
import { createQuickSortRun } from "@/algorithms/quick-sort/engine";
import { QUICK_SORT_DEFAULT_PARAMS } from "@/algorithms/quick-sort/spec";
import { createSelectionSortRun } from "@/algorithms/selection-sort/engine";
import { SELECTION_SORT_DEFAULT_PARAMS } from "@/algorithms/selection-sort/spec";
import type { ParamPrimitive, RawParams, StepEventBase } from "@/types/engine";

export type RendererFamily = "array" | "grid" | "graph" | "tree";

export interface RuntimeRunData {
  input: unknown;
  normalizedParams: Record<string, ParamPrimitive>;
  steps: StepEventBase[];
  result: unknown;
}

export interface AlgorithmRuntimeDefinition {
  slug: string;
  rendererFamily: RendererFamily;
  defaultParams: Record<string, ParamPrimitive>;
  createRun: (rawParams: RawParams) => RuntimeRunData;
}

const ALGORITHM_RUNTIME_REGISTRY: Record<string, AlgorithmRuntimeDefinition> = {
  "bubble-sort": {
    slug: "bubble-sort",
    rendererFamily: "array",
    defaultParams: { ...BUBBLE_SORT_DEFAULT_PARAMS },
    createRun: createBubbleSortRun,
  },
  bfs: {
    slug: "bfs",
    rendererFamily: "grid",
    defaultParams: { ...BFS_DEFAULT_PARAMS },
    createRun: createBfsRun,
  },
  dfs: {
    slug: "dfs",
    rendererFamily: "grid",
    defaultParams: { ...DFS_DEFAULT_PARAMS },
    createRun: createDfsRun,
  },
  dijkstra: {
    slug: "dijkstra",
    rendererFamily: "grid",
    defaultParams: { ...DIJKSTRA_DEFAULT_PARAMS },
    createRun: createDijkstraRun,
  },
  "a-star": {
    slug: "a-star",
    rendererFamily: "grid",
    defaultParams: { ...A_STAR_DEFAULT_PARAMS },
    createRun: createAStarRun,
  },
  "binary-search": {
    slug: "binary-search",
    rendererFamily: "array",
    defaultParams: { ...BINARY_SEARCH_DEFAULT_PARAMS },
    createRun: createBinarySearchRun,
  },
  "selection-sort": {
    slug: "selection-sort",
    rendererFamily: "array",
    defaultParams: { ...SELECTION_SORT_DEFAULT_PARAMS },
    createRun: createSelectionSortRun,
  },
  "insertion-sort": {
    slug: "insertion-sort",
    rendererFamily: "array",
    defaultParams: { ...INSERTION_SORT_DEFAULT_PARAMS },
    createRun: createInsertionSortRun,
  },
  "merge-sort": {
    slug: "merge-sort",
    rendererFamily: "array",
    defaultParams: { ...MERGE_SORT_DEFAULT_PARAMS },
    createRun: createMergeSortRun,
  },
  "quick-sort": {
    slug: "quick-sort",
    rendererFamily: "array",
    defaultParams: { ...QUICK_SORT_DEFAULT_PARAMS },
    createRun: createQuickSortRun,
  },
  "heap-sort": {
    slug: "heap-sort",
    rendererFamily: "array",
    defaultParams: { ...HEAP_SORT_DEFAULT_PARAMS },
    createRun: createHeapSortRun,
  },
};

export function getAlgorithmRuntime(slug: string): AlgorithmRuntimeDefinition | null {
  return ALGORITHM_RUNTIME_REGISTRY[slug] ?? null;
}

export function getAlgorithmDefaultParams(slug: string): Record<string, ParamPrimitive> {
  const runtime = getAlgorithmRuntime(slug);
  return runtime ? { ...runtime.defaultParams } : {};
}

export function isAlgorithmImplemented(slug: string): boolean {
  return getAlgorithmRuntime(slug) !== null;
}

import { createBinarySearchRun } from "@/algorithms/binary-search/engine";
import { BINARY_SEARCH_DEFAULT_PARAMS } from "@/algorithms/binary-search/spec";
import { createBfsRun } from "@/algorithms/bfs/engine";
import { BFS_DEFAULT_PARAMS } from "@/algorithms/bfs/spec";
import { createBubbleSortRun } from "@/algorithms/bubble-sort/engine";
import { BUBBLE_SORT_DEFAULT_PARAMS } from "@/algorithms/bubble-sort/spec";
import { createDfsRun } from "@/algorithms/dfs/engine";
import { DFS_DEFAULT_PARAMS } from "@/algorithms/dfs/spec";
import { createInsertionSortRun } from "@/algorithms/insertion-sort/engine";
import { INSERTION_SORT_DEFAULT_PARAMS } from "@/algorithms/insertion-sort/spec";
import { createMergeSortRun } from "@/algorithms/merge-sort/engine";
import { MERGE_SORT_DEFAULT_PARAMS } from "@/algorithms/merge-sort/spec";
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

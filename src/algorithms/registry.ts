import { createBinarySearchRun } from "@/algorithms/binary-search/engine";
import { BINARY_SEARCH_DEFAULT_PARAMS } from "@/algorithms/binary-search/spec";
import { createBubbleSortRun } from "@/algorithms/bubble-sort/engine";
import { BUBBLE_SORT_DEFAULT_PARAMS } from "@/algorithms/bubble-sort/spec";
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
  "binary-search": {
    slug: "binary-search",
    rendererFamily: "array",
    defaultParams: { ...BINARY_SEARCH_DEFAULT_PARAMS },
    createRun: createBinarySearchRun,
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

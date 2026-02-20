import { aStarExamples } from "@/algorithms/examples/a-star";
import { binarySearchExamples } from "@/algorithms/examples/binary-search";
import { bfsExamples } from "@/algorithms/examples/bfs";
import { bubbleSortExamples } from "@/algorithms/examples/bubble-sort";
import { dijkstraExamples } from "@/algorithms/examples/dijkstra";
import { dfsExamples } from "@/algorithms/examples/dfs";
import { insertionSortExamples } from "@/algorithms/examples/insertion-sort";
import { mergeSortExamples } from "@/algorithms/examples/merge-sort";
import { quickSortExamples } from "@/algorithms/examples/quick-sort";
import { selectionSortExamples } from "@/algorithms/examples/selection-sort";
import type { AlgorithmExamples } from "@/types/examples";

const EXAMPLES_REGISTRY: Record<string, AlgorithmExamples> = {
  "bubble-sort": bubbleSortExamples,
  "binary-search": binarySearchExamples,
  "a-star": aStarExamples,
  bfs: bfsExamples,
  dijkstra: dijkstraExamples,
  dfs: dfsExamples,
  "selection-sort": selectionSortExamples,
  "insertion-sort": insertionSortExamples,
  "merge-sort": mergeSortExamples,
  "quick-sort": quickSortExamples,
};

export function getAlgorithmExamplesBySlug(slug: string): AlgorithmExamples | null {
  return EXAMPLES_REGISTRY[slug] ?? null;
}

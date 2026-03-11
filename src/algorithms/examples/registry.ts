import { aStarExamples } from "@/algorithms/examples/a-star";
import { binarySearchExamples } from "@/algorithms/examples/binary-search";
import { bidirectionalBfsExamples } from "@/algorithms/examples/bidirectional-bfs";
import { bellmanFordExamples } from "@/algorithms/examples/bellman-ford";
import { bfsExamples } from "@/algorithms/examples/bfs";
import { bstOperationsExamples } from "@/algorithms/examples/bst-operations";
import { bubbleSortExamples } from "@/algorithms/examples/bubble-sort";
import { dijkstraExamples } from "@/algorithms/examples/dijkstra";
import { dfsExamples } from "@/algorithms/examples/dfs";
import { heapSortExamples } from "@/algorithms/examples/heap-sort";
import { invertBinaryTreeExamples } from "@/algorithms/examples/invert-binary-tree";
import { insertionSortExamples } from "@/algorithms/examples/insertion-sort";
import { kruskalMstExamples } from "@/algorithms/examples/kruskal-mst";
import { mergeSortExamples } from "@/algorithms/examples/merge-sort";
import { primMstExamples } from "@/algorithms/examples/prim-mst";
import { quickSortExamples } from "@/algorithms/examples/quick-sort";
import { selectionSortExamples } from "@/algorithms/examples/selection-sort";
import { topologicalSortExamples } from "@/algorithms/examples/topological-sort";
import { trieOperationsExamples } from "@/algorithms/examples/trie-operations";
import { unionFindExamples } from "@/algorithms/examples/union-find";
import type { AlgorithmExamples } from "@/types/examples";

const EXAMPLES_REGISTRY: Record<string, AlgorithmExamples> = {
  "bubble-sort": bubbleSortExamples,
  "binary-search": binarySearchExamples,
  "bidirectional-bfs": bidirectionalBfsExamples,
  "bellman-ford": bellmanFordExamples,
  "bst-operations": bstOperationsExamples,
  "a-star": aStarExamples,
  bfs: bfsExamples,
  dijkstra: dijkstraExamples,
  dfs: dfsExamples,
  "selection-sort": selectionSortExamples,
  "insertion-sort": insertionSortExamples,
  "merge-sort": mergeSortExamples,
  "quick-sort": quickSortExamples,
  "topological-sort": topologicalSortExamples,
  "heap-sort": heapSortExamples,
  "invert-binary-tree": invertBinaryTreeExamples,
  "union-find": unionFindExamples,
  "kruskal-mst": kruskalMstExamples,
  "prim-mst": primMstExamples,
  "trie-operations": trieOperationsExamples,
};

export function getAlgorithmExamplesBySlug(slug: string): AlgorithmExamples | null {
  return EXAMPLES_REGISTRY[slug] ?? null;
}

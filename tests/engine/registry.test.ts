import { describe, expect, it } from "vitest";

import { getAlgorithmRuntime, isAlgorithmImplemented } from "@/algorithms/registry";

describe("algorithm runtime registry", () => {
  it("returns runtime definition for implemented algorithms", () => {
    const bubbleSortRuntime = getAlgorithmRuntime("bubble-sort");
    const binarySearchRuntime = getAlgorithmRuntime("binary-search");
    const aStarRuntime = getAlgorithmRuntime("a-star");
    const bidirectionalBfsRuntime = getAlgorithmRuntime("bidirectional-bfs");
    const quickSortRuntime = getAlgorithmRuntime("quick-sort");
    const heapSortRuntime = getAlgorithmRuntime("heap-sort");
    const topologicalRuntime = getAlgorithmRuntime("topological-sort");
    const invertBinaryTreeRuntime = getAlgorithmRuntime("invert-binary-tree");
    const unionFindRuntime = getAlgorithmRuntime("union-find");
    const kruskalMstRuntime = getAlgorithmRuntime("kruskal-mst");
    const primMstRuntime = getAlgorithmRuntime("prim-mst");
    const bellmanFordRuntime = getAlgorithmRuntime("bellman-ford");
    const avlRotationsRuntime = getAlgorithmRuntime("avl-rotations");
    const bstOperationsRuntime = getAlgorithmRuntime("bst-operations");
    const trieOperationsRuntime = getAlgorithmRuntime("trie-operations");
    const countingSortRuntime = getAlgorithmRuntime("counting-sort");

    expect(bubbleSortRuntime).not.toBeNull();
    expect(bubbleSortRuntime?.slug).toBe("bubble-sort");
    expect(binarySearchRuntime).not.toBeNull();
    expect(binarySearchRuntime?.slug).toBe("binary-search");
    expect(aStarRuntime).not.toBeNull();
    expect(aStarRuntime?.slug).toBe("a-star");
    expect(bidirectionalBfsRuntime).not.toBeNull();
    expect(bidirectionalBfsRuntime?.slug).toBe("bidirectional-bfs");
    expect(quickSortRuntime).not.toBeNull();
    expect(quickSortRuntime?.slug).toBe("quick-sort");
    expect(heapSortRuntime).not.toBeNull();
    expect(heapSortRuntime?.slug).toBe("heap-sort");
    expect(topologicalRuntime).not.toBeNull();
    expect(topologicalRuntime?.slug).toBe("topological-sort");
    expect(invertBinaryTreeRuntime).not.toBeNull();
    expect(invertBinaryTreeRuntime?.slug).toBe("invert-binary-tree");
    expect(unionFindRuntime).not.toBeNull();
    expect(unionFindRuntime?.slug).toBe("union-find");
    expect(kruskalMstRuntime).not.toBeNull();
    expect(kruskalMstRuntime?.slug).toBe("kruskal-mst");
    expect(primMstRuntime).not.toBeNull();
    expect(primMstRuntime?.slug).toBe("prim-mst");
    expect(bellmanFordRuntime).not.toBeNull();
    expect(bellmanFordRuntime?.slug).toBe("bellman-ford");
    expect(avlRotationsRuntime).not.toBeNull();
    expect(avlRotationsRuntime?.slug).toBe("avl-rotations");
    expect(bstOperationsRuntime).not.toBeNull();
    expect(bstOperationsRuntime?.slug).toBe("bst-operations");
    expect(trieOperationsRuntime).not.toBeNull();
    expect(trieOperationsRuntime?.slug).toBe("trie-operations");
    expect(countingSortRuntime).not.toBeNull();
    expect(countingSortRuntime?.slug).toBe("counting-sort");
  });

  it("returns null for non-implemented algorithms", () => {
    expect(getAlgorithmRuntime("comparison-mode")).toBeNull();
    expect(isAlgorithmImplemented("comparison-mode")).toBe(false);
  });
});

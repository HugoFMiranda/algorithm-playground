import { describe, expect, it } from "vitest";

import { getAlgorithmRuntime, isAlgorithmImplemented } from "@/algorithms/registry";

describe("algorithm runtime registry", () => {
  it("returns runtime definition for implemented algorithms", () => {
    const bubbleSortRuntime = getAlgorithmRuntime("bubble-sort");
    const binarySearchRuntime = getAlgorithmRuntime("binary-search");
    const aStarRuntime = getAlgorithmRuntime("a-star");
    const quickSortRuntime = getAlgorithmRuntime("quick-sort");
    const heapSortRuntime = getAlgorithmRuntime("heap-sort");
    const topologicalRuntime = getAlgorithmRuntime("topological-sort");
    const invertBinaryTreeRuntime = getAlgorithmRuntime("invert-binary-tree");
    const unionFindRuntime = getAlgorithmRuntime("union-find");
    const kruskalMstRuntime = getAlgorithmRuntime("kruskal-mst");
    const primMstRuntime = getAlgorithmRuntime("prim-mst");
    const trieOperationsRuntime = getAlgorithmRuntime("trie-operations");

    expect(bubbleSortRuntime).not.toBeNull();
    expect(bubbleSortRuntime?.slug).toBe("bubble-sort");
    expect(binarySearchRuntime).not.toBeNull();
    expect(binarySearchRuntime?.slug).toBe("binary-search");
    expect(aStarRuntime).not.toBeNull();
    expect(aStarRuntime?.slug).toBe("a-star");
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
    expect(trieOperationsRuntime).not.toBeNull();
    expect(trieOperationsRuntime?.slug).toBe("trie-operations");
  });

  it("returns null for non-implemented algorithms", () => {
    expect(getAlgorithmRuntime("bidirectional-bfs")).toBeNull();
    expect(isAlgorithmImplemented("bidirectional-bfs")).toBe(false);
  });
});

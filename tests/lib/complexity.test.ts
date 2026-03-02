import { describe, expect, it } from "vitest";

import { getCompactCurrentComplexity, getComplexitySummary } from "@/lib/complexity";

describe("complexity summary", () => {
  it("returns binary search complexity with run-aware details", () => {
    const summary = getComplexitySummary("binary-search", {
      algorithmSlug: "binary-search",
      input: { values: [3, 7, 9, 14, 21, 34, 45, 60] },
      normalizedParams: { target: 34 },
      result: { found: true, index: 5, iterations: 3 },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeBest).toBe("O(1)");
    expect(summary?.timeWorst).toBe("O(log n)");
    expect(summary?.current).toContain("3 iterations");
    expect(summary?.details.some((detail) => detail.includes("n = 8"))).toBe(true);
  });

  it("returns bubble sort linear best case when early exit is enabled", () => {
    const summary = getComplexitySummary("bubble-sort", {
      algorithmSlug: "bubble-sort",
      input: { values: [1, 2, 3, 4, 5] },
      normalizedParams: { optimizeEarlyExit: true },
      result: { sortedValues: [1, 2, 3, 4, 5], comparisons: 4, swaps: 0, passes: 1 },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeBest).toBe("O(n)");
    expect(summary?.timeWorst).toBe("O(n^2)");
    expect(summary?.current).toContain("O(n)");
  });

  it("returns bubble sort quadratic best case when early exit is disabled", () => {
    const summary = getComplexitySummary("bubble-sort", {
      algorithmSlug: "bubble-sort",
      input: { values: [1, 2, 3, 4, 5] },
      normalizedParams: { optimizeEarlyExit: false },
      result: { sortedValues: [1, 2, 3, 4, 5], comparisons: 10, swaps: 0, passes: 4 },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeBest).toBe("O(n^2)");
    expect(summary?.current).toContain("O(n^2)");
  });

  it("returns dijkstra complexity with run-aware details", () => {
    const summary = getComplexitySummary("dijkstra", {
      algorithmSlug: "dijkstra",
      input: {
        rows: 6,
        cols: 8,
        blockedCells: [10, 11, 19, 27],
        allowDiagonal: false,
      },
      normalizedParams: {},
      result: { found: true, distance: 34, visitedCount: 19, relaxations: 24 },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeWorst).toBe("O(V^2 + E)");
    expect(summary?.current).toContain("O(V^2 + E)");
  });

  it("returns a-star complexity with run-aware details", () => {
    const summary = getComplexitySummary("a-star", {
      algorithmSlug: "a-star",
      input: {
        rows: 6,
        cols: 8,
        blockedCells: [10, 11, 19, 27],
        allowDiagonal: false,
      },
      normalizedParams: {},
      result: { found: true, distance: 29, expandedCount: 15, relaxations: 20 },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeWorst).toBe("O(V^2 + E)");
    expect(summary?.current).toContain("O(V^2 + E)");
  });

  it("returns quick-sort complexity with run-aware details", () => {
    const summary = getComplexitySummary("quick-sort", {
      algorithmSlug: "quick-sort",
      input: { values: [9, 4, 7, 3, 8, 2] },
      normalizedParams: { pivotStrategy: "middle" },
      result: { sortedValues: [2, 3, 4, 7, 8, 9], comparisons: 11, swaps: 7, partitions: 4, maxDepth: 3 },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeAverage).toBe("O(n log n)");
    expect(summary?.timeWorst).toBe("O(n^2)");
  });

  it("returns heap-sort complexity with run-aware details", () => {
    const summary = getComplexitySummary("heap-sort", {
      algorithmSlug: "heap-sort",
      input: { values: [9, 4, 7, 3, 8, 2] },
      normalizedParams: {},
      result: {
        sortedValues: [2, 3, 4, 7, 8, 9],
        comparisons: 14,
        swaps: 9,
        heapifyCalls: 7,
        extractions: 5,
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeAverage).toBe("O(n log n)");
    expect(summary?.timeWorst).toBe("O(n log n)");
  });

  it("returns topological-sort complexity with run-aware details", () => {
    const summary = getComplexitySummary("topological-sort", {
      algorithmSlug: "topological-sort",
      input: {
        nodeCount: 6,
        edges: [
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 3],
          [3, 4],
          [4, 5],
        ],
      },
      normalizedParams: { preferLowerIndex: true },
      result: {
        order: [0, 1, 2, 3, 4, 5],
        cycleDetected: false,
        processedCount: 6,
        remainingCount: 0,
        edgeRelaxations: 6,
        initialZeroCount: 1,
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeAverage).toBe("O(V + E)");
    expect(summary?.timeWorst).toBe("O(V + E)");
  });

  it("returns invert-binary-tree complexity with run-aware details", () => {
    const summary = getComplexitySummary("invert-binary-tree", {
      algorithmSlug: "invert-binary-tree",
      input: {
        rootId: 0,
        nodes: [
          { id: 0, value: 4, left: 1, right: 2 },
          { id: 1, value: 2, left: 3, right: 4 },
          { id: 2, value: 7, left: 5, right: 6 },
          { id: 3, value: 1, left: null, right: null },
          { id: 4, value: 3, left: null, right: null },
          { id: 5, value: 6, left: null, right: null },
          { id: 6, value: 9, left: null, right: null },
        ],
      },
      normalizedParams: { traversalMode: "dfs" },
      result: {
        invertedLevelOrder: [4, 7, 2, 9, 6, 3, 1],
        visitedCount: 7,
        swaps: 7,
        traversalOrder: [0, 2, 6, 5, 1, 4, 3],
        rootValue: 4,
        isEmpty: false,
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeAverage).toBe("O(n)");
    expect(summary?.timeWorst).toBe("O(n)");
  });

  it("returns union-find complexity with run-aware details", () => {
    const summary = getComplexitySummary("union-find", {
      algorithmSlug: "union-find",
      input: {
        nodeCount: 8,
        operations: [
          { type: "union", left: 0, right: 1 },
          { type: "union", left: 1, right: 2 },
          { type: "connected", left: 0, right: 2 },
          { type: "find", left: 2, right: null },
        ],
      },
      normalizedParams: { pathCompression: true, unionByRank: true },
      result: {
        parents: [0, 0, 0, 3, 4, 5, 6, 7],
        ranks: [1, 0, 0, 0, 0, 0, 0, 0],
        componentCount: 6,
        operationsProcessed: 4,
        successfulUnions: 2,
        findQueries: 1,
        connectedQueries: 1,
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeAverage).toBe("O(alpha)");
    expect(summary?.space).toBe("O(n)");
  });

  it("returns kruskal-mst complexity with run-aware details", () => {
    const summary = getComplexitySummary("kruskal-mst", {
      algorithmSlug: "kruskal-mst",
      input: {
        nodeCount: 5,
        edges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: 2 },
          { from: 2, to: 3, weight: 3 },
          { from: 3, to: 4, weight: 4 },
          { from: 0, to: 4, weight: 8 },
        ],
      },
      normalizedParams: { preferLowerIndex: true, pathCompression: true, unionByRank: true },
      result: {
        mstEdges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: 2 },
          { from: 2, to: 3, weight: 3 },
          { from: 3, to: 4, weight: 4 },
        ],
        totalWeight: 10,
        edgesConsidered: 4,
        edgesAccepted: 4,
        cycleSkips: 0,
        components: 1,
        connected: true,
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeAverage).toBe("O(E log E)");
    expect(summary?.timeWorst).toBe("O(E log E)");
  });

  it("returns prim-mst complexity with run-aware details", () => {
    const summary = getComplexitySummary("prim-mst", {
      algorithmSlug: "prim-mst",
      input: {
        nodeCount: 5,
        startNode: 0,
        edges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: 2 },
          { from: 2, to: 3, weight: 3 },
          { from: 3, to: 4, weight: 4 },
          { from: 0, to: 4, weight: 8 },
        ],
      },
      normalizedParams: { preferLowerIndex: true },
      result: {
        selectedEdges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: 2 },
          { from: 2, to: 3, weight: 3 },
          { from: 3, to: 4, weight: 4 },
        ],
        totalWeight: 10,
        visitedCount: 5,
        components: 1,
        connected: true,
        frontierCandidates: 14,
        edgeLocks: 4,
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.timeAverage).toBe("O(V * E)");
    expect(summary?.timeWorst).toBe("O(V * E)");
  });

  it("returns null for non-implemented algorithms", () => {
    expect(getComplexitySummary("bellman-ford", null)).toBeNull();
  });

  it("returns compact complexity for implemented algorithms", () => {
    const binary = getCompactCurrentComplexity("binary-search", {
      algorithmSlug: "binary-search",
      input: { values: [10, 20, 30, 40] },
      normalizedParams: { target: 30 },
      result: { found: true, index: 2, iterations: 2 },
    });
    const bubble = getCompactCurrentComplexity("bubble-sort", {
      algorithmSlug: "bubble-sort",
      input: { values: [1, 2, 3, 4] },
      normalizedParams: { optimizeEarlyExit: true },
      result: { sortedValues: [1, 2, 3, 4], comparisons: 3, swaps: 0, passes: 1 },
    });
    const quick = getCompactCurrentComplexity("quick-sort", {
      algorithmSlug: "quick-sort",
      input: { values: [9, 4, 7, 3, 8, 2] },
      normalizedParams: { pivotStrategy: "middle" },
      result: { sortedValues: [2, 3, 4, 7, 8, 9], comparisons: 11, swaps: 7, partitions: 4, maxDepth: 3 },
    });
    const heap = getCompactCurrentComplexity("heap-sort", {
      algorithmSlug: "heap-sort",
      input: { values: [9, 4, 7, 3, 8, 2] },
      normalizedParams: {},
      result: {
        sortedValues: [2, 3, 4, 7, 8, 9],
        comparisons: 14,
        swaps: 9,
        heapifyCalls: 7,
        extractions: 5,
      },
    });
    const topological = getCompactCurrentComplexity("topological-sort", {
      algorithmSlug: "topological-sort",
      input: {
        nodeCount: 6,
        edges: [
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 3],
          [3, 4],
          [4, 5],
        ],
      },
      normalizedParams: { preferLowerIndex: true },
      result: {
        order: [0, 1, 2, 3, 4, 5],
        cycleDetected: false,
        processedCount: 6,
        remainingCount: 0,
        edgeRelaxations: 6,
        initialZeroCount: 1,
      },
    });
    const invertTree = getCompactCurrentComplexity("invert-binary-tree", {
      algorithmSlug: "invert-binary-tree",
      input: {
        rootId: 0,
        nodes: [
          { id: 0, value: 4, left: 1, right: 2 },
          { id: 1, value: 2, left: 3, right: 4 },
          { id: 2, value: 7, left: 5, right: 6 },
          { id: 3, value: 1, left: null, right: null },
          { id: 4, value: 3, left: null, right: null },
          { id: 5, value: 6, left: null, right: null },
          { id: 6, value: 9, left: null, right: null },
        ],
      },
      normalizedParams: { traversalMode: "bfs" },
      result: {
        invertedLevelOrder: [4, 7, 2, 9, 6, 3, 1],
        visitedCount: 7,
        swaps: 7,
        traversalOrder: [0, 2, 1, 6, 5, 4, 3],
        rootValue: 4,
        isEmpty: false,
      },
    });
    const unionFind = getCompactCurrentComplexity("union-find", {
      algorithmSlug: "union-find",
      input: {
        nodeCount: 8,
        operations: [
          { type: "union", left: 0, right: 1 },
          { type: "union", left: 1, right: 2 },
          { type: "find", left: 2, right: null },
        ],
      },
      normalizedParams: { pathCompression: true, unionByRank: true },
      result: {
        parents: [0, 0, 0, 3, 4, 5, 6, 7],
        ranks: [1, 0, 0, 0, 0, 0, 0, 0],
        componentCount: 6,
        operationsProcessed: 3,
        successfulUnions: 2,
        findQueries: 1,
        connectedQueries: 0,
      },
    });

    expect(binary).toBe("O(log n)");
    expect(bubble).toBe("O(n)");
    expect(quick).toBe("O(n log n)");
    expect(heap).toBe("O(n log n)");
    expect(topological).toBe("O(V + E)");
    expect(invertTree).toBe("O(n)");
    expect(unionFind).toBe("O(alpha)");
  });

  it("returns compact complexity for kruskal-mst", () => {
    const compact = getCompactCurrentComplexity("kruskal-mst", {
      algorithmSlug: "kruskal-mst",
      input: {
        nodeCount: 5,
        edges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: 2 },
          { from: 2, to: 3, weight: 3 },
          { from: 3, to: 4, weight: 4 },
        ],
      },
      normalizedParams: { preferLowerIndex: true, pathCompression: true, unionByRank: true },
      result: {
        mstEdges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: 2 },
          { from: 2, to: 3, weight: 3 },
          { from: 3, to: 4, weight: 4 },
        ],
        totalWeight: 10,
        edgesConsidered: 4,
        edgesAccepted: 4,
        cycleSkips: 0,
        components: 1,
        connected: true,
      },
    });

    expect(compact).toBe("O(E log E)");
  });

  it("returns compact complexity for prim-mst", () => {
    const compact = getCompactCurrentComplexity("prim-mst", {
      algorithmSlug: "prim-mst",
      input: {
        nodeCount: 5,
        startNode: 0,
        edges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: 2 },
          { from: 2, to: 3, weight: 3 },
          { from: 3, to: 4, weight: 4 },
        ],
      },
      normalizedParams: { preferLowerIndex: true },
      result: {
        selectedEdges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: 2 },
          { from: 2, to: 3, weight: 3 },
          { from: 3, to: 4, weight: 4 },
        ],
        totalWeight: 10,
        visitedCount: 5,
        components: 1,
        connected: true,
        frontierCandidates: 12,
        edgeLocks: 4,
      },
    });

    expect(compact).toBe("O(V * E)");
  });

  it("returns compact complexity for dijkstra", () => {
    const compact = getCompactCurrentComplexity("dijkstra", {
      algorithmSlug: "dijkstra",
      input: {
        rows: 6,
        cols: 8,
        blockedCells: [10, 11, 19, 27],
        allowDiagonal: false,
      },
      normalizedParams: {},
      result: { found: true, distance: 22, visitedCount: 12, relaxations: 16 },
    });

    expect(compact).toBe("O(V^2 + E)");
  });

  it("returns compact complexity for a-star", () => {
    const compact = getCompactCurrentComplexity("a-star", {
      algorithmSlug: "a-star",
      input: {
        rows: 6,
        cols: 8,
        blockedCells: [10, 11, 19, 27],
        allowDiagonal: true,
      },
      normalizedParams: {},
      result: { found: true, distance: 19, expandedCount: 11, relaxations: 14 },
    });

    expect(compact).toBe("O(V^2 + E)");
  });

  it("returns null compact complexity for non-implemented algorithms", () => {
    expect(getCompactCurrentComplexity("bellman-ford", null)).toBeNull();
  });
});

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

  it("returns null for non-implemented algorithms", () => {
    expect(getComplexitySummary("topological-sort", null)).toBeNull();
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

    expect(binary).toBe("O(log n)");
    expect(bubble).toBe("O(n)");
    expect(quick).toBe("O(n log n)");
    expect(heap).toBe("O(n log n)");
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
    expect(getCompactCurrentComplexity("topological-sort", null)).toBeNull();
  });
});

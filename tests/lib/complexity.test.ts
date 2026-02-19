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

  it("returns null for non-implemented algorithms", () => {
    expect(getComplexitySummary("dijkstra", null)).toBeNull();
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

    expect(binary).toBe("O(log n)");
    expect(bubble).toBe("O(n)");
  });

  it("returns null compact complexity for non-implemented algorithms", () => {
    expect(getCompactCurrentComplexity("dijkstra", null)).toBeNull();
  });
});

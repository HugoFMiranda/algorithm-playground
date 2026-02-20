import { describe, expect, it } from "vitest";

import { getAlgorithmRuntime, isAlgorithmImplemented } from "@/algorithms/registry";

describe("algorithm runtime registry", () => {
  it("returns runtime definition for implemented algorithms", () => {
    const bubbleSortRuntime = getAlgorithmRuntime("bubble-sort");
    const binarySearchRuntime = getAlgorithmRuntime("binary-search");
    const aStarRuntime = getAlgorithmRuntime("a-star");
    const quickSortRuntime = getAlgorithmRuntime("quick-sort");
    const heapSortRuntime = getAlgorithmRuntime("heap-sort");

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
  });

  it("returns null for non-implemented algorithms", () => {
    expect(getAlgorithmRuntime("topological-sort")).toBeNull();
    expect(isAlgorithmImplemented("topological-sort")).toBe(false);
  });
});

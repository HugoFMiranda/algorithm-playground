import { describe, expect, it } from "vitest";

import { getAlgorithmRuntime, isAlgorithmImplemented } from "@/algorithms/registry";

describe("algorithm runtime registry", () => {
  it("returns runtime definition for implemented algorithms", () => {
    const bubbleSortRuntime = getAlgorithmRuntime("bubble-sort");
    const binarySearchRuntime = getAlgorithmRuntime("binary-search");

    expect(bubbleSortRuntime).not.toBeNull();
    expect(bubbleSortRuntime?.slug).toBe("bubble-sort");
    expect(binarySearchRuntime).not.toBeNull();
    expect(binarySearchRuntime?.slug).toBe("binary-search");
  });

  it("returns null for non-implemented algorithms", () => {
    expect(getAlgorithmRuntime("dijkstra")).toBeNull();
    expect(isAlgorithmImplemented("dijkstra")).toBe(false);
  });
});

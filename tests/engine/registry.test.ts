import { describe, expect, it } from "vitest";

import { getAlgorithmRuntime, isAlgorithmImplemented } from "@/algorithms/registry";

describe("algorithm runtime registry", () => {
  it("returns runtime definition for implemented algorithms", () => {
    const runtime = getAlgorithmRuntime("binary-search");

    expect(runtime).not.toBeNull();
    expect(runtime?.slug).toBe("binary-search");
  });

  it("returns null for non-implemented algorithms", () => {
    expect(getAlgorithmRuntime("dijkstra")).toBeNull();
    expect(isAlgorithmImplemented("dijkstra")).toBe(false);
  });
});

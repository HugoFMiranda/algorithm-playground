import { describe, expect, it } from "vitest";

import { binarySearchEngine, createBinarySearchRun } from "@/algorithms/binary-search/engine";
import { BINARY_SEARCH_DEFAULT_VALUES } from "@/algorithms/binary-search/spec";

describe("binary search engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      arrayValues: "63, 3, 41, 20, 9, 12, 52, 75, 33",
      target: 20,
    };

    const firstRun = createBinarySearchRun(rawParams);
    const secondRun = createBinarySearchRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createBinarySearchRun({
      arrayValues: "invalid, values",
      target: "not-a-number",
    });

    expect(run.normalizedParams.target).toBe(72);
    expect(run.input.values).toEqual([...BINARY_SEARCH_DEFAULT_VALUES]);
  });

  it("handles single-value hit and miss cases", () => {
    const hit = binarySearchEngine.generate({ values: [7] }, { arrayValues: "7", target: 7 });
    const miss = binarySearchEngine.generate({ values: [7] }, { arrayValues: "7", target: 8 });

    expect(hit.result).toEqual({
      found: true,
      index: 0,
      iterations: 1,
    });
    expect(hit.steps.at(-1)?.type).toBe("found");

    expect(miss.result).toEqual({
      found: false,
      index: -1,
      iterations: 1,
    });
    expect(miss.steps.at(-1)?.type).toBe("not-found");
  });

  it("keeps deterministic behavior with duplicate values", () => {
    const run = binarySearchEngine.generate(
      { values: [1, 2, 2, 2, 3, 4] },
      { arrayValues: "1, 2, 2, 2, 3, 4", target: 2 },
    );

    expect(run.result.found).toBe(true);
    expect(run.result.index).toBe(2);
  });
});

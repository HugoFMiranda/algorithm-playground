import { describe, expect, it } from "vitest";

import { createHeapSortRun, heapSortEngine } from "@/algorithms/heap-sort/engine";
import { HEAP_SORT_DEFAULT_VALUES } from "@/algorithms/heap-sort/spec";

describe("heap sort engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      arrayValues: "9, 4, 1, 7, 3, 2",
    };

    const firstRun = createHeapSortRun(rawParams);
    const secondRun = createHeapSortRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createHeapSortRun({
      arrayValues: "invalid, values",
    });

    expect(run.input.values).toEqual([...HEAP_SORT_DEFAULT_VALUES]);
  });

  it("sorts values and emits completion metadata", () => {
    const run = createHeapSortRun({
      arrayValues: "5, 1, 4, 2, 8",
    });

    expect(run.result.sortedValues).toEqual([1, 2, 4, 5, 8]);
    expect(run.result.comparisons).toBeGreaterThan(0);
    expect(run.result.swaps).toBeGreaterThan(0);
    expect(run.result.heapifyCalls).toBeGreaterThan(0);
    expect(run.steps.at(-1)?.type).toBe("complete");
  });

  it("keeps deterministic order for duplicate values", () => {
    const run = heapSortEngine.generate(
      { values: [3, 3, 2, 2, 1, 1] },
      { arrayValues: "3, 3, 2, 2, 1, 1" },
    );

    expect(run.result.sortedValues).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

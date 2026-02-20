import { describe, expect, it } from "vitest";

import { createQuickSortRun, quickSortEngine } from "@/algorithms/quick-sort/engine";
import { QUICK_SORT_DEFAULT_VALUES } from "@/algorithms/quick-sort/spec";

describe("quick sort engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      arrayValues: "9, 4, 1, 7, 3, 2",
      pivotStrategy: "middle",
    };

    const firstRun = createQuickSortRun(rawParams);
    const secondRun = createQuickSortRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createQuickSortRun({
      arrayValues: "invalid, values",
      pivotStrategy: "invalid",
    });

    expect(run.normalizedParams.pivotStrategy).toBe("last");
    expect(run.input.values).toEqual([...QUICK_SORT_DEFAULT_VALUES]);
  });

  it("sorts values and emits completion metadata", () => {
    const run = createQuickSortRun({
      arrayValues: "5, 1, 4, 2, 8",
      pivotStrategy: "last",
    });

    expect(run.result.sortedValues).toEqual([1, 2, 4, 5, 8]);
    expect(run.result.comparisons).toBeGreaterThan(0);
    expect(run.result.partitions).toBeGreaterThan(0);
    expect(run.steps.at(-1)?.type).toBe("complete");
  });

  it("keeps deterministic order for duplicate values", () => {
    const run = quickSortEngine.generate(
      { values: [3, 3, 2, 2, 1, 1] },
      { arrayValues: "3, 3, 2, 2, 1, 1", pivotStrategy: "middle" },
    );

    expect(run.result.sortedValues).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

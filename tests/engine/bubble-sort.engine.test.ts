import { describe, expect, it } from "vitest";

import { bubbleSortEngine, createBubbleSortRun } from "@/algorithms/bubble-sort/engine";
import { BUBBLE_SORT_DEFAULT_VALUES } from "@/algorithms/bubble-sort/spec";

describe("bubble sort engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      arrayValues: "9, 4, 1, 7, 3, 2",
      optimizeEarlyExit: true,
    };

    const firstRun = createBubbleSortRun(rawParams);
    const secondRun = createBubbleSortRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createBubbleSortRun({
      arrayValues: "invalid, values",
      optimizeEarlyExit: "invalid",
    });

    expect(run.normalizedParams.optimizeEarlyExit).toBe(true);
    expect(run.input.values).toEqual([...BUBBLE_SORT_DEFAULT_VALUES]);
  });

  it("sorts values and emits completion metadata", () => {
    const run = createBubbleSortRun({
      arrayValues: "5, 1, 4, 2, 8",
      optimizeEarlyExit: true,
    });

    expect(run.result.sortedValues).toEqual([1, 2, 4, 5, 8]);
    expect(run.result.comparisons).toBeGreaterThan(0);
    expect(run.result.swaps).toBeGreaterThan(0);
    expect(run.steps.at(-1)?.type).toBe("complete");
  });

  it("honors optimizeEarlyExit for sorted inputs", () => {
    const optimized = bubbleSortEngine.generate(
      { values: [1, 2, 3, 4, 5] },
      { arrayValues: "1, 2, 3, 4, 5", optimizeEarlyExit: true },
    );
    const unoptimized = bubbleSortEngine.generate(
      { values: [1, 2, 3, 4, 5] },
      { arrayValues: "1, 2, 3, 4, 5", optimizeEarlyExit: false },
    );

    expect(optimized.result.passes).toBe(1);
    expect(unoptimized.result.passes).toBe(4);
    expect(optimized.result.sortedValues).toEqual([1, 2, 3, 4, 5]);
    expect(unoptimized.result.sortedValues).toEqual([1, 2, 3, 4, 5]);
  });
});

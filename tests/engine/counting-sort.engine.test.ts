import { describe, expect, it } from "vitest";

import { countingSortEngine, createCountingSortRun } from "@/algorithms/counting-sort/engine";
import { COUNTING_SORT_DEFAULT_VALUES } from "@/algorithms/counting-sort/spec";

describe("counting sort engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      arrayValues: "4, 2, 2, 8, 3, 3, 1, 5, 4, -1",
    };

    const firstRun = createCountingSortRun(rawParams);
    const secondRun = createCountingSortRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createCountingSortRun({
      arrayValues: "letters only",
    });

    expect(run.normalizedParams.arrayValues).toBe("letters only");
    expect(run.input.values).toEqual([...COUNTING_SORT_DEFAULT_VALUES]);
  });

  it("supports negative values through offset buckets", () => {
    const run = createCountingSortRun({
      arrayValues: "3, -2, 0, -2, 5, 1",
    });

    expect(run.result.sortedValues).toEqual([-2, -2, 0, 1, 3, 5]);
    expect(run.result.minValue).toBe(-2);
    expect(run.result.maxValue).toBe(5);
    expect(run.result.rangeSize).toBe(8);
  });

  it("keeps stable placement order for equal values", () => {
    const generated = countingSortEngine.generate(
      {
        values: [2, 1, 2, 1],
        minValue: 1,
        maxValue: 2,
        rangeSize: 2,
      },
      {
        arrayValues: "2, 1, 2, 1",
      },
    );

    expect(generated.result.sortedValues).toEqual([1, 1, 2, 2]);
    expect(generated.steps.filter((step) => step.type === "place")).toHaveLength(4);
    expect(generated.steps.some((step) => step.type === "write-back")).toBe(true);
  });
});

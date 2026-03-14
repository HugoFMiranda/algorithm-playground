import { describe, expect, it } from "vitest";

import {
  createComparisonSnapshot,
  getComparableAlgorithms,
  getComparisonSharedInputProfile,
  getDefaultComparisonPair,
  getDefaultSharedInputParams,
  getImplementedComparisonAlgorithms,
} from "@/lib/compare";

describe("compare utilities", () => {
  it("returns implemented algorithms with renderer families", () => {
    const algorithms = getImplementedComparisonAlgorithms();

    expect(algorithms.length).toBeGreaterThan(0);
    expect(algorithms.some((algorithm) => algorithm.slug === "bubble-sort")).toBe(true);
    expect(algorithms.every((algorithm) => algorithm.rendererFamily)).toBe(true);
  });

  it("returns a default pair from the same renderer family", () => {
    const [left, right] = getDefaultComparisonPair();
    const comparable = getComparableAlgorithms(left);

    expect(left).not.toBe(right);
    expect(comparable.some((algorithm) => algorithm.slug === right)).toBe(true);
  });

  it("filters comparison candidates to the anchor renderer family", () => {
    const comparable = getComparableAlgorithms("bubble-sort");

    expect(comparable.some((algorithm) => algorithm.slug === "selection-sort")).toBe(true);
    expect(comparable.some((algorithm) => algorithm.slug === "counting-sort")).toBe(true);
    expect(comparable.some((algorithm) => algorithm.slug === "bfs")).toBe(false);
    expect(new Set(comparable.map((algorithm) => algorithm.rendererFamily)).size).toBe(1);
  });

  it("detects safe shared-input profiles for compatible pairs", () => {
    expect(getComparisonSharedInputProfile("bubble-sort", "quick-sort")).toBe("array-values");
    expect(getComparisonSharedInputProfile("counting-sort", "merge-sort")).toBe("array-values");
    expect(getComparisonSharedInputProfile("bfs", "a-star")).toBe("path-grid");
    expect(getComparisonSharedInputProfile("bubble-sort", "topological-sort")).toBeNull();
  });

  it("returns default shared params from the anchor runtime", () => {
    expect(getDefaultSharedInputParams("array-values", "bubble-sort")).toMatchObject({
      arrayValues: "37, 12, 29, 8, 44, 19, 3, 25",
    });

    expect(getDefaultSharedInputParams("path-grid", "bfs")).toMatchObject({
      rows: 6,
      cols: 8,
      startCell: 0,
      targetCell: 47,
      blockedCells: "10, 11, 12, 20, 28, 36, 37",
      allowDiagonal: false,
    });
  });

  it("builds deterministic default-run snapshots from the runtime registry", () => {
    const snapshot = createComparisonSnapshot("bubble-sort");

    expect(snapshot).not.toBeNull();
    expect(snapshot?.algorithm.slug).toBe("bubble-sort");
    expect(snapshot?.stepCount).toBeGreaterThan(0);
    expect(snapshot?.steps).toHaveLength(snapshot?.stepCount ?? 0);
    expect(snapshot?.compactComplexity).toBe("O(n^2)");
    expect(snapshot?.complexitySummary?.timeAverage).toBe("O(n^2)");
    expect(snapshot?.metrics.some((metric) => metric.key === "steps")).toBe(true);
    expect(snapshot?.metrics.some((metric) => metric.key === "comparisons")).toBe(true);
  });

  it("includes family-relevant input metrics in snapshots", () => {
    const snapshot = createComparisonSnapshot("bfs");

    expect(snapshot).not.toBeNull();
    expect(snapshot?.metrics.some((metric) => metric.key === "grid-cells")).toBe(true);
    expect(snapshot?.metrics.some((metric) => metric.key === "visitedCount")).toBe(true);
  });

  it("includes counting-sort range metrics in snapshots", () => {
    const snapshot = createComparisonSnapshot("counting-sort", {
      arrayValues: "3, -1, 3, 2, 0",
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.metrics.some((metric) => metric.key === "rangeSize")).toBe(true);
    expect(snapshot?.metrics.some((metric) => metric.key === "countsLength")).toBe(true);
  });

  it("applies shared input overrides when creating comparison snapshots", () => {
    const arraySnapshot = createComparisonSnapshot("bubble-sort", {
      arrayValues: "9, 1, 7, 3",
    });
    const gridSnapshot = createComparisonSnapshot("bfs", {
      rows: 3,
      cols: 4,
      startCell: 1,
      targetCell: 10,
      blockedCells: "5, 6",
      allowDiagonal: true,
    });

    expect(arraySnapshot?.input).toMatchObject({
      values: [9, 1, 7, 3],
    });
    expect(arraySnapshot?.metrics.find((metric) => metric.key === "input-size")?.value).toBe(4);

    expect(gridSnapshot?.input).toMatchObject({
      rows: 3,
      cols: 4,
      startCell: 1,
      targetCell: 10,
      allowDiagonal: true,
      blockedCells: [5, 6],
    });
    expect(gridSnapshot?.metrics.find((metric) => metric.key === "grid-cells")?.value).toBe(12);
  });
});

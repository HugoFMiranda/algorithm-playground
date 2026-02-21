import { describe, expect, it } from "vitest";

import { createDijkstraRun } from "@/algorithms/dijkstra/engine";
import { DIJKSTRA_DEFAULT_PARAMS } from "@/algorithms/dijkstra/spec";

describe("dijkstra engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      rows: 6,
      cols: 8,
      startCell: 0,
      targetCell: 47,
      blockedCells: "10, 11, 19, 27",
      heavyCells: "14, 15, 22",
      allowDiagonal: false,
      weightSeed: 8,
      weightOverrides: "13:2, 14:11, 30:4",
    };

    const firstRun = createDijkstraRun(rawParams);
    const secondRun = createDijkstraRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("applies weight overrides while ignoring blocked/start/target overrides", () => {
    const baseRun = createDijkstraRun({
      rows: 4,
      cols: 4,
      startCell: 0,
      targetCell: 15,
      blockedCells: "5",
      heavyCells: "6",
      allowDiagonal: false,
      weightSeed: 3,
      weightOverrides: "",
    });
    const overrideRun = createDijkstraRun({
      rows: 4,
      cols: 4,
      startCell: 0,
      targetCell: 15,
      blockedCells: "5",
      heavyCells: "6",
      allowDiagonal: false,
      weightSeed: 3,
      weightOverrides: "0:15, 5:1, 6:2, 9:14, 15:7, 99:3",
    });

    expect(overrideRun.input.weights[6]).toBe(2);
    expect(overrideRun.input.weights[9]).toBe(14);
    expect(overrideRun.input.weights[0]).toBe(baseRun.input.weights[0]);
    expect(overrideRun.input.weights[15]).toBe(baseRun.input.weights[15]);
    expect(overrideRun.input.weights[5]).toBe(baseRun.input.weights[5]);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createDijkstraRun({
      rows: "bad",
      cols: "bad",
      startCell: "bad",
      targetCell: "bad",
      blockedCells: "",
      heavyCells: "",
      allowDiagonal: "bad",
      weightSeed: "bad",
      weightOverrides: "bad",
    });

    expect(run.normalizedParams.rows).toBe(DIJKSTRA_DEFAULT_PARAMS.rows);
    expect(run.normalizedParams.cols).toBe(DIJKSTRA_DEFAULT_PARAMS.cols);
    expect(run.normalizedParams.allowDiagonal).toBe(DIJKSTRA_DEFAULT_PARAMS.allowDiagonal);
    expect(run.normalizedParams.weightSeed).toBe(DIJKSTRA_DEFAULT_PARAMS.weightSeed);
    expect(run.input.weights.length).toBe(DIJKSTRA_DEFAULT_PARAMS.rows * DIJKSTRA_DEFAULT_PARAMS.cols);
  });
});

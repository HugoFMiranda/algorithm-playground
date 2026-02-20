import { describe, expect, it } from "vitest";

import { createAStarRun } from "@/algorithms/a-star/engine";
import { A_STAR_DEFAULT_PARAMS } from "@/algorithms/a-star/spec";

describe("a-star engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      rows: 6,
      cols: 8,
      startCell: 0,
      targetCell: 47,
      blockedCells: "9, 10, 11, 19, 27",
      heavyCells: "14, 15, 22, 23",
      allowDiagonal: false,
      weightSeed: 7,
      weightOverrides: "12:2, 22:12, 37:3",
      heuristicWeight: 1,
    };

    const firstRun = createAStarRun(rawParams);
    const secondRun = createAStarRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("applies weight overrides while ignoring blocked/start/target overrides", () => {
    const baseRun = createAStarRun({
      rows: 4,
      cols: 4,
      startCell: 0,
      targetCell: 15,
      blockedCells: "5",
      heavyCells: "6",
      allowDiagonal: false,
      weightSeed: 3,
      weightOverrides: "",
      heuristicWeight: 1,
    });
    const overrideRun = createAStarRun({
      rows: 4,
      cols: 4,
      startCell: 0,
      targetCell: 15,
      blockedCells: "5",
      heavyCells: "6",
      allowDiagonal: false,
      weightSeed: 3,
      weightOverrides: "0:15, 5:1, 6:2, 9:14, 15:7, 99:3",
      heuristicWeight: 1,
    });

    expect(overrideRun.input.weights[6]).toBe(2);
    expect(overrideRun.input.weights[9]).toBe(14);
    expect(overrideRun.input.weights[0]).toBe(baseRun.input.weights[0]);
    expect(overrideRun.input.weights[15]).toBe(baseRun.input.weights[15]);
    expect(overrideRun.input.weights[5]).toBe(baseRun.input.weights[5]);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createAStarRun({
      rows: "bad",
      cols: "bad",
      startCell: "bad",
      targetCell: "bad",
      blockedCells: "",
      heavyCells: "",
      allowDiagonal: "bad",
      weightSeed: "bad",
      weightOverrides: "bad",
      heuristicWeight: "bad",
    });

    expect(run.normalizedParams.rows).toBe(A_STAR_DEFAULT_PARAMS.rows);
    expect(run.normalizedParams.cols).toBe(A_STAR_DEFAULT_PARAMS.cols);
    expect(run.normalizedParams.allowDiagonal).toBe(A_STAR_DEFAULT_PARAMS.allowDiagonal);
    expect(run.normalizedParams.weightSeed).toBe(A_STAR_DEFAULT_PARAMS.weightSeed);
    expect(run.normalizedParams.heuristicWeight).toBe(A_STAR_DEFAULT_PARAMS.heuristicWeight);
    expect(run.input.weights.length).toBe(A_STAR_DEFAULT_PARAMS.rows * A_STAR_DEFAULT_PARAMS.cols);
  });
});

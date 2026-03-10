import { describe, expect, it } from "vitest";

import { createBidirectionalBfsRun } from "@/algorithms/bidirectional-bfs/engine";
import { BIDIRECTIONAL_BFS_DEFAULT_PARAMS } from "@/algorithms/bidirectional-bfs/spec";

describe("bidirectional-bfs engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      rows: 6,
      cols: 8,
      startCell: 0,
      targetCell: 47,
      blockedCells: "10, 11, 18, 19, 20, 28, 35, 36",
      allowDiagonal: false,
      expandSmallerFrontier: true,
      preferForwardOnTie: true,
    };

    const firstRun = createBidirectionalBfsRun(rawParams);
    const secondRun = createBidirectionalBfsRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("finds a shortest path when frontiers meet", () => {
    const run = createBidirectionalBfsRun({
      rows: 3,
      cols: 3,
      startCell: 0,
      targetCell: 8,
      blockedCells: "",
      allowDiagonal: false,
      expandSmallerFrontier: true,
      preferForwardOnTie: true,
    });

    expect(run.result.found).toBe(true);
    expect(run.result.distance).toBe(4);
    expect(run.result.pathCells[0]).toBe(0);
    expect(run.result.pathCells.at(-1)).toBe(8);
    expect(run.steps.some((step) => step.type === "meet-detected")).toBe(true);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createBidirectionalBfsRun({
      rows: "bad",
      cols: "bad",
      startCell: "bad",
      targetCell: "bad",
      blockedCells: "",
      allowDiagonal: "bad",
      expandSmallerFrontier: "bad",
      preferForwardOnTie: "bad",
    });

    expect(run.normalizedParams.rows).toBe(BIDIRECTIONAL_BFS_DEFAULT_PARAMS.rows);
    expect(run.normalizedParams.cols).toBe(BIDIRECTIONAL_BFS_DEFAULT_PARAMS.cols);
    expect(run.normalizedParams.allowDiagonal).toBe(BIDIRECTIONAL_BFS_DEFAULT_PARAMS.allowDiagonal);
    expect(run.normalizedParams.expandSmallerFrontier).toBe(
      BIDIRECTIONAL_BFS_DEFAULT_PARAMS.expandSmallerFrontier,
    );
    expect(run.normalizedParams.preferForwardOnTie).toBe(
      BIDIRECTIONAL_BFS_DEFAULT_PARAMS.preferForwardOnTie,
    );
  });
});

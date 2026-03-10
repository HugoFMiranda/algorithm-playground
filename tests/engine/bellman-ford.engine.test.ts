import { describe, expect, it } from "vitest";

import { createBellmanFordRun } from "@/algorithms/bellman-ford/engine";
import { BELLMAN_FORD_DEFAULT_PARAMS } from "@/algorithms/bellman-ford/spec";

describe("bellman-ford engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      nodeCount: 7,
      edges: "0>1:6, 0>2:7, 1>2:8, 1>3:5, 1>4:-4, 2>3:-3, 2>4:9, 3>1:-2, 4>0:2, 4>3:7",
      startNode: 0,
      stopEarlyWhenStable: true,
      preferLowerIndex: true,
    };

    const firstRun = createBellmanFordRun(rawParams);
    const secondRun = createBellmanFordRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("detects reachable negative cycles", () => {
    const run = createBellmanFordRun({
      nodeCount: 4,
      edges: "0>1:1, 1>2:-2, 2>1:-2, 2>3:1",
      startNode: 0,
      stopEarlyWhenStable: false,
      preferLowerIndex: true,
    });

    expect(run.result.negativeCycle).toBe(true);
    expect(run.result.cycleEdge).not.toBeNull();
    expect(run.steps.some((step) => step.type === "negative-cycle-edge")).toBe(true);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createBellmanFordRun({
      nodeCount: "bad",
      edges: "",
      startNode: "bad",
      stopEarlyWhenStable: "bad",
      preferLowerIndex: "bad",
    });

    expect(run.normalizedParams.nodeCount).toBe(BELLMAN_FORD_DEFAULT_PARAMS.nodeCount);
    expect(run.normalizedParams.startNode).toBe(BELLMAN_FORD_DEFAULT_PARAMS.startNode);
    expect(run.normalizedParams.stopEarlyWhenStable).toBe(BELLMAN_FORD_DEFAULT_PARAMS.stopEarlyWhenStable);
    expect(run.normalizedParams.preferLowerIndex).toBe(BELLMAN_FORD_DEFAULT_PARAMS.preferLowerIndex);
  });
});

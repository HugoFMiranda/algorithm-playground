import { describe, expect, it } from "vitest";

import {
  createTopologicalSortRun,
  topologicalSortEngine,
} from "@/algorithms/topological-sort/engine";
import { TOPOLOGICAL_SORT_DEFAULT_PARAMS } from "@/algorithms/topological-sort/spec";

describe("topological sort engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      nodeCount: 6,
      edges: "0>1, 0>2, 1>3, 2>3, 3>4, 4>5",
      preferLowerIndex: true,
    };

    const firstRun = createTopologicalSortRun(rawParams);
    const secondRun = createTopologicalSortRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createTopologicalSortRun({
      nodeCount: "bad",
      edges: "invalid",
      preferLowerIndex: "invalid",
    });

    expect(run.normalizedParams.nodeCount).toBe(TOPOLOGICAL_SORT_DEFAULT_PARAMS.nodeCount);
    expect(run.normalizedParams.preferLowerIndex).toBe(true);
    expect(run.input.edges.length).toBeGreaterThan(0);
  });

  it("produces a valid topological order for an acyclic graph", () => {
    const run = createTopologicalSortRun({
      nodeCount: 6,
      edges: "0>1, 0>2, 1>3, 2>3, 3>4, 4>5",
      preferLowerIndex: true,
    });

    expect(run.result.order).toEqual([0, 1, 2, 3, 4, 5]);
    expect(run.result.cycleDetected).toBe(false);
    expect(run.steps.at(-1)?.type).toBe("complete");
  });

  it("detects cycles when no full order exists", () => {
    const run = createTopologicalSortRun({
      nodeCount: 3,
      edges: "0>1, 1>2, 2>0",
      preferLowerIndex: true,
    });

    expect(run.result.cycleDetected).toBe(true);
    expect(run.result.remainingCount).toBe(3);
    expect(run.result.order).toEqual([]);
  });

  it("respects queue priority policy for multiple zero-indegree nodes", () => {
    const lowerFirst = topologicalSortEngine.generate(
      {
        nodeCount: 3,
        edges: [
          [0, 2],
          [1, 2],
        ],
        adjacency: [[2], [2], []],
        indegrees: [0, 0, 2],
      },
      {
        nodeCount: 3,
        edges: "0>2, 1>2",
        preferLowerIndex: true,
      },
    );
    const higherFirst = topologicalSortEngine.generate(
      {
        nodeCount: 3,
        edges: [
          [0, 2],
          [1, 2],
        ],
        adjacency: [[2], [2], []],
        indegrees: [0, 0, 2],
      },
      {
        nodeCount: 3,
        edges: "0>2, 1>2",
        preferLowerIndex: false,
      },
    );

    expect(lowerFirst.result.order).toEqual([0, 1, 2]);
    expect(higherFirst.result.order).toEqual([1, 0, 2]);
  });
});

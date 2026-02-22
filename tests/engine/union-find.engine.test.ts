import { describe, expect, it } from "vitest";

import { createUnionFindRun, unionFindEngine } from "@/algorithms/union-find/engine";
import { UNION_FIND_DEFAULT_PARAMS } from "@/algorithms/union-find/spec";

describe("union find engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      nodeCount: 8,
      operations: "union 0 1, union 1 2, connected 0 2, union 3 4, connected 0 4, find 2",
      pathCompression: true,
      unionByRank: true,
    };

    const firstRun = createUnionFindRun(rawParams);
    const secondRun = createUnionFindRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createUnionFindRun({
      nodeCount: "invalid",
      operations: "invalid operations",
      pathCompression: "invalid",
      unionByRank: "invalid",
    });

    expect(run.normalizedParams.nodeCount).toBe(UNION_FIND_DEFAULT_PARAMS.nodeCount);
    expect(run.normalizedParams.pathCompression).toBe(UNION_FIND_DEFAULT_PARAMS.pathCompression);
    expect(run.normalizedParams.unionByRank).toBe(UNION_FIND_DEFAULT_PARAMS.unionByRank);
    expect(run.input.operations.length).toBeGreaterThan(0);
  });

  it("evaluates unions and connectivity queries deterministically", () => {
    const run = createUnionFindRun({
      nodeCount: 5,
      operations: "union 0 1, union 1 2, connected 0 2, connected 0 3, find 2",
      pathCompression: true,
      unionByRank: true,
    });

    const querySteps = run.steps.filter((step) => step.type === "query-result");

    expect(run.result.successfulUnions).toBe(2);
    expect(run.result.connectedQueries).toBe(2);
    expect(run.result.findQueries).toBe(1);
    expect(run.result.componentCount).toBe(3);
    expect(querySteps).toHaveLength(3);
    expect(querySteps[0].payload.connected).toBe(true);
    expect(querySteps[1].payload.connected).toBe(false);
    expect(querySteps[2].payload.queryType).toBe("find");
  });

  it("applies path compression only when enabled", () => {
    const compressionEnabled = createUnionFindRun({
      nodeCount: 4,
      operations: "union 1 0, union 2 1, union 3 2, find 0",
      pathCompression: true,
      unionByRank: false,
    });
    const compressionDisabled = createUnionFindRun({
      nodeCount: 4,
      operations: "union 1 0, union 2 1, union 3 2, find 0",
      pathCompression: false,
      unionByRank: false,
    });

    const compressionEventsEnabled = compressionEnabled.steps.filter(
      (step) => step.type === "compress-path",
    );
    const compressionEventsDisabled = compressionDisabled.steps.filter(
      (step) => step.type === "compress-path",
    );

    expect(compressionEventsEnabled.length).toBeGreaterThan(0);
    expect(compressionEventsDisabled).toHaveLength(0);
    expect(compressionEnabled.result.parents[0]).toBe(3);
    expect(compressionDisabled.result.parents[0]).toBe(1);
  });

  it("respects union-by-rank toggle behavior", () => {
    const rankDisabled = unionFindEngine.generate(
      {
        nodeCount: 2,
        operations: [{ type: "union", left: 1, right: 0, source: "union 1 0" }],
      },
      {
        nodeCount: 2,
        operations: "union 1 0",
        pathCompression: true,
        unionByRank: false,
      },
    );

    const rankEnabled = unionFindEngine.generate(
      {
        nodeCount: 2,
        operations: [{ type: "union", left: 1, right: 0, source: "union 1 0" }],
      },
      {
        nodeCount: 2,
        operations: "union 1 0",
        pathCompression: true,
        unionByRank: true,
      },
    );

    expect(rankDisabled.result.parents).toEqual([1, 1]);
    expect(rankEnabled.result.parents).toEqual([0, 0]);
  });
});

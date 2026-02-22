import { describe, expect, it } from "vitest";

import {
  createInvertBinaryTreeRun,
  invertBinaryTreeEngine,
} from "@/algorithms/invert-binary-tree/engine";
import {
  INVERT_BINARY_TREE_DEFAULT_LEVEL_ORDER,
  INVERT_BINARY_TREE_DEFAULT_PARAMS,
} from "@/algorithms/invert-binary-tree/spec";

describe("invert binary tree engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      treeValues: "4, 2, 7, 1, 3, 6, 9",
      traversalMode: "dfs",
    };

    const firstRun = createInvertBinaryTreeRun(rawParams);
    const secondRun = createInvertBinaryTreeRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createInvertBinaryTreeRun({
      treeValues: "invalid tokens",
      traversalMode: "unknown",
    });

    expect(run.normalizedParams.traversalMode).toBe(INVERT_BINARY_TREE_DEFAULT_PARAMS.traversalMode);
    expect(run.input.levelOrder).toEqual([...INVERT_BINARY_TREE_DEFAULT_LEVEL_ORDER]);
  });

  it("handles empty tree input deterministically", () => {
    const run = createInvertBinaryTreeRun({
      treeValues: "null",
      traversalMode: "dfs",
    });

    expect(run.result.isEmpty).toBe(true);
    expect(run.result.visitedCount).toBe(0);
    expect(run.result.swaps).toBe(0);
    expect(run.steps).toHaveLength(1);
    expect(run.steps[0].type).toBe("complete");
  });

  it("inverts a balanced tree", () => {
    const run = createInvertBinaryTreeRun({
      treeValues: "4, 2, 7, 1, 3, 6, 9",
      traversalMode: "dfs",
    });

    expect(run.result.invertedLevelOrder).toEqual([4, 7, 2, 9, 6, 3, 1]);
    expect(run.result.visitedCount).toBe(7);
    expect(run.result.swaps).toBe(7);
    expect(run.steps.at(-1)?.type).toBe("complete");
  });

  it("supports deterministic traversal mode differences", () => {
    const input = {
      rootId: 0,
      nodes: [
        { id: 0, value: 1, left: 1, right: 2 },
        { id: 1, value: 2, left: 3, right: null },
        { id: 2, value: 3, left: 4, right: 5 },
        { id: 3, value: 4, left: null, right: null },
        { id: 4, value: 5, left: null, right: null },
        { id: 5, value: 6, left: null, right: null },
      ],
      levelOrder: [1, 2, 3, 4, null, 5, 6],
    };

    const dfs = invertBinaryTreeEngine.generate(input, {
      treeValues: "1, 2, 3, 4, null, 5, 6",
      traversalMode: "dfs",
    });
    const bfs = invertBinaryTreeEngine.generate(input, {
      treeValues: "1, 2, 3, 4, null, 5, 6",
      traversalMode: "bfs",
    });

    const dfsVisitValues = dfs.steps
      .filter((step) => step.type === "visit-node")
      .map((step) => step.payload.value);
    const bfsVisitValues = bfs.steps
      .filter((step) => step.type === "visit-node")
      .map((step) => step.payload.value);

    expect(dfsVisitValues).toEqual([1, 3, 6, 5, 2, 4]);
    expect(bfsVisitValues).toEqual([1, 3, 2, 6, 5, 4]);
  });
});

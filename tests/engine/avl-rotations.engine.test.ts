import { describe, expect, it } from "vitest";

import { avlRotationsEngine, createAvlRotationsRun } from "@/algorithms/avl-rotations/engine";
import {
  AVL_ROTATIONS_DEFAULT_INSERT_VALUES,
  AVL_ROTATIONS_DEFAULT_PARAMS,
} from "@/algorithms/avl-rotations/spec";

describe("avl rotations engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      insertValues: "30, 20, 10, 40, 50, 25, 27",
    };

    const firstRun = createAvlRotationsRun(rawParams);
    const secondRun = createAvlRotationsRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createAvlRotationsRun({
      insertValues: "letters only",
    });

    expect(run.normalizedParams.insertValues).toBe("letters only");
    expect(run.input.insertValues).toEqual([...AVL_ROTATIONS_DEFAULT_INSERT_VALUES]);
  });

  it("covers all single and double rotation cases deterministically", () => {
    const ll = createAvlRotationsRun({ insertValues: "30, 20, 10" });
    const rr = createAvlRotationsRun({ insertValues: "10, 20, 30" });
    const lr = createAvlRotationsRun({ insertValues: "30, 10, 20" });
    const rl = createAvlRotationsRun({ insertValues: "10, 30, 20" });

    expect(ll.result.finalLevelOrder).toEqual([20, 10, 30]);
    expect(rr.result.finalLevelOrder).toEqual([20, 10, 30]);
    expect(lr.result.finalLevelOrder).toEqual([20, 10, 30]);
    expect(rl.result.finalLevelOrder).toEqual([20, 10, 30]);

    expect(ll.steps.some((step) => step.type === "rotate-right")).toBe(true);
    expect(rr.steps.some((step) => step.type === "rotate-left")).toBe(true);
    expect(lr.steps.filter((step) => step.type === "rotate-left" || step.type === "rotate-right")).toHaveLength(2);
    expect(rl.steps.filter((step) => step.type === "rotate-left" || step.type === "rotate-right")).toHaveLength(2);
  });

  it("tracks duplicate inserts as deterministic no-ops", () => {
    const generated = avlRotationsEngine.generate(
      {
        rootId: null,
        nodes: [],
        insertValues: [30, 20, 10, 20],
        initialLevelOrder: [],
      },
      AVL_ROTATIONS_DEFAULT_PARAMS,
    );

    expect(generated.result.insertedCount).toBe(3);
    expect(generated.result.duplicateCount).toBe(1);
    expect(generated.steps.some((step) => step.type === "insert-node" && step.payload.duplicate)).toBe(true);
  });
});

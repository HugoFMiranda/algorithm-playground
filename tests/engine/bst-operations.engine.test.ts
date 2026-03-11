import { describe, expect, it } from "vitest";

import { createBstOperationsRun } from "@/algorithms/bst-operations/engine";
import {
  BST_OPERATIONS_DEFAULT_INITIAL_VALUES,
  BST_OPERATIONS_DEFAULT_OPERATION_LIST,
  BST_OPERATIONS_DEFAULT_PARAMS,
} from "@/algorithms/bst-operations/spec";

describe("bst operations engine", () => {
  it("emits deterministic runs for identical params", () => {
    const rawParams = {
      initialValues: "40, 24, 65, 12, 32, 50, 78",
      operations: "search 32, insert 29, delete 24, search 24",
      deleteStrategy: "successor",
    };

    const firstRun = createBstOperationsRun(rawParams);
    const secondRun = createBstOperationsRun(rawParams);

    expect(firstRun).toEqual(secondRun);
  });

  it("falls back to defaults when params are malformed", () => {
    const run = createBstOperationsRun({
      initialValues: "letters only",
      operations: "walk around",
      deleteStrategy: "unknown",
    });

    expect(run.normalizedParams.deleteStrategy).toBe(BST_OPERATIONS_DEFAULT_PARAMS.deleteStrategy);
    expect(run.input.initialValues).toEqual([...BST_OPERATIONS_DEFAULT_INITIAL_VALUES]);
    expect(run.input.operations.map((operation) => operation.source)).toEqual(
      [...BST_OPERATIONS_DEFAULT_OPERATION_LIST],
    );
  });

  it("handles search, insert, duplicate insert, and delete deterministically", () => {
    const run = createBstOperationsRun({
      initialValues: "40, 24, 65, 12, 32, 50, 78",
      operations: "search 32, insert 29, insert 65, delete 24, search 24, delete 99, insert 90",
      deleteStrategy: "successor",
    });

    expect(run.result.searchHits).toBe(1);
    expect(run.result.insertsApplied).toBe(2);
    expect(run.result.duplicateInserts).toBe(1);
    expect(run.result.deletesApplied).toBe(1);
    expect(run.result.missingDeletes).toBe(1);
    expect(run.result.finalLevelOrder).toEqual([40, 29, 65, 12, 32, 50, 78, null, null, null, null, null, null, null, 90]);
    expect(run.steps.some((step) => step.type === "delete-case")).toBe(true);
    expect(run.steps.at(-1)?.type).toBe("complete");
  });

  it("supports predecessor deletion policy for two-child removals", () => {
    const run = createBstOperationsRun({
      initialValues: "40, 24, 65, 12, 32, 50, 78, 29",
      operations: "delete 24",
      deleteStrategy: "predecessor",
    });

    expect(run.result.finalLevelOrder).toEqual([40, 12, 65, null, 32, 50, 78, 29]);
    expect(run.result.deletesApplied).toBe(1);
  });
});

import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type MergeSortInput,
  type MergeSortParams,
  type MergeSortResult,
  normalizeMergeSortInput,
  normalizeMergeSortParams,
} from "@/algorithms/merge-sort/spec";

type SplitRangeEvent = ArrayStepEvent<"split-range", { start: number; mid: number; end: number; depth: number }>;
type MergeStartEvent = ArrayStepEvent<"merge-start", { start: number; mid: number; end: number; depth: number }>;
type MergeCompareEvent = ArrayStepEvent<
  "merge-compare",
  {
    start: number;
    end: number;
    depth: number;
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
    targetIndex: number;
  }
>;
type WriteBackEvent = ArrayStepEvent<
  "write-back",
  {
    start: number;
    end: number;
    depth: number;
    sourceIndex: number;
    targetIndex: number;
    value: number;
    sourceSide: "left" | "right";
  }
>;
type MergeCompleteEvent = ArrayStepEvent<
  "merge-complete",
  { start: number; mid: number; end: number; depth: number; writes: number }
>;
type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    comparisons: number;
    writes: number;
    merges: number;
    maxDepth: number;
    isSorted: boolean;
  }
>;

export type MergeSortStepEvent =
  | SplitRangeEvent
  | MergeStartEvent
  | MergeCompareEvent
  | WriteBackEvent
  | MergeCompleteEvent
  | CompleteEvent;

function createEvent<TEvent extends MergeSortStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `merge-sort-${index}`,
    index,
    family: "array",
    type,
    payload,
  } as TEvent;
}

function isNonDecreasing(values: number[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] > values[index]) {
      return false;
    }
  }

  return true;
}

export const mergeSortEngine: AlgorithmEngine<
  MergeSortInput,
  MergeSortParams,
  MergeSortStepEvent,
  MergeSortResult
> = {
  normalizeParams: normalizeMergeSortParams,
  normalizeInput: normalizeMergeSortInput,
  generate: (input, params) => {
    const values = [...input.values];
    const buffer = new Array<number>(values.length);
    const steps: MergeSortStepEvent[] = [];
    let nextIndex = 0;
    let comparisons = 0;
    let writes = 0;
    let merges = 0;
    let maxDepth = 0;

    const mergeSort = (start: number, end: number, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);

      if (end - start <= 1) {
        return;
      }

      const mid = start + Math.floor((end - start) / 2);
      steps.push(createEvent(nextIndex, "split-range", { start, mid, end, depth }));
      nextIndex += 1;

      mergeSort(start, mid, depth + 1);
      mergeSort(mid, end, depth + 1);

      steps.push(createEvent(nextIndex, "merge-start", { start, mid, end, depth }));
      nextIndex += 1;

      let leftIndex = start;
      let rightIndex = mid;
      let targetIndex = start;
      let mergeWrites = 0;

      while (leftIndex < mid && rightIndex < end) {
        comparisons += 1;
        const leftValue = values[leftIndex];
        const rightValue = values[rightIndex];

        steps.push(
          createEvent(nextIndex, "merge-compare", {
            start,
            end,
            depth,
            leftIndex,
            rightIndex,
            leftValue,
            rightValue,
            targetIndex,
          }),
        );
        nextIndex += 1;

        const chooseLeft =
          leftValue < rightValue || (leftValue === rightValue && params.preferLeftOnEqual);

        buffer[targetIndex] = chooseLeft ? leftValue : rightValue;
        const sourceIndex = chooseLeft ? leftIndex : rightIndex;
        const sourceSide: "left" | "right" = chooseLeft ? "left" : "right";

        if (chooseLeft) {
          leftIndex += 1;
        } else {
          rightIndex += 1;
        }

        writes += 1;
        mergeWrites += 1;
        steps.push(
          createEvent(nextIndex, "write-back", {
            start,
            end,
            depth,
            sourceIndex,
            targetIndex,
            value: buffer[targetIndex],
            sourceSide,
          }),
        );
        nextIndex += 1;
        targetIndex += 1;
      }

      while (leftIndex < mid) {
        buffer[targetIndex] = values[leftIndex];
        writes += 1;
        mergeWrites += 1;
        steps.push(
          createEvent(nextIndex, "write-back", {
            start,
            end,
            depth,
            sourceIndex: leftIndex,
            targetIndex,
            value: buffer[targetIndex],
            sourceSide: "left",
          }),
        );
        nextIndex += 1;
        leftIndex += 1;
        targetIndex += 1;
      }

      while (rightIndex < end) {
        buffer[targetIndex] = values[rightIndex];
        writes += 1;
        mergeWrites += 1;
        steps.push(
          createEvent(nextIndex, "write-back", {
            start,
            end,
            depth,
            sourceIndex: rightIndex,
            targetIndex,
            value: buffer[targetIndex],
            sourceSide: "right",
          }),
        );
        nextIndex += 1;
        rightIndex += 1;
        targetIndex += 1;
      }

      for (let index = start; index < end; index += 1) {
        values[index] = buffer[index];
      }

      merges += 1;
      steps.push(
        createEvent(nextIndex, "merge-complete", {
          start,
          mid,
          end,
          depth,
          writes: mergeWrites,
        }),
      );
      nextIndex += 1;
    };

    mergeSort(0, values.length, 0);

    steps.push(
      createEvent(nextIndex, "complete", {
        comparisons,
        writes,
        merges,
        maxDepth,
        isSorted: isNonDecreasing(values),
      }),
    );

    return {
      steps,
      result: {
        sortedValues: values,
        comparisons,
        writes,
        merges,
        maxDepth,
      },
    };
  },
};

export function createMergeSortRun(
  rawParams: RawParams,
): AlgorithmRunOutput<MergeSortInput, MergeSortParams, MergeSortStepEvent, MergeSortResult> {
  const normalizedParams = mergeSortEngine.normalizeParams(rawParams);
  const input = mergeSortEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = mergeSortEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type QuickSortInput,
  type QuickSortParams,
  type QuickSortResult,
  normalizeQuickSortInput,
  normalizeQuickSortParams,
} from "@/algorithms/quick-sort/spec";

type PivotSetEvent = ArrayStepEvent<
  "pivot-set",
  {
    low: number;
    high: number;
    depth: number;
    selectedIndex: number;
    activePivotIndex: number;
    pivotValue: number;
    strategy: "last" | "middle";
  }
>;
type CompareEvent = ArrayStepEvent<
  "compare",
  {
    low: number;
    high: number;
    depth: number;
    comparedIndex: number;
    comparedValue: number;
    pivotValue: number;
    storeIndex: number;
  }
>;
type PartitionSwapEvent = ArrayStepEvent<
  "partition-swap",
  {
    low: number;
    high: number;
    depth: number;
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
    reason: "pivot-move" | "partition" | "pivot-place";
    selfSwap: boolean;
  }
>;
type PartitionCompleteEvent = ArrayStepEvent<
  "partition-complete",
  {
    low: number;
    high: number;
    depth: number;
    pivotIndex: number;
    leftSize: number;
    rightSize: number;
  }
>;
type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    comparisons: number;
    swaps: number;
    partitions: number;
    maxDepth: number;
    isSorted: boolean;
  }
>;

export type QuickSortStepEvent =
  | PivotSetEvent
  | CompareEvent
  | PartitionSwapEvent
  | PartitionCompleteEvent
  | CompleteEvent;

function createEvent<TEvent extends QuickSortStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `quick-sort-${index}`,
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

function choosePivotIndex(low: number, high: number, strategy: "last" | "middle"): number {
  if (strategy === "middle") {
    return low + Math.floor((high - low) / 2);
  }

  return high;
}

function swap(values: number[], leftIndex: number, rightIndex: number): void {
  const leftValue = values[leftIndex];
  values[leftIndex] = values[rightIndex];
  values[rightIndex] = leftValue;
}

export const quickSortEngine: AlgorithmEngine<
  QuickSortInput,
  QuickSortParams,
  QuickSortStepEvent,
  QuickSortResult
> = {
  normalizeParams: normalizeQuickSortParams,
  normalizeInput: normalizeQuickSortInput,
  generate: (input, params) => {
    const values = [...input.values];
    const steps: QuickSortStepEvent[] = [];
    let nextIndex = 0;
    let comparisons = 0;
    let swaps = 0;
    let partitions = 0;
    let maxDepth = 0;

    const quickSort = (low: number, high: number, depth: number): void => {
      maxDepth = Math.max(maxDepth, depth);

      if (low >= high) {
        return;
      }

      const selectedPivotIndex = choosePivotIndex(low, high, params.pivotStrategy);
      if (selectedPivotIndex !== high) {
        steps.push(
          createEvent(nextIndex, "partition-swap", {
            low,
            high,
            depth,
            leftIndex: selectedPivotIndex,
            rightIndex: high,
            leftValue: values[selectedPivotIndex],
            rightValue: values[high],
            reason: "pivot-move",
            selfSwap: false,
          }),
        );
        nextIndex += 1;
        swap(values, selectedPivotIndex, high);
        swaps += 1;
      }

      const pivotValue = values[high];
      steps.push(
        createEvent(nextIndex, "pivot-set", {
          low,
          high,
          depth,
          selectedIndex: selectedPivotIndex,
          activePivotIndex: high,
          pivotValue,
          strategy: params.pivotStrategy,
        }),
      );
      nextIndex += 1;

      let storeIndex = low;
      for (let comparedIndex = low; comparedIndex < high; comparedIndex += 1) {
        comparisons += 1;
        steps.push(
          createEvent(nextIndex, "compare", {
            low,
            high,
            depth,
            comparedIndex,
            comparedValue: values[comparedIndex],
            pivotValue,
            storeIndex,
          }),
        );
        nextIndex += 1;

        if (values[comparedIndex] < pivotValue) {
          if (comparedIndex !== storeIndex) {
            steps.push(
              createEvent(nextIndex, "partition-swap", {
                low,
                high,
                depth,
                leftIndex: comparedIndex,
                rightIndex: storeIndex,
                leftValue: values[comparedIndex],
                rightValue: values[storeIndex],
                reason: "partition",
                selfSwap: false,
              }),
            );
            nextIndex += 1;
            swap(values, comparedIndex, storeIndex);
            swaps += 1;
          }
          storeIndex += 1;
        }
      }

      const pivotSelfSwap = storeIndex === high;
      steps.push(
        createEvent(nextIndex, "partition-swap", {
          low,
          high,
          depth,
          leftIndex: storeIndex,
          rightIndex: high,
          leftValue: values[storeIndex],
          rightValue: values[high],
          reason: "pivot-place",
          selfSwap: pivotSelfSwap,
        }),
      );
      nextIndex += 1;
      if (!pivotSelfSwap) {
        swap(values, storeIndex, high);
        swaps += 1;
      }

      partitions += 1;
      steps.push(
        createEvent(nextIndex, "partition-complete", {
          low,
          high,
          depth,
          pivotIndex: storeIndex,
          leftSize: storeIndex - low,
          rightSize: high - storeIndex,
        }),
      );
      nextIndex += 1;

      quickSort(low, storeIndex - 1, depth + 1);
      quickSort(storeIndex + 1, high, depth + 1);
    };

    quickSort(0, values.length - 1, 0);

    steps.push(
      createEvent(nextIndex, "complete", {
        comparisons,
        swaps,
        partitions,
        maxDepth,
        isSorted: isNonDecreasing(values),
      }),
    );

    return {
      steps,
      result: {
        sortedValues: values,
        comparisons,
        swaps,
        partitions,
        maxDepth,
      },
    };
  },
};

export function createQuickSortRun(
  rawParams: RawParams,
): AlgorithmRunOutput<QuickSortInput, QuickSortParams, QuickSortStepEvent, QuickSortResult> {
  const normalizedParams = quickSortEngine.normalizeParams(rawParams);
  const input = quickSortEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = quickSortEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

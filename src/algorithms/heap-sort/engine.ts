import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type HeapSortInput,
  type HeapSortParams,
  type HeapSortResult,
  normalizeHeapSortInput,
  normalizeHeapSortParams,
} from "@/algorithms/heap-sort/spec";

type HeapifyStartEvent = ArrayStepEvent<
  "heapify-start",
  {
    phase: "build" | "extract";
    rootIndex: number;
    heapSize: number;
    sortedStart: number;
  }
>;
type CompareEvent = ArrayStepEvent<
  "compare",
  {
    phase: "build" | "extract";
    rootIndex: number;
    heapSize: number;
    sortedStart: number;
    candidateIndex: number;
    comparedIndex: number;
    candidateValue: number;
    comparedValue: number;
  }
>;
type SwapEvent = ArrayStepEvent<
  "swap",
  {
    phase: "build" | "extract";
    reason: "sift-down" | "extract-root";
    heapSize: number;
    sortedStart: number;
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
  }
>;
type HeapifyCompleteEvent = ArrayStepEvent<
  "heapify-complete",
  {
    phase: "build" | "extract";
    rootIndex: number;
    heapSize: number;
    sortedStart: number;
  }
>;
type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    comparisons: number;
    swaps: number;
    heapifyCalls: number;
    extractions: number;
    isSorted: boolean;
  }
>;

export type HeapSortStepEvent =
  | HeapifyStartEvent
  | CompareEvent
  | SwapEvent
  | HeapifyCompleteEvent
  | CompleteEvent;

function createEvent<TEvent extends HeapSortStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `heap-sort-${index}`,
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

function swap(values: number[], leftIndex: number, rightIndex: number): void {
  const leftValue = values[leftIndex];
  values[leftIndex] = values[rightIndex];
  values[rightIndex] = leftValue;
}

export const heapSortEngine: AlgorithmEngine<
  HeapSortInput,
  HeapSortParams,
  HeapSortStepEvent,
  HeapSortResult
> = {
  normalizeParams: normalizeHeapSortParams,
  normalizeInput: normalizeHeapSortInput,
  generate: (input) => {
    const values = [...input.values];
    const steps: HeapSortStepEvent[] = [];
    let nextIndex = 0;
    let comparisons = 0;
    let swaps = 0;
    let heapifyCalls = 0;
    let extractions = 0;

    const siftDown = (startIndex: number, heapSize: number, phase: "build" | "extract") => {
      const sortedStart = heapSize;
      heapifyCalls += 1;
      steps.push(
        createEvent(nextIndex, "heapify-start", {
          phase,
          rootIndex: startIndex,
          heapSize,
          sortedStart,
        }),
      );
      nextIndex += 1;

      let rootIndex = startIndex;

      while (true) {
        let candidateIndex = rootIndex;
        const leftChildIndex = rootIndex * 2 + 1;
        const rightChildIndex = leftChildIndex + 1;

        if (leftChildIndex < heapSize) {
          comparisons += 1;
          steps.push(
            createEvent(nextIndex, "compare", {
              phase,
              rootIndex,
              heapSize,
              sortedStart,
              candidateIndex,
              comparedIndex: leftChildIndex,
              candidateValue: values[candidateIndex],
              comparedValue: values[leftChildIndex],
            }),
          );
          nextIndex += 1;

          if (values[leftChildIndex] > values[candidateIndex]) {
            candidateIndex = leftChildIndex;
          }
        }

        if (rightChildIndex < heapSize) {
          comparisons += 1;
          steps.push(
            createEvent(nextIndex, "compare", {
              phase,
              rootIndex,
              heapSize,
              sortedStart,
              candidateIndex,
              comparedIndex: rightChildIndex,
              candidateValue: values[candidateIndex],
              comparedValue: values[rightChildIndex],
            }),
          );
          nextIndex += 1;

          if (values[rightChildIndex] > values[candidateIndex]) {
            candidateIndex = rightChildIndex;
          }
        }

        if (candidateIndex === rootIndex) {
          break;
        }

        steps.push(
          createEvent(nextIndex, "swap", {
            phase,
            reason: "sift-down",
            heapSize,
            sortedStart,
            leftIndex: rootIndex,
            rightIndex: candidateIndex,
            leftValue: values[rootIndex],
            rightValue: values[candidateIndex],
          }),
        );
        nextIndex += 1;
        swap(values, rootIndex, candidateIndex);
        swaps += 1;
        rootIndex = candidateIndex;
      }

      steps.push(
        createEvent(nextIndex, "heapify-complete", {
          phase,
          rootIndex: startIndex,
          heapSize,
          sortedStart,
        }),
      );
      nextIndex += 1;
    };

    for (let index = Math.floor(values.length / 2) - 1; index >= 0; index -= 1) {
      siftDown(index, values.length, "build");
    }

    for (let endIndex = values.length - 1; endIndex > 0; endIndex -= 1) {
      steps.push(
        createEvent(nextIndex, "swap", {
          phase: "extract",
          reason: "extract-root",
          heapSize: endIndex + 1,
          sortedStart: endIndex,
          leftIndex: 0,
          rightIndex: endIndex,
          leftValue: values[0],
          rightValue: values[endIndex],
        }),
      );
      nextIndex += 1;
      swap(values, 0, endIndex);
      swaps += 1;
      extractions += 1;

      siftDown(0, endIndex, "extract");
    }

    steps.push(
      createEvent(nextIndex, "complete", {
        comparisons,
        swaps,
        heapifyCalls,
        extractions,
        isSorted: isNonDecreasing(values),
      }),
    );

    return {
      steps,
      result: {
        sortedValues: values,
        comparisons,
        swaps,
        heapifyCalls,
        extractions,
      },
    };
  },
};

export function createHeapSortRun(
  rawParams: RawParams,
): AlgorithmRunOutput<HeapSortInput, HeapSortParams, HeapSortStepEvent, HeapSortResult> {
  const normalizedParams = heapSortEngine.normalizeParams(rawParams);
  const input = heapSortEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = heapSortEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type BubbleSortInput,
  type BubbleSortParams,
  type BubbleSortResult,
  normalizeBubbleSortInput,
  normalizeBubbleSortParams,
} from "@/algorithms/bubble-sort/spec";

type CompareEvent = ArrayStepEvent<
  "compare",
  {
    pass: number;
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
    sortedStart: number;
  }
>;
type SwapEvent = ArrayStepEvent<
  "swap",
  {
    pass: number;
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
    sortedStart: number;
  }
>;
type PassCompleteEvent = ArrayStepEvent<
  "pass-complete",
  {
    pass: number;
    comparisons: number;
    swaps: number;
    swapped: boolean;
    sortedStart: number;
  }
>;
type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    comparisons: number;
    swaps: number;
    passes: number;
    isSorted: boolean;
  }
>;

export type BubbleSortStepEvent = CompareEvent | SwapEvent | PassCompleteEvent | CompleteEvent;

function createEvent<TEvent extends BubbleSortStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `bubble-sort-${index}`,
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

export const bubbleSortEngine: AlgorithmEngine<
  BubbleSortInput,
  BubbleSortParams,
  BubbleSortStepEvent,
  BubbleSortResult
> = {
  normalizeParams: normalizeBubbleSortParams,
  normalizeInput: normalizeBubbleSortInput,
  generate: (input, params) => {
    const values = [...input.values];
    const steps: BubbleSortStepEvent[] = [];
    let nextIndex = 0;
    let comparisons = 0;
    let swaps = 0;
    let passes = 0;

    for (let pass = 0; pass < values.length - 1; pass += 1) {
      const sortedStart = values.length - pass - 1;
      let swapped = false;
      let passComparisons = 0;
      let passSwaps = 0;

      for (let leftIndex = 0; leftIndex < sortedStart; leftIndex += 1) {
        const rightIndex = leftIndex + 1;
        const leftValue = values[leftIndex];
        const rightValue = values[rightIndex];

        comparisons += 1;
        passComparisons += 1;
        steps.push(
          createEvent(nextIndex, "compare", {
            pass,
            leftIndex,
            rightIndex,
            leftValue,
            rightValue,
            sortedStart,
          }),
        );
        nextIndex += 1;

        if (leftValue > rightValue) {
          values[leftIndex] = rightValue;
          values[rightIndex] = leftValue;
          swaps += 1;
          passSwaps += 1;
          swapped = true;

          steps.push(
            createEvent(nextIndex, "swap", {
              pass,
              leftIndex,
              rightIndex,
              leftValue: values[leftIndex],
              rightValue: values[rightIndex],
              sortedStart,
            }),
          );
          nextIndex += 1;
        }
      }

      passes += 1;
      steps.push(
        createEvent(nextIndex, "pass-complete", {
          pass,
          comparisons: passComparisons,
          swaps: passSwaps,
          swapped,
          sortedStart,
        }),
      );
      nextIndex += 1;

      if (params.optimizeEarlyExit && !swapped) {
        break;
      }
    }

    steps.push(
      createEvent(nextIndex, "complete", {
        comparisons,
        swaps,
        passes,
        isSorted: isNonDecreasing(values),
      }),
    );

    return {
      steps,
      result: {
        sortedValues: values,
        comparisons,
        swaps,
        passes,
      },
    };
  },
};

export function createBubbleSortRun(
  rawParams: RawParams,
): AlgorithmRunOutput<BubbleSortInput, BubbleSortParams, BubbleSortStepEvent, BubbleSortResult> {
  const normalizedParams = bubbleSortEngine.normalizeParams(rawParams);
  const input = bubbleSortEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = bubbleSortEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

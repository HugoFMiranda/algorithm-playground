import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type SelectionSortInput,
  type SelectionSortParams,
  type SelectionSortResult,
  normalizeSelectionSortInput,
  normalizeSelectionSortParams,
} from "@/algorithms/selection-sort/spec";

type CandidateMinEvent = ArrayStepEvent<
  "candidate-min",
  {
    pass: number;
    sortedEnd: number;
    minIndex: number;
    minValue: number;
    reason: "initialize" | "update";
  }
>;
type CompareEvent = ArrayStepEvent<
  "compare",
  {
    pass: number;
    sortedEnd: number;
    candidateIndex: number;
    comparedIndex: number;
    candidateValue: number;
    comparedValue: number;
  }
>;
type SwapEvent = ArrayStepEvent<
  "swap",
  {
    pass: number;
    sortedEnd: number;
    leftIndex: number;
    rightIndex: number;
    leftValue: number;
    rightValue: number;
    selfSwap: boolean;
  }
>;
type PassCompleteEvent = ArrayStepEvent<
  "pass-complete",
  {
    pass: number;
    sortedEnd: number;
    minIndex: number;
    comparisons: number;
    swapped: boolean;
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

export type SelectionSortStepEvent =
  | CandidateMinEvent
  | CompareEvent
  | SwapEvent
  | PassCompleteEvent
  | CompleteEvent;

function createEvent<TEvent extends SelectionSortStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `selection-sort-${index}`,
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

export const selectionSortEngine: AlgorithmEngine<
  SelectionSortInput,
  SelectionSortParams,
  SelectionSortStepEvent,
  SelectionSortResult
> = {
  normalizeParams: normalizeSelectionSortParams,
  normalizeInput: normalizeSelectionSortInput,
  generate: (input, params) => {
    const values = [...input.values];
    const steps: SelectionSortStepEvent[] = [];
    let nextIndex = 0;
    let comparisons = 0;
    let swaps = 0;
    let passes = 0;

    for (let pass = 0; pass < values.length - 1; pass += 1) {
      const sortedEnd = pass;
      let minIndex = pass;
      let passComparisons = 0;

      steps.push(
        createEvent(nextIndex, "candidate-min", {
          pass,
          sortedEnd,
          minIndex,
          minValue: values[minIndex],
          reason: "initialize",
        }),
      );
      nextIndex += 1;

      for (let comparedIndex = pass + 1; comparedIndex < values.length; comparedIndex += 1) {
        comparisons += 1;
        passComparisons += 1;

        steps.push(
          createEvent(nextIndex, "compare", {
            pass,
            sortedEnd,
            candidateIndex: minIndex,
            comparedIndex,
            candidateValue: values[minIndex],
            comparedValue: values[comparedIndex],
          }),
        );
        nextIndex += 1;

        if (values[comparedIndex] < values[minIndex]) {
          minIndex = comparedIndex;
          steps.push(
            createEvent(nextIndex, "candidate-min", {
              pass,
              sortedEnd,
              minIndex,
              minValue: values[minIndex],
              reason: "update",
            }),
          );
          nextIndex += 1;
        }
      }

      const shouldSwap = !params.swapOnlyWhenNeeded || minIndex !== pass;
      if (shouldSwap) {
        const leftValue = values[pass];
        const rightValue = values[minIndex];
        values[pass] = rightValue;
        values[minIndex] = leftValue;

        swaps += 1;

        steps.push(
          createEvent(nextIndex, "swap", {
            pass,
            sortedEnd,
            leftIndex: pass,
            rightIndex: minIndex,
            leftValue: values[pass],
            rightValue: values[minIndex],
            selfSwap: pass === minIndex,
          }),
        );
        nextIndex += 1;
      }

      passes += 1;
      steps.push(
        createEvent(nextIndex, "pass-complete", {
          pass,
          sortedEnd,
          minIndex,
          comparisons: passComparisons,
          swapped: shouldSwap,
        }),
      );
      nextIndex += 1;
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

export function createSelectionSortRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  SelectionSortInput,
  SelectionSortParams,
  SelectionSortStepEvent,
  SelectionSortResult
> {
  const normalizedParams = selectionSortEngine.normalizeParams(rawParams);
  const input = selectionSortEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = selectionSortEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

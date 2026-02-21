import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type InsertionSortInput,
  type InsertionSortParams,
  type InsertionSortResult,
  normalizeInsertionSortInput,
  normalizeInsertionSortParams,
} from "@/algorithms/insertion-sort/spec";

type SelectKeyEvent = ArrayStepEvent<
  "select-key",
  {
    pass: number;
    keyIndex: number;
    keyValue: number;
    sortedEnd: number;
  }
>;
type CompareEvent = ArrayStepEvent<
  "compare",
  {
    pass: number;
    compareIndex: number;
    comparedValue: number;
    keyValue: number;
    insertionIndex: number;
  }
>;
type ShiftRightEvent = ArrayStepEvent<
  "shift-right",
  {
    pass: number;
    fromIndex: number;
    toIndex: number;
    movedValue: number;
    keyValue: number;
  }
>;
type InsertEvent = ArrayStepEvent<
  "insert",
  {
    pass: number;
    fromIndex: number;
    toIndex: number;
    keyValue: number;
    shifted: boolean;
    shifts: number;
  }
>;
type PassCompleteEvent = ArrayStepEvent<
  "pass-complete",
  {
    pass: number;
    comparisons: number;
    shifts: number;
    insertIndex: number;
  }
>;
type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    comparisons: number;
    shifts: number;
    passes: number;
    isSorted: boolean;
  }
>;

export type InsertionSortStepEvent =
  | SelectKeyEvent
  | CompareEvent
  | ShiftRightEvent
  | InsertEvent
  | PassCompleteEvent
  | CompleteEvent;

function createEvent<TEvent extends InsertionSortStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `insertion-sort-${index}`,
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

export const insertionSortEngine: AlgorithmEngine<
  InsertionSortInput,
  InsertionSortParams,
  InsertionSortStepEvent,
  InsertionSortResult
> = {
  normalizeParams: normalizeInsertionSortParams,
  normalizeInput: normalizeInsertionSortInput,
  generate: (input, params) => {
    const values = [...input.values];
    const steps: InsertionSortStepEvent[] = [];
    let nextIndex = 0;
    let comparisons = 0;
    let shifts = 0;
    let passes = 0;

    for (let pass = 1; pass < values.length; pass += 1) {
      const keyValue = values[pass];
      let insertionIndex = pass;
      let passComparisons = 0;
      let passShifts = 0;

      steps.push(
        createEvent(nextIndex, "select-key", {
          pass,
          keyIndex: pass,
          keyValue,
          sortedEnd: pass - 1,
        }),
      );
      nextIndex += 1;

      for (let compareIndex = pass - 1; compareIndex >= 0; compareIndex -= 1) {
        comparisons += 1;
        passComparisons += 1;

        steps.push(
          createEvent(nextIndex, "compare", {
            pass,
            compareIndex,
            comparedValue: values[compareIndex],
            keyValue,
            insertionIndex,
          }),
        );
        nextIndex += 1;

        if (values[compareIndex] > keyValue) {
          values[compareIndex + 1] = values[compareIndex];
          insertionIndex = compareIndex;
          shifts += 1;
          passShifts += 1;

          steps.push(
            createEvent(nextIndex, "shift-right", {
              pass,
              fromIndex: compareIndex,
              toIndex: compareIndex + 1,
              movedValue: values[compareIndex],
              keyValue,
            }),
          );
          nextIndex += 1;
          continue;
        }

        if (params.allowEarlyPlacement) {
          break;
        }
      }

      values[insertionIndex] = keyValue;
      steps.push(
        createEvent(nextIndex, "insert", {
          pass,
          fromIndex: pass,
          toIndex: insertionIndex,
          keyValue,
          shifted: insertionIndex !== pass,
          shifts: passShifts,
        }),
      );
      nextIndex += 1;

      passes += 1;
      steps.push(
        createEvent(nextIndex, "pass-complete", {
          pass,
          comparisons: passComparisons,
          shifts: passShifts,
          insertIndex: insertionIndex,
        }),
      );
      nextIndex += 1;
    }

    steps.push(
      createEvent(nextIndex, "complete", {
        comparisons,
        shifts,
        passes,
        isSorted: isNonDecreasing(values),
      }),
    );

    return {
      steps,
      result: {
        sortedValues: values,
        comparisons,
        shifts,
        passes,
      },
    };
  },
};

export function createInsertionSortRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  InsertionSortInput,
  InsertionSortParams,
  InsertionSortStepEvent,
  InsertionSortResult
> {
  const normalizedParams = insertionSortEngine.normalizeParams(rawParams);
  const input = insertionSortEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = insertionSortEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

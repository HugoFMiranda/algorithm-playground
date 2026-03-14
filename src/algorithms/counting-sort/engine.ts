import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type CountingSortInput,
  type CountingSortParams,
  type CountingSortResult,
  normalizeCountingSortInput,
  normalizeCountingSortParams,
} from "@/algorithms/counting-sort/spec";

type CountEvent = ArrayStepEvent<
  "count",
  {
    sourceIndex: number;
    value: number;
    bucketIndex: number;
    bucketValue: number;
    bucketCount: number;
  }
>;

type PrefixSumEvent = ArrayStepEvent<
  "prefix-sum",
  {
    bucketIndex: number;
    bucketValue: number;
    previousCount: number;
    runningTotal: number;
  }
>;

type PlaceEvent = ArrayStepEvent<
  "place",
  {
    sourceIndex: number;
    value: number;
    bucketIndex: number;
    bucketValue: number;
    outputIndex: number;
    remainingCount: number;
  }
>;

type WriteBackEvent = ArrayStepEvent<
  "write-back",
  {
    writeIndex: number;
    value: number;
  }
>;

type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    countsLength: number;
    placements: number;
    writes: number;
    isSorted: boolean;
  }
>;

export type CountingSortStepEvent =
  | CountEvent
  | PrefixSumEvent
  | PlaceEvent
  | WriteBackEvent
  | CompleteEvent;

function createEvent<TEvent extends CountingSortStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `counting-sort-${index}`,
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

export const countingSortEngine: AlgorithmEngine<
  CountingSortInput,
  CountingSortParams,
  CountingSortStepEvent,
  CountingSortResult
> = {
  normalizeParams: normalizeCountingSortParams,
  normalizeInput: normalizeCountingSortInput,
  generate: (input) => {
    const counts = Array.from({ length: input.rangeSize }, () => 0);
    const output = Array.from({ length: input.values.length }, () => 0);
    const steps: CountingSortStepEvent[] = [];
    let nextIndex = 0;
    let placements = 0;
    let writes = 0;

    for (const [sourceIndex, value] of input.values.entries()) {
      const bucketIndex = value - input.minValue;
      counts[bucketIndex] += 1;

      steps.push(
        createEvent(nextIndex, "count", {
          sourceIndex,
          value,
          bucketIndex,
          bucketValue: input.minValue + bucketIndex,
          bucketCount: counts[bucketIndex] as number,
        }),
      );
      nextIndex += 1;
    }

    for (let bucketIndex = 1; bucketIndex < counts.length; bucketIndex += 1) {
      const previousCount = counts[bucketIndex] as number;
      counts[bucketIndex] = (counts[bucketIndex - 1] as number) + previousCount;

      steps.push(
        createEvent(nextIndex, "prefix-sum", {
          bucketIndex,
          bucketValue: input.minValue + bucketIndex,
          previousCount,
          runningTotal: counts[bucketIndex] as number,
        }),
      );
      nextIndex += 1;
    }

    for (let sourceIndex = input.values.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
      const value = input.values[sourceIndex] as number;
      const bucketIndex = value - input.minValue;
      const outputIndex = (counts[bucketIndex] as number) - 1;
      output[outputIndex] = value;
      counts[bucketIndex] = outputIndex;
      placements += 1;

      steps.push(
        createEvent(nextIndex, "place", {
          sourceIndex,
          value,
          bucketIndex,
          bucketValue: input.minValue + bucketIndex,
          outputIndex,
          remainingCount: counts[bucketIndex] as number,
        }),
      );
      nextIndex += 1;
    }

    const sortedValues = [...output];
    for (const [writeIndex, value] of sortedValues.entries()) {
      writes += 1;
      steps.push(
        createEvent(nextIndex, "write-back", {
          writeIndex,
          value,
        }),
      );
      nextIndex += 1;
    }

    steps.push(
      createEvent(nextIndex, "complete", {
        countsLength: input.rangeSize,
        placements,
        writes,
        isSorted: isNonDecreasing(sortedValues),
      }),
    );

    return {
      steps,
      result: {
        sortedValues,
        minValue: input.minValue,
        maxValue: input.maxValue,
        rangeSize: input.rangeSize,
        countsLength: input.rangeSize,
        placements,
        writes,
      },
    };
  },
};

export function createCountingSortRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  CountingSortInput,
  CountingSortParams,
  CountingSortStepEvent,
  CountingSortResult
> {
  const normalizedParams = countingSortEngine.normalizeParams(rawParams);
  const input = countingSortEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = countingSortEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, SearchStepEvent } from "@/types/engine";

import {
  type BinarySearchInput,
  type BinarySearchParams,
  type BinarySearchResult,
  normalizeBinarySearchInput,
  normalizeBinarySearchParams,
} from "@/algorithms/binary-search/spec";

type BoundsInitEvent = SearchStepEvent<"bounds-init", { low: number; high: number }>;
type MidpointEvent = SearchStepEvent<
  "midpoint",
  { low: number; high: number; mid: number; value: number; target: number }
>;
type BoundUpdateEvent = SearchStepEvent<
  "bound-update",
  { direction: "left" | "right"; low: number; high: number; mid: number; target: number }
>;
type FoundEvent = SearchStepEvent<"found", { index: number; value: number; low: number; high: number; mid: number }>;
type NotFoundEvent = SearchStepEvent<"not-found", { insertIndex: number; low: number; high: number; target: number }>;

export type BinarySearchStepEvent =
  | BoundsInitEvent
  | MidpointEvent
  | BoundUpdateEvent
  | FoundEvent
  | NotFoundEvent;

function createEvent<TEvent extends BinarySearchStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `binary-search-${index}`,
    index,
    family: "search",
    type,
    payload,
  } as TEvent;
}

export const binarySearchEngine: AlgorithmEngine<
  BinarySearchInput,
  BinarySearchParams,
  BinarySearchStepEvent,
  BinarySearchResult
> = {
  normalizeParams: normalizeBinarySearchParams,
  normalizeInput: normalizeBinarySearchInput,
  generate: (input, params) => {
    const steps: BinarySearchStepEvent[] = [];
    let nextIndex = 0;

    let low = 0;
    let high = input.values.length - 1;
    let iterations = 0;

    steps.push(createEvent(nextIndex, "bounds-init", { low, high }));
    nextIndex += 1;

    while (low <= high) {
      const mid = low + Math.floor((high - low) / 2);
      const value = input.values[mid];
      iterations += 1;

      steps.push(
        createEvent(nextIndex, "midpoint", {
          low,
          high,
          mid,
          value,
          target: params.target,
        }),
      );
      nextIndex += 1;

      if (value === params.target) {
        steps.push(
          createEvent(nextIndex, "found", {
            index: mid,
            value,
            low,
            high,
            mid,
          }),
        );

        return {
          steps,
          result: {
            found: true,
            index: mid,
            iterations,
          },
        };
      }

      if (value < params.target) {
        low = mid + 1;
        steps.push(
          createEvent(nextIndex, "bound-update", {
            direction: "right",
            low,
            high,
            mid,
            target: params.target,
          }),
        );
      } else {
        high = mid - 1;
        steps.push(
          createEvent(nextIndex, "bound-update", {
            direction: "left",
            low,
            high,
            mid,
            target: params.target,
          }),
        );
      }

      nextIndex += 1;
    }

    steps.push(
      createEvent(nextIndex, "not-found", {
        insertIndex: low,
        low,
        high,
        target: params.target,
      }),
    );

    return {
      steps,
      result: {
        found: false,
        index: -1,
        iterations,
      },
    };
  },
};

export function createBinarySearchRun(
  rawParams: RawParams,
): AlgorithmRunOutput<BinarySearchInput, BinarySearchParams, BinarySearchStepEvent, BinarySearchResult> {
  const normalizedParams = binarySearchEngine.normalizeParams(rawParams);
  const input = binarySearchEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = binarySearchEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

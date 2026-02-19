import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface BubbleSortParams extends Record<string, ParamPrimitive> {
  arrayValues: string;
  optimizeEarlyExit: boolean;
}

export interface BubbleSortInput {
  values: number[];
}

export interface BubbleSortResult {
  sortedValues: number[];
  comparisons: number;
  swaps: number;
  passes: number;
}

export const BUBBLE_SORT_DEFAULT_VALUES = [37, 12, 29, 8, 44, 19, 3, 25] as const;
const BUBBLE_SORT_DEFAULT_ARRAY_VALUES = BUBBLE_SORT_DEFAULT_VALUES.join(", ");
const BUBBLE_SORT_DEFAULT_OPTIMIZE_EARLY_EXIT = true;

export const BUBBLE_SORT_DEFAULT_PARAMS: BubbleSortParams = {
  arrayValues: BUBBLE_SORT_DEFAULT_ARRAY_VALUES,
  optimizeEarlyExit: BUBBLE_SORT_DEFAULT_OPTIMIZE_EARLY_EXIT,
};

function parseArrayValues(rawArrayValues: RawParams["arrayValues"]): string {
  if (typeof rawArrayValues === "string" && rawArrayValues.trim().length > 0) {
    return rawArrayValues;
  }

  return BUBBLE_SORT_DEFAULT_ARRAY_VALUES;
}

function parseOptimizeEarlyExit(rawOptimizeEarlyExit: RawParams["optimizeEarlyExit"]): boolean {
  if (typeof rawOptimizeEarlyExit === "boolean") {
    return rawOptimizeEarlyExit;
  }

  if (typeof rawOptimizeEarlyExit === "number" && Number.isFinite(rawOptimizeEarlyExit)) {
    return rawOptimizeEarlyExit !== 0;
  }

  if (typeof rawOptimizeEarlyExit === "string") {
    const normalized = rawOptimizeEarlyExit.trim().toLowerCase();

    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }

    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return BUBBLE_SORT_DEFAULT_OPTIMIZE_EARLY_EXIT;
}

function parseNumericArray(valuesText: string): number[] {
  return valuesText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

export function normalizeBubbleSortParams(rawParams: RawParams): BubbleSortParams {
  return {
    arrayValues: parseArrayValues(rawParams.arrayValues),
    optimizeEarlyExit: parseOptimizeEarlyExit(rawParams.optimizeEarlyExit),
  };
}

export function normalizeBubbleSortInput(rawInput: unknown, params: BubbleSortParams): BubbleSortInput {
  const candidate =
    Array.isArray(rawInput) && rawInput.every((value) => typeof value === "number")
      ? rawInput
      : parseNumericArray(params.arrayValues);

  const values = [...candidate].filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return { values: [...BUBBLE_SORT_DEFAULT_VALUES] };
  }

  return { values };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomValues(count: number): number[] {
  return Array.from({ length: count }, () => getRandomInteger(-20, 99));
}

export function createRandomBubbleSortParams(): BubbleSortParams {
  const values = createRandomValues(getRandomInteger(7, 12));

  return {
    arrayValues: values.join(", "),
    optimizeEarlyExit: Math.random() >= 0.5,
  };
}

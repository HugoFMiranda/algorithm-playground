import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface CountingSortParams extends Record<string, ParamPrimitive> {
  arrayValues: string;
}

export interface CountingSortInput {
  values: number[];
  minValue: number;
  maxValue: number;
  rangeSize: number;
}

export interface CountingSortResult {
  sortedValues: number[];
  minValue: number;
  maxValue: number;
  rangeSize: number;
  countsLength: number;
  placements: number;
  writes: number;
}

export const COUNTING_SORT_DEFAULT_VALUES = [4, 2, 2, 8, 3, 3, 1, 5, 4, -1] as const;

export const COUNTING_SORT_DEFAULT_PARAMS: CountingSortParams = {
  arrayValues: COUNTING_SORT_DEFAULT_VALUES.join(", "),
};

function parseArrayValues(rawArrayValues: RawParams["arrayValues"]): string {
  if (typeof rawArrayValues === "string" && rawArrayValues.trim().length > 0) {
    return rawArrayValues;
  }

  return COUNTING_SORT_DEFAULT_PARAMS.arrayValues;
}

function parseNumericArray(valuesText: string): number[] {
  return valuesText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.trunc(value));
}

function getRange(values: number[]) {
  let minValue = values[0] as number;
  let maxValue = values[0] as number;

  for (const value of values) {
    if (value < minValue) {
      minValue = value;
    }
    if (value > maxValue) {
      maxValue = value;
    }
  }

  return {
    minValue,
    maxValue,
    rangeSize: maxValue - minValue + 1,
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomValues(count: number): number[] {
  return Array.from({ length: count }, () => getRandomInteger(-4, 12));
}

export function normalizeCountingSortParams(rawParams: RawParams): CountingSortParams {
  return {
    arrayValues: parseArrayValues(rawParams.arrayValues),
  };
}

export function normalizeCountingSortInput(
  rawInput: unknown,
  params: CountingSortParams,
): CountingSortInput {
  const candidate =
    Array.isArray(rawInput) && rawInput.every((value) => typeof value === "number")
      ? rawInput.map((value) => Math.trunc(value))
      : parseNumericArray(params.arrayValues);

  const values = [...candidate].filter((value) => Number.isFinite(value));
  const normalizedValues = values.length > 0 ? values : [...COUNTING_SORT_DEFAULT_VALUES];
  const { minValue, maxValue, rangeSize } = getRange(normalizedValues);

  return {
    values: normalizedValues,
    minValue,
    maxValue,
    rangeSize,
  };
}

export function createRandomCountingSortParams(): CountingSortParams {
  return {
    arrayValues: createRandomValues(getRandomInteger(7, 12)).join(", "),
  };
}

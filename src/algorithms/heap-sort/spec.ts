import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface HeapSortParams extends Record<string, ParamPrimitive> {
  arrayValues: string;
}

export interface HeapSortInput {
  values: number[];
}

export interface HeapSortResult {
  sortedValues: number[];
  comparisons: number;
  swaps: number;
  heapifyCalls: number;
  extractions: number;
}

export const HEAP_SORT_DEFAULT_VALUES = [41, 17, 33, 5, 12, 29, 8, 50] as const;
const HEAP_SORT_DEFAULT_ARRAY_VALUES = HEAP_SORT_DEFAULT_VALUES.join(", ");

export const HEAP_SORT_DEFAULT_PARAMS: HeapSortParams = {
  arrayValues: HEAP_SORT_DEFAULT_ARRAY_VALUES,
};

function parseArrayValues(rawArrayValues: RawParams["arrayValues"]): string {
  if (typeof rawArrayValues === "string" && rawArrayValues.trim().length > 0) {
    return rawArrayValues;
  }

  return HEAP_SORT_DEFAULT_ARRAY_VALUES;
}

function parseNumericArray(valuesText: string): number[] {
  return valuesText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

export function normalizeHeapSortParams(rawParams: RawParams): HeapSortParams {
  return {
    arrayValues: parseArrayValues(rawParams.arrayValues),
  };
}

export function normalizeHeapSortInput(rawInput: unknown, params: HeapSortParams): HeapSortInput {
  const candidate =
    Array.isArray(rawInput) && rawInput.every((value) => typeof value === "number")
      ? rawInput
      : parseNumericArray(params.arrayValues);

  const values = [...candidate].filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return { values: [...HEAP_SORT_DEFAULT_VALUES] };
  }

  return { values };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomValues(count: number): number[] {
  return Array.from({ length: count }, () => getRandomInteger(-20, 99));
}

export function createRandomHeapSortParams(): HeapSortParams {
  const values = createRandomValues(getRandomInteger(8, 14));

  return {
    arrayValues: values.join(", "),
  };
}

import type { ParamPrimitive, RawParams } from "@/types/engine";

export type QuickSortPivotStrategy = "last" | "middle";

export interface QuickSortParams extends Record<string, ParamPrimitive> {
  arrayValues: string;
  pivotStrategy: QuickSortPivotStrategy;
}

export interface QuickSortInput {
  values: number[];
}

export interface QuickSortResult {
  sortedValues: number[];
  comparisons: number;
  swaps: number;
  partitions: number;
  maxDepth: number;
}

export const QUICK_SORT_DEFAULT_VALUES = [29, 10, 14, 37, 13, 5, 22, 31] as const;
const QUICK_SORT_DEFAULT_ARRAY_VALUES = QUICK_SORT_DEFAULT_VALUES.join(", ");
const QUICK_SORT_DEFAULT_PIVOT_STRATEGY: QuickSortPivotStrategy = "last";

export const QUICK_SORT_DEFAULT_PARAMS: QuickSortParams = {
  arrayValues: QUICK_SORT_DEFAULT_ARRAY_VALUES,
  pivotStrategy: QUICK_SORT_DEFAULT_PIVOT_STRATEGY,
};

function parseArrayValues(rawArrayValues: RawParams["arrayValues"]): string {
  if (typeof rawArrayValues === "string" && rawArrayValues.trim().length > 0) {
    return rawArrayValues;
  }

  return QUICK_SORT_DEFAULT_ARRAY_VALUES;
}

function parsePivotStrategy(rawPivotStrategy: RawParams["pivotStrategy"]): QuickSortPivotStrategy {
  if (typeof rawPivotStrategy === "string") {
    const normalized = rawPivotStrategy.trim().toLowerCase();
    if (normalized === "last" || normalized === "middle") {
      return normalized;
    }
  }

  return QUICK_SORT_DEFAULT_PIVOT_STRATEGY;
}

function parseNumericArray(valuesText: string): number[] {
  return valuesText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

export function normalizeQuickSortParams(rawParams: RawParams): QuickSortParams {
  return {
    arrayValues: parseArrayValues(rawParams.arrayValues),
    pivotStrategy: parsePivotStrategy(rawParams.pivotStrategy),
  };
}

export function normalizeQuickSortInput(rawInput: unknown, params: QuickSortParams): QuickSortInput {
  const candidate =
    Array.isArray(rawInput) && rawInput.every((value) => typeof value === "number")
      ? rawInput
      : parseNumericArray(params.arrayValues);

  const values = [...candidate].filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return { values: [...QUICK_SORT_DEFAULT_VALUES] };
  }

  return { values };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomValues(count: number): number[] {
  return Array.from({ length: count }, () => getRandomInteger(-20, 99));
}

export function createRandomQuickSortParams(): QuickSortParams {
  const values = createRandomValues(getRandomInteger(8, 14));

  return {
    arrayValues: values.join(", "),
    pivotStrategy: Math.random() >= 0.5 ? "last" : "middle",
  };
}

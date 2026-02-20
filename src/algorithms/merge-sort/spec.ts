import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface MergeSortParams extends Record<string, ParamPrimitive> {
  arrayValues: string;
  preferLeftOnEqual: boolean;
}

export interface MergeSortInput {
  values: number[];
}

export interface MergeSortResult {
  sortedValues: number[];
  comparisons: number;
  writes: number;
  merges: number;
  maxDepth: number;
}

export const MERGE_SORT_DEFAULT_VALUES = [38, 12, 27, 9, 43, 3, 21, 15] as const;
const MERGE_SORT_DEFAULT_ARRAY_VALUES = MERGE_SORT_DEFAULT_VALUES.join(", ");
const MERGE_SORT_DEFAULT_PREFER_LEFT_ON_EQUAL = true;

export const MERGE_SORT_DEFAULT_PARAMS: MergeSortParams = {
  arrayValues: MERGE_SORT_DEFAULT_ARRAY_VALUES,
  preferLeftOnEqual: MERGE_SORT_DEFAULT_PREFER_LEFT_ON_EQUAL,
};

function parseArrayValues(rawArrayValues: RawParams["arrayValues"]): string {
  if (typeof rawArrayValues === "string" && rawArrayValues.trim().length > 0) {
    return rawArrayValues;
  }

  return MERGE_SORT_DEFAULT_ARRAY_VALUES;
}

function parsePreferLeftOnEqual(rawPreferLeftOnEqual: RawParams["preferLeftOnEqual"]): boolean {
  if (typeof rawPreferLeftOnEqual === "boolean") {
    return rawPreferLeftOnEqual;
  }

  if (typeof rawPreferLeftOnEqual === "number" && Number.isFinite(rawPreferLeftOnEqual)) {
    return rawPreferLeftOnEqual !== 0;
  }

  if (typeof rawPreferLeftOnEqual === "string") {
    const normalized = rawPreferLeftOnEqual.trim().toLowerCase();

    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }

    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return MERGE_SORT_DEFAULT_PREFER_LEFT_ON_EQUAL;
}

function parseNumericArray(valuesText: string): number[] {
  return valuesText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

export function normalizeMergeSortParams(rawParams: RawParams): MergeSortParams {
  return {
    arrayValues: parseArrayValues(rawParams.arrayValues),
    preferLeftOnEqual: parsePreferLeftOnEqual(rawParams.preferLeftOnEqual),
  };
}

export function normalizeMergeSortInput(rawInput: unknown, params: MergeSortParams): MergeSortInput {
  const candidate =
    Array.isArray(rawInput) && rawInput.every((value) => typeof value === "number")
      ? rawInput
      : parseNumericArray(params.arrayValues);

  const values = [...candidate].filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return { values: [...MERGE_SORT_DEFAULT_VALUES] };
  }

  return { values };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomValues(count: number): number[] {
  return Array.from({ length: count }, () => getRandomInteger(-20, 99));
}

export function createRandomMergeSortParams(): MergeSortParams {
  const values = createRandomValues(getRandomInteger(8, 14));

  return {
    arrayValues: values.join(", "),
    preferLeftOnEqual: Math.random() >= 0.5,
  };
}

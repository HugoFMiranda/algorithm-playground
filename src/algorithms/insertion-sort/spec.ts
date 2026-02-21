import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface InsertionSortParams extends Record<string, ParamPrimitive> {
  arrayValues: string;
  allowEarlyPlacement: boolean;
}

export interface InsertionSortInput {
  values: number[];
}

export interface InsertionSortResult {
  sortedValues: number[];
  comparisons: number;
  shifts: number;
  passes: number;
}

export const INSERTION_SORT_DEFAULT_VALUES = [22, 9, 31, 14, 6, 27, 18, 11] as const;
const INSERTION_SORT_DEFAULT_ARRAY_VALUES = INSERTION_SORT_DEFAULT_VALUES.join(", ");
const INSERTION_SORT_DEFAULT_ALLOW_EARLY_PLACEMENT = true;

export const INSERTION_SORT_DEFAULT_PARAMS: InsertionSortParams = {
  arrayValues: INSERTION_SORT_DEFAULT_ARRAY_VALUES,
  allowEarlyPlacement: INSERTION_SORT_DEFAULT_ALLOW_EARLY_PLACEMENT,
};

function parseArrayValues(rawArrayValues: RawParams["arrayValues"]): string {
  if (typeof rawArrayValues === "string" && rawArrayValues.trim().length > 0) {
    return rawArrayValues;
  }

  return INSERTION_SORT_DEFAULT_ARRAY_VALUES;
}

function parseAllowEarlyPlacement(rawAllowEarlyPlacement: RawParams["allowEarlyPlacement"]): boolean {
  if (typeof rawAllowEarlyPlacement === "boolean") {
    return rawAllowEarlyPlacement;
  }

  if (typeof rawAllowEarlyPlacement === "number" && Number.isFinite(rawAllowEarlyPlacement)) {
    return rawAllowEarlyPlacement !== 0;
  }

  if (typeof rawAllowEarlyPlacement === "string") {
    const normalized = rawAllowEarlyPlacement.trim().toLowerCase();

    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }

    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return INSERTION_SORT_DEFAULT_ALLOW_EARLY_PLACEMENT;
}

function parseNumericArray(valuesText: string): number[] {
  return valuesText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

export function normalizeInsertionSortParams(rawParams: RawParams): InsertionSortParams {
  return {
    arrayValues: parseArrayValues(rawParams.arrayValues),
    allowEarlyPlacement: parseAllowEarlyPlacement(rawParams.allowEarlyPlacement),
  };
}

export function normalizeInsertionSortInput(
  rawInput: unknown,
  params: InsertionSortParams,
): InsertionSortInput {
  const candidate =
    Array.isArray(rawInput) && rawInput.every((value) => typeof value === "number")
      ? rawInput
      : parseNumericArray(params.arrayValues);

  const values = [...candidate].filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return { values: [...INSERTION_SORT_DEFAULT_VALUES] };
  }

  return { values };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomValues(count: number): number[] {
  return Array.from({ length: count }, () => getRandomInteger(-20, 99));
}

export function createRandomInsertionSortParams(): InsertionSortParams {
  const values = createRandomValues(getRandomInteger(7, 12));

  return {
    arrayValues: values.join(", "),
    allowEarlyPlacement: Math.random() >= 0.5,
  };
}

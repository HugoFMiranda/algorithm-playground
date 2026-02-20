import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface SelectionSortParams extends Record<string, ParamPrimitive> {
  arrayValues: string;
  swapOnlyWhenNeeded: boolean;
}

export interface SelectionSortInput {
  values: number[];
}

export interface SelectionSortResult {
  sortedValues: number[];
  comparisons: number;
  swaps: number;
  passes: number;
}

export const SELECTION_SORT_DEFAULT_VALUES = [31, 14, 5, 23, 8, 17, 42, 9] as const;
const SELECTION_SORT_DEFAULT_ARRAY_VALUES = SELECTION_SORT_DEFAULT_VALUES.join(", ");
const SELECTION_SORT_DEFAULT_SWAP_ONLY_WHEN_NEEDED = true;

export const SELECTION_SORT_DEFAULT_PARAMS: SelectionSortParams = {
  arrayValues: SELECTION_SORT_DEFAULT_ARRAY_VALUES,
  swapOnlyWhenNeeded: SELECTION_SORT_DEFAULT_SWAP_ONLY_WHEN_NEEDED,
};

function parseArrayValues(rawArrayValues: RawParams["arrayValues"]): string {
  if (typeof rawArrayValues === "string" && rawArrayValues.trim().length > 0) {
    return rawArrayValues;
  }

  return SELECTION_SORT_DEFAULT_ARRAY_VALUES;
}

function parseSwapOnlyWhenNeeded(rawSwapOnlyWhenNeeded: RawParams["swapOnlyWhenNeeded"]): boolean {
  if (typeof rawSwapOnlyWhenNeeded === "boolean") {
    return rawSwapOnlyWhenNeeded;
  }

  if (typeof rawSwapOnlyWhenNeeded === "number" && Number.isFinite(rawSwapOnlyWhenNeeded)) {
    return rawSwapOnlyWhenNeeded !== 0;
  }

  if (typeof rawSwapOnlyWhenNeeded === "string") {
    const normalized = rawSwapOnlyWhenNeeded.trim().toLowerCase();

    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }

    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return SELECTION_SORT_DEFAULT_SWAP_ONLY_WHEN_NEEDED;
}

function parseNumericArray(valuesText: string): number[] {
  return valuesText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

export function normalizeSelectionSortParams(rawParams: RawParams): SelectionSortParams {
  return {
    arrayValues: parseArrayValues(rawParams.arrayValues),
    swapOnlyWhenNeeded: parseSwapOnlyWhenNeeded(rawParams.swapOnlyWhenNeeded),
  };
}

export function normalizeSelectionSortInput(
  rawInput: unknown,
  params: SelectionSortParams,
): SelectionSortInput {
  const candidate =
    Array.isArray(rawInput) && rawInput.every((value) => typeof value === "number")
      ? rawInput
      : parseNumericArray(params.arrayValues);

  const values = [...candidate].filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return { values: [...SELECTION_SORT_DEFAULT_VALUES] };
  }

  return { values };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomValues(count: number): number[] {
  return Array.from({ length: count }, () => getRandomInteger(-20, 99));
}

export function createRandomSelectionSortParams(): SelectionSortParams {
  const values = createRandomValues(getRandomInteger(7, 12));

  return {
    arrayValues: values.join(", "),
    swapOnlyWhenNeeded: Math.random() >= 0.5,
  };
}

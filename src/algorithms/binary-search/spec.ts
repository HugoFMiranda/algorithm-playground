import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface BinarySearchParams extends Record<string, ParamPrimitive> {
  arrayValues: string;
  target: number;
}

export interface BinarySearchInput {
  values: number[];
}

export interface BinarySearchResult {
  found: boolean;
  index: number;
  iterations: number;
}

export const BINARY_SEARCH_DEFAULT_VALUES = [
  2, 5, 8, 12, 17, 21, 29, 34, 40, 47, 53, 61, 72, 88, 95,
] as const;
export const BINARY_SEARCH_DEFAULT_TARGET = 72;
const BINARY_SEARCH_DEFAULT_ARRAY_VALUES = BINARY_SEARCH_DEFAULT_VALUES.join(", ");

export const BINARY_SEARCH_DEFAULT_PARAMS: BinarySearchParams = {
  arrayValues: BINARY_SEARCH_DEFAULT_ARRAY_VALUES,
  target: BINARY_SEARCH_DEFAULT_TARGET,
};

function parseTarget(rawTarget: RawParams["target"]): number {
  if (typeof rawTarget === "number" && Number.isFinite(rawTarget)) {
    return rawTarget;
  }

  if (typeof rawTarget === "string") {
    const parsed = Number(rawTarget);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return BINARY_SEARCH_DEFAULT_TARGET;
}

function parseArrayValues(rawArrayValues: RawParams["arrayValues"]): string {
  if (typeof rawArrayValues === "string" && rawArrayValues.trim().length > 0) {
    return rawArrayValues;
  }

  return BINARY_SEARCH_DEFAULT_ARRAY_VALUES;
}

function parseNumericArray(valuesText: string): number[] {
  return valuesText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));
}

export function normalizeBinarySearchParams(rawParams: RawParams): BinarySearchParams {
  return {
    arrayValues: parseArrayValues(rawParams.arrayValues),
    target: parseTarget(rawParams.target),
  };
}

export function normalizeBinarySearchInput(
  rawInput: unknown,
  params: BinarySearchParams,
): BinarySearchInput {
  const candidate =
    Array.isArray(rawInput) && rawInput.every((value) => typeof value === "number")
      ? rawInput
      : parseNumericArray(params.arrayValues);

  const values = [...candidate]
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);

  if (values.length === 0) {
    return { values: [...BINARY_SEARCH_DEFAULT_VALUES] };
  }

  return { values };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomUniqueValues(count: number): number[] {
  const uniqueValues = new Set<number>();

  while (uniqueValues.size < count) {
    uniqueValues.add(getRandomInteger(-15, 140));
  }

  return [...uniqueValues].sort((left, right) => left - right);
}

export function createRandomBinarySearchParams(): BinarySearchParams {
  const values = createRandomUniqueValues(getRandomInteger(12, 18));
  const midpoint = Math.floor(values.length / 2);
  const nonMidCandidates = values.filter((_, index) => Math.abs(index - midpoint) > 1);
  const targetPool = nonMidCandidates.length > 0 ? nonMidCandidates : values;
  const target = targetPool[getRandomInteger(0, targetPool.length - 1)];

  return {
    arrayValues: values.join(", "),
    target,
  };
}

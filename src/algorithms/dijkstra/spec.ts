import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface DijkstraParams extends Record<string, ParamPrimitive> {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: string;
  heavyCells: string;
  allowDiagonal: boolean;
  weightSeed: number;
}

export interface DijkstraInput {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: number[];
  heavyCells: number[];
  allowDiagonal: boolean;
  weightSeed: number;
  weights: number[];
}

export interface DijkstraResult {
  found: boolean;
  distance: number;
  visitedCount: number;
  relaxations: number;
  pathCells: number[];
}

const DIJKSTRA_DEFAULT_ROWS = 6;
const DIJKSTRA_DEFAULT_COLS = 8;
const DIJKSTRA_DEFAULT_START_CELL = 0;
const DIJKSTRA_DEFAULT_TARGET_CELL = 47;
const DIJKSTRA_DEFAULT_BLOCKED_CELLS = "10, 11, 19, 27, 35";
const DIJKSTRA_DEFAULT_HEAVY_CELLS = "14, 15, 22, 23, 30, 31";
const DIJKSTRA_DEFAULT_ALLOW_DIAGONAL = false;
const DIJKSTRA_DEFAULT_WEIGHT_SEED = 3;

export const DIJKSTRA_DEFAULT_PARAMS: DijkstraParams = {
  rows: DIJKSTRA_DEFAULT_ROWS,
  cols: DIJKSTRA_DEFAULT_COLS,
  startCell: DIJKSTRA_DEFAULT_START_CELL,
  targetCell: DIJKSTRA_DEFAULT_TARGET_CELL,
  blockedCells: DIJKSTRA_DEFAULT_BLOCKED_CELLS,
  heavyCells: DIJKSTRA_DEFAULT_HEAVY_CELLS,
  allowDiagonal: DIJKSTRA_DEFAULT_ALLOW_DIAGONAL,
  weightSeed: DIJKSTRA_DEFAULT_WEIGHT_SEED,
};

function parseInteger(
  rawValue: RawParams[string],
  fallback: number,
  minInclusive: number,
  maxInclusive: number,
): number {
  const parsed =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string"
        ? Number(rawValue)
        : fallback;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(minInclusive, Math.min(maxInclusive, Math.floor(parsed)));
}

function parseBoolean(rawValue: RawParams[string], fallback: boolean): boolean {
  if (typeof rawValue === "boolean") {
    return rawValue;
  }

  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return rawValue !== 0;
  }

  if (typeof rawValue === "string") {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return fallback;
}

function parseCellList(rawCells: RawParams[string], fallback: string): string {
  if (typeof rawCells === "string" && rawCells.trim().length > 0) {
    return rawCells;
  }

  return fallback;
}

function parseCellIndices(cellsText: string, cellCount: number): number[] {
  const cells = cellsText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.floor(value))
    .filter((value) => value >= 0 && value < cellCount);

  return [...new Set(cells)].sort((left, right) => left - right);
}

function createWeights(cellCount: number, weightSeed: number, heavyCells: Set<number>): number[] {
  return Array.from({ length: cellCount }, (_, cell) => {
    const base = 1 + ((cell * 7 + weightSeed * 11) % 9);
    const adjusted = heavyCells.has(cell) ? base + 4 : base;
    return Math.max(1, Math.min(adjusted, 15));
  });
}

export function normalizeDijkstraParams(rawParams: RawParams): DijkstraParams {
  const rows = parseInteger(rawParams.rows, DIJKSTRA_DEFAULT_ROWS, 3, 12);
  const cols = parseInteger(rawParams.cols, DIJKSTRA_DEFAULT_COLS, 3, 14);
  const cellCount = rows * cols;
  const startCell = parseInteger(
    rawParams.startCell,
    DIJKSTRA_DEFAULT_START_CELL,
    0,
    Math.max(0, cellCount - 1),
  );
  const targetCell = parseInteger(
    rawParams.targetCell,
    Math.min(DIJKSTRA_DEFAULT_TARGET_CELL, Math.max(0, cellCount - 1)),
    0,
    Math.max(0, cellCount - 1),
  );

  return {
    rows,
    cols,
    startCell,
    targetCell,
    blockedCells: parseCellList(rawParams.blockedCells, DIJKSTRA_DEFAULT_BLOCKED_CELLS),
    heavyCells: parseCellList(rawParams.heavyCells, DIJKSTRA_DEFAULT_HEAVY_CELLS),
    allowDiagonal: parseBoolean(rawParams.allowDiagonal, DIJKSTRA_DEFAULT_ALLOW_DIAGONAL),
    weightSeed: parseInteger(rawParams.weightSeed, DIJKSTRA_DEFAULT_WEIGHT_SEED, 0, 999),
  };
}

export function normalizeDijkstraInput(rawInput: unknown, params: DijkstraParams): DijkstraInput {
  const cellCount = params.rows * params.cols;
  const blockedCells = parseCellIndices(params.blockedCells, cellCount).filter(
    (cell) => cell !== params.startCell && cell !== params.targetCell,
  );
  const heavyCells = parseCellIndices(params.heavyCells, cellCount).filter(
    (cell) => cell !== params.startCell && cell !== params.targetCell,
  );

  if (
    typeof rawInput === "object" &&
    rawInput !== null &&
    "weights" in rawInput &&
    Array.isArray(rawInput.weights) &&
    rawInput.weights.every((value) => typeof value === "number")
  ) {
    const inputWeights = rawInput.weights
      .slice(0, cellCount)
      .map((value) => Math.max(1, Math.min(Math.floor(value), 15)));
    const weights =
      inputWeights.length === cellCount
        ? inputWeights
        : createWeights(cellCount, params.weightSeed, new Set(heavyCells));

    return {
      rows: params.rows,
      cols: params.cols,
      startCell: params.startCell,
      targetCell: params.targetCell,
      blockedCells,
      heavyCells,
      allowDiagonal: params.allowDiagonal,
      weightSeed: params.weightSeed,
      weights,
    };
  }

  return {
    rows: params.rows,
    cols: params.cols,
    startCell: params.startCell,
    targetCell: params.targetCell,
    blockedCells,
    heavyCells,
    allowDiagonal: params.allowDiagonal,
    weightSeed: params.weightSeed,
    weights: createWeights(cellCount, params.weightSeed, new Set(heavyCells)),
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

export function createRandomDijkstraParams(): DijkstraParams {
  const rows = getRandomInteger(5, 8);
  const cols = getRandomInteger(6, 10);
  const cellCount = rows * cols;
  const startCell = getRandomInteger(0, Math.max(0, Math.floor(cellCount / 3)));
  let targetCell = getRandomInteger(Math.floor((cellCount * 2) / 3), Math.max(0, cellCount - 1));
  if (targetCell === startCell) {
    targetCell = Math.max(0, cellCount - 1);
  }

  const blocked = new Set<number>();
  const blockedTarget = Math.floor(cellCount * 0.15);
  while (blocked.size < blockedTarget) {
    const candidate = getRandomInteger(0, Math.max(0, cellCount - 1));
    if (candidate === startCell || candidate === targetCell) {
      continue;
    }
    blocked.add(candidate);
  }

  const heavy = new Set<number>();
  const heavyTarget = Math.floor(cellCount * 0.2);
  while (heavy.size < heavyTarget) {
    const candidate = getRandomInteger(0, Math.max(0, cellCount - 1));
    if (candidate === startCell || candidate === targetCell || blocked.has(candidate)) {
      continue;
    }
    heavy.add(candidate);
  }

  return {
    rows,
    cols,
    startCell,
    targetCell,
    blockedCells: [...blocked].sort((left, right) => left - right).join(", "),
    heavyCells: [...heavy].sort((left, right) => left - right).join(", "),
    allowDiagonal: Math.random() >= 0.5,
    weightSeed: getRandomInteger(0, 50),
  };
}

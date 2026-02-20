import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface BfsParams extends Record<string, ParamPrimitive> {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: string;
  allowDiagonal: boolean;
}

export interface BfsInput {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: number[];
  allowDiagonal: boolean;
}

export interface BfsResult {
  found: boolean;
  distance: number;
  visitedCount: number;
  enqueuedCount: number;
  layers: number;
  pathCells: number[];
}

const BFS_DEFAULT_ROWS = 6;
const BFS_DEFAULT_COLS = 8;
const BFS_DEFAULT_START_CELL = 0;
const BFS_DEFAULT_TARGET_CELL = 47;
const BFS_DEFAULT_BLOCKED_CELLS = "10, 11, 12, 20, 28, 36, 37";
const BFS_DEFAULT_ALLOW_DIAGONAL = false;

export const BFS_DEFAULT_PARAMS: BfsParams = {
  rows: BFS_DEFAULT_ROWS,
  cols: BFS_DEFAULT_COLS,
  startCell: BFS_DEFAULT_START_CELL,
  targetCell: BFS_DEFAULT_TARGET_CELL,
  blockedCells: BFS_DEFAULT_BLOCKED_CELLS,
  allowDiagonal: BFS_DEFAULT_ALLOW_DIAGONAL,
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

function parseBlockedCells(rawBlockedCells: RawParams["blockedCells"]): string {
  if (typeof rawBlockedCells === "string" && rawBlockedCells.trim().length > 0) {
    return rawBlockedCells;
  }

  return BFS_DEFAULT_BLOCKED_CELLS;
}

function parseBlockedCellIndices(blockedCellsText: string, cellCount: number): number[] {
  const blocked = blockedCellsText
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.floor(value))
    .filter((value) => value >= 0 && value < cellCount);

  return [...new Set(blocked)].sort((left, right) => left - right);
}

export function normalizeBfsParams(rawParams: RawParams): BfsParams {
  const rows = parseInteger(rawParams.rows, BFS_DEFAULT_ROWS, 3, 12);
  const cols = parseInteger(rawParams.cols, BFS_DEFAULT_COLS, 3, 14);
  const cellCount = rows * cols;
  const startCell = parseInteger(rawParams.startCell, BFS_DEFAULT_START_CELL, 0, Math.max(0, cellCount - 1));
  const targetCell = parseInteger(
    rawParams.targetCell,
    Math.min(BFS_DEFAULT_TARGET_CELL, Math.max(0, cellCount - 1)),
    0,
    Math.max(0, cellCount - 1),
  );

  return {
    rows,
    cols,
    startCell,
    targetCell,
    blockedCells: parseBlockedCells(rawParams.blockedCells),
    allowDiagonal: parseBoolean(rawParams.allowDiagonal, BFS_DEFAULT_ALLOW_DIAGONAL),
  };
}

export function normalizeBfsInput(rawInput: unknown, params: BfsParams): BfsInput {
  const cellCount = params.rows * params.cols;

  if (
    typeof rawInput === "object" &&
    rawInput !== null &&
    "rows" in rawInput &&
    "cols" in rawInput &&
    "startCell" in rawInput &&
    "targetCell" in rawInput &&
    "blockedCells" in rawInput &&
    Array.isArray(rawInput.blockedCells) &&
    rawInput.blockedCells.every((cell) => typeof cell === "number")
  ) {
    return {
      rows: params.rows,
      cols: params.cols,
      startCell: params.startCell,
      targetCell: params.targetCell,
      blockedCells: parseBlockedCellIndices(rawInput.blockedCells.join(", "), cellCount).filter(
        (cell) => cell !== params.startCell && cell !== params.targetCell,
      ),
      allowDiagonal: params.allowDiagonal,
    };
  }

  return {
    rows: params.rows,
    cols: params.cols,
    startCell: params.startCell,
    targetCell: params.targetCell,
    blockedCells: parseBlockedCellIndices(params.blockedCells, cellCount).filter(
      (cell) => cell !== params.startCell && cell !== params.targetCell,
    ),
    allowDiagonal: params.allowDiagonal,
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

export function createRandomBfsParams(): BfsParams {
  const rows = getRandomInteger(5, 8);
  const cols = getRandomInteger(6, 10);
  const cellCount = rows * cols;
  const startCell = getRandomInteger(0, Math.max(0, Math.floor(cellCount / 3)));
  let targetCell = getRandomInteger(Math.floor((cellCount * 2) / 3), Math.max(0, cellCount - 1));

  if (targetCell === startCell) {
    targetCell = Math.max(0, cellCount - 1);
  }

  const blocked = new Set<number>();
  const blockedTarget = Math.floor(cellCount * 0.18);
  while (blocked.size < blockedTarget) {
    const candidate = getRandomInteger(0, Math.max(0, cellCount - 1));
    if (candidate === startCell || candidate === targetCell) {
      continue;
    }
    blocked.add(candidate);
  }

  return {
    rows,
    cols,
    startCell,
    targetCell,
    blockedCells: [...blocked].sort((left, right) => left - right).join(", "),
    allowDiagonal: Math.random() >= 0.5,
  };
}

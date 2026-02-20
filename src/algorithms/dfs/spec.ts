import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface DfsParams extends Record<string, ParamPrimitive> {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: string;
  allowDiagonal: boolean;
  preferClockwise: boolean;
}

export interface DfsInput {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: number[];
  allowDiagonal: boolean;
  preferClockwise: boolean;
}

export interface DfsResult {
  found: boolean;
  depth: number;
  visitedCount: number;
  pushedCount: number;
  backtracks: number;
  pathCells: number[];
}

const DFS_DEFAULT_ROWS = 6;
const DFS_DEFAULT_COLS = 8;
const DFS_DEFAULT_START_CELL = 0;
const DFS_DEFAULT_TARGET_CELL = 47;
const DFS_DEFAULT_BLOCKED_CELLS = "9, 10, 18, 26, 27, 35, 36";
const DFS_DEFAULT_ALLOW_DIAGONAL = false;
const DFS_DEFAULT_PREFER_CLOCKWISE = true;

export const DFS_DEFAULT_PARAMS: DfsParams = {
  rows: DFS_DEFAULT_ROWS,
  cols: DFS_DEFAULT_COLS,
  startCell: DFS_DEFAULT_START_CELL,
  targetCell: DFS_DEFAULT_TARGET_CELL,
  blockedCells: DFS_DEFAULT_BLOCKED_CELLS,
  allowDiagonal: DFS_DEFAULT_ALLOW_DIAGONAL,
  preferClockwise: DFS_DEFAULT_PREFER_CLOCKWISE,
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

  return DFS_DEFAULT_BLOCKED_CELLS;
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

export function normalizeDfsParams(rawParams: RawParams): DfsParams {
  const rows = parseInteger(rawParams.rows, DFS_DEFAULT_ROWS, 3, 12);
  const cols = parseInteger(rawParams.cols, DFS_DEFAULT_COLS, 3, 14);
  const cellCount = rows * cols;
  const startCell = parseInteger(rawParams.startCell, DFS_DEFAULT_START_CELL, 0, Math.max(0, cellCount - 1));
  const targetCell = parseInteger(
    rawParams.targetCell,
    Math.min(DFS_DEFAULT_TARGET_CELL, Math.max(0, cellCount - 1)),
    0,
    Math.max(0, cellCount - 1),
  );

  return {
    rows,
    cols,
    startCell,
    targetCell,
    blockedCells: parseBlockedCells(rawParams.blockedCells),
    allowDiagonal: parseBoolean(rawParams.allowDiagonal, DFS_DEFAULT_ALLOW_DIAGONAL),
    preferClockwise: parseBoolean(rawParams.preferClockwise, DFS_DEFAULT_PREFER_CLOCKWISE),
  };
}

export function normalizeDfsInput(rawInput: unknown, params: DfsParams): DfsInput {
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
      preferClockwise: params.preferClockwise,
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
    preferClockwise: params.preferClockwise,
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

export function createRandomDfsParams(): DfsParams {
  const rows = getRandomInteger(5, 8);
  const cols = getRandomInteger(6, 10);
  const cellCount = rows * cols;
  const startCell = getRandomInteger(0, Math.max(0, Math.floor(cellCount / 3)));
  let targetCell = getRandomInteger(Math.floor((cellCount * 2) / 3), Math.max(0, cellCount - 1));

  if (targetCell === startCell) {
    targetCell = Math.max(0, cellCount - 1);
  }

  const blocked = new Set<number>();
  const blockedTarget = Math.floor(cellCount * 0.2);
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
    preferClockwise: Math.random() >= 0.5,
  };
}

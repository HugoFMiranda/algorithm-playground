import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface BidirectionalBfsParams extends Record<string, ParamPrimitive> {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: string;
  allowDiagonal: boolean;
  expandSmallerFrontier: boolean;
  preferForwardOnTie: boolean;
}

export interface BidirectionalBfsInput {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: number[];
  allowDiagonal: boolean;
  expandSmallerFrontier: boolean;
  preferForwardOnTie: boolean;
}

export interface BidirectionalBfsResult {
  found: boolean;
  distance: number;
  visitedCount: number;
  forwardVisitedCount: number;
  backwardVisitedCount: number;
  turns: number;
  meetingCell: number;
  pathCells: number[];
}

const BIDIRECTIONAL_BFS_DEFAULT_ROWS = 6;
const BIDIRECTIONAL_BFS_DEFAULT_COLS = 8;
const BIDIRECTIONAL_BFS_DEFAULT_START_CELL = 0;
const BIDIRECTIONAL_BFS_DEFAULT_TARGET_CELL = 47;
const BIDIRECTIONAL_BFS_DEFAULT_BLOCKED_CELLS = "10, 11, 18, 19, 20, 28, 35, 36";
const BIDIRECTIONAL_BFS_DEFAULT_ALLOW_DIAGONAL = false;
const BIDIRECTIONAL_BFS_DEFAULT_EXPAND_SMALLER_FRONTIER = true;
const BIDIRECTIONAL_BFS_DEFAULT_PREFER_FORWARD_ON_TIE = true;

export const BIDIRECTIONAL_BFS_DEFAULT_PARAMS: BidirectionalBfsParams = {
  rows: BIDIRECTIONAL_BFS_DEFAULT_ROWS,
  cols: BIDIRECTIONAL_BFS_DEFAULT_COLS,
  startCell: BIDIRECTIONAL_BFS_DEFAULT_START_CELL,
  targetCell: BIDIRECTIONAL_BFS_DEFAULT_TARGET_CELL,
  blockedCells: BIDIRECTIONAL_BFS_DEFAULT_BLOCKED_CELLS,
  allowDiagonal: BIDIRECTIONAL_BFS_DEFAULT_ALLOW_DIAGONAL,
  expandSmallerFrontier: BIDIRECTIONAL_BFS_DEFAULT_EXPAND_SMALLER_FRONTIER,
  preferForwardOnTie: BIDIRECTIONAL_BFS_DEFAULT_PREFER_FORWARD_ON_TIE,
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

  return BIDIRECTIONAL_BFS_DEFAULT_BLOCKED_CELLS;
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

export function normalizeBidirectionalBfsParams(rawParams: RawParams): BidirectionalBfsParams {
  const rows = parseInteger(rawParams.rows, BIDIRECTIONAL_BFS_DEFAULT_ROWS, 3, 12);
  const cols = parseInteger(rawParams.cols, BIDIRECTIONAL_BFS_DEFAULT_COLS, 3, 14);
  const cellCount = rows * cols;
  const startCell = parseInteger(
    rawParams.startCell,
    BIDIRECTIONAL_BFS_DEFAULT_START_CELL,
    0,
    Math.max(0, cellCount - 1),
  );
  const targetCell = parseInteger(
    rawParams.targetCell,
    Math.min(BIDIRECTIONAL_BFS_DEFAULT_TARGET_CELL, Math.max(0, cellCount - 1)),
    0,
    Math.max(0, cellCount - 1),
  );

  return {
    rows,
    cols,
    startCell,
    targetCell,
    blockedCells: parseBlockedCells(rawParams.blockedCells),
    allowDiagonal: parseBoolean(rawParams.allowDiagonal, BIDIRECTIONAL_BFS_DEFAULT_ALLOW_DIAGONAL),
    expandSmallerFrontier: parseBoolean(
      rawParams.expandSmallerFrontier,
      BIDIRECTIONAL_BFS_DEFAULT_EXPAND_SMALLER_FRONTIER,
    ),
    preferForwardOnTie: parseBoolean(
      rawParams.preferForwardOnTie,
      BIDIRECTIONAL_BFS_DEFAULT_PREFER_FORWARD_ON_TIE,
    ),
  };
}

export function normalizeBidirectionalBfsInput(
  rawInput: unknown,
  params: BidirectionalBfsParams,
): BidirectionalBfsInput {
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
      expandSmallerFrontier: params.expandSmallerFrontier,
      preferForwardOnTie: params.preferForwardOnTie,
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
    expandSmallerFrontier: params.expandSmallerFrontier,
    preferForwardOnTie: params.preferForwardOnTie,
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

export function createRandomBidirectionalBfsParams(): BidirectionalBfsParams {
  const rows = getRandomInteger(5, 8);
  const cols = getRandomInteger(6, 10);
  const cellCount = rows * cols;
  const startCell = getRandomInteger(0, Math.max(0, Math.floor(cellCount / 4)));
  let targetCell = getRandomInteger(Math.floor((cellCount * 3) / 5), Math.max(0, cellCount - 1));

  if (targetCell === startCell) {
    targetCell = Math.max(0, cellCount - 1);
  }

  const blocked = new Set<number>();
  const blockedTarget = Math.floor(cellCount * 0.16);
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
    expandSmallerFrontier: Math.random() >= 0.35,
    preferForwardOnTie: Math.random() >= 0.5,
  };
}

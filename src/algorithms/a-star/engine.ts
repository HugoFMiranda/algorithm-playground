import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, SearchStepEvent } from "@/types/engine";

import {
  type AStarInput,
  type AStarParams,
  type AStarResult,
  normalizeAStarInput,
  normalizeAStarParams,
} from "@/algorithms/a-star/spec";

type OpenSelectEvent = SearchStepEvent<
  "open-select",
  { cell: number; g: number; h: number; f: number; openSize: number; closedCount: number }
>;
type InspectNeighborEvent = SearchStepEvent<
  "inspect-neighbor",
  {
    from: number;
    to: number;
    edgeWeight: number;
    candidateG: number;
    previousG: number;
    status: "blocked" | "closed" | "skip" | "update";
  }
>;
type ScoreUpdateEvent = SearchStepEvent<
  "score-update",
  { cell: number; previousG: number; nextG: number; h: number; f: number; parent: number }
>;
type FoundEvent = SearchStepEvent<"found", { cell: number; distance: number; pathLength: number; expandedCount: number }>;
type NotFoundEvent = SearchStepEvent<"not-found", { expandedCount: number; relaxations: number }>;
type CompleteEvent = SearchStepEvent<
  "complete",
  { found: boolean; distance: number; expandedCount: number; relaxations: number; pathLength: number }
>;

export type AStarStepEvent =
  | OpenSelectEvent
  | InspectNeighborEvent
  | ScoreUpdateEvent
  | FoundEvent
  | NotFoundEvent
  | CompleteEvent;

function createEvent<TEvent extends AStarStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `a-star-${index}`,
    index,
    family: "search",
    type,
    payload,
  } as TEvent;
}

interface CellPoint {
  row: number;
  col: number;
}

function toPoint(cell: number, cols: number): CellPoint {
  return {
    row: Math.floor(cell / cols),
    col: cell % cols,
  };
}

function toCell(row: number, col: number, cols: number): number {
  return row * cols + col;
}

function getNeighbors(cell: number, rows: number, cols: number, allowDiagonal: boolean): number[] {
  const { row, col } = toPoint(cell, cols);
  const deltas: Array<[number, number]> = allowDiagonal
    ? [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 1],
        [1, 1],
        [1, -1],
        [-1, -1],
      ]
    : [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
      ];

  const neighbors: number[] = [];
  for (const [rowDelta, colDelta] of deltas) {
    const nextRow = row + rowDelta;
    const nextCol = col + colDelta;
    if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
      continue;
    }
    neighbors.push(toCell(nextRow, nextCol, cols));
  }

  return neighbors;
}

function buildPath(parent: number[], startCell: number, targetCell: number): number[] {
  if (targetCell === startCell) {
    return [startCell];
  }

  if (parent[targetCell] === -1) {
    return [];
  }

  const path: number[] = [];
  let cursor = targetCell;

  while (cursor !== -1) {
    path.push(cursor);
    if (cursor === startCell) {
      break;
    }
    cursor = parent[cursor];
  }

  return path.reverse();
}

function heuristicDistance(from: number, to: number, cols: number, allowDiagonal: boolean): number {
  const fromPoint = toPoint(from, cols);
  const targetPoint = toPoint(to, cols);
  const rowDiff = Math.abs(fromPoint.row - targetPoint.row);
  const colDiff = Math.abs(fromPoint.col - targetPoint.col);

  if (allowDiagonal) {
    return Math.max(rowDiff, colDiff);
  }

  return rowDiff + colDiff;
}

function getOpenMinCell(openSet: Set<number>, fScores: number[], gScores: number[]): number | null {
  let candidate: number | null = null;
  let candidateF = Number.POSITIVE_INFINITY;
  let candidateG = Number.POSITIVE_INFINITY;

  for (const cell of openSet) {
    const f = fScores[cell];
    const g = gScores[cell];
    if (
      f < candidateF ||
      (f === candidateF && g < candidateG) ||
      (f === candidateF && g === candidateG && (candidate === null || cell < candidate))
    ) {
      candidate = cell;
      candidateF = f;
      candidateG = g;
    }
  }

  return candidate;
}

export const aStarEngine: AlgorithmEngine<AStarInput, AStarParams, AStarStepEvent, AStarResult> = {
  normalizeParams: normalizeAStarParams,
  normalizeInput: normalizeAStarInput,
  generate: (input) => {
    const steps: AStarStepEvent[] = [];
    let nextIndex = 0;

    const cellCount = input.rows * input.cols;
    const blocked = new Set<number>(input.blockedCells);
    const openSet = new Set<number>();
    const closed = new Array<boolean>(cellCount).fill(false);
    const parent = new Array<number>(cellCount).fill(-1);
    const gScores = new Array<number>(cellCount).fill(Number.POSITIVE_INFINITY);
    const hScores = new Array<number>(cellCount).fill(0);
    const fScores = new Array<number>(cellCount).fill(Number.POSITIVE_INFINITY);

    for (let cell = 0; cell < cellCount; cell += 1) {
      hScores[cell] =
        heuristicDistance(cell, input.targetCell, input.cols, input.allowDiagonal) * input.heuristicWeight;
    }

    gScores[input.startCell] = 0;
    fScores[input.startCell] = hScores[input.startCell];
    openSet.add(input.startCell);

    let expandedCount = 0;
    let relaxations = 0;
    let found = false;

    while (openSet.size > 0) {
      const currentCell = getOpenMinCell(openSet, fScores, gScores);
      if (currentCell === null) {
        break;
      }

      openSet.delete(currentCell);
      if (closed[currentCell]) {
        continue;
      }

      closed[currentCell] = true;
      expandedCount += 1;

      steps.push(
        createEvent(nextIndex, "open-select", {
          cell: currentCell,
          g: gScores[currentCell],
          h: hScores[currentCell],
          f: fScores[currentCell],
          openSize: openSet.size,
          closedCount: expandedCount,
        }),
      );
      nextIndex += 1;

      if (currentCell === input.targetCell) {
        found = true;
        const pathCells = buildPath(parent, input.startCell, input.targetCell);
        steps.push(
          createEvent(nextIndex, "found", {
            cell: currentCell,
            distance: gScores[currentCell],
            pathLength: pathCells.length,
            expandedCount,
          }),
        );
        nextIndex += 1;
        break;
      }

      const neighbors = getNeighbors(currentCell, input.rows, input.cols, input.allowDiagonal);
      for (const neighbor of neighbors) {
        const edgeWeight = input.weights[neighbor];
        const candidateG = gScores[currentCell] + edgeWeight;

        if (blocked.has(neighbor)) {
          steps.push(
            createEvent(nextIndex, "inspect-neighbor", {
              from: currentCell,
              to: neighbor,
              edgeWeight,
              candidateG,
              previousG: -1,
              status: "blocked",
            }),
          );
          nextIndex += 1;
          continue;
        }

        if (closed[neighbor]) {
          steps.push(
            createEvent(nextIndex, "inspect-neighbor", {
              from: currentCell,
              to: neighbor,
              edgeWeight,
              candidateG,
              previousG: Number.isFinite(gScores[neighbor]) ? gScores[neighbor] : -1,
              status: "closed",
            }),
          );
          nextIndex += 1;
          continue;
        }

        const previousG = gScores[neighbor];
        const improved = candidateG < previousG;

        steps.push(
          createEvent(nextIndex, "inspect-neighbor", {
            from: currentCell,
            to: neighbor,
            edgeWeight,
            candidateG,
            previousG: Number.isFinite(previousG) ? previousG : -1,
            status: improved ? "update" : "skip",
          }),
        );
        nextIndex += 1;

        if (!improved) {
          continue;
        }

        gScores[neighbor] = candidateG;
        fScores[neighbor] = candidateG + hScores[neighbor];
        parent[neighbor] = currentCell;
        openSet.add(neighbor);
        relaxations += 1;

        steps.push(
          createEvent(nextIndex, "score-update", {
            cell: neighbor,
            previousG: Number.isFinite(previousG) ? previousG : -1,
            nextG: candidateG,
            h: hScores[neighbor],
            f: fScores[neighbor],
            parent: currentCell,
          }),
        );
        nextIndex += 1;
      }
    }

    const pathCells = found ? buildPath(parent, input.startCell, input.targetCell) : [];
    const finalDistance = found ? gScores[input.targetCell] : -1;

    if (!found) {
      steps.push(
        createEvent(nextIndex, "not-found", {
          expandedCount,
          relaxations,
        }),
      );
      nextIndex += 1;
    }

    steps.push(
      createEvent(nextIndex, "complete", {
        found,
        distance: finalDistance,
        expandedCount,
        relaxations,
        pathLength: pathCells.length,
      }),
    );

    return {
      steps,
      result: {
        found,
        distance: finalDistance,
        expandedCount,
        relaxations,
        pathCells,
      },
    };
  },
};

export function createAStarRun(
  rawParams: RawParams,
): AlgorithmRunOutput<AStarInput, AStarParams, AStarStepEvent, AStarResult> {
  const normalizedParams = aStarEngine.normalizeParams(rawParams);
  const input = aStarEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = aStarEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, SearchStepEvent } from "@/types/engine";

import {
  type DijkstraInput,
  type DijkstraParams,
  type DijkstraResult,
  normalizeDijkstraInput,
  normalizeDijkstraParams,
} from "@/algorithms/dijkstra/spec";

type ExtractMinEvent = SearchStepEvent<
  "extract-min",
  { cell: number; distance: number; frontierSize: number; visitedCount: number }
>;
type RelaxEdgeEvent = SearchStepEvent<
  "relax-edge",
  {
    from: number;
    to: number;
    edgeWeight: number;
    candidateDistance: number;
    previousDistance: number;
    status: "blocked" | "visited" | "skip" | "update";
  }
>;
type DistanceUpdateEvent = SearchStepEvent<
  "distance-update",
  { cell: number; previousDistance: number; nextDistance: number; parent: number }
>;
type FoundEvent = SearchStepEvent<"found", { cell: number; distance: number; pathLength: number; visitedCount: number }>;
type NotFoundEvent = SearchStepEvent<"not-found", { visitedCount: number; relaxations: number }>;
type CompleteEvent = SearchStepEvent<
  "complete",
  { found: boolean; distance: number; visitedCount: number; relaxations: number; pathLength: number }
>;

export type DijkstraStepEvent =
  | ExtractMinEvent
  | RelaxEdgeEvent
  | DistanceUpdateEvent
  | FoundEvent
  | NotFoundEvent
  | CompleteEvent;

function createEvent<TEvent extends DijkstraStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `dijkstra-${index}`,
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

function getFrontierMinCell(frontier: Set<number>, distances: number[]): number | null {
  let candidate: number | null = null;
  let candidateDistance = Number.POSITIVE_INFINITY;

  for (const cell of frontier) {
    const distance = distances[cell];
    if (distance < candidateDistance || (distance === candidateDistance && (candidate === null || cell < candidate))) {
      candidate = cell;
      candidateDistance = distance;
    }
  }

  return candidate;
}

export const dijkstraEngine: AlgorithmEngine<
  DijkstraInput,
  DijkstraParams,
  DijkstraStepEvent,
  DijkstraResult
> = {
  normalizeParams: normalizeDijkstraParams,
  normalizeInput: normalizeDijkstraInput,
  generate: (input) => {
    const steps: DijkstraStepEvent[] = [];
    let nextIndex = 0;

    const cellCount = input.rows * input.cols;
    const blocked = new Set<number>(input.blockedCells);
    const visited = new Array<boolean>(cellCount).fill(false);
    const distances = new Array<number>(cellCount).fill(Number.POSITIVE_INFINITY);
    const parent = new Array<number>(cellCount).fill(-1);
    const frontier = new Set<number>();

    let visitedCount = 0;
    let relaxations = 0;

    distances[input.startCell] = 0;
    frontier.add(input.startCell);

    let found = false;

    while (frontier.size > 0) {
      const currentCell = getFrontierMinCell(frontier, distances);
      if (currentCell === null) {
        break;
      }

      frontier.delete(currentCell);
      if (visited[currentCell]) {
        continue;
      }

      visited[currentCell] = true;
      visitedCount += 1;

      steps.push(
        createEvent(nextIndex, "extract-min", {
          cell: currentCell,
          distance: distances[currentCell],
          frontierSize: frontier.size,
          visitedCount,
        }),
      );
      nextIndex += 1;

      if (currentCell === input.targetCell) {
        found = true;
        const pathCells = buildPath(parent, input.startCell, input.targetCell);
        steps.push(
          createEvent(nextIndex, "found", {
            cell: currentCell,
            distance: distances[currentCell],
            pathLength: pathCells.length,
            visitedCount,
          }),
        );
        nextIndex += 1;
        break;
      }

      const neighbors = getNeighbors(currentCell, input.rows, input.cols, input.allowDiagonal);
      for (const neighbor of neighbors) {
        if (blocked.has(neighbor)) {
          steps.push(
            createEvent(nextIndex, "relax-edge", {
              from: currentCell,
              to: neighbor,
              edgeWeight: input.weights[neighbor],
              candidateDistance: distances[currentCell] + input.weights[neighbor],
              previousDistance: -1,
              status: "blocked",
            }),
          );
          nextIndex += 1;
          continue;
        }

        if (visited[neighbor]) {
          steps.push(
            createEvent(nextIndex, "relax-edge", {
              from: currentCell,
              to: neighbor,
              edgeWeight: input.weights[neighbor],
              candidateDistance: distances[currentCell] + input.weights[neighbor],
              previousDistance: Number.isFinite(distances[neighbor]) ? distances[neighbor] : -1,
              status: "visited",
            }),
          );
          nextIndex += 1;
          continue;
        }

        const candidateDistance = distances[currentCell] + input.weights[neighbor];
        const previousDistance = distances[neighbor];
        const didImprove = candidateDistance < previousDistance;

        steps.push(
          createEvent(nextIndex, "relax-edge", {
            from: currentCell,
            to: neighbor,
            edgeWeight: input.weights[neighbor],
            candidateDistance,
            previousDistance: Number.isFinite(previousDistance) ? previousDistance : -1,
            status: didImprove ? "update" : "skip",
          }),
        );
        nextIndex += 1;

        if (!didImprove) {
          continue;
        }

        distances[neighbor] = candidateDistance;
        parent[neighbor] = currentCell;
        frontier.add(neighbor);
        relaxations += 1;

        steps.push(
          createEvent(nextIndex, "distance-update", {
            cell: neighbor,
            previousDistance: Number.isFinite(previousDistance) ? previousDistance : -1,
            nextDistance: candidateDistance,
            parent: currentCell,
          }),
        );
        nextIndex += 1;
      }
    }

    const pathCells = found ? buildPath(parent, input.startCell, input.targetCell) : [];
    const finalDistance = found ? distances[input.targetCell] : -1;

    if (!found) {
      steps.push(
        createEvent(nextIndex, "not-found", {
          visitedCount,
          relaxations,
        }),
      );
      nextIndex += 1;
    }

    steps.push(
      createEvent(nextIndex, "complete", {
        found,
        distance: finalDistance,
        visitedCount,
        relaxations,
        pathLength: pathCells.length,
      }),
    );

    return {
      steps,
      result: {
        found,
        distance: finalDistance,
        visitedCount,
        relaxations,
        pathCells,
      },
    };
  },
};

export function createDijkstraRun(
  rawParams: RawParams,
): AlgorithmRunOutput<DijkstraInput, DijkstraParams, DijkstraStepEvent, DijkstraResult> {
  const normalizedParams = dijkstraEngine.normalizeParams(rawParams);
  const input = dijkstraEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = dijkstraEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

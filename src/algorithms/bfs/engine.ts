import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, SearchStepEvent } from "@/types/engine";

import {
  type BfsInput,
  type BfsParams,
  type BfsResult,
  normalizeBfsInput,
  normalizeBfsParams,
} from "@/algorithms/bfs/spec";

type EnqueueEvent = SearchStepEvent<"enqueue", { cell: number; depth: number; queueSize: number }>;
type VisitEvent = SearchStepEvent<"visit", { cell: number; depth: number }>;
type InspectNeighborEvent = SearchStepEvent<
  "inspect-neighbor",
  {
    from: number;
    to: number;
    depth: number;
    status: "blocked" | "visited" | "enqueue";
  }
>;
type FrontierLayerCompleteEvent = SearchStepEvent<
  "frontier-layer-complete",
  { depth: number; visitedCount: number; queueSize: number }
>;
type FoundEvent = SearchStepEvent<
  "found",
  { cell: number; depth: number; visitedCount: number; pathLength: number }
>;
type NotFoundEvent = SearchStepEvent<"not-found", { visitedCount: number; layers: number }>;

export type BfsStepEvent =
  | EnqueueEvent
  | VisitEvent
  | InspectNeighborEvent
  | FrontierLayerCompleteEvent
  | FoundEvent
  | NotFoundEvent;

function createEvent<TEvent extends BfsStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `bfs-${index}`,
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

export const bfsEngine: AlgorithmEngine<BfsInput, BfsParams, BfsStepEvent, BfsResult> = {
  normalizeParams: normalizeBfsParams,
  normalizeInput: normalizeBfsInput,
  generate: (input) => {
    const steps: BfsStepEvent[] = [];
    let nextIndex = 0;

    const cellCount = input.rows * input.cols;
    const blocked = new Set<number>(input.blockedCells);
    const visited = new Array<boolean>(cellCount).fill(false);
    const depth = new Array<number>(cellCount).fill(-1);
    const parent = new Array<number>(cellCount).fill(-1);
    const queue: number[] = [];

    let visitedCount = 0;
    let enqueuedCount = 0;
    let layers = 0;

    visited[input.startCell] = true;
    depth[input.startCell] = 0;
    queue.push(input.startCell);
    enqueuedCount += 1;
    steps.push(createEvent(nextIndex, "enqueue", { cell: input.startCell, depth: 0, queueSize: queue.length }));
    nextIndex += 1;

    if (input.startCell === input.targetCell) {
      steps.push(
        createEvent(nextIndex, "found", {
          cell: input.startCell,
          depth: 0,
          visitedCount: 1,
          pathLength: 1,
        }),
      );

      return {
        steps,
        result: {
          found: true,
          distance: 0,
          visitedCount: 1,
          enqueuedCount,
          layers: 1,
          pathCells: [input.startCell],
        },
      };
    }

    let found = false;
    let foundDepth = -1;

    while (queue.length > 0 && !found) {
      const layerSize = queue.length;
      const currentLayerDepth = depth[queue[0]];
      layers += 1;

      for (let layerIndex = 0; layerIndex < layerSize; layerIndex += 1) {
        const cell = queue.shift();
        if (cell === undefined) {
          break;
        }

        visitedCount += 1;
        steps.push(createEvent(nextIndex, "visit", { cell, depth: depth[cell] }));
        nextIndex += 1;

        if (cell === input.targetCell) {
          found = true;
          foundDepth = depth[cell];
          break;
        }

        const neighbors = getNeighbors(cell, input.rows, input.cols, input.allowDiagonal);
        for (const neighbor of neighbors) {
          if (blocked.has(neighbor)) {
            steps.push(
              createEvent(nextIndex, "inspect-neighbor", {
                from: cell,
                to: neighbor,
                depth: depth[cell] + 1,
                status: "blocked",
              }),
            );
            nextIndex += 1;
            continue;
          }

          if (visited[neighbor]) {
            steps.push(
              createEvent(nextIndex, "inspect-neighbor", {
                from: cell,
                to: neighbor,
                depth: depth[cell] + 1,
                status: "visited",
              }),
            );
            nextIndex += 1;
            continue;
          }

          visited[neighbor] = true;
          parent[neighbor] = cell;
          depth[neighbor] = depth[cell] + 1;
          queue.push(neighbor);
          enqueuedCount += 1;

          steps.push(
            createEvent(nextIndex, "inspect-neighbor", {
              from: cell,
              to: neighbor,
              depth: depth[neighbor],
              status: "enqueue",
            }),
          );
          nextIndex += 1;

          steps.push(
            createEvent(nextIndex, "enqueue", {
              cell: neighbor,
              depth: depth[neighbor],
              queueSize: queue.length,
            }),
          );
          nextIndex += 1;
        }
      }

      steps.push(
        createEvent(nextIndex, "frontier-layer-complete", {
          depth: currentLayerDepth,
          visitedCount,
          queueSize: queue.length,
        }),
      );
      nextIndex += 1;
    }

    if (found) {
      const pathCells = buildPath(parent, input.startCell, input.targetCell);
      steps.push(
        createEvent(nextIndex, "found", {
          cell: input.targetCell,
          depth: foundDepth,
          visitedCount,
          pathLength: pathCells.length,
        }),
      );

      return {
        steps,
        result: {
          found: true,
          distance: foundDepth,
          visitedCount,
          enqueuedCount,
          layers,
          pathCells,
        },
      };
    }

    steps.push(
      createEvent(nextIndex, "not-found", {
        visitedCount,
        layers,
      }),
    );

    return {
      steps,
      result: {
        found: false,
        distance: -1,
        visitedCount,
        enqueuedCount,
        layers,
        pathCells: [],
      },
    };
  },
};

export function createBfsRun(
  rawParams: RawParams,
): AlgorithmRunOutput<BfsInput, BfsParams, BfsStepEvent, BfsResult> {
  const normalizedParams = bfsEngine.normalizeParams(rawParams);
  const input = bfsEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = bfsEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

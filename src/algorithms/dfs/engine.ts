import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, SearchStepEvent } from "@/types/engine";

import {
  type DfsInput,
  type DfsParams,
  type DfsResult,
  normalizeDfsInput,
  normalizeDfsParams,
} from "@/algorithms/dfs/spec";

type PushStackEvent = SearchStepEvent<"push-stack", { cell: number; depth: number; stackSize: number }>;
type VisitEvent = SearchStepEvent<"visit", { cell: number; depth: number }>;
type InspectNeighborEvent = SearchStepEvent<
  "inspect-neighbor",
  {
    from: number;
    to: number;
    depth: number;
    status: "blocked" | "visited" | "push";
  }
>;
type BacktrackEvent = SearchStepEvent<"backtrack", { from: number; to: number; depth: number }>;
type FoundEvent = SearchStepEvent<"found", { cell: number; depth: number; visitedCount: number; pathLength: number }>;
type NotFoundEvent = SearchStepEvent<"not-found", { visitedCount: number; backtracks: number }>;

export type DfsStepEvent =
  | PushStackEvent
  | VisitEvent
  | InspectNeighborEvent
  | BacktrackEvent
  | FoundEvent
  | NotFoundEvent;

function createEvent<TEvent extends DfsStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `dfs-${index}`,
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

interface StackFrame {
  cell: number;
  neighbors: number[];
  cursor: number;
  entered: boolean;
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

function getNeighborDeltas(allowDiagonal: boolean, preferClockwise: boolean): Array<[number, number]> {
  if (allowDiagonal) {
    return preferClockwise
      ? [
          [-1, 0],
          [-1, 1],
          [0, 1],
          [1, 1],
          [1, 0],
          [1, -1],
          [0, -1],
          [-1, -1],
        ]
      : [
          [-1, 0],
          [-1, -1],
          [0, -1],
          [1, -1],
          [1, 0],
          [1, 1],
          [0, 1],
          [-1, 1],
        ];
  }

  return preferClockwise
    ? [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
      ]
    : [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1],
      ];
}

function getNeighbors(
  cell: number,
  rows: number,
  cols: number,
  allowDiagonal: boolean,
  preferClockwise: boolean,
): number[] {
  const { row, col } = toPoint(cell, cols);
  const deltas = getNeighborDeltas(allowDiagonal, preferClockwise);

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

export const dfsEngine: AlgorithmEngine<DfsInput, DfsParams, DfsStepEvent, DfsResult> = {
  normalizeParams: normalizeDfsParams,
  normalizeInput: normalizeDfsInput,
  generate: (input) => {
    const steps: DfsStepEvent[] = [];
    let nextIndex = 0;

    const cellCount = input.rows * input.cols;
    const blocked = new Set<number>(input.blockedCells);
    const visited = new Array<boolean>(cellCount).fill(false);
    const depth = new Array<number>(cellCount).fill(-1);
    const parent = new Array<number>(cellCount).fill(-1);
    const stack: StackFrame[] = [];

    let visitedCount = 0;
    let pushedCount = 0;
    let backtracks = 0;

    visited[input.startCell] = true;
    depth[input.startCell] = 0;
    stack.push({
      cell: input.startCell,
      neighbors: getNeighbors(
        input.startCell,
        input.rows,
        input.cols,
        input.allowDiagonal,
        input.preferClockwise,
      ),
      cursor: 0,
      entered: false,
    });
    pushedCount += 1;
    steps.push(
      createEvent(nextIndex, "push-stack", {
        cell: input.startCell,
        depth: 0,
        stackSize: stack.length,
      }),
    );
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
          depth: 0,
          visitedCount: 1,
          pushedCount,
          backtracks: 0,
          pathCells: [input.startCell],
        },
      };
    }

    let found = false;
    let foundDepth = -1;

    while (stack.length > 0 && !found) {
      const frame = stack[stack.length - 1];

      if (!frame.entered) {
        frame.entered = true;
        visitedCount += 1;
        steps.push(createEvent(nextIndex, "visit", { cell: frame.cell, depth: depth[frame.cell] }));
        nextIndex += 1;

        if (frame.cell === input.targetCell) {
          found = true;
          foundDepth = depth[frame.cell];
          break;
        }
      }

      if (frame.cursor >= frame.neighbors.length) {
        stack.pop();
        const nextTop = stack[stack.length - 1];
        backtracks += 1;
        steps.push(
          createEvent(nextIndex, "backtrack", {
            from: frame.cell,
            to: nextTop ? nextTop.cell : -1,
            depth: depth[frame.cell],
          }),
        );
        nextIndex += 1;
        continue;
      }

      const neighbor = frame.neighbors[frame.cursor];
      frame.cursor += 1;

      if (blocked.has(neighbor)) {
        steps.push(
          createEvent(nextIndex, "inspect-neighbor", {
            from: frame.cell,
            to: neighbor,
            depth: depth[frame.cell] + 1,
            status: "blocked",
          }),
        );
        nextIndex += 1;
        continue;
      }

      if (visited[neighbor]) {
        steps.push(
          createEvent(nextIndex, "inspect-neighbor", {
            from: frame.cell,
            to: neighbor,
            depth: depth[frame.cell] + 1,
            status: "visited",
          }),
        );
        nextIndex += 1;
        continue;
      }

      visited[neighbor] = true;
      parent[neighbor] = frame.cell;
      depth[neighbor] = depth[frame.cell] + 1;
      steps.push(
        createEvent(nextIndex, "inspect-neighbor", {
          from: frame.cell,
          to: neighbor,
          depth: depth[neighbor],
          status: "push",
        }),
      );
      nextIndex += 1;

      stack.push({
        cell: neighbor,
        neighbors: getNeighbors(
          neighbor,
          input.rows,
          input.cols,
          input.allowDiagonal,
          input.preferClockwise,
        ),
        cursor: 0,
        entered: false,
      });
      pushedCount += 1;
      steps.push(
        createEvent(nextIndex, "push-stack", {
          cell: neighbor,
          depth: depth[neighbor],
          stackSize: stack.length,
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
          depth: foundDepth,
          visitedCount,
          pushedCount,
          backtracks,
          pathCells,
        },
      };
    }

    steps.push(
      createEvent(nextIndex, "not-found", {
        visitedCount,
        backtracks,
      }),
    );

    return {
      steps,
      result: {
        found: false,
        depth: -1,
        visitedCount,
        pushedCount,
        backtracks,
        pathCells: [],
      },
    };
  },
};

export function createDfsRun(
  rawParams: RawParams,
): AlgorithmRunOutput<DfsInput, DfsParams, DfsStepEvent, DfsResult> {
  const normalizedParams = dfsEngine.normalizeParams(rawParams);
  const input = dfsEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = dfsEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

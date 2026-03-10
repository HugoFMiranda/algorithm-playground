import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, SearchStepEvent } from "@/types/engine";

import {
  type BidirectionalBfsInput,
  type BidirectionalBfsParams,
  type BidirectionalBfsResult,
  normalizeBidirectionalBfsInput,
  normalizeBidirectionalBfsParams,
} from "@/algorithms/bidirectional-bfs/spec";

type SearchDirection = "forward" | "backward";

type EnqueueFrontierEvent = SearchStepEvent<
  "enqueue-frontier",
  { direction: SearchDirection; cell: number; depth: number; frontierSize: number }
>;
type VisitEvent = SearchStepEvent<"visit", { direction: SearchDirection; cell: number; depth: number }>;
type InspectNeighborEvent = SearchStepEvent<
  "inspect-neighbor",
  {
    direction: SearchDirection;
    from: number;
    to: number;
    depth: number;
    status: "blocked" | "visited-self" | "enqueue" | "meet";
  }
>;
type FrontierTurnCompleteEvent = SearchStepEvent<
  "frontier-turn-complete",
  { direction: SearchDirection; depth: number; visitedCount: number; frontierSize: number }
>;
type MeetDetectedEvent = SearchStepEvent<
  "meet-detected",
  {
    direction: SearchDirection;
    from: number;
    to: number;
    meetingCell: number;
    totalDistance: number;
    pathLength: number;
  }
>;
type NotFoundEvent = SearchStepEvent<"not-found", { visitedCount: number; turns: number }>;

export type BidirectionalBfsStepEvent =
  | EnqueueFrontierEvent
  | VisitEvent
  | InspectNeighborEvent
  | FrontierTurnCompleteEvent
  | MeetDetectedEvent
  | NotFoundEvent;

function createEvent<TEvent extends BidirectionalBfsStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `bidirectional-bfs-${index}`,
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

function buildDirectionalPath(parent: number[], origin: number, meetingCell: number): number[] {
  const path: number[] = [];
  let cursor = meetingCell;

  while (cursor !== -1) {
    path.push(cursor);
    if (cursor === origin) {
      break;
    }
    cursor = parent[cursor];
  }

  return path.reverse();
}

function buildCombinedPath(
  forwardParent: number[],
  backwardParent: number[],
  startCell: number,
  targetCell: number,
  meetingCell: number,
): number[] {
  const startToMeeting = buildDirectionalPath(forwardParent, startCell, meetingCell);
  const meetingToTarget: number[] = [];
  let cursor = meetingCell;

  while (cursor !== -1) {
    meetingToTarget.push(cursor);
    if (cursor === targetCell) {
      break;
    }
    cursor = backwardParent[cursor];
  }

  return [...startToMeeting, ...meetingToTarget.slice(1)];
}

function selectDirection(
  input: BidirectionalBfsInput,
  forwardQueue: number[],
  backwardQueue: number[],
): SearchDirection {
  if (!input.expandSmallerFrontier) {
    return input.preferForwardOnTie ? "forward" : "backward";
  }

  if (forwardQueue.length < backwardQueue.length) {
    return "forward";
  }

  if (backwardQueue.length < forwardQueue.length) {
    return "backward";
  }

  return input.preferForwardOnTie ? "forward" : "backward";
}

export const bidirectionalBfsEngine: AlgorithmEngine<
  BidirectionalBfsInput,
  BidirectionalBfsParams,
  BidirectionalBfsStepEvent,
  BidirectionalBfsResult
> = {
  normalizeParams: normalizeBidirectionalBfsParams,
  normalizeInput: normalizeBidirectionalBfsInput,
  generate: (input) => {
    const steps: BidirectionalBfsStepEvent[] = [];
    let nextIndex = 0;

    const cellCount = input.rows * input.cols;
    const blocked = new Set<number>(input.blockedCells);
    const forwardVisited = new Array<boolean>(cellCount).fill(false);
    const backwardVisited = new Array<boolean>(cellCount).fill(false);
    const forwardDepth = new Array<number>(cellCount).fill(-1);
    const backwardDepth = new Array<number>(cellCount).fill(-1);
    const forwardParent = new Array<number>(cellCount).fill(-1);
    const backwardParent = new Array<number>(cellCount).fill(-1);
    const forwardQueue: number[] = [];
    const backwardQueue: number[] = [];

    let forwardVisitedCount = 0;
    let backwardVisitedCount = 0;
    let turns = 0;
    let meetingCell = -1;

    forwardVisited[input.startCell] = true;
    forwardDepth[input.startCell] = 0;
    forwardQueue.push(input.startCell);
    steps.push(
      createEvent(nextIndex, "enqueue-frontier", {
        direction: "forward",
        cell: input.startCell,
        depth: 0,
        frontierSize: forwardQueue.length,
      }),
    );
    nextIndex += 1;

    backwardVisited[input.targetCell] = true;
    backwardDepth[input.targetCell] = 0;
    backwardQueue.push(input.targetCell);
    steps.push(
      createEvent(nextIndex, "enqueue-frontier", {
        direction: "backward",
        cell: input.targetCell,
        depth: 0,
        frontierSize: backwardQueue.length,
      }),
    );
    nextIndex += 1;

    if (input.startCell === input.targetCell) {
      steps.push(
        createEvent(nextIndex, "meet-detected", {
          direction: "forward",
          from: input.startCell,
          to: input.targetCell,
          meetingCell: input.startCell,
          totalDistance: 0,
          pathLength: 1,
        }),
      );

      return {
        steps,
        result: {
          found: true,
          distance: 0,
          visitedCount: 1,
          forwardVisitedCount: 1,
          backwardVisitedCount: 1,
          turns: 0,
          meetingCell: input.startCell,
          pathCells: [input.startCell],
        },
      };
    }

    let found = false;

    while (forwardQueue.length > 0 && backwardQueue.length > 0 && !found) {
      const direction = selectDirection(input, forwardQueue, backwardQueue);
      const queue = direction === "forward" ? forwardQueue : backwardQueue;
      const ownVisited = direction === "forward" ? forwardVisited : backwardVisited;
      const ownDepth = direction === "forward" ? forwardDepth : backwardDepth;
      const ownParent = direction === "forward" ? forwardParent : backwardParent;
      const oppositeVisited = direction === "forward" ? backwardVisited : forwardVisited;
      const oppositeDepth = direction === "forward" ? backwardDepth : forwardDepth;

      const layerSize = queue.length;
      const currentLayerDepth = ownDepth[queue[0]];
      turns += 1;

      for (let layerIndex = 0; layerIndex < layerSize; layerIndex += 1) {
        const cell = queue.shift();
        if (cell === undefined) {
          break;
        }

        if (direction === "forward") {
          forwardVisitedCount += 1;
        } else {
          backwardVisitedCount += 1;
        }

        steps.push(
          createEvent(nextIndex, "visit", {
            direction,
            cell,
            depth: ownDepth[cell],
          }),
        );
        nextIndex += 1;

        if (oppositeVisited[cell]) {
          meetingCell = cell;
          const pathCells = buildCombinedPath(
            forwardParent,
            backwardParent,
            input.startCell,
            input.targetCell,
            meetingCell,
          );
          steps.push(
            createEvent(nextIndex, "meet-detected", {
              direction,
              from: cell,
              to: cell,
              meetingCell,
              totalDistance: pathCells.length - 1,
              pathLength: pathCells.length,
            }),
          );
          found = true;
          break;
        }

        const neighbors = getNeighbors(cell, input.rows, input.cols, input.allowDiagonal);
        for (const neighbor of neighbors) {
          if (blocked.has(neighbor)) {
            steps.push(
              createEvent(nextIndex, "inspect-neighbor", {
                direction,
                from: cell,
                to: neighbor,
                depth: ownDepth[cell] + 1,
                status: "blocked",
              }),
            );
            nextIndex += 1;
            continue;
          }

          if (ownVisited[neighbor]) {
            steps.push(
              createEvent(nextIndex, "inspect-neighbor", {
                direction,
                from: cell,
                to: neighbor,
                depth: ownDepth[cell] + 1,
                status: "visited-self",
              }),
            );
            nextIndex += 1;
            continue;
          }

          ownVisited[neighbor] = true;
          ownDepth[neighbor] = ownDepth[cell] + 1;
          ownParent[neighbor] = cell;

          if (oppositeVisited[neighbor]) {
            meetingCell = neighbor;
            const pathCells = buildCombinedPath(
              forwardParent,
              backwardParent,
              input.startCell,
              input.targetCell,
              meetingCell,
            );
            steps.push(
              createEvent(nextIndex, "inspect-neighbor", {
                direction,
                from: cell,
                to: neighbor,
                depth: ownDepth[neighbor],
                status: "meet",
              }),
            );
            nextIndex += 1;
            steps.push(
              createEvent(nextIndex, "meet-detected", {
                direction,
                from: cell,
                to: neighbor,
                meetingCell,
                totalDistance: pathCells.length - 1,
                pathLength: pathCells.length,
              }),
            );
            found = true;
            break;
          }

          queue.push(neighbor);
          steps.push(
            createEvent(nextIndex, "inspect-neighbor", {
              direction,
              from: cell,
              to: neighbor,
              depth: ownDepth[neighbor],
              status: "enqueue",
            }),
          );
          nextIndex += 1;
          steps.push(
            createEvent(nextIndex, "enqueue-frontier", {
              direction,
              cell: neighbor,
              depth: ownDepth[neighbor],
              frontierSize: queue.length,
            }),
          );
          nextIndex += 1;
        }

        if (found) {
          break;
        }
      }

      if (found) {
        break;
      }

      steps.push(
        createEvent(nextIndex, "frontier-turn-complete", {
          direction,
          depth: currentLayerDepth,
          visitedCount: forwardVisitedCount + backwardVisitedCount,
          frontierSize: queue.length,
        }),
      );
      nextIndex += 1;
    }

    if (found) {
      const pathCells = buildCombinedPath(
        forwardParent,
        backwardParent,
        input.startCell,
        input.targetCell,
        meetingCell,
      );

      return {
        steps,
        result: {
          found: true,
          distance: pathCells.length - 1,
          visitedCount: new Set<number>([
            ...forwardVisited.map((isVisited, cell) => (isVisited ? cell : -1)),
            ...backwardVisited.map((isVisited, cell) => (isVisited ? cell : -1)),
          ]).size - 1,
          forwardVisitedCount,
          backwardVisitedCount,
          turns,
          meetingCell,
          pathCells,
        },
      };
    }

    steps.push(
      createEvent(nextIndex, "not-found", {
        visitedCount: forwardVisitedCount + backwardVisitedCount,
        turns,
      }),
    );

    return {
      steps,
      result: {
        found: false,
        distance: -1,
        visitedCount: new Set<number>([
          ...forwardVisited.map((isVisited, cell) => (isVisited ? cell : -1)),
          ...backwardVisited.map((isVisited, cell) => (isVisited ? cell : -1)),
        ]).size - 1,
        forwardVisitedCount,
        backwardVisitedCount,
        turns,
        meetingCell: -1,
        pathCells: [],
      },
    };
  },
};

export function createBidirectionalBfsRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  BidirectionalBfsInput,
  BidirectionalBfsParams,
  BidirectionalBfsStepEvent,
  BidirectionalBfsResult
> {
  const normalizedParams = bidirectionalBfsEngine.normalizeParams(rawParams);
  const input = bidirectionalBfsEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = bidirectionalBfsEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

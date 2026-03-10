import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type BellmanFordEdge,
  type BellmanFordInput,
  type BellmanFordParams,
  type BellmanFordResult,
  normalizeBellmanFordInput,
  normalizeBellmanFordParams,
} from "@/algorithms/bellman-ford/spec";

type RelaxationRoundEvent = ArrayStepEvent<
  "relaxation-round",
  { round: number; totalRounds: number; edgeCount: number }
>;

type EdgeRelaxEvent = ArrayStepEvent<
  "edge-relax",
  {
    round: number;
    edgeIndex: number;
    from: number;
    to: number;
    weight: number;
    candidateDistance: number;
    previousDistance: number;
    status: "unreachable" | "skip" | "update";
  }
>;

type DistanceUpdateEvent = ArrayStepEvent<
  "distance-update",
  {
    round: number;
    node: number;
    previousDistance: number;
    nextDistance: number;
    parent: number;
  }
>;

type NegativeCycleEdgeEvent = ArrayStepEvent<
  "negative-cycle-edge",
  { edgeIndex: number; from: number; to: number; weight: number }
>;

type CompleteEvent = ArrayStepEvent<
  "complete",
  { roundsExecuted: number; relaxations: number; reachableCount: number; negativeCycle: boolean }
>;

export type BellmanFordStepEvent =
  | RelaxationRoundEvent
  | EdgeRelaxEvent
  | DistanceUpdateEvent
  | NegativeCycleEdgeEvent
  | CompleteEvent;

function createEvent<TEvent extends BellmanFordStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `bellman-ford-${index}`,
    index,
    family: "array",
    type,
    payload,
  } as TEvent;
}

function edgeComparator(
  preferLowerIndex: boolean,
): (left: BellmanFordEdge, right: BellmanFordEdge) => number {
  return (left, right) => {
    if (left.from !== right.from) {
      return preferLowerIndex ? left.from - right.from : right.from - left.from;
    }
    if (left.to !== right.to) {
      return preferLowerIndex ? left.to - right.to : right.to - left.to;
    }
    return left.weight - right.weight;
  };
}

function countReachable(distances: number[]): number {
  return distances.filter((distance) => Number.isFinite(distance)).length;
}

export const bellmanFordEngine: AlgorithmEngine<
  BellmanFordInput,
  BellmanFordParams,
  BellmanFordStepEvent,
  BellmanFordResult
> = {
  normalizeParams: normalizeBellmanFordParams,
  normalizeInput: normalizeBellmanFordInput,
  generate: (input, params) => {
    const steps: BellmanFordStepEvent[] = [];
    const distances = new Array<number>(input.nodeCount).fill(Number.POSITIVE_INFINITY);
    const parents = new Array<number>(input.nodeCount).fill(-1);
    const sortedEdges = [...input.edges].sort(edgeComparator(params.preferLowerIndex));

    let nextIndex = 0;
    let roundsExecuted = 0;
    let relaxations = 0;

    distances[input.startNode] = 0;

    for (let round = 1; round <= Math.max(0, input.nodeCount - 1); round += 1) {
      roundsExecuted = round;
      let updatedThisRound = false;

      steps.push(
        createEvent(nextIndex, "relaxation-round", {
          round,
          totalRounds: Math.max(0, input.nodeCount - 1),
          edgeCount: sortedEdges.length,
        }),
      );
      nextIndex += 1;

      for (let edgeIndex = 0; edgeIndex < sortedEdges.length; edgeIndex += 1) {
        const edge = sortedEdges[edgeIndex];
        const previousDistance = distances[edge.to];

        if (!Number.isFinite(distances[edge.from])) {
          steps.push(
            createEvent(nextIndex, "edge-relax", {
              round,
              edgeIndex,
              from: edge.from,
              to: edge.to,
              weight: edge.weight,
              candidateDistance: -1,
              previousDistance: Number.isFinite(previousDistance) ? previousDistance : -1,
              status: "unreachable",
            }),
          );
          nextIndex += 1;
          continue;
        }

        const candidateDistance = distances[edge.from] + edge.weight;
        const improved = candidateDistance < previousDistance;

        steps.push(
          createEvent(nextIndex, "edge-relax", {
            round,
            edgeIndex,
            from: edge.from,
            to: edge.to,
            weight: edge.weight,
            candidateDistance,
            previousDistance: Number.isFinite(previousDistance) ? previousDistance : -1,
            status: improved ? "update" : "skip",
          }),
        );
        nextIndex += 1;

        if (!improved) {
          continue;
        }

        distances[edge.to] = candidateDistance;
        parents[edge.to] = edge.from;
        relaxations += 1;
        updatedThisRound = true;

        steps.push(
          createEvent(nextIndex, "distance-update", {
            round,
            node: edge.to,
            previousDistance: Number.isFinite(previousDistance) ? previousDistance : -1,
            nextDistance: candidateDistance,
            parent: edge.from,
          }),
        );
        nextIndex += 1;
      }

      if (params.stopEarlyWhenStable && !updatedThisRound) {
        break;
      }
    }

    let negativeCycle = false;
    let cycleEdge: BellmanFordEdge | null = null;

    for (let edgeIndex = 0; edgeIndex < sortedEdges.length; edgeIndex += 1) {
      const edge = sortedEdges[edgeIndex];
      if (!Number.isFinite(distances[edge.from])) {
        continue;
      }

      if (distances[edge.from] + edge.weight < distances[edge.to]) {
        negativeCycle = true;
        cycleEdge = edge;
        steps.push(
          createEvent(nextIndex, "negative-cycle-edge", {
            edgeIndex,
            from: edge.from,
            to: edge.to,
            weight: edge.weight,
          }),
        );
        nextIndex += 1;
        break;
      }
    }

    steps.push(
      createEvent(nextIndex, "complete", {
        roundsExecuted,
        relaxations,
        reachableCount: countReachable(distances),
        negativeCycle,
      }),
    );

    return {
      steps,
      result: {
        distances: [...distances],
        parents: [...parents],
        roundsExecuted,
        relaxations,
        reachableCount: countReachable(distances),
        negativeCycle,
        cycleEdge,
      },
    };
  },
};

export function createBellmanFordRun(
  rawParams: RawParams,
): AlgorithmRunOutput<BellmanFordInput, BellmanFordParams, BellmanFordStepEvent, BellmanFordResult> {
  const normalizedParams = bellmanFordEngine.normalizeParams(rawParams);
  const input = bellmanFordEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = bellmanFordEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

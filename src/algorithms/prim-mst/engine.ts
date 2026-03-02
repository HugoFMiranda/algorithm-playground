import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type PrimMstEdge,
  type PrimMstInput,
  type PrimMstParams,
  type PrimMstResult,
  normalizePrimMstInput,
  normalizePrimMstParams,
} from "@/algorithms/prim-mst/spec";

type CandidateEdgeEvent = ArrayStepEvent<
  "candidate-edge",
  {
    from: number;
    to: number;
    weight: number;
    candidateCount: number;
    bestWeight: number;
    componentIndex: number;
  }
>;

type NodeAddEvent = ArrayStepEvent<
  "node-add",
  {
    node: number;
    from: number | null;
    weight: number;
    nodeCount: number;
    componentIndex: number;
    isSeed: boolean;
  }
>;

type EdgeLockEvent = ArrayStepEvent<
  "edge-lock",
  {
    from: number;
    to: number;
    weight: number;
    lockedEdges: number;
    totalWeight: number;
    componentIndex: number;
  }
>;

type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    totalWeight: number;
    visitedCount: number;
    components: number;
    connected: boolean;
    frontierCandidates: number;
    edgeLocks: number;
  }
>;

export type PrimMstStepEvent = CandidateEdgeEvent | NodeAddEvent | EdgeLockEvent | CompleteEvent;

function createEvent<TEvent extends PrimMstStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `prim-mst-${index}`,
    index,
    family: "array",
    type,
    payload,
  } as TEvent;
}

function compareNodes(left: number, right: number, preferLowerIndex: boolean): number {
  return preferLowerIndex ? left - right : right - left;
}

function compareFrontierEdges(
  left: PrimMstEdge,
  right: PrimMstEdge,
  preferLowerIndex: boolean,
): number {
  if (left.weight !== right.weight) {
    return left.weight - right.weight;
  }

  if (left.to !== right.to) {
    return compareNodes(left.to, right.to, preferLowerIndex);
  }

  return compareNodes(left.from, right.from, preferLowerIndex);
}

function normalizeFrontierDirection(edge: PrimMstEdge, visited: Set<number>): PrimMstEdge | null {
  const leftVisited = visited.has(edge.from);
  const rightVisited = visited.has(edge.to);

  if (leftVisited && rightVisited) {
    return null;
  }
  if (!leftVisited && !rightVisited) {
    return null;
  }

  if (leftVisited) {
    return edge;
  }

  return {
    from: edge.to,
    to: edge.from,
    weight: edge.weight,
  };
}

function pickNextSeed(
  visited: Set<number>,
  nodeCount: number,
  startNode: number,
  preferLowerIndex: boolean,
): number | null {
  if (visited.size === 0 && !visited.has(startNode)) {
    return startNode;
  }

  const unvisited: number[] = [];
  for (let node = 0; node < nodeCount; node += 1) {
    if (!visited.has(node)) {
      unvisited.push(node);
    }
  }

  if (unvisited.length === 0) {
    return null;
  }

  unvisited.sort((left, right) => compareNodes(left, right, preferLowerIndex));
  return unvisited[0] ?? null;
}

export const primMstEngine: AlgorithmEngine<PrimMstInput, PrimMstParams, PrimMstStepEvent, PrimMstResult> = {
  normalizeParams: normalizePrimMstParams,
  normalizeInput: normalizePrimMstInput,
  generate: (input, params) => {
    const steps: PrimMstStepEvent[] = [];
    const visited = new Set<number>();
    const selectedEdges: PrimMstEdge[] = [];
    let nextIndex = 0;
    let totalWeight = 0;
    let frontierCandidates = 0;
    let edgeLocks = 0;
    let componentIndex = 0;

    while (visited.size < input.nodeCount) {
      const seed = pickNextSeed(visited, input.nodeCount, input.startNode, params.preferLowerIndex);
      if (seed === null) {
        break;
      }

      componentIndex += 1;
      visited.add(seed);
      steps.push(
        createEvent(nextIndex, "node-add", {
          node: seed,
          from: null,
          weight: 0,
          nodeCount: visited.size,
          componentIndex,
          isSeed: true,
        }),
      );
      nextIndex += 1;

      while (true) {
        let bestEdge: PrimMstEdge | null = null;

        for (const edge of input.edges) {
          const frontierEdge = normalizeFrontierDirection(edge, visited);
          if (!frontierEdge) {
            continue;
          }

          frontierCandidates += 1;
          if (
            bestEdge === null ||
            compareFrontierEdges(frontierEdge, bestEdge, params.preferLowerIndex) < 0
          ) {
            bestEdge = frontierEdge;
          }

          steps.push(
            createEvent(nextIndex, "candidate-edge", {
              from: frontierEdge.from,
              to: frontierEdge.to,
              weight: frontierEdge.weight,
              candidateCount: frontierCandidates,
              bestWeight: bestEdge.weight,
              componentIndex,
            }),
          );
          nextIndex += 1;
        }

        if (bestEdge === null) {
          break;
        }

        selectedEdges.push(bestEdge);
        edgeLocks += 1;
        totalWeight += bestEdge.weight;
        visited.add(bestEdge.to);

        steps.push(
          createEvent(nextIndex, "edge-lock", {
            from: bestEdge.from,
            to: bestEdge.to,
            weight: bestEdge.weight,
            lockedEdges: edgeLocks,
            totalWeight,
            componentIndex,
          }),
        );
        nextIndex += 1;

        steps.push(
          createEvent(nextIndex, "node-add", {
            node: bestEdge.to,
            from: bestEdge.from,
            weight: bestEdge.weight,
            nodeCount: visited.size,
            componentIndex,
            isSeed: false,
          }),
        );
        nextIndex += 1;
      }
    }

    const visitedCount = visited.size;
    const components = componentIndex;
    const connected = visitedCount === input.nodeCount && components === 1;

    steps.push(
      createEvent(nextIndex, "complete", {
        totalWeight,
        visitedCount,
        components,
        connected,
        frontierCandidates,
        edgeLocks,
      }),
    );

    return {
      steps,
      result: {
        selectedEdges,
        totalWeight,
        visitedCount,
        components,
        connected,
        frontierCandidates,
        edgeLocks,
      },
    };
  },
};

export function createPrimMstRun(
  rawParams: RawParams,
): AlgorithmRunOutput<PrimMstInput, PrimMstParams, PrimMstStepEvent, PrimMstResult> {
  const normalizedParams = primMstEngine.normalizeParams(rawParams);
  const input = primMstEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = primMstEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

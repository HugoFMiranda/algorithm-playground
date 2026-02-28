import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type KruskalMstEdge,
  type KruskalMstInput,
  type KruskalMstParams,
  type KruskalMstResult,
  normalizeKruskalMstInput,
  normalizeKruskalMstParams,
} from "@/algorithms/kruskal-mst/spec";

type EdgeConsiderEvent = ArrayStepEvent<
  "edge-consider",
  {
    edgeIndex: number;
    from: number;
    to: number;
    weight: number;
    consideredCount: number;
  }
>;

type UnionCheckEvent = ArrayStepEvent<
  "union-check",
  {
    edgeIndex: number;
    from: number;
    to: number;
    weight: number;
    leftRoot: number;
    rightRoot: number;
    accepted: boolean;
    componentCount: number;
  }
>;

type EdgeAcceptEvent = ArrayStepEvent<
  "edge-accept",
  {
    edgeIndex: number;
    from: number;
    to: number;
    weight: number;
    acceptedCount: number;
    totalWeight: number;
  }
>;

type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    edgesConsidered: number;
    edgesAccepted: number;
    cycleSkips: number;
    totalWeight: number;
    components: number;
    connected: boolean;
  }
>;

export type KruskalMstStepEvent = EdgeConsiderEvent | UnionCheckEvent | EdgeAcceptEvent | CompleteEvent;

function createEvent<TEvent extends KruskalMstStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `kruskal-mst-${index}`,
    index,
    family: "array",
    type,
    payload,
  } as TEvent;
}

function createEdgeComparator(
  preferLowerIndex: boolean,
): (left: KruskalMstEdge, right: KruskalMstEdge) => number {
  return (left, right) => {
    if (left.weight !== right.weight) {
      return left.weight - right.weight;
    }

    if (preferLowerIndex) {
      if (left.from !== right.from) {
        return left.from - right.from;
      }
      return left.to - right.to;
    }

    if (left.from !== right.from) {
      return right.from - left.from;
    }
    return right.to - left.to;
  };
}

function findRoot(parents: number[], node: number, compressPath: boolean): number {
  const trail: number[] = [node];
  let current = node;
  while (parents[current] !== current) {
    current = parents[current];
    trail.push(current);
    if (trail.length > parents.length + 1) {
      break;
    }
  }

  if (compressPath && trail.length > 1) {
    for (let index = 0; index < trail.length - 1; index += 1) {
      parents[trail[index]] = current;
    }
  }

  return current;
}

function unionRoots(
  leftRoot: number,
  rightRoot: number,
  parents: number[],
  ranks: number[],
  unionByRank: boolean,
): void {
  if (!unionByRank) {
    parents[rightRoot] = leftRoot;
    return;
  }

  const leftRank = ranks[leftRoot];
  const rightRank = ranks[rightRoot];

  if (leftRank < rightRank) {
    parents[leftRoot] = rightRoot;
    return;
  }

  if (rightRank < leftRank) {
    parents[rightRoot] = leftRoot;
    return;
  }

  const parentRoot = Math.min(leftRoot, rightRoot);
  const attachedRoot = parentRoot === leftRoot ? rightRoot : leftRoot;
  parents[attachedRoot] = parentRoot;
  ranks[parentRoot] += 1;
}

export const kruskalMstEngine: AlgorithmEngine<
  KruskalMstInput,
  KruskalMstParams,
  KruskalMstStepEvent,
  KruskalMstResult
> = {
  normalizeParams: normalizeKruskalMstParams,
  normalizeInput: normalizeKruskalMstInput,
  generate: (input, params) => {
    const steps: KruskalMstStepEvent[] = [];
    const parents = Array.from({ length: input.nodeCount }, (_, index) => index);
    const ranks = Array.from({ length: input.nodeCount }, () => 0);
    const sortedEdges = [...input.edges].sort(createEdgeComparator(params.preferLowerIndex));
    const mstEdges: KruskalMstEdge[] = [];

    let nextIndex = 0;
    let edgesConsidered = 0;
    let edgesAccepted = 0;
    let cycleSkips = 0;
    let totalWeight = 0;
    let components = input.nodeCount;

    for (let edgeIndex = 0; edgeIndex < sortedEdges.length; edgeIndex += 1) {
      if (mstEdges.length >= input.nodeCount - 1) {
        break;
      }

      const edge = sortedEdges[edgeIndex];
      edgesConsidered += 1;

      steps.push(
        createEvent(nextIndex, "edge-consider", {
          edgeIndex,
          from: edge.from,
          to: edge.to,
          weight: edge.weight,
          consideredCount: edgesConsidered,
        }),
      );
      nextIndex += 1;

      const leftRoot = findRoot(parents, edge.from, params.pathCompression);
      const rightRoot = findRoot(parents, edge.to, params.pathCompression);
      const accepted = leftRoot !== rightRoot;

      if (accepted) {
        unionRoots(leftRoot, rightRoot, parents, ranks, params.unionByRank);
        components -= 1;
      } else {
        cycleSkips += 1;
      }

      steps.push(
        createEvent(nextIndex, "union-check", {
          edgeIndex,
          from: edge.from,
          to: edge.to,
          weight: edge.weight,
          leftRoot,
          rightRoot,
          accepted,
          componentCount: components,
        }),
      );
      nextIndex += 1;

      if (!accepted) {
        continue;
      }

      mstEdges.push(edge);
      edgesAccepted += 1;
      totalWeight += edge.weight;
      steps.push(
        createEvent(nextIndex, "edge-accept", {
          edgeIndex,
          from: edge.from,
          to: edge.to,
          weight: edge.weight,
          acceptedCount: edgesAccepted,
          totalWeight,
        }),
      );
      nextIndex += 1;
    }

    const connected = input.nodeCount > 0 && components === 1 && edgesAccepted === input.nodeCount - 1;

    steps.push(
      createEvent(nextIndex, "complete", {
        edgesConsidered,
        edgesAccepted,
        cycleSkips,
        totalWeight,
        components,
        connected,
      }),
    );

    return {
      steps,
      result: {
        mstEdges,
        totalWeight,
        edgesConsidered,
        edgesAccepted,
        cycleSkips,
        components,
        connected,
      },
    };
  },
};

export function createKruskalMstRun(
  rawParams: RawParams,
): AlgorithmRunOutput<KruskalMstInput, KruskalMstParams, KruskalMstStepEvent, KruskalMstResult> {
  const normalizedParams = kruskalMstEngine.normalizeParams(rawParams);
  const input = kruskalMstEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = kruskalMstEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

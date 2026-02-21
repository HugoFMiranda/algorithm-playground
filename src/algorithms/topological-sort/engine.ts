import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type TopologicalSortInput,
  type TopologicalSortParams,
  type TopologicalSortResult,
  normalizeTopologicalSortInput,
  normalizeTopologicalSortParams,
} from "@/algorithms/topological-sort/spec";

type QueuePushEvent = ArrayStepEvent<
  "queue-push",
  {
    node: number;
    reason: "initial-zero" | "indegree-zero";
    queueSize: number;
  }
>;
type NodeOutputEvent = ArrayStepEvent<
  "node-output",
  {
    node: number;
    queueSize: number;
    orderIndex: number;
  }
>;
type IndegreeDecrementEvent = ArrayStepEvent<
  "indegree-decrement",
  {
    from: number;
    to: number;
    nextIndegree: number;
    queued: boolean;
    queueSize: number;
  }
>;
type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    processedCount: number;
    orderLength: number;
    remainingCount: number;
    edgeRelaxations: number;
    initialZeroCount: number;
    cycleDetected: boolean;
  }
>;

export type TopologicalSortStepEvent =
  | QueuePushEvent
  | NodeOutputEvent
  | IndegreeDecrementEvent
  | CompleteEvent;

function createEvent<TEvent extends TopologicalSortStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `topological-sort-${index}`,
    index,
    family: "array",
    type,
    payload,
  } as TEvent;
}

function createComparator(preferLowerIndex: boolean): (left: number, right: number) => number {
  return preferLowerIndex ? (left, right) => left - right : (left, right) => right - left;
}

export const topologicalSortEngine: AlgorithmEngine<
  TopologicalSortInput,
  TopologicalSortParams,
  TopologicalSortStepEvent,
  TopologicalSortResult
> = {
  normalizeParams: normalizeTopologicalSortParams,
  normalizeInput: normalizeTopologicalSortInput,
  generate: (input, params) => {
    const steps: TopologicalSortStepEvent[] = [];
    const indegrees = [...input.indegrees];
    const queue: number[] = [];
    const outputOrder: number[] = [];
    const compareNodes = createComparator(params.preferLowerIndex);
    let nextIndex = 0;
    let edgeRelaxations = 0;
    let initialZeroCount = 0;

    for (let node = 0; node < input.nodeCount; node += 1) {
      if (indegrees[node] === 0) {
        queue.push(node);
        queue.sort(compareNodes);
        initialZeroCount += 1;
        steps.push(
          createEvent(nextIndex, "queue-push", {
            node,
            reason: "initial-zero",
            queueSize: queue.length,
          }),
        );
        nextIndex += 1;
      }
    }

    while (queue.length > 0) {
      const node = queue.shift() as number;
      const orderIndex = outputOrder.length;
      outputOrder.push(node);
      steps.push(
        createEvent(nextIndex, "node-output", {
          node,
          queueSize: queue.length,
          orderIndex,
        }),
      );
      nextIndex += 1;

      const neighbors = [...input.adjacency[node]].sort(compareNodes);
      for (const neighbor of neighbors) {
        edgeRelaxations += 1;
        indegrees[neighbor] -= 1;
        let queued = false;

        if (indegrees[neighbor] === 0) {
          queue.push(neighbor);
          queue.sort(compareNodes);
          queued = true;
        }

        steps.push(
          createEvent(nextIndex, "indegree-decrement", {
            from: node,
            to: neighbor,
            nextIndegree: indegrees[neighbor],
            queued,
            queueSize: queue.length,
          }),
        );
        nextIndex += 1;

        if (queued) {
          steps.push(
            createEvent(nextIndex, "queue-push", {
              node: neighbor,
              reason: "indegree-zero",
              queueSize: queue.length,
            }),
          );
          nextIndex += 1;
        }
      }
    }

    const processedCount = outputOrder.length;
    const remainingCount = Math.max(0, input.nodeCount - processedCount);
    const cycleDetected = remainingCount > 0;

    steps.push(
      createEvent(nextIndex, "complete", {
        processedCount,
        orderLength: outputOrder.length,
        remainingCount,
        edgeRelaxations,
        initialZeroCount,
        cycleDetected,
      }),
    );

    return {
      steps,
      result: {
        order: outputOrder,
        cycleDetected,
        processedCount,
        remainingCount,
        edgeRelaxations,
        initialZeroCount,
      },
    };
  },
};

export function createTopologicalSortRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  TopologicalSortInput,
  TopologicalSortParams,
  TopologicalSortStepEvent,
  TopologicalSortResult
> {
  const normalizedParams = topologicalSortEngine.normalizeParams(rawParams);
  const input = topologicalSortEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = topologicalSortEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

import type { AlgorithmEngine, AlgorithmRunOutput, ArrayStepEvent, RawParams } from "@/types/engine";

import {
  type UnionFindInput,
  type UnionFindOperation,
  type UnionFindParams,
  type UnionFindResult,
  normalizeUnionFindInput,
  normalizeUnionFindParams,
} from "@/algorithms/union-find/spec";

type FindRootContext = "union-left" | "union-right" | "find" | "connected-left" | "connected-right";

type FindRootEvent = ArrayStepEvent<
  "find-root",
  {
    operationIndex: number;
    context: FindRootContext;
    node: number;
    root: number;
    trail: string;
    depth: number;
    operation: string;
  }
>;

type CompressPathEvent = ArrayStepEvent<
  "compress-path",
  {
    operationIndex: number;
    node: number;
    fromParent: number;
    toParent: number;
    root: number;
    operation: string;
  }
>;

type UnionEvent = ArrayStepEvent<
  "union",
  {
    operationIndex: number;
    left: number;
    right: number;
    leftRoot: number;
    rightRoot: number;
    merged: boolean;
    attachedRoot: number | null;
    parentRoot: number | null;
    rankRaisedRoot: number | null;
    nextRank: number | null;
    componentCount: number;
    operation: string;
  }
>;

type QueryResultEvent = ArrayStepEvent<
  "query-result",
  {
    operationIndex: number;
    queryType: "find" | "connected";
    node: number;
    otherNode: number | null;
    root: number;
    otherRoot: number | null;
    connected: boolean | null;
    operation: string;
  }
>;

type CompleteEvent = ArrayStepEvent<
  "complete",
  {
    componentCount: number;
    operationsProcessed: number;
    successfulUnions: number;
    findQueries: number;
    connectedQueries: number;
    pathCompression: boolean;
    unionByRank: boolean;
    parents: string;
    ranks: string;
  }
>;

export type UnionFindStepEvent =
  | FindRootEvent
  | CompressPathEvent
  | UnionEvent
  | QueryResultEvent
  | CompleteEvent;

function createEvent<TEvent extends UnionFindStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `union-find-${index}`,
    index,
    family: "array",
    type,
    payload,
  } as TEvent;
}

interface RootTrace {
  root: number;
  trail: number[];
}

function traceRoot(parents: number[], start: number): RootTrace {
  const trail: number[] = [start];
  const seen = new Set<number>([start]);

  let current = start;
  while (parents[current] !== current) {
    current = parents[current];
    if (seen.has(current)) {
      break;
    }
    seen.add(current);
    trail.push(current);

    if (trail.length > parents.length + 1) {
      break;
    }
  }

  return {
    root: current,
    trail,
  };
}

function serializeTrail(trail: number[]): string {
  return trail.join(" -> ");
}

function formatArray(values: number[]): string {
  return values.join(", ");
}

export const unionFindEngine: AlgorithmEngine<
  UnionFindInput,
  UnionFindParams,
  UnionFindStepEvent,
  UnionFindResult
> = {
  normalizeParams: normalizeUnionFindParams,
  normalizeInput: normalizeUnionFindInput,
  generate: (input, params) => {
    const steps: UnionFindStepEvent[] = [];
    const parents = Array.from({ length: input.nodeCount }, (_, index) => index);
    const ranks = Array.from({ length: input.nodeCount }, () => 0);

    let nextIndex = 0;
    let componentCount = input.nodeCount;
    let successfulUnions = 0;
    let findQueries = 0;
    let connectedQueries = 0;

    const emitFindTrace = (
      operationIndex: number,
      context: FindRootContext,
      operation: string,
      node: number,
    ): RootTrace => {
      const trace = traceRoot(parents, node);

      steps.push(
        createEvent(nextIndex, "find-root", {
          operationIndex,
          context,
          node,
          root: trace.root,
          trail: serializeTrail(trace.trail),
          depth: Math.max(0, trace.trail.length - 1),
          operation,
        }),
      );
      nextIndex += 1;

      if (params.pathCompression && trace.trail.length > 1) {
        for (let trailIndex = 0; trailIndex < trace.trail.length - 1; trailIndex += 1) {
          const visitedNode = trace.trail[trailIndex];
          const currentParent = parents[visitedNode];
          if (currentParent === trace.root) {
            continue;
          }

          parents[visitedNode] = trace.root;
          steps.push(
            createEvent(nextIndex, "compress-path", {
              operationIndex,
              node: visitedNode,
              fromParent: currentParent,
              toParent: trace.root,
              root: trace.root,
              operation,
            }),
          );
          nextIndex += 1;
        }
      }

      return {
        root: trace.root,
        trail: [...trace.trail],
      };
    };

    const applyUnion = (
      leftRoot: number,
      rightRoot: number,
    ): { attachedRoot: number; parentRoot: number; rankRaisedRoot: number | null; nextRank: number | null } => {
      if (!params.unionByRank) {
        parents[rightRoot] = leftRoot;
        return {
          attachedRoot: rightRoot,
          parentRoot: leftRoot,
          rankRaisedRoot: null,
          nextRank: null,
        };
      }

      const leftRank = ranks[leftRoot];
      const rightRank = ranks[rightRoot];

      if (leftRank < rightRank) {
        parents[leftRoot] = rightRoot;
        return {
          attachedRoot: leftRoot,
          parentRoot: rightRoot,
          rankRaisedRoot: null,
          nextRank: null,
        };
      }

      if (rightRank < leftRank) {
        parents[rightRoot] = leftRoot;
        return {
          attachedRoot: rightRoot,
          parentRoot: leftRoot,
          rankRaisedRoot: null,
          nextRank: null,
        };
      }

      const parentRoot = Math.min(leftRoot, rightRoot);
      const attachedRoot = parentRoot === leftRoot ? rightRoot : leftRoot;
      parents[attachedRoot] = parentRoot;
      ranks[parentRoot] += 1;

      return {
        attachedRoot,
        parentRoot,
        rankRaisedRoot: parentRoot,
        nextRank: ranks[parentRoot],
      };
    };

    input.operations.forEach((operation: UnionFindOperation, operationIndex) => {
      if (operation.type === "union") {
        const leftTrace = emitFindTrace(operationIndex, "union-left", operation.source, operation.left);
        const rightNode = operation.right as number;
        const rightTrace = emitFindTrace(operationIndex, "union-right", operation.source, rightNode);

        let merged = false;
        let attachedRoot: number | null = null;
        let parentRoot: number | null = null;
        let rankRaisedRoot: number | null = null;
        let nextRank: number | null = null;

        if (leftTrace.root !== rightTrace.root) {
          const unionResult = applyUnion(leftTrace.root, rightTrace.root);
          attachedRoot = unionResult.attachedRoot;
          parentRoot = unionResult.parentRoot;
          rankRaisedRoot = unionResult.rankRaisedRoot;
          nextRank = unionResult.nextRank;
          merged = true;
          componentCount -= 1;
          successfulUnions += 1;
        }

        steps.push(
          createEvent(nextIndex, "union", {
            operationIndex,
            left: operation.left,
            right: rightNode,
            leftRoot: leftTrace.root,
            rightRoot: rightTrace.root,
            merged,
            attachedRoot,
            parentRoot,
            rankRaisedRoot,
            nextRank,
            componentCount,
            operation: operation.source,
          }),
        );
        nextIndex += 1;

        return;
      }

      if (operation.type === "find") {
        const trace = emitFindTrace(operationIndex, "find", operation.source, operation.left);
        findQueries += 1;
        steps.push(
          createEvent(nextIndex, "query-result", {
            operationIndex,
            queryType: "find",
            node: operation.left,
            otherNode: null,
            root: trace.root,
            otherRoot: null,
            connected: null,
            operation: operation.source,
          }),
        );
        nextIndex += 1;
        return;
      }

      const rightNode = operation.right as number;
      const leftTrace = emitFindTrace(operationIndex, "connected-left", operation.source, operation.left);
      const rightTrace = emitFindTrace(operationIndex, "connected-right", operation.source, rightNode);
      connectedQueries += 1;

      steps.push(
        createEvent(nextIndex, "query-result", {
          operationIndex,
          queryType: "connected",
          node: operation.left,
          otherNode: rightNode,
          root: leftTrace.root,
          otherRoot: rightTrace.root,
          connected: leftTrace.root === rightTrace.root,
          operation: operation.source,
        }),
      );
      nextIndex += 1;
    });

    steps.push(
      createEvent(nextIndex, "complete", {
        componentCount,
        operationsProcessed: input.operations.length,
        successfulUnions,
        findQueries,
        connectedQueries,
        pathCompression: params.pathCompression,
        unionByRank: params.unionByRank,
        parents: formatArray(parents),
        ranks: formatArray(ranks),
      }),
    );

    return {
      steps,
      result: {
        parents,
        ranks,
        componentCount,
        operationsProcessed: input.operations.length,
        successfulUnions,
        findQueries,
        connectedQueries,
      },
    };
  },
};

export function createUnionFindRun(
  rawParams: RawParams,
): AlgorithmRunOutput<UnionFindInput, UnionFindParams, UnionFindStepEvent, UnionFindResult> {
  const normalizedParams = unionFindEngine.normalizeParams(rawParams);
  const input = unionFindEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = unionFindEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

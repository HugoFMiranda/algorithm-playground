import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, StepEventBase } from "@/types/engine";

import {
  type InvertBinaryTreeInput,
  type InvertBinaryTreeParams,
  type InvertBinaryTreeResult,
  type InvertBinaryTreeTraversalMode,
  normalizeInvertBinaryTreeInput,
  normalizeInvertBinaryTreeParams,
} from "@/algorithms/invert-binary-tree/spec";

type VisitNodeEvent = StepEventBase<
  "search",
  "visit-node",
  {
    nodeId: number;
    value: number;
    depth: number;
    leftValue: number | null;
    rightValue: number | null;
    visitedCount: number;
    traversalMode: InvertBinaryTreeTraversalMode;
  }
>;

type SwapChildrenEvent = StepEventBase<
  "search",
  "swap-children",
  {
    nodeId: number;
    leftNodeId: number | null;
    rightNodeId: number | null;
    leftValue: number | null;
    rightValue: number | null;
    swapCount: number;
  }
>;

type CompleteEvent = StepEventBase<
  "search",
  "complete",
  {
    visitedCount: number;
    swaps: number;
    traversalMode: InvertBinaryTreeTraversalMode;
    rootValue: number | null;
    levelOrder: string;
    isEmpty: boolean;
  }
>;

export type InvertBinaryTreeStepEvent = VisitNodeEvent | SwapChildrenEvent | CompleteEvent;

function createEvent<TEvent extends InvertBinaryTreeStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `invert-binary-tree-${index}`,
    index,
    family: "search",
    type,
    payload,
  } as TEvent;
}

function getNodeValue(input: Pick<InvertBinaryTreeInput, "nodes">, nodeId: number | null): number | null {
  if (nodeId === null) {
    return null;
  }

  const node = input.nodes[nodeId];
  return node ? node.value : null;
}

function toLevelOrderValues(input: Pick<InvertBinaryTreeInput, "rootId" | "nodes">): Array<number | null> {
  if (input.rootId === null) {
    return [];
  }

  const values: Array<number | null> = [];
  const queue: Array<number | null> = [input.rootId];

  while (queue.length > 0) {
    const nodeId = queue.shift() as number | null;

    if (nodeId === null) {
      values.push(null);
      continue;
    }

    const node = input.nodes[nodeId];
    if (!node) {
      values.push(null);
      continue;
    }

    values.push(node.value);
    queue.push(node.left);
    queue.push(node.right);
  }

  while (values.length > 0 && values[values.length - 1] === null) {
    values.pop();
  }

  return values;
}

function serializeLevelOrder(values: Array<number | null>): string {
  if (values.length === 0) {
    return "empty";
  }

  return values.map((value) => (value === null ? "null" : String(value))).join(", ");
}

interface TraversalNode {
  nodeId: number;
  depth: number;
}

export const invertBinaryTreeEngine: AlgorithmEngine<
  InvertBinaryTreeInput,
  InvertBinaryTreeParams,
  InvertBinaryTreeStepEvent,
  InvertBinaryTreeResult
> = {
  normalizeParams: normalizeInvertBinaryTreeParams,
  normalizeInput: normalizeInvertBinaryTreeInput,
  generate: (input, params) => {
    const nodes = input.nodes.map((node) => ({ ...node }));
    const mutableInput: InvertBinaryTreeInput = {
      rootId: input.rootId,
      nodes,
      levelOrder: [...input.levelOrder],
    };

    const steps: InvertBinaryTreeStepEvent[] = [];
    const traversalOrder: number[] = [];
    let nextIndex = 0;
    let visitedCount = 0;
    let swaps = 0;

    if (mutableInput.rootId !== null) {
      if (params.traversalMode === "dfs") {
        const stack: TraversalNode[] = [{ nodeId: mutableInput.rootId, depth: 0 }];

        while (stack.length > 0) {
          const current = stack.pop() as TraversalNode;
          const node = mutableInput.nodes[current.nodeId];

          visitedCount += 1;
          traversalOrder.push(current.nodeId);
          steps.push(
            createEvent(nextIndex, "visit-node", {
              nodeId: current.nodeId,
              value: node.value,
              depth: current.depth,
              leftValue: getNodeValue(mutableInput, node.left),
              rightValue: getNodeValue(mutableInput, node.right),
              visitedCount,
              traversalMode: params.traversalMode,
            }),
          );
          nextIndex += 1;

          const nextLeft = node.right;
          const nextRight = node.left;
          node.left = nextLeft;
          node.right = nextRight;

          swaps += 1;
          steps.push(
            createEvent(nextIndex, "swap-children", {
              nodeId: current.nodeId,
              leftNodeId: node.left,
              rightNodeId: node.right,
              leftValue: getNodeValue(mutableInput, node.left),
              rightValue: getNodeValue(mutableInput, node.right),
              swapCount: swaps,
            }),
          );
          nextIndex += 1;

          if (node.right !== null) {
            stack.push({ nodeId: node.right, depth: current.depth + 1 });
          }
          if (node.left !== null) {
            stack.push({ nodeId: node.left, depth: current.depth + 1 });
          }
        }
      } else {
        const queue: TraversalNode[] = [{ nodeId: mutableInput.rootId, depth: 0 }];

        while (queue.length > 0) {
          const current = queue.shift() as TraversalNode;
          const node = mutableInput.nodes[current.nodeId];

          visitedCount += 1;
          traversalOrder.push(current.nodeId);
          steps.push(
            createEvent(nextIndex, "visit-node", {
              nodeId: current.nodeId,
              value: node.value,
              depth: current.depth,
              leftValue: getNodeValue(mutableInput, node.left),
              rightValue: getNodeValue(mutableInput, node.right),
              visitedCount,
              traversalMode: params.traversalMode,
            }),
          );
          nextIndex += 1;

          const nextLeft = node.right;
          const nextRight = node.left;
          node.left = nextLeft;
          node.right = nextRight;

          swaps += 1;
          steps.push(
            createEvent(nextIndex, "swap-children", {
              nodeId: current.nodeId,
              leftNodeId: node.left,
              rightNodeId: node.right,
              leftValue: getNodeValue(mutableInput, node.left),
              rightValue: getNodeValue(mutableInput, node.right),
              swapCount: swaps,
            }),
          );
          nextIndex += 1;

          if (node.left !== null) {
            queue.push({ nodeId: node.left, depth: current.depth + 1 });
          }
          if (node.right !== null) {
            queue.push({ nodeId: node.right, depth: current.depth + 1 });
          }
        }
      }
    }

    const invertedLevelOrder = toLevelOrderValues(mutableInput);
    const rootValue = getNodeValue(mutableInput, mutableInput.rootId);
    const isEmpty = mutableInput.rootId === null;

    steps.push(
      createEvent(nextIndex, "complete", {
        visitedCount,
        swaps,
        traversalMode: params.traversalMode,
        rootValue,
        levelOrder: serializeLevelOrder(invertedLevelOrder),
        isEmpty,
      }),
    );

    return {
      steps,
      result: {
        invertedLevelOrder,
        visitedCount,
        swaps,
        traversalOrder,
        rootValue,
        isEmpty,
      },
    };
  },
};

export function createInvertBinaryTreeRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  InvertBinaryTreeInput,
  InvertBinaryTreeParams,
  InvertBinaryTreeStepEvent,
  InvertBinaryTreeResult
> {
  const normalizedParams = invertBinaryTreeEngine.normalizeParams(rawParams);
  const input = invertBinaryTreeEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = invertBinaryTreeEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

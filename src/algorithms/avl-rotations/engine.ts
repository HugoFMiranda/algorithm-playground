import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, StepEventBase } from "@/types/engine";

import {
  type AvlRotationsInput,
  type AvlRotationsNode,
  type AvlRotationsParams,
  type AvlRotationsResult,
  normalizeAvlRotationsInput,
  normalizeAvlRotationsParams,
} from "@/algorithms/avl-rotations/spec";

type RotationCase = "LL" | "RR" | "LR" | "RL";

type TraverseEvent = StepEventBase<
  "search",
  "traverse",
  {
    insertIndex: number;
    targetValue: number;
    nodeId: number;
    nodeValue: number;
    depth: number;
    direction: "root" | "left" | "right" | "match";
    nextNodeId: number | null;
  }
>;

type InsertNodeEvent = StepEventBase<
  "search",
  "insert-node",
  {
    insertIndex: number;
    targetValue: number;
    nodeId: number;
    parentId: number | null;
    direction: "root" | "left" | "right";
    depth: number;
    duplicate: boolean;
    nodeCount: number;
  }
>;

type HeightUpdateEvent = StepEventBase<
  "search",
  "height-update",
  {
    insertIndex: number;
    nodeId: number;
    value: number;
    height: number;
    balanceFactor: number;
    leftHeight: number;
    rightHeight: number;
  }
>;

type ImbalanceDetectedEvent = StepEventBase<
  "search",
  "imbalance-detected",
  {
    insertIndex: number;
    nodeId: number;
    value: number;
    balanceFactor: number;
    caseType: RotationCase;
    childNodeId: number | null;
  }
>;

type RotateLeftEvent = StepEventBase<
  "search",
  "rotate-left",
  {
    insertIndex: number;
    pivotId: number;
    newRootId: number;
    parentId: number | null;
    direction: "root" | "left" | "right";
    movedSubtreeId: number | null;
  }
>;

type RotateRightEvent = StepEventBase<
  "search",
  "rotate-right",
  {
    insertIndex: number;
    pivotId: number;
    newRootId: number;
    parentId: number | null;
    direction: "root" | "left" | "right";
    movedSubtreeId: number | null;
  }
>;

type CompleteEvent = StepEventBase<
  "search",
  "complete",
  {
    insertedCount: number;
    duplicateCount: number;
    heightUpdates: number;
    imbalanceCount: number;
    rotations: number;
    nodeCount: number;
    treeHeight: number;
  }
>;

export type AvlRotationsStepEvent =
  | TraverseEvent
  | InsertNodeEvent
  | HeightUpdateEvent
  | ImbalanceDetectedEvent
  | RotateLeftEvent
  | RotateRightEvent
  | CompleteEvent;

function createEvent<TEvent extends AvlRotationsStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `avl-rotations-${index}`,
    index,
    family: "search",
    type,
    payload,
  } as TEvent;
}

function cloneNodes(nodes: AvlRotationsNode[]): AvlRotationsNode[] {
  return nodes.map((node) => ({ ...node }));
}

function getHeight(nodes: AvlRotationsNode[], nodeId: number | null): number {
  if (nodeId === null) {
    return 0;
  }

  return nodes[nodeId]?.height ?? 0;
}

function getBalanceFactor(nodes: AvlRotationsNode[], nodeId: number | null): number {
  if (nodeId === null) {
    return 0;
  }

  const node = nodes[nodeId];
  if (!node) {
    return 0;
  }

  return getHeight(nodes, node.left) - getHeight(nodes, node.right);
}

function updateHeight(
  nodes: AvlRotationsNode[],
  nodeId: number,
  insertIndex: number,
  steps: AvlRotationsStepEvent[],
  nextIndexRef: { current: number },
  metrics: { heightUpdates: number },
): void {
  const node = nodes[nodeId] as AvlRotationsNode;
  const leftHeight = getHeight(nodes, node.left);
  const rightHeight = getHeight(nodes, node.right);
  node.height = Math.max(leftHeight, rightHeight) + 1;
  metrics.heightUpdates += 1;

  steps.push(
    createEvent(nextIndexRef.current, "height-update", {
      insertIndex,
      nodeId,
      value: node.value,
      height: node.height,
      balanceFactor: leftHeight - rightHeight,
      leftHeight,
      rightHeight,
    }),
  );
  nextIndexRef.current += 1;
}

function getReachableNodeCount(rootId: number | null, nodes: AvlRotationsNode[]): number {
  if (rootId === null || !nodes[rootId]) {
    return 0;
  }

  const visited = new Set<number>();
  const queue: number[] = [rootId];
  while (queue.length > 0) {
    const nodeId = queue.shift() as number;
    if (visited.has(nodeId)) {
      continue;
    }
    visited.add(nodeId);

    const node = nodes[nodeId];
    if (!node) {
      continue;
    }

    if (node.left !== null) {
      queue.push(node.left);
    }
    if (node.right !== null) {
      queue.push(node.right);
    }
  }

  return visited.size;
}

function toLevelOrder(rootId: number | null, nodes: AvlRotationsNode[]): Array<number | null> {
  if (rootId === null || !nodes[rootId]) {
    return [];
  }

  const values: Array<number | null> = [];
  const queue: Array<number | null> = [rootId];

  while (queue.length > 0) {
    const nodeId = queue.shift() as number | null;
    if (nodeId === null) {
      values.push(null);
      continue;
    }

    const node = nodes[nodeId];
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

function getTreeHeight(rootId: number | null, nodes: AvlRotationsNode[]): number {
  return getHeight(nodes, rootId);
}

function rotateLeft(
  nodes: AvlRotationsNode[],
  pivotId: number,
  parentId: number | null,
  direction: "root" | "left" | "right",
  insertIndex: number,
  steps: AvlRotationsStepEvent[],
  nextIndexRef: { current: number },
  metrics: { rotations: number; heightUpdates: number },
): number {
  const pivot = nodes[pivotId] as AvlRotationsNode;
  const newRootId = pivot.right as number;
  const newRoot = nodes[newRootId] as AvlRotationsNode;
  const movedSubtreeId = newRoot.left;

  pivot.right = movedSubtreeId;
  newRoot.left = pivotId;

  metrics.rotations += 1;
  steps.push(
    createEvent(nextIndexRef.current, "rotate-left", {
      insertIndex,
      pivotId,
      newRootId,
      parentId,
      direction,
      movedSubtreeId,
    }),
  );
  nextIndexRef.current += 1;

  updateHeight(nodes, pivotId, insertIndex, steps, nextIndexRef, metrics);
  updateHeight(nodes, newRootId, insertIndex, steps, nextIndexRef, metrics);

  return newRootId;
}

function rotateRight(
  nodes: AvlRotationsNode[],
  pivotId: number,
  parentId: number | null,
  direction: "root" | "left" | "right",
  insertIndex: number,
  steps: AvlRotationsStepEvent[],
  nextIndexRef: { current: number },
  metrics: { rotations: number; heightUpdates: number },
): number {
  const pivot = nodes[pivotId] as AvlRotationsNode;
  const newRootId = pivot.left as number;
  const newRoot = nodes[newRootId] as AvlRotationsNode;
  const movedSubtreeId = newRoot.right;

  pivot.left = movedSubtreeId;
  newRoot.right = pivotId;

  metrics.rotations += 1;
  steps.push(
    createEvent(nextIndexRef.current, "rotate-right", {
      insertIndex,
      pivotId,
      newRootId,
      parentId,
      direction,
      movedSubtreeId,
    }),
  );
  nextIndexRef.current += 1;

  updateHeight(nodes, pivotId, insertIndex, steps, nextIndexRef, metrics);
  updateHeight(nodes, newRootId, insertIndex, steps, nextIndexRef, metrics);

  return newRootId;
}

interface InsertMetrics {
  insertedCount: number;
  duplicateCount: number;
  heightUpdates: number;
  imbalanceCount: number;
  rotations: number;
}

function insertValue(
  nodes: AvlRotationsNode[],
  nodeId: number | null,
  parentId: number | null,
  direction: "root" | "left" | "right",
  depth: number,
  targetValue: number,
  insertIndex: number,
  steps: AvlRotationsStepEvent[],
  nextIndexRef: { current: number },
  metrics: InsertMetrics,
): number {
  if (nodeId === null) {
    const nextId = nodes.length;
    nodes.push({
      id: nextId,
      value: targetValue,
      left: null,
      right: null,
      height: 1,
    });
    metrics.insertedCount += 1;
    steps.push(
      createEvent(nextIndexRef.current, "insert-node", {
        insertIndex,
        targetValue,
        nodeId: nextId,
        parentId,
        direction,
        depth,
        duplicate: false,
        nodeCount: 0,
      }),
    );
    nextIndexRef.current += 1;
    return nextId;
  }

  const node = nodes[nodeId] as AvlRotationsNode;
  if (targetValue === node.value) {
    steps.push(
      createEvent(nextIndexRef.current, "traverse", {
        insertIndex,
        targetValue,
        nodeId,
        nodeValue: node.value,
        depth,
        direction: depth === 0 ? "match" : direction,
        nextNodeId: null,
      }),
    );
    nextIndexRef.current += 1;

    metrics.duplicateCount += 1;
    steps.push(
      createEvent(nextIndexRef.current, "insert-node", {
        insertIndex,
        targetValue,
        nodeId,
        parentId,
        direction,
        depth,
        duplicate: true,
        nodeCount: 0,
      }),
    );
    nextIndexRef.current += 1;
    return nodeId;
  }

  const nextDirection = targetValue < node.value ? "left" : "right";
  const nextNodeId = nextDirection === "left" ? node.left : node.right;
  steps.push(
    createEvent(nextIndexRef.current, "traverse", {
      insertIndex,
      targetValue,
      nodeId,
      nodeValue: node.value,
      depth,
      direction: depth === 0 ? "root" : direction,
      nextNodeId,
    }),
  );
  nextIndexRef.current += 1;

  if (nextDirection === "left") {
    node.left = insertValue(
      nodes,
      node.left,
      nodeId,
      "left",
      depth + 1,
      targetValue,
      insertIndex,
      steps,
      nextIndexRef,
      metrics,
    );
  } else {
    node.right = insertValue(
      nodes,
      node.right,
      nodeId,
      "right",
      depth + 1,
      targetValue,
      insertIndex,
      steps,
      nextIndexRef,
      metrics,
    );
  }

  updateHeight(nodes, nodeId, insertIndex, steps, nextIndexRef, metrics);
  const balanceFactor = getBalanceFactor(nodes, nodeId);

  if (balanceFactor > 1 || balanceFactor < -1) {
    const childNodeId = balanceFactor > 1 ? node.left : node.right;
    const childBalance = getBalanceFactor(nodes, childNodeId);
    const caseType: RotationCase =
      balanceFactor > 1
        ? childBalance >= 0
          ? "LL"
          : "LR"
        : childBalance <= 0
          ? "RR"
          : "RL";

    metrics.imbalanceCount += 1;
    steps.push(
      createEvent(nextIndexRef.current, "imbalance-detected", {
        insertIndex,
        nodeId,
        value: node.value,
        balanceFactor,
        caseType,
        childNodeId,
      }),
    );
    nextIndexRef.current += 1;

    if (caseType === "LL") {
      return rotateRight(nodes, nodeId, parentId, direction, insertIndex, steps, nextIndexRef, metrics);
    }

    if (caseType === "RR") {
      return rotateLeft(nodes, nodeId, parentId, direction, insertIndex, steps, nextIndexRef, metrics);
    }

    if (caseType === "LR") {
      node.left = rotateLeft(
        nodes,
        node.left as number,
        nodeId,
        "left",
        insertIndex,
        steps,
        nextIndexRef,
        metrics,
      );
      return rotateRight(nodes, nodeId, parentId, direction, insertIndex, steps, nextIndexRef, metrics);
    }

    node.right = rotateRight(
      nodes,
      node.right as number,
      nodeId,
      "right",
      insertIndex,
      steps,
      nextIndexRef,
      metrics,
    );
    return rotateLeft(nodes, nodeId, parentId, direction, insertIndex, steps, nextIndexRef, metrics);
  }

  return nodeId;
}

export const avlRotationsEngine: AlgorithmEngine<
  AvlRotationsInput,
  AvlRotationsParams,
  AvlRotationsStepEvent,
  AvlRotationsResult
> = {
  normalizeParams: normalizeAvlRotationsParams,
  normalizeInput: normalizeAvlRotationsInput,
  generate: (input) => {
    const nodes = cloneNodes(input.nodes);
    const steps: AvlRotationsStepEvent[] = [];
    const nextIndexRef = { current: 0 };
    const metrics: InsertMetrics = {
      insertedCount: 0,
      duplicateCount: 0,
      heightUpdates: 0,
      imbalanceCount: 0,
      rotations: 0,
    };

    let rootId = input.rootId;

    for (const [insertIndex, targetValue] of input.insertValues.entries()) {
      rootId = insertValue(
        nodes,
        rootId,
        null,
        "root",
        0,
        targetValue,
        insertIndex,
        steps,
        nextIndexRef,
        metrics,
      );
    }

    const nodeCount = getReachableNodeCount(rootId, nodes);

    for (const step of steps) {
      if (step.type === "insert-node") {
        step.payload.nodeCount = nodeCount;
      }
    }

    const treeHeight = getTreeHeight(rootId, nodes);
    steps.push(
      createEvent(nextIndexRef.current, "complete", {
        insertedCount: metrics.insertedCount,
        duplicateCount: metrics.duplicateCount,
        heightUpdates: metrics.heightUpdates,
        imbalanceCount: metrics.imbalanceCount,
        rotations: metrics.rotations,
        nodeCount,
        treeHeight,
      }),
    );

    return {
      steps,
      result: {
        finalLevelOrder: toLevelOrder(rootId, nodes),
        nodeCount,
        treeHeight,
        insertedCount: metrics.insertedCount,
        duplicateCount: metrics.duplicateCount,
        heightUpdates: metrics.heightUpdates,
        imbalanceCount: metrics.imbalanceCount,
        rotations: metrics.rotations,
        rootValue: rootId === null ? null : nodes[rootId]?.value ?? null,
      },
    };
  },
};

export function createAvlRotationsRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  AvlRotationsInput,
  AvlRotationsParams,
  AvlRotationsStepEvent,
  AvlRotationsResult
> {
  const normalizedParams = avlRotationsEngine.normalizeParams(rawParams);
  const input = avlRotationsEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = avlRotationsEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

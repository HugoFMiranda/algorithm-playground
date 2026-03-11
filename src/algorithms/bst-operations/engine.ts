import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, StepEventBase } from "@/types/engine";

import {
  type BstDeleteStrategy,
  type BstOperation,
  type BstOperationType,
  type BstOperationsInput,
  type BstOperationsNode,
  type BstOperationsParams,
  type BstOperationsResult,
  normalizeBstOperationsInput,
  normalizeBstOperationsParams,
} from "@/algorithms/bst-operations/spec";

type TraverseDirection = "root" | "left" | "right" | "match";
type DeleteCaseKind = "not-found" | "leaf" | "one-child" | "two-children";
type RelinkAction = "replace-root" | "set-left" | "set-right" | "copy-value";

type TraverseEvent = StepEventBase<
  "search",
  "traverse",
  {
    operationIndex: number;
    operationType: BstOperationType;
    targetValue: number;
    nodeId: number;
    nodeValue: number;
    depth: number;
    direction: TraverseDirection;
    nextNodeId: number | null;
  }
>;

type InsertNodeEvent = StepEventBase<
  "search",
  "insert-node",
  {
    operationIndex: number;
    targetValue: number;
    nodeId: number;
    parentId: number | null;
    direction: "root" | "left" | "right";
    depth: number;
    duplicate: boolean;
    nodeCount: number;
  }
>;

type SearchResultEvent = StepEventBase<
  "search",
  "search-result",
  {
    operationIndex: number;
    targetValue: number;
    found: boolean;
    nodeId: number | null;
    depth: number;
    visitedCount: number;
    searchHits: number;
  }
>;

type DeleteCaseEvent = StepEventBase<
  "search",
  "delete-case",
  {
    operationIndex: number;
    targetValue: number;
    nodeId: number | null;
    depth: number;
    caseKind: DeleteCaseKind;
    replacementNodeId: number | null;
    candidateNodeId: number | null;
    candidateValue: number | null;
  }
>;

type DeleteRelinkEvent = StepEventBase<
  "search",
  "delete-relink",
  {
    operationIndex: number;
    targetValue: number;
    action: RelinkAction;
    parentId: number | null;
    nodeId: number;
    replacementNodeId: number | null;
    direction: "root" | "left" | "right";
    newValue: number | null;
    nodeCount: number;
    rootId: number | null;
  }
>;

type CompleteEvent = StepEventBase<
  "search",
  "complete",
  {
    operationsProcessed: number;
    traversedNodes: number;
    searchHits: number;
    insertsApplied: number;
    deletesApplied: number;
    duplicateInserts: number;
    missingDeletes: number;
    nodeCount: number;
    treeHeight: number;
  }
>;

export type BstOperationsStepEvent =
  | TraverseEvent
  | InsertNodeEvent
  | SearchResultEvent
  | DeleteCaseEvent
  | DeleteRelinkEvent
  | CompleteEvent;

function createEvent<TEvent extends BstOperationsStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `bst-operations-${index}`,
    index,
    family: "search",
    type,
    payload,
  } as TEvent;
}

interface SearchPosition {
  parentId: number | null;
  nodeId: number | null;
  depth: number;
  directionFromParent: "root" | "left" | "right";
}

function cloneNodes(nodes: BstOperationsNode[]): BstOperationsNode[] {
  return nodes.map((node) => ({ ...node }));
}

function getReachableNodeCount(rootId: number | null, nodes: BstOperationsNode[]): number {
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

function getTreeHeight(rootId: number | null, nodes: BstOperationsNode[]): number {
  if (rootId === null || !nodes[rootId]) {
    return 0;
  }

  const queue: Array<{ nodeId: number; depth: number }> = [{ nodeId: rootId, depth: 1 }];
  let height = 0;

  while (queue.length > 0) {
    const current = queue.shift() as { nodeId: number; depth: number };
    const node = nodes[current.nodeId];
    if (!node) {
      continue;
    }

    height = Math.max(height, current.depth);
    if (node.left !== null) {
      queue.push({ nodeId: node.left, depth: current.depth + 1 });
    }
    if (node.right !== null) {
      queue.push({ nodeId: node.right, depth: current.depth + 1 });
    }
  }

  return height;
}

function toLevelOrder(rootId: number | null, nodes: BstOperationsNode[]): Array<number | null> {
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

function findValue(
  rootId: number | null,
  nodes: BstOperationsNode[],
  targetValue: number,
  operationIndex: number,
  operationType: BstOperationType,
  steps: BstOperationsStepEvent[],
  nextIndexRef: { current: number },
): SearchPosition {
  let parentId: number | null = null;
  let nodeId = rootId;
  let depth = 0;
  let directionFromParent: "root" | "left" | "right" = "root";

  while (nodeId !== null) {
    const node = nodes[nodeId];
    if (!node) {
      break;
    }

    const isMatch = targetValue === node.value;
    const nextNodeId =
      isMatch ? null : targetValue < node.value ? node.left : node.right;
    steps.push(
      createEvent(nextIndexRef.current, "traverse", {
        operationIndex,
        operationType,
        targetValue,
        nodeId,
        nodeValue: node.value,
        depth,
        direction: depth === 0 ? (isMatch ? "match" : "root") : isMatch ? "match" : directionFromParent,
        nextNodeId,
      }),
    );
    nextIndexRef.current += 1;

    if (isMatch) {
      return {
        parentId,
        nodeId,
        depth,
        directionFromParent,
      };
    }

    parentId = nodeId;
    if (targetValue < node.value) {
      nodeId = node.left;
      directionFromParent = "left";
    } else {
      nodeId = node.right;
      directionFromParent = "right";
    }
    depth += 1;
  }

  return {
    parentId,
    nodeId: null,
    depth,
    directionFromParent,
  };
}

function findExtreme(
  startNodeId: number,
  nodes: BstOperationsNode[],
  operationIndex: number,
  targetValue: number,
  direction: "left" | "right",
  steps: BstOperationsStepEvent[],
  nextIndexRef: { current: number },
): { parentId: number | null; nodeId: number; depthOffset: number } {
  let parentId: number | null = null;
  let nodeId = startNodeId;
  let depthOffset = 0;

  while (true) {
    const node = nodes[nodeId] as BstOperationsNode;
    const nextNodeId = direction === "left" ? node.left : node.right;

    steps.push(
      createEvent(nextIndexRef.current, "traverse", {
        operationIndex,
        operationType: "delete",
        targetValue,
        nodeId,
        nodeValue: node.value,
        depth: depthOffset + 1,
        direction,
        nextNodeId,
      }),
    );
    nextIndexRef.current += 1;

    if (nextNodeId === null) {
      return { parentId, nodeId, depthOffset: depthOffset + 1 };
    }

    parentId = nodeId;
    nodeId = nextNodeId;
    depthOffset += 1;
  }
}

function setChildLink(
  nodes: BstOperationsNode[],
  parentId: number | null,
  direction: "root" | "left" | "right",
  replacementNodeId: number | null,
  rootIdRef: { current: number | null },
): void {
  if (direction === "root") {
    rootIdRef.current = replacementNodeId;
    return;
  }

  if (parentId === null) {
    return;
  }

  const parent = nodes[parentId];
  if (!parent) {
    return;
  }

  if (direction === "left") {
    parent.left = replacementNodeId;
    return;
  }

  parent.right = replacementNodeId;
}

function getRootValue(rootId: number | null, nodes: BstOperationsNode[]): number | null {
  if (rootId === null) {
    return null;
  }

  return nodes[rootId]?.value ?? null;
}

export const bstOperationsEngine: AlgorithmEngine<
  BstOperationsInput,
  BstOperationsParams,
  BstOperationsStepEvent,
  BstOperationsResult
> = {
  normalizeParams: normalizeBstOperationsParams,
  normalizeInput: normalizeBstOperationsInput,
  generate: (input, params) => {
    const nodes = cloneNodes(input.nodes);
    const rootIdRef = { current: input.rootId };
    const steps: BstOperationsStepEvent[] = [];
    const nextIndexRef = { current: 0 };

    let traversedNodes = 0;
    let searchHits = 0;
    let insertsApplied = 0;
    let deletesApplied = 0;
    let duplicateInserts = 0;
    let missingDeletes = 0;

    for (const [operationIndex, operation] of input.operations.entries()) {
      const position = findValue(
        rootIdRef.current,
        nodes,
        operation.value,
        operationIndex,
        operation.type,
        steps,
        nextIndexRef,
      );

      const traversalsForOperation = steps.filter(
        (step) => step.type === "traverse" && step.payload.operationIndex === operationIndex,
      ).length;
      traversedNodes += traversalsForOperation;

      if (operation.type === "search") {
        const found = position.nodeId !== null;
        if (found) {
          searchHits += 1;
        }

        steps.push(
          createEvent(nextIndexRef.current, "search-result", {
            operationIndex,
            targetValue: operation.value,
            found,
            nodeId: position.nodeId,
            depth: position.nodeId === null ? position.depth : position.depth,
            visitedCount: traversedNodes,
            searchHits,
          }),
        );
        nextIndexRef.current += 1;
        continue;
      }

      if (operation.type === "insert") {
        if (position.nodeId !== null) {
          duplicateInserts += 1;
          steps.push(
            createEvent(nextIndexRef.current, "insert-node", {
              operationIndex,
              targetValue: operation.value,
              nodeId: position.nodeId,
              parentId: position.parentId,
              direction: position.directionFromParent,
              depth: position.depth,
              duplicate: true,
              nodeCount: getReachableNodeCount(rootIdRef.current, nodes),
            }),
          );
          nextIndexRef.current += 1;
          continue;
        }

        const nodeId = nodes.length;
        nodes.push({
          id: nodeId,
          value: operation.value,
          left: null,
          right: null,
        });

        if (position.parentId === null) {
          rootIdRef.current = nodeId;
        } else {
          const parent = nodes[position.parentId] as BstOperationsNode;
          if (position.directionFromParent === "left") {
            parent.left = nodeId;
          } else {
            parent.right = nodeId;
          }
        }

        insertsApplied += 1;
        steps.push(
          createEvent(nextIndexRef.current, "insert-node", {
            operationIndex,
            targetValue: operation.value,
            nodeId,
            parentId: position.parentId,
            direction: position.parentId === null ? "root" : position.directionFromParent,
            depth: position.depth,
            duplicate: false,
            nodeCount: getReachableNodeCount(rootIdRef.current, nodes),
          }),
        );
        nextIndexRef.current += 1;
        continue;
      }

      if (position.nodeId === null) {
        missingDeletes += 1;
        steps.push(
          createEvent(nextIndexRef.current, "delete-case", {
            operationIndex,
            targetValue: operation.value,
            nodeId: null,
            depth: position.depth,
            caseKind: "not-found",
            replacementNodeId: null,
            candidateNodeId: null,
            candidateValue: null,
          }),
        );
        nextIndexRef.current += 1;
        continue;
      }

      const targetNode = nodes[position.nodeId] as BstOperationsNode;
      const childCount = Number(targetNode.left !== null) + Number(targetNode.right !== null);

      if (childCount <= 1) {
        const replacementNodeId = targetNode.left ?? targetNode.right ?? null;
        const caseKind: DeleteCaseKind = childCount === 0 ? "leaf" : "one-child";

        steps.push(
          createEvent(nextIndexRef.current, "delete-case", {
            operationIndex,
            targetValue: operation.value,
            nodeId: position.nodeId,
            depth: position.depth,
            caseKind,
            replacementNodeId,
            candidateNodeId: null,
            candidateValue: null,
          }),
        );
        nextIndexRef.current += 1;

        setChildLink(
          nodes,
          position.parentId,
          position.directionFromParent,
          replacementNodeId,
          rootIdRef,
        );

        deletesApplied += 1;
        steps.push(
          createEvent(nextIndexRef.current, "delete-relink", {
            operationIndex,
            targetValue: operation.value,
            action: position.parentId === null ? "replace-root" : position.directionFromParent === "left" ? "set-left" : "set-right",
            parentId: position.parentId,
            nodeId: position.nodeId,
            replacementNodeId,
            direction: position.directionFromParent,
            newValue: null,
            nodeCount: getReachableNodeCount(rootIdRef.current, nodes),
            rootId: rootIdRef.current,
          }),
        );
        nextIndexRef.current += 1;
        continue;
      }

      const useSuccessor = params.deleteStrategy === "successor";
      const candidateStartId = useSuccessor ? targetNode.right : targetNode.left;
      const extreme = findExtreme(
        candidateStartId as number,
        nodes,
        operationIndex,
        operation.value,
        useSuccessor ? "left" : "right",
        steps,
        nextIndexRef,
      );
      traversedNodes += extreme.depthOffset;

      const candidateNode = nodes[extreme.nodeId] as BstOperationsNode;
      const replacementNodeId = useSuccessor ? candidateNode.right : candidateNode.left;

      steps.push(
        createEvent(nextIndexRef.current, "delete-case", {
          operationIndex,
          targetValue: operation.value,
          nodeId: position.nodeId,
          depth: position.depth,
          caseKind: "two-children",
          replacementNodeId,
          candidateNodeId: extreme.nodeId,
          candidateValue: candidateNode.value,
        }),
      );
      nextIndexRef.current += 1;

      targetNode.value = candidateNode.value;
      steps.push(
        createEvent(nextIndexRef.current, "delete-relink", {
          operationIndex,
          targetValue: operation.value,
          action: "copy-value",
          parentId: null,
          nodeId: position.nodeId,
          replacementNodeId: extreme.nodeId,
          direction: "root",
          newValue: candidateNode.value,
          nodeCount: getReachableNodeCount(rootIdRef.current, nodes),
          rootId: rootIdRef.current,
        }),
      );
      nextIndexRef.current += 1;

      const detachParentId = extreme.parentId ?? position.nodeId;
      const detachDirection =
        useSuccessor && extreme.parentId === null
          ? "right"
          : !useSuccessor && extreme.parentId === null
            ? "left"
            : useSuccessor
              ? "left"
              : "right";

      setChildLink(nodes, detachParentId, detachDirection, replacementNodeId, rootIdRef);
      deletesApplied += 1;

      steps.push(
        createEvent(nextIndexRef.current, "delete-relink", {
          operationIndex,
          targetValue: operation.value,
          action: detachDirection === "left" ? "set-left" : "set-right",
          parentId: detachParentId,
          nodeId: extreme.nodeId,
          replacementNodeId,
          direction: detachDirection,
          newValue: null,
          nodeCount: getReachableNodeCount(rootIdRef.current, nodes),
          rootId: rootIdRef.current,
        }),
      );
      nextIndexRef.current += 1;
    }

    const finalLevelOrder = toLevelOrder(rootIdRef.current, nodes);
    const nodeCount = getReachableNodeCount(rootIdRef.current, nodes);
    const treeHeight = getTreeHeight(rootIdRef.current, nodes);

    steps.push(
      createEvent(nextIndexRef.current, "complete", {
        operationsProcessed: input.operations.length,
        traversedNodes,
        searchHits,
        insertsApplied,
        deletesApplied,
        duplicateInserts,
        missingDeletes,
        nodeCount,
        treeHeight,
      }),
    );

    return {
      steps,
      result: {
        finalLevelOrder,
        operationCount: input.operations.length,
        traversedNodes,
        searchHits,
        insertsApplied,
        deletesApplied,
        duplicateInserts,
        missingDeletes,
        nodeCount,
        treeHeight,
        rootValue: getRootValue(rootIdRef.current, nodes),
      },
    };
  },
};

export function createBstOperationsRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  BstOperationsInput,
  BstOperationsParams,
  BstOperationsStepEvent,
  BstOperationsResult
> {
  const normalizedParams = bstOperationsEngine.normalizeParams(rawParams);
  const input = bstOperationsEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = bstOperationsEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

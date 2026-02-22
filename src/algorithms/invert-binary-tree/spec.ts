import type { ParamPrimitive, RawParams } from "@/types/engine";

export type InvertBinaryTreeTraversalMode = "dfs" | "bfs";

export interface InvertBinaryTreeParams extends Record<string, ParamPrimitive> {
  treeValues: string;
  traversalMode: InvertBinaryTreeTraversalMode;
}

export interface InvertBinaryTreeNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
}

export interface InvertBinaryTreeInput {
  rootId: number | null;
  nodes: InvertBinaryTreeNode[];
  levelOrder: Array<number | null>;
}

export interface InvertBinaryTreeResult {
  invertedLevelOrder: Array<number | null>;
  visitedCount: number;
  swaps: number;
  traversalOrder: number[];
  rootValue: number | null;
  isEmpty: boolean;
}

export const INVERT_BINARY_TREE_DEFAULT_LEVEL_ORDER = [4, 2, 7, 1, 3, 6, 9] as const;
const INVERT_BINARY_TREE_DEFAULT_TREE_VALUES = INVERT_BINARY_TREE_DEFAULT_LEVEL_ORDER.join(", ");
const INVERT_BINARY_TREE_DEFAULT_TRAVERSAL_MODE: InvertBinaryTreeTraversalMode = "dfs";

export const INVERT_BINARY_TREE_DEFAULT_PARAMS: InvertBinaryTreeParams = {
  treeValues: INVERT_BINARY_TREE_DEFAULT_TREE_VALUES,
  traversalMode: INVERT_BINARY_TREE_DEFAULT_TRAVERSAL_MODE,
};

function isNullToken(token: string): boolean {
  const normalized = token.trim().toLowerCase();
  return normalized === "null" || normalized === "nil" || normalized === "none";
}

function parseTraversalMode(
  rawTraversalMode: RawParams["traversalMode"],
): InvertBinaryTreeTraversalMode {
  if (rawTraversalMode === "bfs" || rawTraversalMode === "dfs") {
    return rawTraversalMode;
  }

  if (typeof rawTraversalMode === "string") {
    const normalized = rawTraversalMode.trim().toLowerCase();
    if (normalized === "bfs") {
      return "bfs";
    }
    if (normalized === "dfs") {
      return "dfs";
    }
  }

  return INVERT_BINARY_TREE_DEFAULT_TRAVERSAL_MODE;
}

function parseTreeValues(rawTreeValues: RawParams["treeValues"]): string {
  if (typeof rawTreeValues === "string" && rawTreeValues.trim().length > 0) {
    return rawTreeValues;
  }

  return INVERT_BINARY_TREE_DEFAULT_TREE_VALUES;
}

function parseLevelOrderValues(text: string): Array<number | null> {
  const tokens = text
    .split(/[\s,]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const values: Array<number | null> = [];
  for (const token of tokens) {
    if (isNullToken(token)) {
      values.push(null);
      continue;
    }

    const parsed = Number(token);
    if (Number.isFinite(parsed)) {
      values.push(parsed);
    }
  }

  return values;
}

function parseRawLevelOrderInput(rawInput: unknown): Array<number | null> {
  if (!Array.isArray(rawInput)) {
    return [];
  }

  const values: Array<number | null> = [];
  for (const entry of rawInput) {
    if (typeof entry === "number" && Number.isFinite(entry)) {
      values.push(entry);
      continue;
    }

    if (entry === null) {
      values.push(null);
      continue;
    }

    if (typeof entry === "string") {
      if (isNullToken(entry)) {
        values.push(null);
        continue;
      }

      const parsed = Number(entry);
      if (Number.isFinite(parsed)) {
        values.push(parsed);
      }
    }
  }

  return values;
}

function trimTrailingNulls(values: Array<number | null>): Array<number | null> {
  const trimmed = [...values];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === null) {
    trimmed.pop();
  }

  return trimmed;
}

function buildTreeFromLevelOrder(
  levelOrder: Array<number | null>,
): Pick<InvertBinaryTreeInput, "rootId" | "nodes"> {
  if (levelOrder.length === 0 || levelOrder[0] === null) {
    return {
      rootId: null,
      nodes: [],
    };
  }

  const nodes: InvertBinaryTreeNode[] = [
    {
      id: 0,
      value: levelOrder[0],
      left: null,
      right: null,
    },
  ];

  const queue: number[] = [0];
  let nextId = 1;
  let cursor = 1;

  while (queue.length > 0 && cursor < levelOrder.length) {
    const parentId = queue.shift() as number;
    const parent = nodes[parentId];

    const leftValue = levelOrder[cursor] ?? null;
    cursor += 1;
    if (leftValue !== null) {
      const leftId = nextId;
      nextId += 1;
      nodes.push({
        id: leftId,
        value: leftValue,
        left: null,
        right: null,
      });
      parent.left = leftId;
      queue.push(leftId);
    }

    if (cursor >= levelOrder.length) {
      continue;
    }

    const rightValue = levelOrder[cursor] ?? null;
    cursor += 1;
    if (rightValue !== null) {
      const rightId = nextId;
      nextId += 1;
      nodes.push({
        id: rightId,
        value: rightValue,
        left: null,
        right: null,
      });
      parent.right = rightId;
      queue.push(rightId);
    }
  }

  return {
    rootId: 0,
    nodes,
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomUniqueValues(count: number): number[] {
  const values = new Set<number>();
  while (values.size < count) {
    values.add(getRandomInteger(-25, 110));
  }

  return [...values];
}

function serializeLevelOrder(values: Array<number | null>): string {
  return values.map((value) => (value === null ? "null" : String(value))).join(", ");
}

export function normalizeInvertBinaryTreeParams(rawParams: RawParams): InvertBinaryTreeParams {
  return {
    treeValues: parseTreeValues(rawParams.treeValues),
    traversalMode: parseTraversalMode(rawParams.traversalMode),
  };
}

export function normalizeInvertBinaryTreeInput(
  rawInput: unknown,
  params: InvertBinaryTreeParams,
): InvertBinaryTreeInput {
  let levelOrder = parseRawLevelOrderInput(rawInput);

  if (levelOrder.length === 0) {
    levelOrder = parseLevelOrderValues(params.treeValues);
  }

  if (levelOrder.length === 0) {
    levelOrder = [...INVERT_BINARY_TREE_DEFAULT_LEVEL_ORDER];
  }

  const normalizedLevelOrder = trimTrailingNulls(levelOrder);
  const { rootId, nodes } = buildTreeFromLevelOrder(normalizedLevelOrder);

  return {
    rootId,
    nodes,
    levelOrder: normalizedLevelOrder,
  };
}

export function createRandomInvertBinaryTreeParams(): InvertBinaryTreeParams {
  const nodeCount = getRandomInteger(6, 10);
  const values = createRandomUniqueValues(nodeCount);
  const levelOrder: Array<number | null> = [...values];

  if (levelOrder.length > 6 && Math.random() >= 0.5) {
    levelOrder[levelOrder.length - 1] = null;
  }

  if (levelOrder.length > 7 && Math.random() >= 0.6) {
    levelOrder[levelOrder.length - 2] = null;
  }

  return {
    treeValues: serializeLevelOrder(trimTrailingNulls(levelOrder)),
    traversalMode: Math.random() >= 0.5 ? "dfs" : "bfs",
  };
}

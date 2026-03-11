import type { ParamPrimitive, RawParams } from "@/types/engine";

export type BstOperationType = "search" | "insert" | "delete";
export type BstDeleteStrategy = "successor" | "predecessor";

export interface BstOperation {
  type: BstOperationType;
  value: number;
  source: string;
}

export interface BstOperationsParams extends Record<string, ParamPrimitive> {
  initialValues: string;
  operations: string;
  deleteStrategy: BstDeleteStrategy;
}

export interface BstOperationsNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
}

export interface BstOperationsInput {
  rootId: number | null;
  nodes: BstOperationsNode[];
  initialValues: number[];
  operations: BstOperation[];
  initialLevelOrder: Array<number | null>;
}

export interface BstOperationsResult {
  finalLevelOrder: Array<number | null>;
  operationCount: number;
  traversedNodes: number;
  searchHits: number;
  insertsApplied: number;
  deletesApplied: number;
  duplicateInserts: number;
  missingDeletes: number;
  nodeCount: number;
  treeHeight: number;
  rootValue: number | null;
}

export const BST_OPERATIONS_DEFAULT_INITIAL_VALUES = [40, 24, 65, 12, 32, 50, 78] as const;
export const BST_OPERATIONS_DEFAULT_OPERATION_LIST = [
  "search 32",
  "insert 29",
  "delete 24",
  "search 24",
  "insert 65",
  "delete 99",
  "insert 90",
] as const;
const BST_OPERATIONS_DEFAULT_DELETE_STRATEGY: BstDeleteStrategy = "successor";

export const BST_OPERATIONS_DEFAULT_PARAMS: BstOperationsParams = {
  initialValues: BST_OPERATIONS_DEFAULT_INITIAL_VALUES.join(", "),
  operations: BST_OPERATIONS_DEFAULT_OPERATION_LIST.join(", "),
  deleteStrategy: BST_OPERATIONS_DEFAULT_DELETE_STRATEGY,
};

function parseText(rawValue: RawParams[keyof RawParams], fallback: string): string {
  if (typeof rawValue === "string" && rawValue.trim().length > 0) {
    return rawValue;
  }

  return fallback;
}

function parseDeleteStrategy(rawValue: RawParams["deleteStrategy"]): BstDeleteStrategy {
  if (rawValue === "successor" || rawValue === "predecessor") {
    return rawValue;
  }

  if (typeof rawValue === "string") {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === "successor") {
      return "successor";
    }
    if (normalized === "predecessor") {
      return "predecessor";
    }
  }

  return BST_OPERATIONS_DEFAULT_DELETE_STRATEGY;
}

function uniqueValues(values: number[]): number[] {
  const seen = new Set<number>();
  const unique: number[] = [];

  for (const value of values) {
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    unique.push(value);
  }

  return unique;
}

function parseNumberList(text: string): number[] {
  const values = text
    .split(/[\s,;]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));

  return uniqueValues(values);
}

function parseOperationType(token: string): BstOperationType | null {
  const normalized = token.trim().toLowerCase();
  if (normalized === "search" || normalized === "find") {
    return "search";
  }
  if (normalized === "insert" || normalized === "add") {
    return "insert";
  }
  if (normalized === "delete" || normalized === "remove") {
    return "delete";
  }
  return null;
}

function parseOperations(text: string): BstOperation[] {
  const segments = text
    .split(/[\n,;]+/g)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const operations: BstOperation[] = [];
  for (const segment of segments) {
    const match = segment.match(/^([a-zA-Z-]+)\s+(-?\d+)$/);
    if (!match) {
      continue;
    }

    const type = parseOperationType(match[1]);
    const value = Number(match[2]);
    if (!type || !Number.isFinite(value)) {
      continue;
    }

    operations.push({
      type,
      value,
      source: segment,
    });
  }

  if (operations.length > 0) {
    return operations;
  }

  return BST_OPERATIONS_DEFAULT_OPERATION_LIST.map((operationText) => {
    const [rawType, rawValue] = operationText.split(/\s+/g);
    return {
      type: parseOperationType(rawType) as BstOperationType,
      value: Number(rawValue),
      source: operationText,
    };
  });
}

function insertNode(
  nodes: BstOperationsNode[],
  rootId: number | null,
  value: number,
): number | null {
  if (rootId === null) {
    nodes.push({ id: 0, value, left: null, right: null });
    return 0;
  }

  let currentId: number | null = rootId;
  while (currentId !== null) {
    const currentNode: BstOperationsNode | undefined = nodes[currentId];
    if (!currentNode) {
      break;
    }

    if (value === currentNode.value) {
      return rootId;
    }

    if (value < currentNode.value) {
      if (currentNode.left === null) {
        const nextId = nodes.length;
        currentNode.left = nextId;
        nodes.push({ id: nextId, value, left: null, right: null });
        return rootId;
      }
      currentId = currentNode.left;
      continue;
    }

    if (currentNode.right === null) {
      const nextId = nodes.length;
      currentNode.right = nextId;
      nodes.push({ id: nextId, value, left: null, right: null });
      return rootId;
    }
    currentId = currentNode.right;
  }

  return rootId;
}

function buildTree(values: number[]): Pick<BstOperationsInput, "rootId" | "nodes"> {
  const nodes: BstOperationsNode[] = [];
  let rootId: number | null = null;

  for (const value of values) {
    rootId = insertNode(nodes, rootId, value);
  }

  return {
    rootId,
    nodes,
  };
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

function normalizeInputOverride(rawInput: unknown): {
  initialValues?: number[];
  operations?: BstOperation[];
} {
  if (typeof rawInput !== "object" || rawInput === null) {
    return {};
  }

  const overrides: {
    initialValues?: number[];
    operations?: BstOperation[];
  } = {};

  if ("initialValues" in rawInput && Array.isArray(rawInput.initialValues)) {
    const values = rawInput.initialValues.filter(
      (value): value is number => typeof value === "number" && Number.isFinite(value),
    );
    if (values.length > 0) {
      overrides.initialValues = uniqueValues(values);
    }
  }

  if ("operations" in rawInput && Array.isArray(rawInput.operations)) {
    const operations = rawInput.operations.filter(
      (operation): operation is BstOperation =>
        typeof operation === "object" &&
        operation !== null &&
        "type" in operation &&
        "value" in operation &&
        (operation.type === "search" ||
          operation.type === "insert" ||
          operation.type === "delete") &&
        typeof operation.value === "number" &&
        Number.isFinite(operation.value),
    );
    if (operations.length > 0) {
      overrides.operations = operations.map((operation) => ({
        type: operation.type,
        value: operation.value,
        source: `${operation.type} ${operation.value}`,
      }));
    }
  }

  return overrides;
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function sampleUniqueValues(count: number): number[] {
  const values = new Set<number>();
  while (values.size < count) {
    values.add(getRandomInteger(5, 99));
  }

  return [...values];
}

export function normalizeBstOperationsParams(rawParams: RawParams): BstOperationsParams {
  return {
    initialValues: parseText(rawParams.initialValues, BST_OPERATIONS_DEFAULT_PARAMS.initialValues),
    operations: parseText(rawParams.operations, BST_OPERATIONS_DEFAULT_PARAMS.operations),
    deleteStrategy: parseDeleteStrategy(rawParams.deleteStrategy),
  };
}

export function normalizeBstOperationsInput(
  rawInput: unknown,
  params: BstOperationsParams,
): BstOperationsInput {
  const overrides = normalizeInputOverride(rawInput);
  const initialValues =
    overrides.initialValues ??
    (() => {
      const parsed = parseNumberList(params.initialValues);
      return parsed.length > 0 ? parsed : [...BST_OPERATIONS_DEFAULT_INITIAL_VALUES];
    })();

  const operations = overrides.operations ?? parseOperations(params.operations);
  const { rootId, nodes } = buildTree(initialValues);

  return {
    rootId,
    nodes,
    initialValues,
    operations,
    initialLevelOrder: toLevelOrder(rootId, nodes),
  };
}

export function createRandomBstOperationsParams(): BstOperationsParams {
  const initialValues = sampleUniqueValues(getRandomInteger(6, 8));
  const operations: string[] = [];
  const workingValues = [...initialValues];

  const searchValue = workingValues[getRandomInteger(0, workingValues.length - 1)] ?? 40;
  operations.push(`search ${searchValue}`);

  const insertValue = sampleUniqueValues(1).find((value) => !workingValues.includes(value)) ?? 88;
  workingValues.push(insertValue);
  operations.push(`insert ${insertValue}`);

  const deleteValue = workingValues[getRandomInteger(0, workingValues.length - 1)] ?? initialValues[0] ?? 40;
  operations.push(`delete ${deleteValue}`);

  operations.push(`search ${getRandomInteger(3, 97)}`);
  operations.push(`insert ${getRandomInteger(100, 120)}`);
  operations.push(`delete ${getRandomInteger(1, 120)}`);

  return {
    initialValues: initialValues.join(", "),
    operations: operations.join(", "),
    deleteStrategy: Math.random() >= 0.5 ? "successor" : "predecessor",
  };
}

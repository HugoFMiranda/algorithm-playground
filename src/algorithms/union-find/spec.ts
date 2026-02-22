import type { ParamPrimitive, RawParams } from "@/types/engine";

export type UnionFindOperationType = "union" | "find" | "connected";

export interface UnionFindOperation {
  type: UnionFindOperationType;
  left: number;
  right: number | null;
  source: string;
}

export interface UnionFindParams extends Record<string, ParamPrimitive> {
  nodeCount: number;
  operations: string;
  pathCompression: boolean;
  unionByRank: boolean;
}

export interface UnionFindInput {
  nodeCount: number;
  operations: UnionFindOperation[];
}

export interface UnionFindResult {
  parents: number[];
  ranks: number[];
  componentCount: number;
  operationsProcessed: number;
  successfulUnions: number;
  findQueries: number;
  connectedQueries: number;
}

const MIN_NODE_COUNT = 2;
const MAX_NODE_COUNT = 24;
const DEFAULT_NODE_COUNT = 10;

const DEFAULT_OPERATIONS: Omit<UnionFindOperation, "source">[] = [
  { type: "union", left: 0, right: 1 },
  { type: "union", left: 1, right: 2 },
  { type: "union", left: 3, right: 4 },
  { type: "connected", left: 0, right: 2 },
  { type: "connected", left: 0, right: 4 },
  { type: "find", left: 2, right: null },
  { type: "union", left: 2, right: 4 },
  { type: "connected", left: 0, right: 4 },
  { type: "union", left: 5, right: 6 },
  { type: "union", left: 6, right: 7 },
  { type: "connected", left: 5, right: 7 },
  { type: "find", left: 7, right: null },
];

const DEFAULT_PATH_COMPRESSION = true;
const DEFAULT_UNION_BY_RANK = true;

function serializeOperation(operation: Omit<UnionFindOperation, "source">): string {
  if (operation.type === "find") {
    return `find ${operation.left}`;
  }

  return `${operation.type} ${operation.left} ${operation.right}`;
}

const DEFAULT_OPERATIONS_TEXT = DEFAULT_OPERATIONS.map(serializeOperation).join(", ");

export const UNION_FIND_DEFAULT_PARAMS: UnionFindParams = {
  nodeCount: DEFAULT_NODE_COUNT,
  operations: DEFAULT_OPERATIONS_TEXT,
  pathCompression: DEFAULT_PATH_COMPRESSION,
  unionByRank: DEFAULT_UNION_BY_RANK,
};

function parseNodeCount(rawNodeCount: RawParams["nodeCount"]): number {
  if (typeof rawNodeCount === "number" && Number.isFinite(rawNodeCount)) {
    return Math.max(MIN_NODE_COUNT, Math.min(Math.round(rawNodeCount), MAX_NODE_COUNT));
  }

  if (typeof rawNodeCount === "string") {
    const parsed = Number(rawNodeCount.trim());
    if (Number.isFinite(parsed)) {
      return Math.max(MIN_NODE_COUNT, Math.min(Math.round(parsed), MAX_NODE_COUNT));
    }
  }

  return DEFAULT_NODE_COUNT;
}

function parseBoolean(rawValue: RawParams[keyof RawParams], fallback: boolean): boolean {
  if (typeof rawValue === "boolean") {
    return rawValue;
  }

  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return rawValue !== 0;
  }

  if (typeof rawValue === "string") {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return fallback;
}

function parseOperationsText(rawOperations: RawParams["operations"]): string {
  if (typeof rawOperations === "string" && rawOperations.trim().length > 0) {
    return rawOperations;
  }

  return DEFAULT_OPERATIONS_TEXT;
}

function createOperation(
  type: UnionFindOperationType,
  left: number,
  right: number | null,
  source: string,
): UnionFindOperation {
  return {
    type,
    left: Math.trunc(left),
    right: right === null ? null : Math.trunc(right),
    source,
  };
}

function parseOperationsFromText(text: string): UnionFindOperation[] {
  const segments = text
    .split(/[\n,;]+/g)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const operations: UnionFindOperation[] = [];
  for (const segment of segments) {
    const lower = segment.toLowerCase();

    const unionMatch = lower.match(/^(?:union|unite|u)\s+(-?\d+)\s+(-?\d+)$/);
    if (unionMatch) {
      operations.push(
        createOperation("union", Number(unionMatch[1]), Number(unionMatch[2]), segment),
      );
      continue;
    }

    const findMatch = lower.match(/^(?:find|f)\s+(-?\d+)$/);
    if (findMatch) {
      operations.push(createOperation("find", Number(findMatch[1]), null, segment));
      continue;
    }

    const connectedMatch = lower.match(/^(?:connected|conn|same|c)\s+(-?\d+)\s+(-?\d+)$/);
    if (connectedMatch) {
      operations.push(
        createOperation("connected", Number(connectedMatch[1]), Number(connectedMatch[2]), segment),
      );
      continue;
    }
  }

  return operations;
}

function sanitizeOperations(operations: UnionFindOperation[], nodeCount: number): UnionFindOperation[] {
  const sanitized: UnionFindOperation[] = [];

  for (const operation of operations) {
    const left = operation.left;
    if (left < 0 || left >= nodeCount) {
      continue;
    }

    if (operation.type === "find") {
      sanitized.push(operation);
      continue;
    }

    if (operation.right === null || operation.right < 0 || operation.right >= nodeCount) {
      continue;
    }

    sanitized.push(operation);
  }

  return sanitized;
}

function buildFallbackOperations(nodeCount: number): UnionFindOperation[] {
  const candidates = DEFAULT_OPERATIONS.map((operation) => ({
    ...operation,
    source: serializeOperation(operation),
  }));
  const withinRange = sanitizeOperations(candidates, nodeCount);
  if (withinRange.length > 0) {
    return withinRange;
  }

  const fallback: UnionFindOperation[] = [];
  for (let index = 0; index < nodeCount - 1; index += 1) {
    fallback.push(createOperation("union", index, index + 1, `union ${index} ${index + 1}`));
  }

  return fallback;
}

export function normalizeUnionFindParams(rawParams: RawParams): UnionFindParams {
  return {
    nodeCount: parseNodeCount(rawParams.nodeCount),
    operations: parseOperationsText(rawParams.operations),
    pathCompression: parseBoolean(rawParams.pathCompression, DEFAULT_PATH_COMPRESSION),
    unionByRank: parseBoolean(rawParams.unionByRank, DEFAULT_UNION_BY_RANK),
  };
}

export function normalizeUnionFindInput(rawInput: unknown, params: UnionFindParams): UnionFindInput {
  const nodeCount = params.nodeCount;
  let rawOperations: UnionFindOperation[] = [];

  if (
    typeof rawInput === "object" &&
    rawInput !== null &&
    "operations" in rawInput &&
    Array.isArray(rawInput.operations)
  ) {
    rawOperations = rawInput.operations.filter(
      (operation): operation is UnionFindOperation =>
        typeof operation === "object" &&
        operation !== null &&
        "type" in operation &&
        "left" in operation &&
        typeof operation.type === "string" &&
        (operation.type === "union" || operation.type === "find" || operation.type === "connected") &&
        typeof operation.left === "number" &&
        (operation.type === "find"
          ? true
          : "right" in operation && (operation.right === null || typeof operation.right === "number")) &&
        "source" in operation &&
        typeof operation.source === "string",
    );
  } else {
    rawOperations = parseOperationsFromText(params.operations);
  }

  const operations = sanitizeOperations(rawOperations, nodeCount);

  return {
    nodeCount,
    operations: operations.length > 0 ? operations : buildFallbackOperations(nodeCount),
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function createRandomOperations(nodeCount: number): UnionFindOperation[] {
  const count = getRandomInteger(8, 14);
  const operations: UnionFindOperation[] = [];

  for (let index = 0; index < count; index += 1) {
    const left = getRandomInteger(0, nodeCount - 1);
    const right = getRandomInteger(0, nodeCount - 1);
    const roll = Math.random();

    if (roll < 0.48) {
      operations.push(createOperation("union", left, right, `union ${left} ${right}`));
      continue;
    }

    if (roll < 0.76) {
      operations.push(createOperation("find", left, null, `find ${left}`));
      continue;
    }

    operations.push(createOperation("connected", left, right, `connected ${left} ${right}`));
  }

  return operations;
}

export function createRandomUnionFindParams(): UnionFindParams {
  const nodeCount = getRandomInteger(8, 14);
  const operations = createRandomOperations(nodeCount)
    .map((operation) => operation.source)
    .join(", ");

  return {
    nodeCount,
    operations,
    pathCompression: Math.random() >= 0.3,
    unionByRank: Math.random() >= 0.2,
  };
}

import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface AvlRotationsParams extends Record<string, ParamPrimitive> {
  insertValues: string;
}

export interface AvlRotationsNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  height: number;
}

export interface AvlRotationsInput {
  rootId: number | null;
  nodes: AvlRotationsNode[];
  insertValues: number[];
  initialLevelOrder: Array<number | null>;
}

export interface AvlRotationsResult {
  finalLevelOrder: Array<number | null>;
  nodeCount: number;
  treeHeight: number;
  insertedCount: number;
  duplicateCount: number;
  heightUpdates: number;
  imbalanceCount: number;
  rotations: number;
  rootValue: number | null;
}

export const AVL_ROTATIONS_DEFAULT_INSERT_VALUES = [30, 20, 10, 40, 50, 25, 27] as const;

export const AVL_ROTATIONS_DEFAULT_PARAMS: AvlRotationsParams = {
  insertValues: AVL_ROTATIONS_DEFAULT_INSERT_VALUES.join(", "),
};

function parseText(rawValue: RawParams[keyof RawParams], fallback: string): string {
  if (typeof rawValue === "string" && rawValue.trim().length > 0) {
    return rawValue;
  }

  return fallback;
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

function parseInsertValues(text: string): number[] {
  const values = text
    .split(/[\s,;]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value));

  return uniqueValues(values);
}

function normalizeInputOverride(rawInput: unknown): { insertValues?: number[] } {
  if (typeof rawInput !== "object" || rawInput === null) {
    return {};
  }

  if ("insertValues" in rawInput && Array.isArray(rawInput.insertValues)) {
    const values = rawInput.insertValues.filter(
      (value): value is number => typeof value === "number" && Number.isFinite(value),
    );

    if (values.length > 0) {
      return { insertValues: uniqueValues(values) };
    }
  }

  return {};
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

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

const RANDOM_SEQUENCES = [
  [30, 20, 10],
  [10, 20, 30],
  [30, 10, 20],
  [10, 30, 20],
  [40, 20, 60, 10, 30, 25],
  [50, 30, 70, 20, 40, 35],
] as const;

export function normalizeAvlRotationsParams(rawParams: RawParams): AvlRotationsParams {
  return {
    insertValues: parseText(rawParams.insertValues, AVL_ROTATIONS_DEFAULT_PARAMS.insertValues),
  };
}

export function normalizeAvlRotationsInput(
  rawInput: unknown,
  params: AvlRotationsParams,
): AvlRotationsInput {
  const overrides = normalizeInputOverride(rawInput);
  const insertValues =
    overrides.insertValues ??
    (() => {
      const parsed = parseInsertValues(params.insertValues);
      return parsed.length > 0 ? parsed : [...AVL_ROTATIONS_DEFAULT_INSERT_VALUES];
    })();

  return {
    rootId: null,
    nodes: [],
    insertValues,
    initialLevelOrder: [],
  };
}

export function createRandomAvlRotationsParams(): AvlRotationsParams {
  const sequence =
    RANDOM_SEQUENCES[getRandomInteger(0, RANDOM_SEQUENCES.length - 1)] ?? AVL_ROTATIONS_DEFAULT_INSERT_VALUES;

  return {
    insertValues: sequence.join(", "),
  };
}

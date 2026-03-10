import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface BellmanFordEdge {
  from: number;
  to: number;
  weight: number;
}

export interface BellmanFordParams extends Record<string, ParamPrimitive> {
  nodeCount: number;
  edges: string;
  startNode: number;
  stopEarlyWhenStable: boolean;
  preferLowerIndex: boolean;
}

export interface BellmanFordInput {
  nodeCount: number;
  edges: BellmanFordEdge[];
  startNode: number;
}

export interface BellmanFordResult {
  distances: number[];
  parents: number[];
  roundsExecuted: number;
  relaxations: number;
  reachableCount: number;
  negativeCycle: boolean;
  cycleEdge: BellmanFordEdge | null;
}

const MIN_NODE_COUNT = 2;
const MAX_NODE_COUNT = 18;
const DEFAULT_NODE_COUNT = 7;
const DEFAULT_START_NODE = 0;
const DEFAULT_STOP_EARLY_WHEN_STABLE = true;
const DEFAULT_PREFER_LOWER_INDEX = true;

const DEFAULT_EDGES: BellmanFordEdge[] = [
  { from: 0, to: 1, weight: 6 },
  { from: 0, to: 2, weight: 7 },
  { from: 1, to: 2, weight: 8 },
  { from: 1, to: 3, weight: 5 },
  { from: 1, to: 4, weight: -4 },
  { from: 2, to: 3, weight: -3 },
  { from: 2, to: 4, weight: 9 },
  { from: 3, to: 1, weight: -2 },
  { from: 4, to: 0, weight: 2 },
  { from: 4, to: 3, weight: 7 },
];

function serializeEdge(edge: BellmanFordEdge): string {
  return `${edge.from}>${edge.to}:${edge.weight}`;
}

const DEFAULT_EDGES_TEXT = DEFAULT_EDGES.map(serializeEdge).join(", ");

export const BELLMAN_FORD_DEFAULT_PARAMS: BellmanFordParams = {
  nodeCount: DEFAULT_NODE_COUNT,
  edges: DEFAULT_EDGES_TEXT,
  startNode: DEFAULT_START_NODE,
  stopEarlyWhenStable: DEFAULT_STOP_EARLY_WHEN_STABLE,
  preferLowerIndex: DEFAULT_PREFER_LOWER_INDEX,
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

function parseStartNode(rawStartNode: RawParams["startNode"], nodeCount: number): number {
  if (typeof rawStartNode === "number" && Number.isFinite(rawStartNode)) {
    return Math.max(0, Math.min(Math.round(rawStartNode), nodeCount - 1));
  }

  if (typeof rawStartNode === "string") {
    const parsed = Number(rawStartNode.trim());
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(Math.round(parsed), nodeCount - 1));
    }
  }

  return Math.max(0, Math.min(DEFAULT_START_NODE, nodeCount - 1));
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

function parseEdgesText(rawEdges: RawParams["edges"]): string {
  if (typeof rawEdges === "string" && rawEdges.trim().length > 0) {
    return rawEdges;
  }

  return DEFAULT_EDGES_TEXT;
}

function parseEdgesFromText(text: string): BellmanFordEdge[] {
  const matches = text.matchAll(/(-?\d+)\s*(?:>|->|:)\s*(-?\d+)\s*[:@]\s*(-?\d+)/g);
  const edges: BellmanFordEdge[] = [];

  for (const match of matches) {
    const from = Number(match[1]);
    const to = Number(match[2]);
    const weight = Number(match[3]);

    if (Number.isFinite(from) && Number.isFinite(to) && Number.isFinite(weight)) {
      edges.push({
        from: Math.trunc(from),
        to: Math.trunc(to),
        weight: Math.trunc(weight),
      });
    }
  }

  return edges;
}

function normalizeEdges(edges: BellmanFordEdge[], nodeCount: number): BellmanFordEdge[] {
  const byDirection = new Map<string, BellmanFordEdge>();

  for (const edge of edges) {
    if (!Number.isInteger(edge.from) || !Number.isInteger(edge.to) || !Number.isInteger(edge.weight)) {
      continue;
    }
    if (edge.from < 0 || edge.from >= nodeCount || edge.to < 0 || edge.to >= nodeCount) {
      continue;
    }
    if (edge.from === edge.to) {
      continue;
    }

    const key = `${edge.from}:${edge.to}`;
    const weight = Math.max(-20, Math.min(edge.weight, 25));
    const existing = byDirection.get(key);

    if (!existing || weight < existing.weight) {
      byDirection.set(key, {
        from: edge.from,
        to: edge.to,
        weight,
      });
    }
  }

  return [...byDirection.values()].sort((left, right) => {
    if (left.from !== right.from) {
      return left.from - right.from;
    }
    if (left.to !== right.to) {
      return left.to - right.to;
    }
    return left.weight - right.weight;
  });
}

function buildFallbackEdges(nodeCount: number): BellmanFordEdge[] {
  const defaultWithinRange = normalizeEdges(DEFAULT_EDGES, nodeCount);
  if (defaultWithinRange.length > 0) {
    return defaultWithinRange;
  }

  const fallback: BellmanFordEdge[] = [];
  for (let node = 0; node < nodeCount - 1; node += 1) {
    fallback.push({
      from: node,
      to: node + 1,
      weight: node % 2 === 0 ? 2 : -1,
    });
  }

  if (nodeCount > 3) {
    fallback.push({ from: 0, to: nodeCount - 1, weight: 6 });
    fallback.push({ from: nodeCount - 2, to: 1, weight: -2 });
  }

  return normalizeEdges(fallback, nodeCount);
}

export function normalizeBellmanFordParams(rawParams: RawParams): BellmanFordParams {
  const nodeCount = parseNodeCount(rawParams.nodeCount);

  return {
    nodeCount,
    edges: parseEdgesText(rawParams.edges),
    startNode: parseStartNode(rawParams.startNode, nodeCount),
    stopEarlyWhenStable: parseBoolean(rawParams.stopEarlyWhenStable, DEFAULT_STOP_EARLY_WHEN_STABLE),
    preferLowerIndex: parseBoolean(rawParams.preferLowerIndex, DEFAULT_PREFER_LOWER_INDEX),
  };
}

export function normalizeBellmanFordInput(rawInput: unknown, params: BellmanFordParams): BellmanFordInput {
  const nodeCount = params.nodeCount;
  let rawEdges: BellmanFordEdge[] = [];

  if (typeof rawInput === "object" && rawInput !== null && "edges" in rawInput && Array.isArray(rawInput.edges)) {
    rawEdges = rawInput.edges.filter(
      (edge): edge is BellmanFordEdge =>
        typeof edge === "object" &&
        edge !== null &&
        "from" in edge &&
        "to" in edge &&
        "weight" in edge &&
        typeof edge.from === "number" &&
        typeof edge.to === "number" &&
        typeof edge.weight === "number",
    );
  } else {
    rawEdges = parseEdgesFromText(params.edges);
  }

  const edges = normalizeEdges(rawEdges, nodeCount);

  return {
    nodeCount,
    edges: edges.length > 0 ? edges : buildFallbackEdges(nodeCount),
    startNode: parseStartNode(params.startNode, nodeCount),
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

export function createRandomBellmanFordParams(): BellmanFordParams {
  const nodeCount = getRandomInteger(5, 9);
  const edgeCandidates: BellmanFordEdge[] = [];

  for (let node = 0; node < nodeCount - 1; node += 1) {
    edgeCandidates.push({
      from: node,
      to: node + 1,
      weight: getRandomInteger(-3, 8),
    });
  }

  for (let from = 0; from < nodeCount; from += 1) {
    for (let to = 0; to < nodeCount; to += 1) {
      if (from === to || Math.random() >= 0.24) {
        continue;
      }
      edgeCandidates.push({
        from,
        to,
        weight: getRandomInteger(-5, 12),
      });
    }
  }

  const edges = normalizeEdges(edgeCandidates, nodeCount);

  return {
    nodeCount,
    edges: edges.map(serializeEdge).join(", "),
    startNode: getRandomInteger(0, nodeCount - 1),
    stopEarlyWhenStable: Math.random() >= 0.35,
    preferLowerIndex: Math.random() >= 0.35,
  };
}

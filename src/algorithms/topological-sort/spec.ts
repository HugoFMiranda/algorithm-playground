import type { ParamPrimitive, RawParams } from "@/types/engine";

export type TopologicalSortEdge = readonly [number, number];

export interface TopologicalSortParams extends Record<string, ParamPrimitive> {
  nodeCount: number;
  edges: string;
  preferLowerIndex: boolean;
}

export interface TopologicalSortInput {
  nodeCount: number;
  edges: TopologicalSortEdge[];
  adjacency: number[][];
  indegrees: number[];
}

export interface TopologicalSortResult {
  order: number[];
  cycleDetected: boolean;
  processedCount: number;
  remainingCount: number;
  edgeRelaxations: number;
  initialZeroCount: number;
}

const MIN_NODE_COUNT = 2;
const MAX_NODE_COUNT = 16;
const DEFAULT_NODE_COUNT = 7;
const DEFAULT_EDGES: TopologicalSortEdge[] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
  [5, 6],
];
const DEFAULT_EDGES_TEXT = DEFAULT_EDGES.map((edge) => `${edge[0]}>${edge[1]}`).join(", ");
const DEFAULT_PREFER_LOWER_INDEX = true;

export const TOPOLOGICAL_SORT_DEFAULT_PARAMS: TopologicalSortParams = {
  nodeCount: DEFAULT_NODE_COUNT,
  edges: DEFAULT_EDGES_TEXT,
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

function parseBoolean(rawValue: RawParams["preferLowerIndex"], fallback: boolean): boolean {
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

function normalizeEdgeList(edges: TopologicalSortEdge[], nodeCount: number): TopologicalSortEdge[] {
  const seen = new Set<string>();
  const normalized: TopologicalSortEdge[] = [];

  for (const [from, to] of edges) {
    if (!Number.isInteger(from) || !Number.isInteger(to)) {
      continue;
    }
    if (from < 0 || from >= nodeCount || to < 0 || to >= nodeCount) {
      continue;
    }
    if (from === to) {
      continue;
    }

    const key = `${from}:${to}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push([from, to]);
  }

  return normalized;
}

function parseEdges(edgesText: string, nodeCount: number): TopologicalSortEdge[] {
  const matches = edgesText.matchAll(/(-?\d+)\s*(?:->|>|:)\s*(-?\d+)/g);
  const parsed: TopologicalSortEdge[] = [];

  for (const match of matches) {
    const from = Number(match[1]);
    const to = Number(match[2]);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      parsed.push([Math.trunc(from), Math.trunc(to)]);
    }
  }

  return normalizeEdgeList(parsed, nodeCount);
}

function buildFallbackEdges(nodeCount: number): TopologicalSortEdge[] {
  const fallback = normalizeEdgeList(DEFAULT_EDGES, nodeCount);
  if (fallback.length > 0) {
    return fallback;
  }

  const chain: TopologicalSortEdge[] = [];
  for (let node = 0; node < nodeCount - 1; node += 1) {
    chain.push([node, node + 1]);
  }

  return chain;
}

function sortAdjacency(adjacency: number[][]): number[][] {
  return adjacency.map((neighbors) => [...neighbors].sort((left, right) => left - right));
}

export function normalizeTopologicalSortParams(rawParams: RawParams): TopologicalSortParams {
  return {
    nodeCount: parseNodeCount(rawParams.nodeCount),
    edges: parseEdgesText(rawParams.edges),
    preferLowerIndex: parseBoolean(rawParams.preferLowerIndex, DEFAULT_PREFER_LOWER_INDEX),
  };
}

export function normalizeTopologicalSortInput(
  rawInput: unknown,
  params: TopologicalSortParams,
): TopologicalSortInput {
  const nodeCount = params.nodeCount;
  let rawEdges: TopologicalSortEdge[] = [];

  if (
    typeof rawInput === "object" &&
    rawInput !== null &&
    "edges" in rawInput &&
    Array.isArray(rawInput.edges)
  ) {
    rawEdges = rawInput.edges.filter(
      (edge): edge is TopologicalSortEdge =>
        Array.isArray(edge) &&
        edge.length === 2 &&
        typeof edge[0] === "number" &&
        typeof edge[1] === "number",
    );
  } else {
    rawEdges = parseEdges(params.edges, nodeCount);
  }

  const edges = rawEdges.length > 0 ? normalizeEdgeList(rawEdges, nodeCount) : buildFallbackEdges(nodeCount);
  const adjacency = Array.from({ length: nodeCount }, () => [] as number[]);
  const indegrees = Array.from({ length: nodeCount }, () => 0);

  for (const [from, to] of edges) {
    adjacency[from].push(to);
    indegrees[to] += 1;
  }

  return {
    nodeCount,
    edges,
    adjacency: sortAdjacency(adjacency),
    indegrees,
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function serializeEdges(edges: TopologicalSortEdge[]): string {
  return edges.map((edge) => `${edge[0]}>${edge[1]}`).join(", ");
}

export function createRandomTopologicalSortParams(): TopologicalSortParams {
  const nodeCount = getRandomInteger(6, 10);
  const generatedEdges: TopologicalSortEdge[] = [];

  for (let node = 0; node < nodeCount - 1; node += 1) {
    generatedEdges.push([node, node + 1]);
  }

  for (let from = 0; from < nodeCount; from += 1) {
    for (let to = from + 2; to < nodeCount; to += 1) {
      if (Math.random() < 0.3) {
        generatedEdges.push([from, to]);
      }
    }
  }

  const edges = normalizeEdgeList(generatedEdges, nodeCount);

  return {
    nodeCount,
    edges: serializeEdges(edges),
    preferLowerIndex: Math.random() >= 0.5,
  };
}

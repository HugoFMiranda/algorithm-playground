import type { ParamPrimitive, RawParams } from "@/types/engine";

export interface PrimMstEdge {
  from: number;
  to: number;
  weight: number;
}

export interface PrimMstParams extends Record<string, ParamPrimitive> {
  nodeCount: number;
  edges: string;
  startNode: number;
  preferLowerIndex: boolean;
}

export interface PrimMstInput {
  nodeCount: number;
  edges: PrimMstEdge[];
  startNode: number;
}

export interface PrimMstResult {
  selectedEdges: PrimMstEdge[];
  totalWeight: number;
  visitedCount: number;
  components: number;
  connected: boolean;
  frontierCandidates: number;
  edgeLocks: number;
}

const MIN_NODE_COUNT = 2;
const MAX_NODE_COUNT = 18;
const DEFAULT_NODE_COUNT = 8;
const DEFAULT_START_NODE = 0;
const DEFAULT_PREFER_LOWER_INDEX = true;

const DEFAULT_EDGES: PrimMstEdge[] = [
  { from: 0, to: 1, weight: 4 },
  { from: 0, to: 2, weight: 3 },
  { from: 1, to: 2, weight: 1 },
  { from: 1, to: 3, weight: 2 },
  { from: 2, to: 3, weight: 4 },
  { from: 2, to: 4, weight: 6 },
  { from: 3, to: 4, weight: 5 },
  { from: 3, to: 5, weight: 7 },
  { from: 4, to: 5, weight: 2 },
  { from: 4, to: 6, weight: 8 },
  { from: 5, to: 7, weight: 3 },
  { from: 6, to: 7, weight: 4 },
];

function serializeEdge(edge: PrimMstEdge): string {
  return `${edge.from}-${edge.to}:${edge.weight}`;
}

const DEFAULT_EDGES_TEXT = DEFAULT_EDGES.map(serializeEdge).join(", ");

export const PRIM_MST_DEFAULT_PARAMS: PrimMstParams = {
  nodeCount: DEFAULT_NODE_COUNT,
  edges: DEFAULT_EDGES_TEXT,
  startNode: DEFAULT_START_NODE,
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

function parseEdgesFromText(text: string): PrimMstEdge[] {
  const matches = text.matchAll(/(-?\d+)\s*(?:-|>|:)\s*(-?\d+)\s*[:@]\s*(-?\d+)/g);
  const edges: PrimMstEdge[] = [];

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

function normalizeEdges(edges: PrimMstEdge[], nodeCount: number): PrimMstEdge[] {
  const byEndpoints = new Map<string, PrimMstEdge>();

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

    const from = Math.min(edge.from, edge.to);
    const to = Math.max(edge.from, edge.to);
    const weight = Math.max(1, Math.min(Math.abs(edge.weight), 99));
    const key = `${from}:${to}`;
    const existing = byEndpoints.get(key);

    if (!existing || weight < existing.weight) {
      byEndpoints.set(key, { from, to, weight });
    }
  }

  return [...byEndpoints.values()].sort((left, right) => {
    if (left.from !== right.from) {
      return left.from - right.from;
    }
    if (left.to !== right.to) {
      return left.to - right.to;
    }
    return left.weight - right.weight;
  });
}

function buildFallbackEdges(nodeCount: number): PrimMstEdge[] {
  const defaultWithinRange = normalizeEdges(DEFAULT_EDGES, nodeCount);
  if (defaultWithinRange.length > 0) {
    return defaultWithinRange;
  }

  const fallback: PrimMstEdge[] = [];
  for (let node = 0; node < nodeCount - 1; node += 1) {
    fallback.push({ from: node, to: node + 1, weight: node + 1 });
  }
  if (nodeCount > 3) {
    fallback.push({ from: 0, to: nodeCount - 1, weight: nodeCount + 2 });
  }

  return normalizeEdges(fallback, nodeCount);
}

export function normalizePrimMstParams(rawParams: RawParams): PrimMstParams {
  const nodeCount = parseNodeCount(rawParams.nodeCount);

  return {
    nodeCount,
    edges: parseEdgesText(rawParams.edges),
    startNode: parseStartNode(rawParams.startNode, nodeCount),
    preferLowerIndex: parseBoolean(rawParams.preferLowerIndex, DEFAULT_PREFER_LOWER_INDEX),
  };
}

export function normalizePrimMstInput(rawInput: unknown, params: PrimMstParams): PrimMstInput {
  const nodeCount = params.nodeCount;
  let rawEdges: PrimMstEdge[] = [];

  if (typeof rawInput === "object" && rawInput !== null && "edges" in rawInput && Array.isArray(rawInput.edges)) {
    rawEdges = rawInput.edges.filter(
      (edge): edge is PrimMstEdge =>
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

export function createRandomPrimMstParams(): PrimMstParams {
  const nodeCount = getRandomInteger(6, 10);
  const edgeCandidates: PrimMstEdge[] = [];

  for (let node = 0; node < nodeCount - 1; node += 1) {
    edgeCandidates.push({
      from: node,
      to: node + 1,
      weight: getRandomInteger(1, 12),
    });
  }

  for (let from = 0; from < nodeCount; from += 1) {
    for (let to = from + 2; to < nodeCount; to += 1) {
      if (Math.random() < 0.26) {
        edgeCandidates.push({
          from,
          to,
          weight: getRandomInteger(1, 18),
        });
      }
    }
  }

  const edges = normalizeEdges(edgeCandidates, nodeCount);

  return {
    nodeCount,
    edges: edges.map(serializeEdge).join(", "),
    startNode: getRandomInteger(0, nodeCount - 1),
    preferLowerIndex: Math.random() >= 0.35,
  };
}

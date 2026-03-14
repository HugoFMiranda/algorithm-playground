import { getAlgorithmRuntime, isAlgorithmImplemented, type RendererFamily } from "@/algorithms/registry";
import { ALGORITHMS, getAlgorithmBySlug, type AlgorithmDefinition } from "@/data/algorithms";
import { getCompactCurrentComplexity, getComplexitySummary } from "@/lib/complexity";
import type { ParamPrimitive, RawParams, StepEventBase } from "@/types/engine";

export interface ComparisonAlgorithmDefinition extends AlgorithmDefinition {
  rendererFamily: RendererFamily;
}

export interface ComparisonSnapshot {
  algorithm: ComparisonAlgorithmDefinition;
  input: unknown;
  normalizedParams: Record<string, ParamPrimitive>;
  steps: StepEventBase[];
  result: unknown;
  stepCount: number;
  compactComplexity: string | null;
  complexitySummary: ReturnType<typeof getComplexitySummary>;
  metrics: ComparisonMetric[];
}

export interface ComparisonMetric {
  key: string;
  label: string;
  value: number;
}

export type ComparisonSharedInputProfile = "array-values" | "path-grid";

const ARRAY_SHARED_INPUT_SLUGS = new Set([
  "binary-search",
  "bubble-sort",
  "counting-sort",
  "selection-sort",
  "insertion-sort",
  "merge-sort",
  "quick-sort",
  "heap-sort",
]);

const PATH_GRID_SHARED_INPUT_SLUGS = new Set([
  "bfs",
  "dfs",
  "dijkstra",
  "a-star",
  "bidirectional-bfs",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function addMetric(
  metrics: ComparisonMetric[],
  seen: Set<string>,
  key: string,
  label: string,
  value: unknown,
) {
  if (seen.has(key) || !isFiniteNumber(value)) {
    return;
  }

  seen.add(key);
  metrics.push({ key, label, value });
}

function extractInputMetrics(snapshot: {
  input: unknown;
}): ComparisonMetric[] {
  const metrics: ComparisonMetric[] = [];
  const seen = new Set<string>();
  const { input } = snapshot;

  if (!isRecord(input)) {
    return metrics;
  }

  if ("values" in input && Array.isArray(input.values)) {
    addMetric(metrics, seen, "input-size", "Input Size", input.values.length);
  }

  if ("rows" in input && "cols" in input) {
    const rows = input.rows;
    const cols = input.cols;
    if (isFiniteNumber(rows) && isFiniteNumber(cols)) {
      addMetric(metrics, seen, "grid-cells", "Grid Cells", rows * cols);
    }
  }

  if ("blockedCells" in input && Array.isArray(input.blockedCells)) {
    addMetric(metrics, seen, "blocked-cells", "Blocked Cells", input.blockedCells.length);
  }

  if ("nodeCount" in input) {
    addMetric(metrics, seen, "nodes", "Nodes", input.nodeCount);
  }

  if ("edges" in input && Array.isArray(input.edges)) {
    addMetric(metrics, seen, "edges", "Edges", input.edges.length);
  }

  if ("operations" in input && Array.isArray(input.operations)) {
    addMetric(metrics, seen, "operations", "Operations", input.operations.length);
  }

  if ("words" in input && Array.isArray(input.words)) {
    addMetric(metrics, seen, "words", "Words", input.words.length);
  }

  if ("queries" in input && Array.isArray(input.queries)) {
    addMetric(metrics, seen, "queries", "Queries", input.queries.length);
  }

  if ("initialValues" in input && Array.isArray(input.initialValues)) {
    addMetric(metrics, seen, "initial-values", "Initial Values", input.initialValues.length);
  }

  if ("insertValues" in input && Array.isArray(input.insertValues)) {
    addMetric(metrics, seen, "insert-values", "Insert Values", input.insertValues.length);
  }

  if ("nodes" in input && Array.isArray(input.nodes)) {
    addMetric(metrics, seen, "tree-nodes", "Tree Nodes", input.nodes.length);
  }

  return metrics;
}

const RESULT_METRIC_PRIORITY: Array<{ key: string; label: string }> = [
  { key: "comparisons", label: "Comparisons" },
  { key: "swaps", label: "Swaps" },
  { key: "passes", label: "Passes" },
  { key: "writes", label: "Writes" },
  { key: "rangeSize", label: "Range Size" },
  { key: "countsLength", label: "Bucket Count" },
  { key: "shifts", label: "Shifts" },
  { key: "partitions", label: "Partitions" },
  { key: "maxDepth", label: "Depth" },
  { key: "heapifyCalls", label: "Heapify Calls" },
  { key: "extractions", label: "Extractions" },
  { key: "visitedCount", label: "Visited" },
  { key: "expandedCount", label: "Expanded" },
  { key: "forwardVisitedCount", label: "Forward Seen" },
  { key: "backwardVisitedCount", label: "Backward Seen" },
  { key: "relaxations", label: "Relaxations" },
  { key: "distance", label: "Distance" },
  { key: "iterations", label: "Iterations" },
  { key: "edgesConsidered", label: "Edges Considered" },
  { key: "edgesAccepted", label: "Edges Accepted" },
  { key: "cycleSkips", label: "Cycle Skips" },
  { key: "frontierCandidates", label: "Frontier Candidates" },
  { key: "edgeLocks", label: "Edge Locks" },
  { key: "componentCount", label: "Components" },
  { key: "components", label: "Components" },
  { key: "successfulUnions", label: "Successful Unions" },
  { key: "findQueries", label: "Find Queries" },
  { key: "connectedQueries", label: "Connected Queries" },
  { key: "roundsExecuted", label: "Rounds" },
  { key: "reachableCount", label: "Reachable" },
  { key: "searchHits", label: "Search Hits" },
  { key: "prefixHits", label: "Prefix Hits" },
  { key: "wordsInserted", label: "Words Inserted" },
  { key: "queryCount", label: "Query Count" },
  { key: "createdNodes", label: "Created Nodes" },
  { key: "terminalNodes", label: "Terminal Nodes" },
  { key: "operationCount", label: "Operation Count" },
  { key: "traversedNodes", label: "Traversed Nodes" },
  { key: "insertsApplied", label: "Inserts" },
  { key: "deletesApplied", label: "Deletes" },
  { key: "duplicateInserts", label: "Duplicate Inserts" },
  { key: "missingDeletes", label: "Missing Deletes" },
  { key: "treeHeight", label: "Tree Height" },
  { key: "nodeCount", label: "Node Count" },
  { key: "heightUpdates", label: "Height Updates" },
  { key: "imbalanceCount", label: "Imbalances" },
  { key: "rotations", label: "Rotations" },
  { key: "processedCount", label: "Processed" },
  { key: "remainingCount", label: "Remaining" },
  { key: "initialZeroCount", label: "Initial Zeroes" },
  { key: "totalWeight", label: "Total Weight" },
];

function extractResultMetrics(snapshot: { result: unknown; stepCount: number }): ComparisonMetric[] {
  const metrics: ComparisonMetric[] = [{ key: "steps", label: "Steps", value: snapshot.stepCount }];
  const seen = new Set<string>(["steps"]);

  if (!isRecord(snapshot.result)) {
    return metrics;
  }

  for (const metric of RESULT_METRIC_PRIORITY) {
    addMetric(metrics, seen, metric.key, metric.label, snapshot.result[metric.key]);
  }

  return metrics;
}

function extractComparisonMetrics(snapshot: {
  input: unknown;
  result: unknown;
  stepCount: number;
}): ComparisonMetric[] {
  return [...extractInputMetrics(snapshot), ...extractResultMetrics(snapshot)].slice(0, 8);
}

function toComparisonAlgorithm(algorithm: AlgorithmDefinition): ComparisonAlgorithmDefinition | null {
  const runtime = getAlgorithmRuntime(algorithm.slug);

  if (!runtime) {
    return null;
  }

  return {
    ...algorithm,
    rendererFamily: runtime.rendererFamily,
  };
}

export function getImplementedComparisonAlgorithms(): ComparisonAlgorithmDefinition[] {
  return ALGORITHMS.filter((algorithm) => isAlgorithmImplemented(algorithm.slug))
    .map(toComparisonAlgorithm)
    .filter((algorithm): algorithm is ComparisonAlgorithmDefinition => algorithm !== null);
}

export function getComparableAlgorithms(anchorSlug: string | null): ComparisonAlgorithmDefinition[] {
  const implemented = getImplementedComparisonAlgorithms();

  if (!anchorSlug) {
    return implemented;
  }

  const anchor = implemented.find((algorithm) => algorithm.slug === anchorSlug);

  if (!anchor) {
    return implemented;
  }

  return implemented.filter((algorithm) => algorithm.rendererFamily === anchor.rendererFamily);
}

export function getDefaultComparisonPair(): [string, string] {
  const implemented = getImplementedComparisonAlgorithms();

  for (const algorithm of implemented) {
    const partner = implemented.find(
      (candidate) =>
        candidate.slug !== algorithm.slug && candidate.rendererFamily === algorithm.rendererFamily,
    );

    if (partner) {
      return [algorithm.slug, partner.slug];
    }
  }

  const fallback = implemented[0]?.slug ?? "bubble-sort";
  return [fallback, fallback];
}

export function getComparisonSharedInputProfile(
  leftSlug: string | null,
  rightSlug: string | null,
): ComparisonSharedInputProfile | null {
  if (!leftSlug || !rightSlug) {
    return null;
  }

  if (ARRAY_SHARED_INPUT_SLUGS.has(leftSlug) && ARRAY_SHARED_INPUT_SLUGS.has(rightSlug)) {
    return "array-values";
  }

  if (PATH_GRID_SHARED_INPUT_SLUGS.has(leftSlug) && PATH_GRID_SHARED_INPUT_SLUGS.has(rightSlug)) {
    return "path-grid";
  }

  return null;
}

export function getDefaultSharedInputParams(
  profile: ComparisonSharedInputProfile | null,
  anchorSlug: string | null,
): RawParams {
  if (!profile || !anchorSlug) {
    return {};
  }

  const runtime = getAlgorithmRuntime(anchorSlug);

  if (!runtime) {
    return {};
  }

  if (profile === "array-values") {
    return {
      arrayValues:
        typeof runtime.defaultParams.arrayValues === "string" ? runtime.defaultParams.arrayValues : "",
    };
  }

  return {
    rows: typeof runtime.defaultParams.rows === "number" ? runtime.defaultParams.rows : 6,
    cols: typeof runtime.defaultParams.cols === "number" ? runtime.defaultParams.cols : 8,
    startCell: typeof runtime.defaultParams.startCell === "number" ? runtime.defaultParams.startCell : 0,
    targetCell: typeof runtime.defaultParams.targetCell === "number" ? runtime.defaultParams.targetCell : 47,
    blockedCells:
      typeof runtime.defaultParams.blockedCells === "string" ? runtime.defaultParams.blockedCells : "",
    allowDiagonal:
      typeof runtime.defaultParams.allowDiagonal === "boolean" ? runtime.defaultParams.allowDiagonal : false,
  };
}

export function getComparisonAlgorithm(slug: string): ComparisonAlgorithmDefinition | null {
  const algorithm = getAlgorithmBySlug(slug);

  if (!algorithm || !isAlgorithmImplemented(slug)) {
    return null;
  }

  return toComparisonAlgorithm(algorithm);
}

export function createComparisonSnapshot(slug: string, rawParams: RawParams = {}): ComparisonSnapshot | null {
  const algorithm = getComparisonAlgorithm(slug);
  const runtime = getAlgorithmRuntime(slug);

  if (!algorithm || !runtime) {
    return null;
  }

  const run = runtime.createRun({ ...runtime.defaultParams, ...rawParams });
  const runSnapshot = {
    algorithmSlug: slug,
    input: run.input,
    normalizedParams: run.normalizedParams,
    result: run.result,
  };

  return {
    algorithm,
    input: run.input,
    normalizedParams: run.normalizedParams,
    steps: run.steps,
    result: run.result,
    stepCount: run.steps.length,
    compactComplexity: getCompactCurrentComplexity(slug, runSnapshot),
    complexitySummary: getComplexitySummary(slug, runSnapshot),
    metrics: extractComparisonMetrics({
      input: run.input,
      result: run.result,
      stepCount: run.steps.length,
    }),
  };
}

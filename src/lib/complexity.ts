import type { ParamPrimitive } from "@/types/engine";

interface AlgorithmRunSnapshot {
  algorithmSlug: string;
  input: unknown;
  normalizedParams: Record<string, ParamPrimitive>;
  result: unknown;
}

export interface ComplexitySummary {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  space: string;
  current: string;
  details: string[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractValues(input: unknown): number[] {
  if (!isRecord(input) || !("values" in input)) {
    return [];
  }

  const candidate = input.values;
  if (!Array.isArray(candidate) || !candidate.every(isFiniteNumber)) {
    return [];
  }

  return candidate;
}

function isNonDecreasing(values: number[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] > values[index]) {
      return false;
    }
  }

  return true;
}

function parseBooleanParam(value: ParamPrimitive | undefined, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function getBinarySearchComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  const values = run ? extractValues(run.input) : [];
  const n = values.length;
  const theoreticalWorstIterations = n > 0 ? Math.ceil(Math.log2(n + 1)) : 0;

  let iterations: number | null = null;
  let found: boolean | null = null;
  if (run && isRecord(run.result)) {
    if ("iterations" in run.result && isFiniteNumber(run.result.iterations)) {
      iterations = run.result.iterations;
    }
    if ("found" in run.result && typeof run.result.found === "boolean") {
      found = run.result.found;
    }
  }

  const current =
    iterations === null
      ? "Awaiting run output"
      : `${iterations} iteration${iterations === 1 ? "" : "s"} for n=${n || "?"}`;

  const details = [
    `n = ${n}`,
    `Current behavior: ${iterations !== null && iterations <= 1 ? "O(1)" : "O(log n)"}`,
    `Worst-case iteration bound for n: ${theoreticalWorstIterations}`,
    found === null ? "Result: pending" : `Result: ${found ? "target found" : "target not found"}`,
  ];

  return {
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
    current,
    details,
  };
}

function getBubbleSortComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  const values = run ? extractValues(run.input) : [];
  const n = values.length;
  const sortedInput = isNonDecreasing(values);
  const optimizeEarlyExit = parseBooleanParam(run?.normalizedParams.optimizeEarlyExit, true);

  let comparisons: number | null = null;
  let swaps: number | null = null;
  let passes: number | null = null;
  if (run && isRecord(run.result)) {
    if ("comparisons" in run.result && isFiniteNumber(run.result.comparisons)) {
      comparisons = run.result.comparisons;
    }
    if ("swaps" in run.result && isFiniteNumber(run.result.swaps)) {
      swaps = run.result.swaps;
    }
    if ("passes" in run.result && isFiniteNumber(run.result.passes)) {
      passes = run.result.passes;
    }
  }

  const worstComparisons = n > 1 ? (n * (n - 1)) / 2 : 0;
  const bestComparisonsWithEarlyExit = n > 1 ? n - 1 : 0;
  const currentComplexityLabel =
    optimizeEarlyExit && sortedInput ? "O(n) on this input (early exit)" : "O(n^2) on this input";

  const details = [
    `n = ${n}`,
    `optimizeEarlyExit = ${String(optimizeEarlyExit)}`,
    `Input already sorted: ${String(sortedInput)}`,
    `Theoretical comparisons: best ${bestComparisonsWithEarlyExit}, worst ${worstComparisons}`,
    comparisons === null
      ? "Observed comparisons: pending"
      : `Observed comparisons/swaps/passes: ${comparisons}/${swaps ?? "?"}/${passes ?? "?"}`,
  ];

  return {
    timeBest: optimizeEarlyExit ? "O(n)" : "O(n^2)",
    timeAverage: "O(n^2)",
    timeWorst: "O(n^2)",
    space: "O(1)",
    current: currentComplexityLabel,
    details,
  };
}

function getSelectionSortComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  const values = run ? extractValues(run.input) : [];
  const n = values.length;
  const swapOnlyWhenNeeded = parseBooleanParam(run?.normalizedParams.swapOnlyWhenNeeded, true);

  let comparisons: number | null = null;
  let swaps: number | null = null;
  let passes: number | null = null;
  if (run && isRecord(run.result)) {
    if ("comparisons" in run.result && isFiniteNumber(run.result.comparisons)) {
      comparisons = run.result.comparisons;
    }
    if ("swaps" in run.result && isFiniteNumber(run.result.swaps)) {
      swaps = run.result.swaps;
    }
    if ("passes" in run.result && isFiniteNumber(run.result.passes)) {
      passes = run.result.passes;
    }
  }

  const fixedComparisons = n > 1 ? (n * (n - 1)) / 2 : 0;
  const theoreticalBestSwaps = swapOnlyWhenNeeded ? 0 : Math.max(0, n - 1);
  const theoreticalWorstSwaps = Math.max(0, n - 1);

  const details = [
    `n = ${n}`,
    `swapOnlyWhenNeeded = ${String(swapOnlyWhenNeeded)}`,
    `Theoretical comparisons (best/avg/worst): ${fixedComparisons}`,
    `Theoretical swaps: best ${theoreticalBestSwaps}, worst ${theoreticalWorstSwaps}`,
    comparisons === null
      ? "Observed comparisons: pending"
      : `Observed comparisons/swaps/passes: ${comparisons}/${swaps ?? "?"}/${passes ?? "?"}`,
  ];

  return {
    timeBest: "O(n^2)",
    timeAverage: "O(n^2)",
    timeWorst: "O(n^2)",
    space: "O(1)",
    current: "O(n^2) on this input",
    details,
  };
}

function getQuickSortComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  const values = run ? extractValues(run.input) : [];
  const n = values.length;
  const pivotStrategy =
    run && typeof run.normalizedParams.pivotStrategy === "string"
      ? run.normalizedParams.pivotStrategy
      : "last";

  let comparisons: number | null = null;
  let swaps: number | null = null;
  let partitions: number | null = null;
  let maxDepth: number | null = null;
  if (run && isRecord(run.result)) {
    if ("comparisons" in run.result && isFiniteNumber(run.result.comparisons)) {
      comparisons = run.result.comparisons;
    }
    if ("swaps" in run.result && isFiniteNumber(run.result.swaps)) {
      swaps = run.result.swaps;
    }
    if ("partitions" in run.result && isFiniteNumber(run.result.partitions)) {
      partitions = run.result.partitions;
    }
    if ("maxDepth" in run.result && isFiniteNumber(run.result.maxDepth)) {
      maxDepth = run.result.maxDepth;
    }
  }

  const details = [
    `n = ${n}`,
    `pivotStrategy = ${pivotStrategy}`,
    `Expected profile: O(n log n) average, O(n^2) worst for unbalanced partitions`,
    comparisons === null
      ? "Observed comparisons/swaps/partitions: pending"
      : `Observed comparisons/swaps/partitions: ${comparisons}/${swaps ?? "?"}/${partitions ?? "?"}`,
    maxDepth === null ? "Observed recursion depth: pending" : `Observed recursion depth: ${maxDepth}`,
  ];

  return {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n^2)",
    space: "O(log n)",
    current: n <= 1 ? "O(1) on this input" : "O(n log n) expected on this input",
    details,
  };
}

function getHeapSortComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  const values = run ? extractValues(run.input) : [];
  const n = values.length;

  let comparisons: number | null = null;
  let swaps: number | null = null;
  let heapifyCalls: number | null = null;
  let extractions: number | null = null;
  if (run && isRecord(run.result)) {
    if ("comparisons" in run.result && isFiniteNumber(run.result.comparisons)) {
      comparisons = run.result.comparisons;
    }
    if ("swaps" in run.result && isFiniteNumber(run.result.swaps)) {
      swaps = run.result.swaps;
    }
    if ("heapifyCalls" in run.result && isFiniteNumber(run.result.heapifyCalls)) {
      heapifyCalls = run.result.heapifyCalls;
    }
    if ("extractions" in run.result && isFiniteNumber(run.result.extractions)) {
      extractions = run.result.extractions;
    }
  }

  const details = [
    `n = ${n}`,
    "Build-heap phase is O(n), followed by O(log n) sift-down per extraction",
    comparisons === null
      ? "Observed comparisons/swaps: pending"
      : `Observed comparisons/swaps: ${comparisons}/${swaps ?? "?"}`,
    heapifyCalls === null
      ? "Observed heapify calls: pending"
      : `Observed heapify calls/extractions: ${heapifyCalls}/${extractions ?? "?"}`,
  ];

  return {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(1)",
    current: n <= 1 ? "O(1) on this input" : "O(n log n) on this input",
    details,
  };
}

function getTopologicalSortComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  let nodeCount = 0;
  let edgeCount = 0;

  if (run && isRecord(run.input)) {
    if ("nodeCount" in run.input && isFiniteNumber(run.input.nodeCount)) {
      nodeCount = run.input.nodeCount;
    }
    if ("edges" in run.input && Array.isArray(run.input.edges)) {
      edgeCount = run.input.edges.length;
    }
  }

  let orderLength: number | null = null;
  let cycleDetected: boolean | null = null;
  let remainingCount: number | null = null;
  let edgeRelaxations: number | null = null;
  if (run && isRecord(run.result)) {
    if ("order" in run.result && Array.isArray(run.result.order)) {
      orderLength = run.result.order.length;
    }
    if ("cycleDetected" in run.result && typeof run.result.cycleDetected === "boolean") {
      cycleDetected = run.result.cycleDetected;
    }
    if ("remainingCount" in run.result && isFiniteNumber(run.result.remainingCount)) {
      remainingCount = run.result.remainingCount;
    }
    if ("edgeRelaxations" in run.result && isFiniteNumber(run.result.edgeRelaxations)) {
      edgeRelaxations = run.result.edgeRelaxations;
    }
  }

  const details = [
    `Graph size: V=${nodeCount}, E=${edgeCount}`,
    "Kahn traversal processes each node and edge at most once",
    orderLength === null ? "Observed output length: pending" : `Observed output length: ${orderLength}`,
    edgeRelaxations === null ? "Observed edge relaxations: pending" : `Observed edge relaxations: ${edgeRelaxations}`,
    cycleDetected === null
      ? "Cycle detection: pending"
      : cycleDetected
        ? `Cycle detected with ${remainingCount ?? "?"} node(s) unresolved`
        : "Cycle detection: none",
  ];

  return {
    timeBest: "O(V + E)",
    timeAverage: "O(V + E)",
    timeWorst: "O(V + E)",
    space: "O(V + E)",
    current: "O(V + E) on this graph",
    details,
  };
}

function getUnionFindComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  let nodeCount = 0;
  let operationCount = 0;
  let pathCompression = true;
  let unionByRank = true;

  if (run && isRecord(run.input)) {
    if ("nodeCount" in run.input && isFiniteNumber(run.input.nodeCount)) {
      nodeCount = run.input.nodeCount;
    }
    if ("operations" in run.input && Array.isArray(run.input.operations)) {
      operationCount = run.input.operations.length;
    }
  }

  if (run) {
    pathCompression = parseBooleanParam(run.normalizedParams.pathCompression, true);
    unionByRank = parseBooleanParam(run.normalizedParams.unionByRank, true);
  }

  let componentCount: number | null = null;
  let successfulUnions: number | null = null;
  let findQueries: number | null = null;
  let connectedQueries: number | null = null;
  if (run && isRecord(run.result)) {
    if ("componentCount" in run.result && isFiniteNumber(run.result.componentCount)) {
      componentCount = run.result.componentCount;
    }
    if ("successfulUnions" in run.result && isFiniteNumber(run.result.successfulUnions)) {
      successfulUnions = run.result.successfulUnions;
    }
    if ("findQueries" in run.result && isFiniteNumber(run.result.findQueries)) {
      findQueries = run.result.findQueries;
    }
    if ("connectedQueries" in run.result && isFiniteNumber(run.result.connectedQueries)) {
      connectedQueries = run.result.connectedQueries;
    }
  }

  const details = [
    `Nodes = ${nodeCount}, operations = ${operationCount}`,
    `pathCompression = ${String(pathCompression)}, unionByRank = ${String(unionByRank)}`,
    "Amortized behavior trends to near-constant with both optimizations enabled",
    componentCount === null
      ? "Observed components: pending"
      : `Observed components/successful unions: ${componentCount}/${successfulUnions ?? "?"}`,
    findQueries === null
      ? "Observed query counts: pending"
      : `Observed find/connected queries: ${findQueries}/${connectedQueries ?? "?"}`,
  ];

  return {
    timeBest: "O(1)",
    timeAverage: "O(alpha)",
    timeWorst: pathCompression && unionByRank ? "O(alpha)" : "O(log n)",
    space: "O(n)",
    current: operationCount === 0 ? "O(1) on this run" : "O(alpha) amortized on this run",
    details,
  };
}

function getKruskalMstComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  let nodeCount = 0;
  let edgeCount = 0;

  if (run && isRecord(run.input)) {
    if ("nodeCount" in run.input && isFiniteNumber(run.input.nodeCount)) {
      nodeCount = run.input.nodeCount;
    }
    if ("edges" in run.input && Array.isArray(run.input.edges)) {
      edgeCount = run.input.edges.length;
    }
  }

  let totalWeight: number | null = null;
  let edgesConsidered: number | null = null;
  let edgesAccepted: number | null = null;
  let cycleSkips: number | null = null;
  let connected: boolean | null = null;
  if (run && isRecord(run.result)) {
    if ("totalWeight" in run.result && isFiniteNumber(run.result.totalWeight)) {
      totalWeight = run.result.totalWeight;
    }
    if ("edgesConsidered" in run.result && isFiniteNumber(run.result.edgesConsidered)) {
      edgesConsidered = run.result.edgesConsidered;
    }
    if ("edgesAccepted" in run.result && isFiniteNumber(run.result.edgesAccepted)) {
      edgesAccepted = run.result.edgesAccepted;
    }
    if ("cycleSkips" in run.result && isFiniteNumber(run.result.cycleSkips)) {
      cycleSkips = run.result.cycleSkips;
    }
    if ("connected" in run.result && typeof run.result.connected === "boolean") {
      connected = run.result.connected;
    }
  }

  const details = [
    `Graph size: V=${nodeCount}, E=${edgeCount}`,
    "Dominant cost is edge sorting, then near-constant amortized union-find checks",
    edgesConsidered === null
      ? "Observed considered/accepted edges: pending"
      : `Observed considered/accepted edges: ${edgesConsidered}/${edgesAccepted ?? "?"}`,
    cycleSkips === null ? "Observed cycle skips: pending" : `Observed cycle skips: ${cycleSkips}`,
    totalWeight === null ? "MST total weight: pending" : `MST total weight: ${totalWeight}`,
    connected === null ? "Connected graph: pending" : `Connected graph: ${String(connected)}`,
  ];

  return {
    timeBest: "O(E log E)",
    timeAverage: "O(E log E)",
    timeWorst: "O(E log E)",
    space: "O(V + E)",
    current: edgeCount <= 1 ? "O(1) on this graph" : "O(E log E) on this graph",
    details,
  };
}

function getInvertBinaryTreeComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  let nodeCount = 0;
  if (run && isRecord(run.input) && "nodes" in run.input && Array.isArray(run.input.nodes)) {
    nodeCount = run.input.nodes.length;
  }

  const traversalMode =
    run && run.normalizedParams.traversalMode === "bfs" ? "bfs" : "dfs";
  const queueOrStackSpace = traversalMode === "bfs" ? "O(w)" : "O(h)";

  let visitedCount: number | null = null;
  let swaps: number | null = null;
  let isEmpty: boolean | null = null;
  if (run && isRecord(run.result)) {
    if ("visitedCount" in run.result && isFiniteNumber(run.result.visitedCount)) {
      visitedCount = run.result.visitedCount;
    }
    if ("swaps" in run.result && isFiniteNumber(run.result.swaps)) {
      swaps = run.result.swaps;
    }
    if ("isEmpty" in run.result && typeof run.result.isEmpty === "boolean") {
      isEmpty = run.result.isEmpty;
    }
  }

  const details = [
    `Nodes = ${nodeCount}`,
    `Traversal mode = ${traversalMode.toUpperCase()}`,
    `Auxiliary traversal space profile: ${queueOrStackSpace}`,
    visitedCount === null
      ? "Observed visited nodes: pending"
      : `Observed visited nodes/swaps: ${visitedCount}/${swaps ?? "?"}`,
    isEmpty === null ? "Empty tree: pending" : `Empty tree: ${String(isEmpty)}`,
  ];

  return {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: queueOrStackSpace,
    current: nodeCount <= 1 ? "O(1) on this tree" : "O(n) on this tree",
    details,
  };
}

function getInsertionSortComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  const values = run ? extractValues(run.input) : [];
  const n = values.length;
  const sortedInput = isNonDecreasing(values);
  const allowEarlyPlacement = parseBooleanParam(run?.normalizedParams.allowEarlyPlacement, true);

  let comparisons: number | null = null;
  let shifts: number | null = null;
  let passes: number | null = null;
  if (run && isRecord(run.result)) {
    if ("comparisons" in run.result && isFiniteNumber(run.result.comparisons)) {
      comparisons = run.result.comparisons;
    }
    if ("shifts" in run.result && isFiniteNumber(run.result.shifts)) {
      shifts = run.result.shifts;
    }
    if ("passes" in run.result && isFiniteNumber(run.result.passes)) {
      passes = run.result.passes;
    }
  }

  const worstComparisons = n > 1 ? (n * (n - 1)) / 2 : 0;
  const currentComplexityLabel =
    allowEarlyPlacement && sortedInput ? "O(n) on this input (early placement)" : "O(n^2) on this input";

  const details = [
    `n = ${n}`,
    `allowEarlyPlacement = ${String(allowEarlyPlacement)}`,
    `Input already sorted: ${String(sortedInput)}`,
    `Theoretical comparisons: best ${n > 0 ? Math.max(0, n - 1) : 0}, worst ${worstComparisons}`,
    comparisons === null
      ? "Observed comparisons: pending"
      : `Observed comparisons/shifts/passes: ${comparisons}/${shifts ?? "?"}/${passes ?? "?"}`,
  ];

  return {
    timeBest: allowEarlyPlacement ? "O(n)" : "O(n^2)",
    timeAverage: "O(n^2)",
    timeWorst: "O(n^2)",
    space: "O(1)",
    current: currentComplexityLabel,
    details,
  };
}

function getMergeSortComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  const values = run ? extractValues(run.input) : [];
  const n = values.length;

  let comparisons: number | null = null;
  let writes: number | null = null;
  let merges: number | null = null;
  let maxDepth: number | null = null;
  if (run && isRecord(run.result)) {
    if ("comparisons" in run.result && isFiniteNumber(run.result.comparisons)) {
      comparisons = run.result.comparisons;
    }
    if ("writes" in run.result && isFiniteNumber(run.result.writes)) {
      writes = run.result.writes;
    }
    if ("merges" in run.result && isFiniteNumber(run.result.merges)) {
      merges = run.result.merges;
    }
    if ("maxDepth" in run.result && isFiniteNumber(run.result.maxDepth)) {
      maxDepth = run.result.maxDepth;
    }
  }

  const logFactor = n > 1 ? Math.ceil(Math.log2(n)) : 0;
  const estimatedCost = n > 1 ? n * logFactor : 0;

  const details = [
    `n = ${n}`,
    `Estimated n * log2(n) cost scale: ${estimatedCost}`,
    `Extra buffer usage tracks O(n) auxiliary memory for merge writes`,
    comparisons === null
      ? "Observed comparisons: pending"
      : `Observed comparisons/writes/merges: ${comparisons}/${writes ?? "?"}/${merges ?? "?"}`,
    maxDepth === null ? "Observed recursion depth: pending" : `Observed recursion depth: ${maxDepth}`,
  ];

  return {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
    current: "O(n log n) on this input",
    details,
  };
}

function getBfsComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  let rows = 0;
  let cols = 0;
  let blockedCells = 0;
  let allowDiagonal = false;

  if (run && isRecord(run.input)) {
    if ("rows" in run.input && isFiniteNumber(run.input.rows)) {
      rows = run.input.rows;
    }
    if ("cols" in run.input && isFiniteNumber(run.input.cols)) {
      cols = run.input.cols;
    }
    if ("blockedCells" in run.input && Array.isArray(run.input.blockedCells)) {
      blockedCells = run.input.blockedCells.filter(isFiniteNumber).length;
    }
    if ("allowDiagonal" in run.input && typeof run.input.allowDiagonal === "boolean") {
      allowDiagonal = run.input.allowDiagonal;
    }
  }

  const vertexCount = Math.max(0, rows * cols - blockedCells);
  const edgeFactor = allowDiagonal ? 8 : 4;
  const estimatedEdges = Math.floor((vertexCount * edgeFactor) / 2);

  let visitedCount: number | null = null;
  let distance: number | null = null;
  let found: boolean | null = null;
  if (run && isRecord(run.result)) {
    if ("visitedCount" in run.result && isFiniteNumber(run.result.visitedCount)) {
      visitedCount = run.result.visitedCount;
    }
    if ("distance" in run.result && isFiniteNumber(run.result.distance)) {
      distance = run.result.distance;
    }
    if ("found" in run.result && typeof run.result.found === "boolean") {
      found = run.result.found;
    }
  }

  const details = [
    `Grid = ${rows} x ${cols}, blocked = ${blockedCells}`,
    `Approximate graph size: V=${vertexCount}, E~${estimatedEdges}`,
    `Neighbor model: ${allowDiagonal ? "8-direction" : "4-direction"}`,
    visitedCount === null
      ? "Observed visited nodes: pending"
      : `Observed visited nodes: ${visitedCount}`,
    found === null ? "Result: pending" : `Result: ${found ? `found at distance ${distance}` : "not found"}`,
  ];

  return {
    timeBest: "O(1)",
    timeAverage: "O(V + E)",
    timeWorst: "O(V + E)",
    space: "O(V)",
    current: "O(V + E) on this graph",
    details,
  };
}

function getDfsComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  let rows = 0;
  let cols = 0;
  let blockedCells = 0;
  let allowDiagonal = false;

  if (run && isRecord(run.input)) {
    if ("rows" in run.input && isFiniteNumber(run.input.rows)) {
      rows = run.input.rows;
    }
    if ("cols" in run.input && isFiniteNumber(run.input.cols)) {
      cols = run.input.cols;
    }
    if ("blockedCells" in run.input && Array.isArray(run.input.blockedCells)) {
      blockedCells = run.input.blockedCells.filter(isFiniteNumber).length;
    }
    if ("allowDiagonal" in run.input && typeof run.input.allowDiagonal === "boolean") {
      allowDiagonal = run.input.allowDiagonal;
    }
  }

  const vertexCount = Math.max(0, rows * cols - blockedCells);
  const edgeFactor = allowDiagonal ? 8 : 4;
  const estimatedEdges = Math.floor((vertexCount * edgeFactor) / 2);

  let visitedCount: number | null = null;
  let depth: number | null = null;
  let backtracks: number | null = null;
  let found: boolean | null = null;
  if (run && isRecord(run.result)) {
    if ("visitedCount" in run.result && isFiniteNumber(run.result.visitedCount)) {
      visitedCount = run.result.visitedCount;
    }
    if ("depth" in run.result && isFiniteNumber(run.result.depth)) {
      depth = run.result.depth;
    }
    if ("backtracks" in run.result && isFiniteNumber(run.result.backtracks)) {
      backtracks = run.result.backtracks;
    }
    if ("found" in run.result && typeof run.result.found === "boolean") {
      found = run.result.found;
    }
  }

  const details = [
    `Grid = ${rows} x ${cols}, blocked = ${blockedCells}`,
    `Approximate graph size: V=${vertexCount}, E~${estimatedEdges}`,
    `Neighbor model: ${allowDiagonal ? "8-direction" : "4-direction"}`,
    visitedCount === null ? "Observed visited nodes: pending" : `Observed visited nodes: ${visitedCount}`,
    backtracks === null ? "Observed backtracks: pending" : `Observed backtracks: ${backtracks}`,
    found === null
      ? "Result: pending"
      : `Result: ${found ? `found at depth ${depth}` : "not found (depth-first exhausted)"}`,
  ];

  return {
    timeBest: "O(1)",
    timeAverage: "O(V + E)",
    timeWorst: "O(V + E)",
    space: "O(V)",
    current: "O(V + E) on this graph",
    details,
  };
}

function getDijkstraComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  let rows = 0;
  let cols = 0;
  let blockedCells = 0;
  let allowDiagonal = false;

  if (run && isRecord(run.input)) {
    if ("rows" in run.input && isFiniteNumber(run.input.rows)) {
      rows = run.input.rows;
    }
    if ("cols" in run.input && isFiniteNumber(run.input.cols)) {
      cols = run.input.cols;
    }
    if ("blockedCells" in run.input && Array.isArray(run.input.blockedCells)) {
      blockedCells = run.input.blockedCells.filter(isFiniteNumber).length;
    }
    if ("allowDiagonal" in run.input && typeof run.input.allowDiagonal === "boolean") {
      allowDiagonal = run.input.allowDiagonal;
    }
  }

  const vertexCount = Math.max(0, rows * cols - blockedCells);
  const edgeFactor = allowDiagonal ? 8 : 4;
  const estimatedEdges = Math.floor((vertexCount * edgeFactor) / 2);

  let visitedCount: number | null = null;
  let distance: number | null = null;
  let relaxations: number | null = null;
  let found: boolean | null = null;
  if (run && isRecord(run.result)) {
    if ("visitedCount" in run.result && isFiniteNumber(run.result.visitedCount)) {
      visitedCount = run.result.visitedCount;
    }
    if ("distance" in run.result && isFiniteNumber(run.result.distance)) {
      distance = run.result.distance;
    }
    if ("relaxations" in run.result && isFiniteNumber(run.result.relaxations)) {
      relaxations = run.result.relaxations;
    }
    if ("found" in run.result && typeof run.result.found === "boolean") {
      found = run.result.found;
    }
  }

  const details = [
    `Grid = ${rows} x ${cols}, blocked = ${blockedCells}`,
    `Approximate graph size: V=${vertexCount}, E~${estimatedEdges}`,
    `Neighbor model: ${allowDiagonal ? "8-direction" : "4-direction"}`,
    `Current implementation uses deterministic min-scan frontier selection`,
    visitedCount === null ? "Observed visited nodes: pending" : `Observed visited nodes: ${visitedCount}`,
    relaxations === null ? "Observed relaxations: pending" : `Observed relaxations: ${relaxations}`,
    found === null ? "Result: pending" : `Result: ${found ? `found at distance ${distance}` : "not found"}`,
  ];

  return {
    timeBest: "O(V^2 + E)",
    timeAverage: "O(V^2 + E)",
    timeWorst: "O(V^2 + E)",
    space: "O(V)",
    current: "O(V^2 + E) on this graph",
    details,
  };
}

function getAStarComplexity(run: AlgorithmRunSnapshot | null): ComplexitySummary {
  let rows = 0;
  let cols = 0;
  let blockedCells = 0;
  let allowDiagonal = false;

  if (run && isRecord(run.input)) {
    if ("rows" in run.input && isFiniteNumber(run.input.rows)) {
      rows = run.input.rows;
    }
    if ("cols" in run.input && isFiniteNumber(run.input.cols)) {
      cols = run.input.cols;
    }
    if ("blockedCells" in run.input && Array.isArray(run.input.blockedCells)) {
      blockedCells = run.input.blockedCells.filter(isFiniteNumber).length;
    }
    if ("allowDiagonal" in run.input && typeof run.input.allowDiagonal === "boolean") {
      allowDiagonal = run.input.allowDiagonal;
    }
  }

  const vertexCount = Math.max(0, rows * cols - blockedCells);
  const edgeFactor = allowDiagonal ? 8 : 4;
  const estimatedEdges = Math.floor((vertexCount * edgeFactor) / 2);

  let expandedCount: number | null = null;
  let distance: number | null = null;
  let relaxations: number | null = null;
  let found: boolean | null = null;
  if (run && isRecord(run.result)) {
    if ("expandedCount" in run.result && isFiniteNumber(run.result.expandedCount)) {
      expandedCount = run.result.expandedCount;
    }
    if ("distance" in run.result && isFiniteNumber(run.result.distance)) {
      distance = run.result.distance;
    }
    if ("relaxations" in run.result && isFiniteNumber(run.result.relaxations)) {
      relaxations = run.result.relaxations;
    }
    if ("found" in run.result && typeof run.result.found === "boolean") {
      found = run.result.found;
    }
  }

  const details = [
    `Grid = ${rows} x ${cols}, blocked = ${blockedCells}`,
    `Approximate graph size: V=${vertexCount}, E~${estimatedEdges}`,
    `Neighbor model: ${allowDiagonal ? "8-direction" : "4-direction"}`,
    `Current implementation uses deterministic min-scan open-set selection`,
    expandedCount === null ? "Observed expanded cells: pending" : `Observed expanded cells: ${expandedCount}`,
    relaxations === null ? "Observed score updates: pending" : `Observed score updates: ${relaxations}`,
    found === null ? "Result: pending" : `Result: ${found ? `found at distance ${distance}` : "not found"}`,
  ];

  return {
    timeBest: "O(V^2 + E)",
    timeAverage: "O(V^2 + E)",
    timeWorst: "O(V^2 + E)",
    space: "O(V)",
    current: "O(V^2 + E) on this graph",
    details,
  };
}

export function getComplexitySummary(
  algorithmSlug: string,
  run: AlgorithmRunSnapshot | null,
): ComplexitySummary | null {
  if (algorithmSlug === "binary-search") {
    return getBinarySearchComplexity(run && run.algorithmSlug === "binary-search" ? run : null);
  }

  if (algorithmSlug === "bubble-sort") {
    return getBubbleSortComplexity(run && run.algorithmSlug === "bubble-sort" ? run : null);
  }

  if (algorithmSlug === "bfs") {
    return getBfsComplexity(run && run.algorithmSlug === "bfs" ? run : null);
  }

  if (algorithmSlug === "dfs") {
    return getDfsComplexity(run && run.algorithmSlug === "dfs" ? run : null);
  }

  if (algorithmSlug === "dijkstra") {
    return getDijkstraComplexity(run && run.algorithmSlug === "dijkstra" ? run : null);
  }

  if (algorithmSlug === "a-star") {
    return getAStarComplexity(run && run.algorithmSlug === "a-star" ? run : null);
  }

  if (algorithmSlug === "selection-sort") {
    return getSelectionSortComplexity(run && run.algorithmSlug === "selection-sort" ? run : null);
  }

  if (algorithmSlug === "quick-sort") {
    return getQuickSortComplexity(run && run.algorithmSlug === "quick-sort" ? run : null);
  }

  if (algorithmSlug === "heap-sort") {
    return getHeapSortComplexity(run && run.algorithmSlug === "heap-sort" ? run : null);
  }

  if (algorithmSlug === "topological-sort") {
    return getTopologicalSortComplexity(run && run.algorithmSlug === "topological-sort" ? run : null);
  }

  if (algorithmSlug === "union-find") {
    return getUnionFindComplexity(run && run.algorithmSlug === "union-find" ? run : null);
  }

  if (algorithmSlug === "kruskal-mst") {
    return getKruskalMstComplexity(run && run.algorithmSlug === "kruskal-mst" ? run : null);
  }

  if (algorithmSlug === "insertion-sort") {
    return getInsertionSortComplexity(run && run.algorithmSlug === "insertion-sort" ? run : null);
  }

  if (algorithmSlug === "merge-sort") {
    return getMergeSortComplexity(run && run.algorithmSlug === "merge-sort" ? run : null);
  }

  if (algorithmSlug === "invert-binary-tree") {
    return getInvertBinaryTreeComplexity(run && run.algorithmSlug === "invert-binary-tree" ? run : null);
  }

  return null;
}

export function getCompactCurrentComplexity(
  algorithmSlug: string,
  run: AlgorithmRunSnapshot | null,
): string | null {
  const summary = getComplexitySummary(algorithmSlug, run);

  if (!summary) {
    return null;
  }

  const currentMatch = summary.current.match(/O\([^)]+\)/);
  if (currentMatch) {
    return currentMatch[0];
  }

  for (const detail of summary.details) {
    const detailMatch = detail.match(/O\([^)]+\)/);
    if (detailMatch) {
      return detailMatch[0];
    }
  }

  return summary.timeAverage || null;
}


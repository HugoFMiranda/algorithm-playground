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

import { useMemo } from "react";
import { ArrowUpDownIcon, Grid2x2Icon, MonitorPlayIcon, SearchIcon } from "lucide-react";

import type { BinarySearchResult, BinarySearchInput } from "@/algorithms/binary-search/spec";
import type { BinarySearchStepEvent } from "@/algorithms/binary-search/engine";
import type { BfsInput, BfsResult } from "@/algorithms/bfs/spec";
import type { BfsStepEvent } from "@/algorithms/bfs/engine";
import type { BubbleSortInput, BubbleSortResult } from "@/algorithms/bubble-sort/spec";
import type { BubbleSortStepEvent } from "@/algorithms/bubble-sort/engine";
import type { DfsInput, DfsResult } from "@/algorithms/dfs/spec";
import type { DfsStepEvent } from "@/algorithms/dfs/engine";
import type { InsertionSortInput, InsertionSortResult } from "@/algorithms/insertion-sort/spec";
import type { InsertionSortStepEvent } from "@/algorithms/insertion-sort/engine";
import type { MergeSortInput, MergeSortResult } from "@/algorithms/merge-sort/spec";
import type { MergeSortStepEvent } from "@/algorithms/merge-sort/engine";
import type { SelectionSortInput, SelectionSortResult } from "@/algorithms/selection-sort/spec";
import type { SelectionSortStepEvent } from "@/algorithms/selection-sort/engine";
import type { AlgorithmDefinition } from "@/data/algorithms";
import { getCompactCurrentComplexity } from "@/lib/complexity";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VisualizerPanelProps {
  algorithm: AlgorithmDefinition;
}

interface AlgorithmRunSnapshot {
  algorithmSlug: string;
  input: unknown;
  normalizedParams: Record<string, string | number | boolean>;
  steps: unknown[];
  result: unknown;
}

interface SharedVisualizerProps {
  run: AlgorithmRunSnapshot | null;
  cursor: number;
}

export function VisualizerPanel({ algorithm }: VisualizerPanelProps) {
  const run = useAppStore((state) => state.run);
  const cursor = useAppStore((state) => state.playback.cursor);

  if (algorithm.slug === "binary-search") {
    return <BinarySearchVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "bubble-sort") {
    return <BubbleSortVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "bfs") {
    return <BfsVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "dfs") {
    return <DfsVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "selection-sort") {
    return <SelectionSortVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "insertion-sort") {
    return <InsertionSortVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "merge-sort") {
    return <MergeSortVisualizer run={run} cursor={cursor} />;
  }

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <Badge variant="outline" className="rounded-full border-border/70">
            Placeholder
          </Badge>
        </div>
        <CardDescription>
          Rendering surface for <span className="font-medium">{algorithm.name}</span>. Canvas and step
          playback integration will land in later phases.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-1">
        <div className="bg-muted/35 text-muted-foreground flex w-full flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center">
          <MonitorPlayIcon className="mb-3 size-8" />
          <p className="text-sm font-medium">Visualizer Surface Reserved</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed">
            This area will host renderer output fed by algorithm step streams and playback state.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-[11px]">
            <Grid2x2Icon className="size-3.5" />
            Grid and chart renderers planned
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BinarySearchVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("binary-search", run);
  const typedRun =
    run && run.algorithmSlug === "binary-search"
      ? {
          ...run,
          input: run.input as BinarySearchInput,
          result: run.result as BinarySearchResult,
          steps: run.steps as BinarySearchStepEvent[],
        }
      : null;

  const values = typedRun?.input.values ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = deriveBinarySearchFrame(activeStep, values.length);
  const stepLabel = activeStep ? formatBinarySearchStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep
    ? formatBinarySearchStepMessage(activeStep)
    : "Press Play or Step to start execution.";

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            {compactComplexity ? (
              <Badge variant="outline" className="rounded-full border-border/70">
                {compactComplexity}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full border-border/70">
              Binary Search
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic search playback with active bounds, midpoint, and completion state.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Target</p>
            <p className="font-mono text-base">{typedRun?.normalizedParams.target ?? "n/a"}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Low / High</p>
            <p className="font-mono text-base">
              {frame.low} / {frame.high}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Mid</p>
            <p className="font-mono text-base">{frame.mid ?? "n/a"}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">
              {typedRun?.result.found
                ? `Found @ ${typedRun.result.index}`
                : typedRun && cursor >= typedRun.steps.length - 1
                  ? "Not Found"
                  : "Searching"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full border-border/70">
              {stepLabel}
            </Badge>
            <p className="text-muted-foreground">{stepMessage}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {values.map((value, index) => {
              const isMid = frame.mid === index;
              const isFound = frame.foundIndex === index;
              const inActiveRange = index >= frame.low && index <= frame.high;
              const isOutOfRange = frame.high < frame.low || !inActiveRange;

              return (
                <div
                  key={`${value}-${index}`}
                  className={cn(
                    "rounded-lg border p-2",
                    isOutOfRange && "border-border/60 bg-muted/30 text-muted-foreground",
                    inActiveRange && "border-sky-300/50 bg-sky-500/10",
                    isMid && "border-amber-300/60 bg-amber-500/20",
                    isFound && "border-emerald-300/60 bg-emerald-500/20",
                  )}
                >
                  <p className="text-muted-foreground text-[10px]">index {index}</p>
                  <p className="font-mono text-sm">{value}</p>
                </div>
              );
            })}
          </div>
          {values.length === 0 ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <SearchIcon className="size-3.5" />
              No values available for visualization.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface BfsFrame {
  visited: Set<number>;
  queued: Set<number>;
  blocked: Set<number>;
  path: Set<number>;
  current: number | null;
  inspected: number | null;
  inspectStatus: "blocked" | "visited" | "enqueue" | null;
  depth: number | null;
  found: boolean;
  completed: boolean;
}

function toGridLabel(cell: number, cols: number): string {
  const row = Math.floor(cell / cols);
  const col = cell % cols;
  return `r${row} c${col}`;
}

function BfsVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("bfs", run);
  const typedRun =
    run && run.algorithmSlug === "bfs"
      ? {
          ...run,
          input: run.input as BfsInput,
          result: run.result as BfsResult,
          steps: run.steps as BfsStepEvent[],
        }
      : null;

  const steps = typedRun?.steps ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveBfsFrame(typedRun, cursor), [typedRun, cursor]);
  const stepLabel = activeStep ? formatBfsStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep ? formatBfsStepMessage(activeStep) : "Press Play or Step to start execution.";
  const totalCells = typedRun ? typedRun.input.rows * typedRun.input.cols : 0;

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            {compactComplexity ? (
              <Badge variant="outline" className="rounded-full border-border/70">
                {compactComplexity}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full border-border/70">
              BFS
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic frontier expansion on a grid with visit, queue, and neighbor-inspection playback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Grid</p>
            <p className="font-mono text-base">
              {typedRun ? `${typedRun.input.rows} x ${typedRun.input.cols}` : "n/a"}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Visited</p>
            <p className="font-mono text-base">{typedRun?.result.visitedCount ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Distance</p>
            <p className="font-mono text-base">
              {typedRun?.result.found ? typedRun.result.distance : typedRun ? "n/a" : "n/a"}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">
              {typedRun?.result.found ? "Path Found" : typedRun && frame.completed ? "Not Found" : "Searching"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full border-border/70">
              {stepLabel}
            </Badge>
            <p className="text-muted-foreground">{stepMessage}</p>
          </div>
          {typedRun ? (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${typedRun.input.cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: totalCells }, (_, cell) => {
                const isStart = cell === typedRun.input.startCell;
                const isTarget = cell === typedRun.input.targetCell;
                const isBlocked = frame.blocked.has(cell);
                const isVisited = frame.visited.has(cell);
                const isQueued = frame.queued.has(cell);
                const isPath = frame.path.has(cell);
                const isCurrent = frame.current === cell;
                const isInspected = frame.inspected === cell;

                return (
                  <div
                    key={cell}
                    className={cn(
                      "rounded-lg border p-2",
                      isBlocked && "border-zinc-500/70 bg-zinc-500/25 text-zinc-100",
                      isVisited && "border-sky-300/60 bg-sky-500/12",
                      isQueued && "border-cyan-300/60 bg-cyan-500/12",
                      isPath && "border-emerald-300/70 bg-emerald-500/20",
                      isCurrent && "border-amber-300/70 bg-amber-500/20",
                      isInspected && frame.inspectStatus === "blocked" && "border-red-300/70 bg-red-500/18",
                      isInspected && frame.inspectStatus === "enqueue" && "border-violet-300/70 bg-violet-500/20",
                      isStart && "ring-1 ring-blue-300/70",
                      isTarget && "ring-1 ring-rose-300/70",
                    )}
                  >
                    <p className="text-muted-foreground text-[10px]">{toGridLabel(cell, typedRun.input.cols)}</p>
                    <p className="font-mono text-xs">
                      {isStart ? "S" : isTarget ? "T" : isBlocked ? "#" : cell}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
          {!typedRun ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <SearchIcon className="size-3.5" />
              No BFS run available for visualization.
            </div>
          ) : null}
        </div>

        <div className="text-muted-foreground text-xs">
          Legend: <span className="font-medium">S/T</span> start/target, <span className="font-medium">#</span>{" "}
          blocked, queued (cyan), visited (blue), current (amber), path (green).
        </div>
      </CardContent>
    </Card>
  );
}

function deriveBfsFrame(
  run: {
    input: BfsInput;
    result: BfsResult;
    steps: BfsStepEvent[];
  } | null,
  cursor: number,
): BfsFrame {
  const frame: BfsFrame = {
    visited: new Set<number>(),
    queued: new Set<number>(),
    blocked: new Set<number>(run?.input.blockedCells ?? []),
    path: new Set<number>(),
    current: null,
    inspected: null,
    inspectStatus: null,
    depth: null,
    found: false,
    completed: false,
  };

  if (!run || cursor < 0 || run.steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, run.steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = run.steps[index];

    if (step.type === "enqueue") {
      frame.queued.add(step.payload.cell);
      frame.inspected = null;
      frame.inspectStatus = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "visit") {
      frame.current = step.payload.cell;
      frame.queued.delete(step.payload.cell);
      frame.visited.add(step.payload.cell);
      frame.inspected = null;
      frame.inspectStatus = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "inspect-neighbor") {
      frame.inspected = step.payload.to;
      frame.inspectStatus = step.payload.status;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "frontier-layer-complete") {
      frame.current = null;
      frame.inspected = null;
      frame.inspectStatus = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "found") {
      frame.found = true;
      frame.completed = true;
      frame.current = step.payload.cell;
      frame.path = new Set<number>(run.result.pathCells);
      frame.depth = step.payload.depth;
      continue;
    }

    frame.completed = true;
    frame.found = false;
    frame.current = null;
    frame.inspected = null;
    frame.inspectStatus = null;
    frame.depth = null;
  }

  return frame;
}

function formatBfsStepLabel(step: BfsStepEvent): string {
  if (step.type === "enqueue") {
    return "Enqueue";
  }

  if (step.type === "visit") {
    return "Visit";
  }

  if (step.type === "inspect-neighbor") {
    return "Inspect Neighbor";
  }

  if (step.type === "frontier-layer-complete") {
    return "Layer Complete";
  }

  if (step.type === "found") {
    return "Target Found";
  }

  return "No Path";
}

function formatBfsStepMessage(step: BfsStepEvent): string {
  if (step.type === "enqueue") {
    return `Queue cell ${step.payload.cell} at depth ${step.payload.depth}. Queue size is now ${step.payload.queueSize}.`;
  }

  if (step.type === "visit") {
    return `Visit cell ${step.payload.cell} at depth ${step.payload.depth}.`;
  }

  if (step.type === "inspect-neighbor") {
    if (step.payload.status === "blocked") {
      return `Neighbor ${step.payload.to} from ${step.payload.from} is blocked.`;
    }

    if (step.payload.status === "visited") {
      return `Neighbor ${step.payload.to} from ${step.payload.from} is already discovered.`;
    }

    return `Neighbor ${step.payload.to} from ${step.payload.from} is discoverable and queued.`;
  }

  if (step.type === "frontier-layer-complete") {
    return `Depth ${step.payload.depth} complete: visited ${step.payload.visitedCount}, queue has ${step.payload.queueSize}.`;
  }

  if (step.type === "found") {
    return `Target reached at depth ${step.payload.depth} with path length ${step.payload.pathLength}.`;
  }

  return `Search exhausted after ${step.payload.layers} layer(s), visited ${step.payload.visitedCount} cells.`;
}

interface DfsFrame {
  visited: Set<number>;
  stacked: Set<number>;
  blocked: Set<number>;
  path: Set<number>;
  current: number | null;
  inspected: number | null;
  inspectStatus: "blocked" | "visited" | "push" | null;
  depth: number | null;
  found: boolean;
  completed: boolean;
}

function DfsVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("dfs", run);
  const typedRun =
    run && run.algorithmSlug === "dfs"
      ? {
          ...run,
          input: run.input as DfsInput,
          result: run.result as DfsResult,
          steps: run.steps as DfsStepEvent[],
        }
      : null;

  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveDfsFrame(typedRun, cursor), [typedRun, cursor]);
  const stepLabel = activeStep ? formatDfsStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep ? formatDfsStepMessage(activeStep) : "Press Play or Step to start execution.";
  const totalCells = typedRun ? typedRun.input.rows * typedRun.input.cols : 0;

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            {compactComplexity ? (
              <Badge variant="outline" className="rounded-full border-border/70">
                {compactComplexity}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full border-border/70">
              DFS
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic depth-first traversal on a grid with stack pushes, visits, neighbor checks, and
          backtracking.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Grid</p>
            <p className="font-mono text-base">
              {typedRun ? `${typedRun.input.rows} x ${typedRun.input.cols}` : "n/a"}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Visited</p>
            <p className="font-mono text-base">{typedRun?.result.visitedCount ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Depth</p>
            <p className="font-mono text-base">
              {typedRun?.result.found ? typedRun.result.depth : typedRun ? "n/a" : "n/a"}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">
              {typedRun?.result.found ? "Path Found" : typedRun && frame.completed ? "Not Found" : "Searching"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full border-border/70">
              {stepLabel}
            </Badge>
            <p className="text-muted-foreground">{stepMessage}</p>
          </div>
          {typedRun ? (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${typedRun.input.cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: totalCells }, (_, cell) => {
                const isStart = cell === typedRun.input.startCell;
                const isTarget = cell === typedRun.input.targetCell;
                const isBlocked = frame.blocked.has(cell);
                const isVisited = frame.visited.has(cell);
                const isStacked = frame.stacked.has(cell);
                const isPath = frame.path.has(cell);
                const isCurrent = frame.current === cell;
                const isInspected = frame.inspected === cell;

                return (
                  <div
                    key={cell}
                    className={cn(
                      "rounded-lg border p-2",
                      isBlocked && "border-zinc-500/70 bg-zinc-500/25 text-zinc-100",
                      isVisited && "border-sky-300/60 bg-sky-500/12",
                      isStacked && "border-cyan-300/60 bg-cyan-500/12",
                      isPath && "border-emerald-300/70 bg-emerald-500/20",
                      isCurrent && "border-amber-300/70 bg-amber-500/20",
                      isInspected && frame.inspectStatus === "blocked" && "border-red-300/70 bg-red-500/18",
                      isInspected && frame.inspectStatus === "push" && "border-violet-300/70 bg-violet-500/20",
                      isInspected && frame.inspectStatus === "visited" && "border-orange-300/70 bg-orange-500/20",
                      isStart && "ring-1 ring-blue-300/70",
                      isTarget && "ring-1 ring-rose-300/70",
                    )}
                  >
                    <p className="text-muted-foreground text-[10px]">{toGridLabel(cell, typedRun.input.cols)}</p>
                    <p className="font-mono text-xs">
                      {isStart ? "S" : isTarget ? "T" : isBlocked ? "#" : cell}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
          {!typedRun ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <SearchIcon className="size-3.5" />
              No DFS run available for visualization.
            </div>
          ) : null}
        </div>

        <div className="text-muted-foreground text-xs">
          Legend: <span className="font-medium">S/T</span> start/target, <span className="font-medium">#</span>{" "}
          blocked, stack (cyan), visited (blue), current (amber), path (green), inspect (red/orange/violet).
        </div>
      </CardContent>
    </Card>
  );
}

function deriveDfsFrame(
  run: {
    input: DfsInput;
    result: DfsResult;
    steps: DfsStepEvent[];
  } | null,
  cursor: number,
): DfsFrame {
  const frame: DfsFrame = {
    visited: new Set<number>(),
    stacked: new Set<number>(),
    blocked: new Set<number>(run?.input.blockedCells ?? []),
    path: new Set<number>(),
    current: null,
    inspected: null,
    inspectStatus: null,
    depth: null,
    found: false,
    completed: false,
  };

  if (!run || cursor < 0 || run.steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, run.steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = run.steps[index];

    if (step.type === "push-stack") {
      frame.stacked.add(step.payload.cell);
      frame.inspected = null;
      frame.inspectStatus = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "visit") {
      frame.current = step.payload.cell;
      frame.visited.add(step.payload.cell);
      frame.inspected = null;
      frame.inspectStatus = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "inspect-neighbor") {
      frame.inspected = step.payload.to;
      frame.inspectStatus = step.payload.status;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "backtrack") {
      frame.stacked.delete(step.payload.from);
      frame.current = step.payload.to >= 0 ? step.payload.to : null;
      frame.inspected = null;
      frame.inspectStatus = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "found") {
      frame.found = true;
      frame.completed = true;
      frame.current = step.payload.cell;
      frame.path = new Set<number>(run.result.pathCells);
      frame.depth = step.payload.depth;
      continue;
    }

    frame.completed = true;
    frame.found = false;
    frame.current = null;
    frame.inspected = null;
    frame.inspectStatus = null;
    frame.depth = null;
  }

  return frame;
}

function formatDfsStepLabel(step: DfsStepEvent): string {
  if (step.type === "push-stack") {
    return "Push Stack";
  }

  if (step.type === "visit") {
    return "Visit";
  }

  if (step.type === "inspect-neighbor") {
    return "Inspect Neighbor";
  }

  if (step.type === "backtrack") {
    return "Backtrack";
  }

  if (step.type === "found") {
    return "Target Found";
  }

  return "No Path";
}

function formatDfsStepMessage(step: DfsStepEvent): string {
  if (step.type === "push-stack") {
    return `Push cell ${step.payload.cell} at depth ${step.payload.depth}. Stack size is now ${step.payload.stackSize}.`;
  }

  if (step.type === "visit") {
    return `Visit cell ${step.payload.cell} at depth ${step.payload.depth}.`;
  }

  if (step.type === "inspect-neighbor") {
    if (step.payload.status === "blocked") {
      return `Neighbor ${step.payload.to} from ${step.payload.from} is blocked.`;
    }

    if (step.payload.status === "visited") {
      return `Neighbor ${step.payload.to} from ${step.payload.from} has already been discovered.`;
    }

    return `Neighbor ${step.payload.to} from ${step.payload.from} is pushed onto the stack.`;
  }

  if (step.type === "backtrack") {
    return step.payload.to >= 0
      ? `Backtrack from ${step.payload.from} to ${step.payload.to}.`
      : `Backtrack from ${step.payload.from}; stack is now empty.`;
  }

  if (step.type === "found") {
    return `Target reached at depth ${step.payload.depth} with path length ${step.payload.pathLength}.`;
  }

  return `Search exhausted after ${step.payload.backtracks} backtrack(s), visited ${step.payload.visitedCount} cells.`;
}

interface BubbleSortFrame {
  values: number[];
  comparedPair: [number, number] | null;
  swappedPair: [number, number] | null;
  sortedStart: number;
  completed: boolean;
  pass: number | null;
}

function BubbleSortVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("bubble-sort", run);
  const typedRun =
    run && run.algorithmSlug === "bubble-sort"
      ? {
          ...run,
          input: run.input as BubbleSortInput,
          result: run.result as BubbleSortResult,
          steps: run.steps as BubbleSortStepEvent[],
        }
      : null;

  const values = typedRun?.input.values ?? [];
  const steps = typedRun?.steps ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveBubbleSortFrame(values, steps, cursor), [values, steps, cursor]);
  const stepLabel = activeStep ? formatBubbleSortStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep
    ? formatBubbleSortStepMessage(activeStep)
    : "Press Play or Step to start execution.";

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            {compactComplexity ? (
              <Badge variant="outline" className="rounded-full border-border/70">
                {compactComplexity}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full border-border/70">
              Bubble Sort
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic adjacent comparison and swap playback with pass-by-pass sorted region tracking.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Pass</p>
            <p className="font-mono text-base">{frame.pass === null ? "n/a" : frame.pass + 1}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Comparisons</p>
            <p className="font-mono text-base">{typedRun?.result.comparisons ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Swaps</p>
            <p className="font-mono text-base">{typedRun?.result.swaps ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">{frame.completed ? "Sorted" : "Sorting"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full border-border/70">
              {stepLabel}
            </Badge>
            <p className="text-muted-foreground">{stepMessage}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {frame.values.map((value, index) => {
              const isCompared =
                frame.comparedPair !== null &&
                (index === frame.comparedPair[0] || index === frame.comparedPair[1]);
              const isSwapped =
                frame.swappedPair !== null &&
                (index === frame.swappedPair[0] || index === frame.swappedPair[1]);
              const isSorted = frame.completed || index >= frame.sortedStart;

              return (
                <div
                  key={`${value}-${index}`}
                  className={cn(
                    "rounded-lg border p-2",
                    isSorted && "border-emerald-300/60 bg-emerald-500/15",
                    isCompared && "border-sky-300/60 bg-sky-500/15",
                    isSwapped && "border-amber-300/60 bg-amber-500/20",
                  )}
                >
                  <p className="text-muted-foreground text-[10px]">index {index}</p>
                  <p className="font-mono text-sm">{value}</p>
                </div>
              );
            })}
          </div>
          {frame.values.length === 0 ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <ArrowUpDownIcon className="size-3.5" />
              No values available for visualization.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function deriveBubbleSortFrame(
  initialValues: number[],
  steps: BubbleSortStepEvent[],
  cursor: number,
): BubbleSortFrame {
  const frame: BubbleSortFrame = {
    values: [...initialValues],
    comparedPair: null,
    swappedPair: null,
    sortedStart: initialValues.length,
    completed: false,
    pass: null,
  };

  if (cursor < 0 || steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = steps[index];

    if (step.type === "compare") {
      frame.comparedPair = [step.payload.leftIndex, step.payload.rightIndex];
      frame.swappedPair = null;
      frame.sortedStart = step.payload.sortedStart;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "swap") {
      const leftValue = frame.values[step.payload.leftIndex];
      frame.values[step.payload.leftIndex] = frame.values[step.payload.rightIndex];
      frame.values[step.payload.rightIndex] = leftValue;

      frame.comparedPair = [step.payload.leftIndex, step.payload.rightIndex];
      frame.swappedPair = [step.payload.leftIndex, step.payload.rightIndex];
      frame.sortedStart = step.payload.sortedStart;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "pass-complete") {
      frame.comparedPair = null;
      frame.swappedPair = null;
      frame.sortedStart = step.payload.sortedStart;
      frame.pass = step.payload.pass;
      continue;
    }

    frame.comparedPair = null;
    frame.swappedPair = null;
    frame.sortedStart = 0;
    frame.completed = step.payload.isSorted;
    frame.pass = null;
  }

  return frame;
}

function formatBubbleSortStepLabel(step: BubbleSortStepEvent): string {
  if (step.type === "compare") {
    return "Compare";
  }

  if (step.type === "swap") {
    return "Swap";
  }

  if (step.type === "pass-complete") {
    return "Pass Complete";
  }

  return "Sorted";
}

function formatBubbleSortStepMessage(step: BubbleSortStepEvent): string {
  if (step.type === "compare") {
    return `Pass ${step.payload.pass + 1}: compare index ${step.payload.leftIndex} (${step.payload.leftValue}) and ${step.payload.rightIndex} (${step.payload.rightValue}).`;
  }

  if (step.type === "swap") {
    return `Swap index ${step.payload.leftIndex} and ${step.payload.rightIndex} to maintain ascending order.`;
  }

  if (step.type === "pass-complete") {
    return `Pass ${step.payload.pass + 1} complete: ${step.payload.comparisons} comparisons, ${step.payload.swaps} swaps.`;
  }

  return `Completed in ${step.payload.passes} passes with ${step.payload.comparisons} comparisons.`;
}

interface SelectionSortFrame {
  values: number[];
  candidateIndex: number | null;
  comparedIndex: number | null;
  swappedPair: [number, number] | null;
  sortedPrefixEnd: number;
  completed: boolean;
  pass: number | null;
}

function SelectionSortVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("selection-sort", run);
  const typedRun =
    run && run.algorithmSlug === "selection-sort"
      ? {
          ...run,
          input: run.input as SelectionSortInput,
          result: run.result as SelectionSortResult,
          steps: run.steps as SelectionSortStepEvent[],
        }
      : null;

  const values = typedRun?.input.values ?? [];
  const steps = typedRun?.steps ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveSelectionSortFrame(values, steps, cursor), [values, steps, cursor]);
  const stepLabel = activeStep ? formatSelectionSortStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep
    ? formatSelectionSortStepMessage(activeStep)
    : "Press Play or Step to start execution.";

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            {compactComplexity ? (
              <Badge variant="outline" className="rounded-full border-border/70">
                {compactComplexity}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full border-border/70">
              Selection Sort
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic minimum-candidate tracking across the unsorted suffix with a single swap per pass.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Pass</p>
            <p className="font-mono text-base">{frame.pass === null ? "n/a" : frame.pass + 1}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Comparisons</p>
            <p className="font-mono text-base">{typedRun?.result.comparisons ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Swaps</p>
            <p className="font-mono text-base">{typedRun?.result.swaps ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">{frame.completed ? "Sorted" : "Sorting"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full border-border/70">
              {stepLabel}
            </Badge>
            <p className="text-muted-foreground">{stepMessage}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {frame.values.map((value, index) => {
              const isCandidate = frame.candidateIndex === index;
              const isCompared = frame.comparedIndex === index;
              const isSwapped =
                frame.swappedPair !== null &&
                (index === frame.swappedPair[0] || index === frame.swappedPair[1]);
              const isSorted = frame.completed || index < frame.sortedPrefixEnd;

              return (
                <div
                  key={`${value}-${index}`}
                  className={cn(
                    "rounded-lg border p-2",
                    isSorted && "border-emerald-300/60 bg-emerald-500/15",
                    isCompared && "border-sky-300/60 bg-sky-500/15",
                    isCandidate && "border-cyan-300/60 bg-cyan-500/15",
                    isSwapped && "border-amber-300/60 bg-amber-500/20",
                  )}
                >
                  <p className="text-muted-foreground text-[10px]">index {index}</p>
                  <p className="font-mono text-sm">{value}</p>
                </div>
              );
            })}
          </div>
          {frame.values.length === 0 ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <ArrowUpDownIcon className="size-3.5" />
              No values available for visualization.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function deriveSelectionSortFrame(
  initialValues: number[],
  steps: SelectionSortStepEvent[],
  cursor: number,
): SelectionSortFrame {
  const frame: SelectionSortFrame = {
    values: [...initialValues],
    candidateIndex: null,
    comparedIndex: null,
    swappedPair: null,
    sortedPrefixEnd: 0,
    completed: false,
    pass: null,
  };

  if (cursor < 0 || steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = steps[index];

    if (step.type === "candidate-min") {
      frame.candidateIndex = step.payload.minIndex;
      frame.comparedIndex = null;
      frame.swappedPair = null;
      frame.sortedPrefixEnd = step.payload.sortedEnd;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "compare") {
      frame.candidateIndex = step.payload.candidateIndex;
      frame.comparedIndex = step.payload.comparedIndex;
      frame.swappedPair = null;
      frame.sortedPrefixEnd = step.payload.sortedEnd;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "swap") {
      const leftValue = frame.values[step.payload.leftIndex];
      frame.values[step.payload.leftIndex] = frame.values[step.payload.rightIndex];
      frame.values[step.payload.rightIndex] = leftValue;

      frame.candidateIndex = step.payload.leftIndex;
      frame.comparedIndex = step.payload.rightIndex;
      frame.swappedPair = [step.payload.leftIndex, step.payload.rightIndex];
      frame.sortedPrefixEnd = step.payload.sortedEnd;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "pass-complete") {
      frame.candidateIndex = null;
      frame.comparedIndex = null;
      frame.swappedPair = null;
      frame.sortedPrefixEnd = step.payload.sortedEnd + 1;
      frame.pass = step.payload.pass;
      continue;
    }

    frame.candidateIndex = null;
    frame.comparedIndex = null;
    frame.swappedPair = null;
    frame.sortedPrefixEnd = frame.values.length;
    frame.completed = step.payload.isSorted;
    frame.pass = null;
  }

  return frame;
}

function formatSelectionSortStepLabel(step: SelectionSortStepEvent): string {
  if (step.type === "candidate-min") {
    return step.payload.reason === "initialize" ? "Init Candidate" : "New Minimum";
  }

  if (step.type === "compare") {
    return "Compare";
  }

  if (step.type === "swap") {
    return step.payload.selfSwap ? "Self Swap" : "Swap";
  }

  if (step.type === "pass-complete") {
    return "Pass Complete";
  }

  return "Sorted";
}

function formatSelectionSortStepMessage(step: SelectionSortStepEvent): string {
  if (step.type === "candidate-min") {
    return step.payload.reason === "initialize"
      ? `Pass ${step.payload.pass + 1}: initialize minimum at index ${step.payload.minIndex}.`
      : `Pass ${step.payload.pass + 1}: update minimum to index ${step.payload.minIndex} (${step.payload.minValue}).`;
  }

  if (step.type === "compare") {
    return `Compare candidate index ${step.payload.candidateIndex} (${step.payload.candidateValue}) with index ${step.payload.comparedIndex} (${step.payload.comparedValue}).`;
  }

  if (step.type === "swap") {
    return step.payload.selfSwap
      ? `Pass ${step.payload.pass + 1}: forced self-swap at index ${step.payload.leftIndex}.`
      : `Swap index ${step.payload.leftIndex} with minimum index ${step.payload.rightIndex}.`;
  }

  if (step.type === "pass-complete") {
    return `Pass ${step.payload.pass + 1} complete: ${step.payload.comparisons} comparisons, sorted prefix extends to index ${step.payload.sortedEnd}.`;
  }

  return `Completed in ${step.payload.passes} passes with ${step.payload.comparisons} comparisons.`;
}

interface InsertionSortFrame {
  values: number[];
  sortedPrefixEnd: number;
  keyIndex: number | null;
  keyValue: number | null;
  compareIndex: number | null;
  shiftPair: [number, number] | null;
  insertIndex: number | null;
  completed: boolean;
  pass: number | null;
}

function InsertionSortVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("insertion-sort", run);
  const typedRun =
    run && run.algorithmSlug === "insertion-sort"
      ? {
          ...run,
          input: run.input as InsertionSortInput,
          result: run.result as InsertionSortResult,
          steps: run.steps as InsertionSortStepEvent[],
        }
      : null;

  const values = typedRun?.input.values ?? [];
  const steps = typedRun?.steps ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveInsertionSortFrame(values, steps, cursor), [values, steps, cursor]);
  const stepLabel = activeStep ? formatInsertionSortStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep
    ? formatInsertionSortStepMessage(activeStep)
    : "Press Play or Step to start execution.";

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            {compactComplexity ? (
              <Badge variant="outline" className="rounded-full border-border/70">
                {compactComplexity}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full border-border/70">
              Insertion Sort
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic key selection, right-shift operations, and insertion index placement per pass.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Pass</p>
            <p className="font-mono text-base">{frame.pass === null ? "n/a" : frame.pass}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Comparisons</p>
            <p className="font-mono text-base">{typedRun?.result.comparisons ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Shifts</p>
            <p className="font-mono text-base">{typedRun?.result.shifts ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">{frame.completed ? "Sorted" : "Sorting"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full border-border/70">
              {stepLabel}
            </Badge>
            <p className="text-muted-foreground">{stepMessage}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {frame.values.map((value, index) => {
              const isSorted = frame.completed || index < frame.sortedPrefixEnd;
              const isKey = frame.keyIndex === index;
              const isCompared = frame.compareIndex === index;
              const isShifted =
                frame.shiftPair !== null &&
                (index === frame.shiftPair[0] || index === frame.shiftPair[1]);
              const isInserted = frame.insertIndex === index;

              return (
                <div
                  key={`${value}-${index}`}
                  className={cn(
                    "rounded-lg border p-2",
                    isSorted && "border-emerald-300/60 bg-emerald-500/15",
                    isCompared && "border-sky-300/60 bg-sky-500/15",
                    isKey && "border-cyan-300/60 bg-cyan-500/15",
                    isShifted && "border-amber-300/60 bg-amber-500/20",
                    isInserted && "border-indigo-300/60 bg-indigo-500/20",
                  )}
                >
                  <p className="text-muted-foreground text-[10px]">index {index}</p>
                  <p className="font-mono text-sm">{value}</p>
                </div>
              );
            })}
          </div>
          {frame.values.length === 0 ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <ArrowUpDownIcon className="size-3.5" />
              No values available for visualization.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function deriveInsertionSortFrame(
  initialValues: number[],
  steps: InsertionSortStepEvent[],
  cursor: number,
): InsertionSortFrame {
  const frame: InsertionSortFrame = {
    values: [...initialValues],
    sortedPrefixEnd: initialValues.length > 0 ? 1 : 0,
    keyIndex: null,
    keyValue: null,
    compareIndex: null,
    shiftPair: null,
    insertIndex: null,
    completed: false,
    pass: null,
  };

  if (cursor < 0 || steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = steps[index];

    if (step.type === "select-key") {
      frame.sortedPrefixEnd = step.payload.sortedEnd + 1;
      frame.keyIndex = step.payload.keyIndex;
      frame.keyValue = step.payload.keyValue;
      frame.compareIndex = null;
      frame.shiftPair = null;
      frame.insertIndex = null;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "compare") {
      frame.compareIndex = step.payload.compareIndex;
      frame.shiftPair = null;
      frame.insertIndex = null;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "shift-right") {
      frame.values[step.payload.toIndex] = frame.values[step.payload.fromIndex];
      frame.keyIndex = null;
      frame.compareIndex = step.payload.fromIndex;
      frame.shiftPair = [step.payload.fromIndex, step.payload.toIndex];
      frame.insertIndex = null;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "insert") {
      frame.values[step.payload.toIndex] = step.payload.keyValue;
      frame.keyIndex = step.payload.toIndex;
      frame.compareIndex = null;
      frame.shiftPair = null;
      frame.insertIndex = step.payload.toIndex;
      frame.pass = step.payload.pass;
      continue;
    }

    if (step.type === "pass-complete") {
      frame.sortedPrefixEnd = step.payload.pass + 1;
      frame.keyIndex = null;
      frame.keyValue = null;
      frame.compareIndex = null;
      frame.shiftPair = null;
      frame.insertIndex = null;
      frame.pass = step.payload.pass;
      continue;
    }

    frame.sortedPrefixEnd = frame.values.length;
    frame.keyIndex = null;
    frame.keyValue = null;
    frame.compareIndex = null;
    frame.shiftPair = null;
    frame.insertIndex = null;
    frame.completed = step.payload.isSorted;
    frame.pass = null;
  }

  return frame;
}

function formatInsertionSortStepLabel(step: InsertionSortStepEvent): string {
  if (step.type === "select-key") {
    return "Select Key";
  }

  if (step.type === "compare") {
    return "Compare";
  }

  if (step.type === "shift-right") {
    return "Shift Right";
  }

  if (step.type === "insert") {
    return step.payload.shifted ? "Insert" : "Keep Position";
  }

  if (step.type === "pass-complete") {
    return "Pass Complete";
  }

  return "Sorted";
}

function formatInsertionSortStepMessage(step: InsertionSortStepEvent): string {
  if (step.type === "select-key") {
    return `Pass ${step.payload.pass}: select key ${step.payload.keyValue} from index ${step.payload.keyIndex}.`;
  }

  if (step.type === "compare") {
    return `Compare key ${step.payload.keyValue} with index ${step.payload.compareIndex} (${step.payload.comparedValue}).`;
  }

  if (step.type === "shift-right") {
    return `Shift value ${step.payload.movedValue} from index ${step.payload.fromIndex} to ${step.payload.toIndex}.`;
  }

  if (step.type === "insert") {
    return step.payload.shifted
      ? `Insert key ${step.payload.keyValue} at index ${step.payload.toIndex} after ${step.payload.shifts} shift(s).`
      : `Key ${step.payload.keyValue} stays at index ${step.payload.toIndex}.`;
  }

  if (step.type === "pass-complete") {
    return `Pass ${step.payload.pass} complete: ${step.payload.comparisons} comparisons and ${step.payload.shifts} shift(s).`;
  }

  return `Completed in ${step.payload.passes} passes with ${step.payload.comparisons} comparisons.`;
}

interface MergeSortFrame {
  values: number[];
  activeRange: [number, number] | null;
  leftPointer: number | null;
  rightPointer: number | null;
  targetIndex: number | null;
  writeTarget: number | null;
  sourceIndex: number | null;
  depth: number | null;
  completed: boolean;
}

function MergeSortVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("merge-sort", run);
  const typedRun =
    run && run.algorithmSlug === "merge-sort"
      ? {
          ...run,
          input: run.input as MergeSortInput,
          result: run.result as MergeSortResult,
          steps: run.steps as MergeSortStepEvent[],
        }
      : null;

  const values = typedRun?.input.values ?? [];
  const steps = typedRun?.steps ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveMergeSortFrame(values, steps, cursor), [values, steps, cursor]);
  const stepLabel = activeStep ? formatMergeSortStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep
    ? formatMergeSortStepMessage(activeStep)
    : "Press Play or Step to start execution.";

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            {compactComplexity ? (
              <Badge variant="outline" className="rounded-full border-border/70">
                {compactComplexity}
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full border-border/70">
              Merge Sort
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic recursive split and merge playback with compare and write-back events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Comparisons</p>
            <p className="font-mono text-base">{typedRun?.result.comparisons ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Writes</p>
            <p className="font-mono text-base">{typedRun?.result.writes ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Merges</p>
            <p className="font-mono text-base">{typedRun?.result.merges ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Depth</p>
            <p className="font-mono text-base">{frame.depth ?? typedRun?.result.maxDepth ?? "n/a"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full border-border/70">
              {stepLabel}
            </Badge>
            <p className="text-muted-foreground">{stepMessage}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {frame.values.map((value, index) => {
              const inActiveRange =
                frame.activeRange !== null && index >= frame.activeRange[0] && index <= frame.activeRange[1];
              const isPointer = index === frame.leftPointer || index === frame.rightPointer;
              const isWriteTarget = index === frame.writeTarget;
              const isSourceIndex = index === frame.sourceIndex;
              const isSorted = frame.completed;

              return (
                <div
                  key={`${value}-${index}`}
                  className={cn(
                    "rounded-lg border p-2",
                    inActiveRange && "border-sky-300/60 bg-sky-500/10",
                    isPointer && "border-cyan-300/60 bg-cyan-500/15",
                    isWriteTarget && "border-amber-300/60 bg-amber-500/20",
                    isSourceIndex && "border-indigo-300/60 bg-indigo-500/15",
                    isSorted && "border-emerald-300/60 bg-emerald-500/15",
                  )}
                >
                  <p className="text-muted-foreground text-[10px]">index {index}</p>
                  <p className="font-mono text-sm">{value}</p>
                </div>
              );
            })}
          </div>
          {frame.values.length === 0 ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <ArrowUpDownIcon className="size-3.5" />
              No values available for visualization.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function deriveMergeSortFrame(
  initialValues: number[],
  steps: MergeSortStepEvent[],
  cursor: number,
): MergeSortFrame {
  const frame: MergeSortFrame = {
    values: [...initialValues],
    activeRange: null,
    leftPointer: null,
    rightPointer: null,
    targetIndex: null,
    writeTarget: null,
    sourceIndex: null,
    depth: null,
    completed: false,
  };

  if (cursor < 0 || steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = steps[index];

    if (step.type === "split-range") {
      frame.activeRange = [step.payload.start, step.payload.end - 1];
      frame.leftPointer = null;
      frame.rightPointer = null;
      frame.targetIndex = null;
      frame.writeTarget = null;
      frame.sourceIndex = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "merge-start") {
      frame.activeRange = [step.payload.start, step.payload.end - 1];
      frame.leftPointer = step.payload.start;
      frame.rightPointer = step.payload.mid;
      frame.targetIndex = step.payload.start;
      frame.writeTarget = null;
      frame.sourceIndex = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "merge-compare") {
      frame.activeRange = [step.payload.start, step.payload.end - 1];
      frame.leftPointer = step.payload.leftIndex;
      frame.rightPointer = step.payload.rightIndex;
      frame.targetIndex = step.payload.targetIndex;
      frame.writeTarget = null;
      frame.sourceIndex = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "write-back") {
      frame.values[step.payload.targetIndex] = step.payload.value;
      frame.activeRange = [step.payload.start, step.payload.end - 1];
      frame.writeTarget = step.payload.targetIndex;
      frame.sourceIndex = step.payload.sourceIndex;
      frame.targetIndex = step.payload.targetIndex;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "merge-complete") {
      frame.activeRange = [step.payload.start, step.payload.end - 1];
      frame.leftPointer = null;
      frame.rightPointer = null;
      frame.targetIndex = null;
      frame.writeTarget = null;
      frame.sourceIndex = null;
      frame.depth = step.payload.depth;
      continue;
    }

    frame.activeRange = [0, Math.max(0, frame.values.length - 1)];
    frame.leftPointer = null;
    frame.rightPointer = null;
    frame.targetIndex = null;
    frame.writeTarget = null;
    frame.sourceIndex = null;
    frame.completed = step.payload.isSorted;
  }

  return frame;
}

function formatMergeSortStepLabel(step: MergeSortStepEvent): string {
  if (step.type === "split-range") {
    return "Split Range";
  }

  if (step.type === "merge-start") {
    return "Merge Start";
  }

  if (step.type === "merge-compare") {
    return "Merge Compare";
  }

  if (step.type === "write-back") {
    return "Write Back";
  }

  if (step.type === "merge-complete") {
    return "Merge Complete";
  }

  return "Sorted";
}

function formatMergeSortStepMessage(step: MergeSortStepEvent): string {
  if (step.type === "split-range") {
    return `Depth ${step.payload.depth}: split [${step.payload.start}, ${step.payload.end - 1}] at ${step.payload.mid}.`;
  }

  if (step.type === "merge-start") {
    return `Depth ${step.payload.depth}: merge [${step.payload.start}, ${step.payload.mid - 1}] with [${step.payload.mid}, ${step.payload.end - 1}].`;
  }

  if (step.type === "merge-compare") {
    return `Compare left ${step.payload.leftValue} (i=${step.payload.leftIndex}) and right ${step.payload.rightValue} (j=${step.payload.rightIndex}).`;
  }

  if (step.type === "write-back") {
    return `Write ${step.payload.value} from ${step.payload.sourceSide} source index ${step.payload.sourceIndex} to index ${step.payload.targetIndex}.`;
  }

  if (step.type === "merge-complete") {
    return `Depth ${step.payload.depth}: merged [${step.payload.start}, ${step.payload.end - 1}] with ${step.payload.writes} write(s).`;
  }

  return `Completed with ${step.payload.comparisons} comparisons and ${step.payload.writes} writes.`;
}

interface BinarySearchFrame {
  low: number;
  high: number;
  mid: number | null;
  foundIndex: number | null;
}

function deriveBinarySearchFrame(
  activeStep: BinarySearchStepEvent | null,
  valuesLength: number,
): BinarySearchFrame {
  const baseFrame: BinarySearchFrame = {
    low: 0,
    high: valuesLength - 1,
    mid: null,
    foundIndex: null,
  };

  if (!activeStep) {
    return baseFrame;
  }

  if (activeStep.type === "bounds-init") {
    return {
      ...baseFrame,
      low: activeStep.payload.low,
      high: activeStep.payload.high,
    };
  }

  if (activeStep.type === "midpoint" || activeStep.type === "bound-update") {
    return {
      ...baseFrame,
      low: activeStep.payload.low,
      high: activeStep.payload.high,
      mid: activeStep.payload.mid,
    };
  }

  if (activeStep.type === "found") {
    return {
      ...baseFrame,
      low: activeStep.payload.low,
      high: activeStep.payload.high,
      mid: activeStep.payload.mid,
      foundIndex: activeStep.payload.index,
    };
  }

  return {
    ...baseFrame,
    low: activeStep.payload.low,
    high: activeStep.payload.high,
  };
}

function formatBinarySearchStepLabel(step: BinarySearchStepEvent): string {
  if (step.type === "bounds-init") {
    return "Initialize Bounds";
  }

  if (step.type === "midpoint") {
    return "Check Midpoint";
  }

  if (step.type === "bound-update") {
    return "Update Bounds";
  }

  if (step.type === "found") {
    return "Match Found";
  }

  return "Not Found";
}

function formatBinarySearchStepMessage(step: BinarySearchStepEvent): string {
  if (step.type === "bounds-init") {
    return `Search interval starts at [${step.payload.low}, ${step.payload.high}].`;
  }

  if (step.type === "midpoint") {
    return `mid=${step.payload.mid}, value=${step.payload.value}, target=${step.payload.target}`;
  }

  if (step.type === "bound-update") {
    return step.payload.direction === "right"
      ? `Value is smaller than target. Move low to ${step.payload.low}.`
      : `Value is larger than target. Move high to ${step.payload.high}.`;
  }

  if (step.type === "found") {
    return `Target found at index ${step.payload.index}.`;
  }

  return `Target not found. Insert position would be ${step.payload.insertIndex}.`;
}

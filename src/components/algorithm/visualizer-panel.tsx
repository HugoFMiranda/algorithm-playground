import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDownIcon, Grid2x2Icon, MonitorPlayIcon, SearchIcon } from "lucide-react";

import type { AStarInput, AStarResult } from "@/algorithms/a-star/spec";
import type { AStarStepEvent } from "@/algorithms/a-star/engine";
import type { BinarySearchResult, BinarySearchInput } from "@/algorithms/binary-search/spec";
import type { BinarySearchStepEvent } from "@/algorithms/binary-search/engine";
import type { BfsInput, BfsResult } from "@/algorithms/bfs/spec";
import type { BfsStepEvent } from "@/algorithms/bfs/engine";
import type { BubbleSortInput, BubbleSortResult } from "@/algorithms/bubble-sort/spec";
import type { BubbleSortStepEvent } from "@/algorithms/bubble-sort/engine";
import type { DijkstraInput, DijkstraResult } from "@/algorithms/dijkstra/spec";
import type { DijkstraStepEvent } from "@/algorithms/dijkstra/engine";
import type { DfsInput, DfsResult } from "@/algorithms/dfs/spec";
import type { DfsStepEvent } from "@/algorithms/dfs/engine";
import type { HeapSortInput, HeapSortResult } from "@/algorithms/heap-sort/spec";
import type { HeapSortStepEvent } from "@/algorithms/heap-sort/engine";
import type { InsertionSortInput, InsertionSortResult } from "@/algorithms/insertion-sort/spec";
import type { InsertionSortStepEvent } from "@/algorithms/insertion-sort/engine";
import type { MergeSortInput, MergeSortResult } from "@/algorithms/merge-sort/spec";
import type { MergeSortStepEvent } from "@/algorithms/merge-sort/engine";
import type { QuickSortInput, QuickSortResult } from "@/algorithms/quick-sort/spec";
import type { QuickSortStepEvent } from "@/algorithms/quick-sort/engine";
import type { SelectionSortInput, SelectionSortResult } from "@/algorithms/selection-sort/spec";
import type { SelectionSortStepEvent } from "@/algorithms/selection-sort/engine";
import type { TopologicalSortInput, TopologicalSortResult } from "@/algorithms/topological-sort/spec";
import type { TopologicalSortStepEvent } from "@/algorithms/topological-sort/engine";
import type { AlgorithmDefinition } from "@/data/algorithms";
import { getCompactCurrentComplexity } from "@/lib/complexity";
import { parseWeightOverrides, serializeCellList, serializeWeightOverrides } from "@/lib/path-grid-edit";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  if (algorithm.slug === "dijkstra") {
    return <DijkstraVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "a-star") {
    return <AStarVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "selection-sort") {
    return <SelectionSortVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "quick-sort") {
    return <QuickSortVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "heap-sort") {
    return <HeapSortVisualizer run={run} cursor={cursor} />;
  }

  if (algorithm.slug === "topological-sort") {
    return <TopologicalSortVisualizer run={run} cursor={cursor} />;
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

type PathGridTool =
  | "start"
  | "target"
  | "block"
  | "erase"
  | "heavy"
  | "unheavy"
  | "weight";

interface GridToolOption {
  id: PathGridTool;
  label: string;
}

interface GridToolBarProps {
  activeTool: PathGridTool;
  tools: GridToolOption[];
  disabled: boolean;
  onToolChange: (tool: PathGridTool) => void;
}

function GridToolBar({ activeTool, tools, disabled, onToolChange }: GridToolBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          type="button"
          size="sm"
          variant={activeTool === tool.id ? "secondary" : "outline"}
          onClick={() => onToolChange(tool.id)}
          disabled={disabled}
          className="h-7 px-2 text-[11px]"
        >
          {tool.label}
        </Button>
      ))}
    </div>
  );
}

interface GridPaintHandlers {
  onPointerDown: (cell: number) => void;
  onPointerEnter: (cell: number) => void;
}

function useGridPaint(
  activeTool: PathGridTool,
  draggableTools: readonly PathGridTool[],
  canEdit: boolean,
  onApply: (cell: number) => void,
): GridPaintHandlers {
  const isPointerDownRef = useRef(false);
  const lastCellRef = useRef<number | null>(null);
  const draggableSet = useMemo(() => new Set<PathGridTool>(draggableTools), [draggableTools]);

  useEffect(() => {
    const handlePointerUp = () => {
      isPointerDownRef.current = false;
      lastCellRef.current = null;
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const onPointerDown = useCallback(
    (cell: number) => {
      if (!canEdit) {
        return;
      }

      isPointerDownRef.current = true;
      lastCellRef.current = cell;
      onApply(cell);
    },
    [canEdit, onApply],
  );

  const onPointerEnter = useCallback(
    (cell: number) => {
      if (!canEdit || !isPointerDownRef.current) {
        return;
      }

      if (!draggableSet.has(activeTool)) {
        return;
      }

      if (lastCellRef.current === cell) {
        return;
      }

      lastCellRef.current = cell;
      onApply(cell);
    },
    [activeTool, canEdit, draggableSet, onApply],
  );

  return {
    onPointerDown,
    onPointerEnter,
  };
}

function areNumberSetsEqual(left: Set<number>, right: Set<number>): boolean {
  if (left.size !== right.size) {
    return false;
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }

  return true;
}

function BfsVisualizer({ run, cursor }: SharedVisualizerProps) {
  const setParams = useAppStore((state) => state.setParams);
  const playbackStatus = useAppStore((state) => state.playback.status);
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
  const canEdit = playbackStatus !== "playing";
  const [activeTool, setActiveTool] = useState<PathGridTool>("block");

  const applyTool = useCallback(
    (cell: number) => {
      if (!typedRun || !canEdit || cell < 0 || cell >= totalCells) {
        return;
      }

      const blocked = new Set<number>(typedRun.input.blockedCells);
      const previousBlocked = new Set<number>(typedRun.input.blockedCells);
      let nextStart = typedRun.input.startCell;
      let nextTarget = typedRun.input.targetCell;

      if (activeTool === "start") {
        nextStart = cell;
        blocked.delete(cell);
      } else if (activeTool === "target") {
        nextTarget = cell;
        blocked.delete(cell);
      } else if (activeTool === "block") {
        if (cell === nextStart || cell === nextTarget) {
          return;
        }
        blocked.add(cell);
      } else if (activeTool === "erase") {
        blocked.delete(cell);
      }

      if (
        nextStart === typedRun.input.startCell &&
        nextTarget === typedRun.input.targetCell &&
        areNumberSetsEqual(blocked, previousBlocked)
      ) {
        return;
      }

      setParams({
        startCell: nextStart,
        targetCell: nextTarget,
        blockedCells: serializeCellList(blocked),
      });
    },
    [activeTool, canEdit, setParams, totalCells, typedRun],
  );

  const paintHandlers = useGridPaint(activeTool, ["block", "erase"], canEdit, applyTool);

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
          <div className="space-y-1.5 rounded-lg border border-border/70 bg-background/50 p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <GridToolBar
                activeTool={activeTool}
                tools={[
                  { id: "start", label: "Start" },
                  { id: "target", label: "Target" },
                  { id: "block", label: "Block" },
                  { id: "erase", label: "Erase" },
                ]}
                disabled={!typedRun || !canEdit}
                onToolChange={setActiveTool}
              />
              {!canEdit ? (
                <p className="text-muted-foreground text-[11px]">Pause playback to edit the grid.</p>
              ) : (
                <p className="text-muted-foreground text-[11px]">Click or drag to apply the active tool.</p>
              )}
            </div>
          </div>
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
                    onPointerDown={() => paintHandlers.onPointerDown(cell)}
                    onPointerEnter={() => paintHandlers.onPointerEnter(cell)}
                    className={cn(
                      "rounded-lg border p-2 select-none",
                      isBlocked && "border-zinc-500/70 bg-zinc-500/25 text-zinc-100",
                      isVisited && "border-sky-300/60 bg-sky-500/12",
                      isQueued && "border-cyan-300/60 bg-cyan-500/12",
                      isPath && "border-emerald-300/70 bg-emerald-500/20",
                      isCurrent && "border-amber-300/70 bg-amber-500/20",
                      isInspected && frame.inspectStatus === "blocked" && "border-red-300/70 bg-red-500/18",
                      isInspected && frame.inspectStatus === "enqueue" && "border-violet-300/70 bg-violet-500/20",
                      isStart && "ring-1 ring-blue-300/70",
                      isTarget && "ring-1 ring-rose-300/70",
                      typedRun && canEdit && "cursor-pointer",
                      (!typedRun || !canEdit) && "cursor-default",
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
  const setParams = useAppStore((state) => state.setParams);
  const playbackStatus = useAppStore((state) => state.playback.status);
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
  const canEdit = playbackStatus !== "playing";
  const [activeTool, setActiveTool] = useState<PathGridTool>("block");

  const applyTool = useCallback(
    (cell: number) => {
      if (!typedRun || !canEdit || cell < 0 || cell >= totalCells) {
        return;
      }

      const blocked = new Set<number>(typedRun.input.blockedCells);
      const previousBlocked = new Set<number>(typedRun.input.blockedCells);
      let nextStart = typedRun.input.startCell;
      let nextTarget = typedRun.input.targetCell;

      if (activeTool === "start") {
        nextStart = cell;
        blocked.delete(cell);
      } else if (activeTool === "target") {
        nextTarget = cell;
        blocked.delete(cell);
      } else if (activeTool === "block") {
        if (cell === nextStart || cell === nextTarget) {
          return;
        }
        blocked.add(cell);
      } else if (activeTool === "erase") {
        blocked.delete(cell);
      }

      if (
        nextStart === typedRun.input.startCell &&
        nextTarget === typedRun.input.targetCell &&
        areNumberSetsEqual(blocked, previousBlocked)
      ) {
        return;
      }

      setParams({
        startCell: nextStart,
        targetCell: nextTarget,
        blockedCells: serializeCellList(blocked),
      });
    },
    [activeTool, canEdit, setParams, totalCells, typedRun],
  );

  const paintHandlers = useGridPaint(activeTool, ["block", "erase"], canEdit, applyTool);

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
          <div className="space-y-1.5 rounded-lg border border-border/70 bg-background/50 p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <GridToolBar
                activeTool={activeTool}
                tools={[
                  { id: "start", label: "Start" },
                  { id: "target", label: "Target" },
                  { id: "block", label: "Block" },
                  { id: "erase", label: "Erase" },
                ]}
                disabled={!typedRun || !canEdit}
                onToolChange={setActiveTool}
              />
              {!canEdit ? (
                <p className="text-muted-foreground text-[11px]">Pause playback to edit the grid.</p>
              ) : (
                <p className="text-muted-foreground text-[11px]">Click or drag to apply the active tool.</p>
              )}
            </div>
          </div>
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
                    onPointerDown={() => paintHandlers.onPointerDown(cell)}
                    onPointerEnter={() => paintHandlers.onPointerEnter(cell)}
                    className={cn(
                      "rounded-lg border p-2 select-none",
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
                      typedRun && canEdit && "cursor-pointer",
                      (!typedRun || !canEdit) && "cursor-default",
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

interface DijkstraFrame {
  visited: Set<number>;
  frontier: Set<number>;
  blocked: Set<number>;
  heavy: Set<number>;
  path: Set<number>;
  distances: Map<number, number>;
  current: number | null;
  inspected: number | null;
  inspectStatus: "blocked" | "visited" | "skip" | "update" | null;
  completed: boolean;
  found: boolean;
}

function formatDistance(distance: number | undefined): string {
  if (distance === undefined) {
    return "inf";
  }

  return String(distance);
}

function DijkstraVisualizer({ run, cursor }: SharedVisualizerProps) {
  const params = useAppStore((state) => state.params);
  const setParams = useAppStore((state) => state.setParams);
  const playbackStatus = useAppStore((state) => state.playback.status);
  const compactComplexity = getCompactCurrentComplexity("dijkstra", run);
  const typedRun =
    run && run.algorithmSlug === "dijkstra"
      ? {
          ...run,
          input: run.input as DijkstraInput,
          result: run.result as DijkstraResult,
          steps: run.steps as DijkstraStepEvent[],
        }
      : null;

  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveDijkstraFrame(typedRun, cursor), [typedRun, cursor]);
  const stepLabel = activeStep ? formatDijkstraStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep
    ? formatDijkstraStepMessage(activeStep)
    : "Press Play or Step to start execution.";
  const totalCells = typedRun ? typedRun.input.rows * typedRun.input.cols : 0;
  const canEdit = playbackStatus !== "playing";
  const [activeTool, setActiveTool] = useState<PathGridTool>("block");
  const [pendingWeightCell, setPendingWeightCell] = useState<number | null>(null);
  const [pendingWeightValue, setPendingWeightValue] = useState("");
  const weightOverridesText =
    typeof params.weightOverrides === "string" ? params.weightOverrides : typedRun?.input.weightOverrides ?? "";
  const weightOverrides = useMemo(
    () => parseWeightOverrides(weightOverridesText, totalCells),
    [totalCells, weightOverridesText],
  );
  const serializedWeightOverrides = useMemo(
    () => serializeWeightOverrides(weightOverrides),
    [weightOverrides],
  );

  useEffect(() => {
    if (activeTool !== "weight") {
      setPendingWeightCell(null);
    }
  }, [activeTool]);

  const applyTool = useCallback(
    (cell: number) => {
      if (!typedRun || !canEdit || cell < 0 || cell >= totalCells) {
        return;
      }

      const blocked = new Set<number>(typedRun.input.blockedCells);
      const heavy = new Set<number>(typedRun.input.heavyCells);
      const previousBlocked = new Set<number>(typedRun.input.blockedCells);
      const previousHeavy = new Set<number>(typedRun.input.heavyCells);
      const nextWeightOverrides = parseWeightOverrides(weightOverridesText, totalCells);

      let nextStart = typedRun.input.startCell;
      let nextTarget = typedRun.input.targetCell;

      if (activeTool === "weight") {
        if (blocked.has(cell)) {
          return;
        }

        setPendingWeightCell(cell);
        setPendingWeightValue(String(nextWeightOverrides.get(cell) ?? typedRun.input.weights[cell]));
        return;
      }

      if (activeTool === "start") {
        nextStart = cell;
        blocked.delete(cell);
        heavy.delete(cell);
        nextWeightOverrides.delete(cell);
      } else if (activeTool === "target") {
        nextTarget = cell;
        blocked.delete(cell);
        heavy.delete(cell);
        nextWeightOverrides.delete(cell);
      } else if (activeTool === "block") {
        if (cell === nextStart || cell === nextTarget) {
          return;
        }
        blocked.add(cell);
        heavy.delete(cell);
        nextWeightOverrides.delete(cell);
      } else if (activeTool === "erase") {
        blocked.delete(cell);
      } else if (activeTool === "heavy") {
        if (blocked.has(cell) || cell === nextStart || cell === nextTarget) {
          return;
        }
        heavy.add(cell);
      } else if (activeTool === "unheavy") {
        heavy.delete(cell);
      }

      const nextOverridesText = serializeWeightOverrides(nextWeightOverrides);
      if (
        nextStart === typedRun.input.startCell &&
        nextTarget === typedRun.input.targetCell &&
        areNumberSetsEqual(blocked, previousBlocked) &&
        areNumberSetsEqual(heavy, previousHeavy) &&
        nextOverridesText === serializedWeightOverrides
      ) {
        return;
      }

      setPendingWeightCell(null);
      setParams({
        startCell: nextStart,
        targetCell: nextTarget,
        blockedCells: serializeCellList(blocked),
        heavyCells: serializeCellList(heavy),
        weightOverrides: nextOverridesText,
      });
    },
    [
      activeTool,
      canEdit,
      serializedWeightOverrides,
      setParams,
      totalCells,
      typedRun,
      weightOverridesText,
    ],
  );

  const paintHandlers = useGridPaint(
    activeTool,
    ["block", "erase", "heavy", "unheavy"],
    canEdit,
    applyTool,
  );

  const handleApplyWeight = useCallback(() => {
    if (!typedRun || !canEdit || pendingWeightCell === null) {
      return;
    }

    const nextWeight = Number(pendingWeightValue);
    if (!Number.isFinite(nextWeight)) {
      return;
    }

    const blocked = new Set<number>(typedRun.input.blockedCells);
    if (blocked.has(pendingWeightCell)) {
      return;
    }

    const nextWeightOverrides = parseWeightOverrides(weightOverridesText, totalCells);
    nextWeightOverrides.set(pendingWeightCell, Math.max(1, Math.min(15, Math.floor(nextWeight))));
    const nextOverridesText = serializeWeightOverrides(nextWeightOverrides);
    if (nextOverridesText === serializedWeightOverrides) {
      setPendingWeightCell(null);
      return;
    }

    setParams({ weightOverrides: nextOverridesText });
    setPendingWeightCell(null);
  }, [
    canEdit,
    pendingWeightCell,
    pendingWeightValue,
    serializedWeightOverrides,
    setParams,
    totalCells,
    typedRun,
    weightOverridesText,
  ]);

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
              Dijkstra
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic weighted-grid shortest path playback with extract-min and relaxation events.
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
            <p className="font-mono text-base">{typedRun?.result.found ? typedRun.result.distance : "n/a"}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">
              {typedRun?.result.found ? "Path Found" : typedRun && frame.completed ? "Not Found" : "Searching"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="space-y-1.5 rounded-lg border border-border/70 bg-background/50 p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <GridToolBar
                activeTool={activeTool}
                tools={[
                  { id: "start", label: "Start" },
                  { id: "target", label: "Target" },
                  { id: "block", label: "Block" },
                  { id: "erase", label: "Erase" },
                  { id: "heavy", label: "Heavy" },
                  { id: "unheavy", label: "Unheavy" },
                  { id: "weight", label: "Weight" },
                ]}
                disabled={!typedRun || !canEdit}
                onToolChange={setActiveTool}
              />
              {!canEdit ? (
                <p className="text-muted-foreground text-[11px]">Pause playback to edit the grid.</p>
              ) : (
                <p className="text-muted-foreground text-[11px]">Click or drag to apply the active tool.</p>
              )}
            </div>
            {activeTool === "weight" && typedRun ? (
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[11px]">
                    {pendingWeightCell === null
                      ? "Select a non-blocked cell to edit its weight."
                      : `Cell ${pendingWeightCell} weight`}
                  </p>
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    value={pendingWeightValue}
                    onChange={(event) => setPendingWeightValue(event.target.value)}
                    className="h-8 w-28"
                    disabled={!canEdit || pendingWeightCell === null}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!canEdit || pendingWeightCell === null}
                  onClick={handleApplyWeight}
                >
                  Apply
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pendingWeightCell === null}
                  onClick={() => setPendingWeightCell(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : null}
          </div>
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
                const isFrontier = frame.frontier.has(cell);
                const isPath = frame.path.has(cell);
                const isCurrent = frame.current === cell;
                const isInspected = frame.inspected === cell;
                const isHeavy = frame.heavy.has(cell);
                const distance = frame.distances.get(cell);
                const isOverridden = weightOverrides.has(cell);

                return (
                  <div
                    key={cell}
                    onPointerDown={() => paintHandlers.onPointerDown(cell)}
                    onPointerEnter={() => paintHandlers.onPointerEnter(cell)}
                    className={cn(
                      "rounded-lg border p-2 select-none",
                      isBlocked && "border-zinc-500/70 bg-zinc-500/25 text-zinc-100",
                      isVisited && "border-sky-300/60 bg-sky-500/12",
                      isFrontier && "border-cyan-300/60 bg-cyan-500/12",
                      isPath && "border-emerald-300/70 bg-emerald-500/20",
                      isCurrent && "border-amber-300/70 bg-amber-500/20",
                      isHeavy && !isBlocked && "ring-1 ring-violet-300/50",
                      isOverridden && !isBlocked && "ring-1 ring-lime-300/60",
                      isInspected && frame.inspectStatus === "blocked" && "border-red-300/70 bg-red-500/18",
                      isInspected && frame.inspectStatus === "update" && "border-violet-300/70 bg-violet-500/20",
                      isInspected && frame.inspectStatus === "skip" && "border-orange-300/70 bg-orange-500/20",
                      isStart && "ring-1 ring-blue-300/70",
                      isTarget && "ring-1 ring-rose-300/70",
                      typedRun && canEdit && "cursor-pointer",
                      (!typedRun || !canEdit) && "cursor-default",
                    )}
                  >
                    <p className="text-muted-foreground text-[10px]">{toGridLabel(cell, typedRun.input.cols)}</p>
                    <p className="font-mono text-xs">
                      {isStart ? "S" : isTarget ? "T" : isBlocked ? "#" : typedRun.input.weights[cell]}
                    </p>
                    <p className="text-[10px] text-muted-foreground">d={formatDistance(distance)}</p>
                  </div>
                );
              })}
            </div>
          ) : null}
          {!typedRun ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <SearchIcon className="size-3.5" />
              No Dijkstra run available for visualization.
            </div>
          ) : null}
        </div>

        <div className="text-muted-foreground text-xs">
          Legend: <span className="font-medium">S/T</span> start/target, <span className="font-medium">#</span>{" "}
          blocked, violet ring = heavy, lime ring = weight override, number = cell weight, d = best known
          distance.
        </div>
      </CardContent>
    </Card>
  );
}

function deriveDijkstraFrame(
  run: {
    input: DijkstraInput;
    result: DijkstraResult;
    steps: DijkstraStepEvent[];
  } | null,
  cursor: number,
): DijkstraFrame {
  const frame: DijkstraFrame = {
    visited: new Set<number>(),
    frontier: new Set<number>(),
    blocked: new Set<number>(run?.input.blockedCells ?? []),
    heavy: new Set<number>(run?.input.heavyCells ?? []),
    path: new Set<number>(),
    distances: new Map<number, number>(),
    current: null,
    inspected: null,
    inspectStatus: null,
    completed: false,
    found: false,
  };

  if (!run || cursor < 0 || run.steps.length === 0) {
    if (run) {
      frame.frontier.add(run.input.startCell);
      frame.distances.set(run.input.startCell, 0);
    }
    return frame;
  }

  frame.frontier.add(run.input.startCell);
  frame.distances.set(run.input.startCell, 0);

  const boundedCursor = Math.min(cursor, run.steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = run.steps[index];

    if (step.type === "extract-min") {
      frame.current = step.payload.cell;
      frame.frontier.delete(step.payload.cell);
      frame.visited.add(step.payload.cell);
      frame.distances.set(step.payload.cell, step.payload.distance);
      frame.inspected = null;
      frame.inspectStatus = null;
      continue;
    }

    if (step.type === "relax-edge") {
      frame.inspected = step.payload.to;
      frame.inspectStatus = step.payload.status;
      continue;
    }

    if (step.type === "distance-update") {
      frame.distances.set(step.payload.cell, step.payload.nextDistance);
      if (!frame.visited.has(step.payload.cell)) {
        frame.frontier.add(step.payload.cell);
      }
      continue;
    }

    if (step.type === "found") {
      frame.completed = true;
      frame.found = true;
      frame.current = step.payload.cell;
      frame.path = new Set<number>(run.result.pathCells);
      continue;
    }

    if (step.type === "not-found") {
      frame.completed = true;
      frame.found = false;
      frame.current = null;
      frame.inspected = null;
      frame.inspectStatus = null;
      continue;
    }

    frame.completed = true;
    frame.found = step.payload.found;
    frame.path = new Set<number>(run.result.pathCells);
  }

  return frame;
}

function formatDijkstraStepLabel(step: DijkstraStepEvent): string {
  if (step.type === "extract-min") {
    return "Extract Min";
  }

  if (step.type === "relax-edge") {
    return "Relax Edge";
  }

  if (step.type === "distance-update") {
    return "Distance Update";
  }

  if (step.type === "found") {
    return "Target Found";
  }

  if (step.type === "not-found") {
    return "No Path";
  }

  return "Complete";
}

function formatDijkstraStepMessage(step: DijkstraStepEvent): string {
  if (step.type === "extract-min") {
    return `Extract cell ${step.payload.cell} with best-known distance ${step.payload.distance}.`;
  }

  if (step.type === "relax-edge") {
    if (step.payload.status === "blocked") {
      return `Edge ${step.payload.from} -> ${step.payload.to} is blocked.`;
    }

    if (step.payload.status === "visited") {
      return `Edge ${step.payload.from} -> ${step.payload.to} goes to an already settled cell.`;
    }

    if (step.payload.status === "skip") {
      return `Edge ${step.payload.from} -> ${step.payload.to} does not improve distance (${step.payload.candidateDistance}).`;
    }

    return `Edge ${step.payload.from} -> ${step.payload.to} yields improved candidate ${step.payload.candidateDistance}.`;
  }

  if (step.type === "distance-update") {
    return `Update d(${step.payload.cell}) from ${step.payload.previousDistance < 0 ? "inf" : step.payload.previousDistance} to ${step.payload.nextDistance}.`;
  }

  if (step.type === "found") {
    return `Target reached with total distance ${step.payload.distance} and path length ${step.payload.pathLength}.`;
  }

  if (step.type === "not-found") {
    return `No reachable target after ${step.payload.relaxations} successful relaxation(s).`;
  }

  return step.payload.found
    ? `Completed with distance ${step.payload.distance} and ${step.payload.relaxations} relaxation(s).`
    : `Completed without path after visiting ${step.payload.visitedCount} cells.`;
}

interface AStarFrame {
  open: Set<number>;
  closed: Set<number>;
  blocked: Set<number>;
  heavy: Set<number>;
  path: Set<number>;
  gScores: Map<number, number>;
  fScores: Map<number, number>;
  current: number | null;
  inspected: number | null;
  inspectStatus: "blocked" | "closed" | "skip" | "update" | null;
  completed: boolean;
  found: boolean;
}

function getHeuristicEstimate(
  cell: number,
  targetCell: number,
  cols: number,
  allowDiagonal: boolean,
  heuristicWeight: number,
): number {
  const fromPoint = {
    row: Math.floor(cell / cols),
    col: cell % cols,
  };
  const targetPoint = {
    row: Math.floor(targetCell / cols),
    col: targetCell % cols,
  };
  const rowDiff = Math.abs(fromPoint.row - targetPoint.row);
  const colDiff = Math.abs(fromPoint.col - targetPoint.col);
  const distance = allowDiagonal ? Math.max(rowDiff, colDiff) : rowDiff + colDiff;
  return distance * heuristicWeight;
}

function AStarVisualizer({ run, cursor }: SharedVisualizerProps) {
  const params = useAppStore((state) => state.params);
  const setParams = useAppStore((state) => state.setParams);
  const playbackStatus = useAppStore((state) => state.playback.status);
  const compactComplexity = getCompactCurrentComplexity("a-star", run);
  const typedRun =
    run && run.algorithmSlug === "a-star"
      ? {
          ...run,
          input: run.input as AStarInput,
          result: run.result as AStarResult,
          steps: run.steps as AStarStepEvent[],
        }
      : null;

  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveAStarFrame(typedRun, cursor), [typedRun, cursor]);
  const stepLabel = activeStep ? formatAStarStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep ? formatAStarStepMessage(activeStep) : "Press Play or Step to start execution.";
  const totalCells = typedRun ? typedRun.input.rows * typedRun.input.cols : 0;
  const canEdit = playbackStatus !== "playing";
  const [activeTool, setActiveTool] = useState<PathGridTool>("block");
  const [pendingWeightCell, setPendingWeightCell] = useState<number | null>(null);
  const [pendingWeightValue, setPendingWeightValue] = useState("");
  const weightOverridesText =
    typeof params.weightOverrides === "string" ? params.weightOverrides : typedRun?.input.weightOverrides ?? "";
  const weightOverrides = useMemo(
    () => parseWeightOverrides(weightOverridesText, totalCells),
    [totalCells, weightOverridesText],
  );
  const serializedWeightOverrides = useMemo(
    () => serializeWeightOverrides(weightOverrides),
    [weightOverrides],
  );

  useEffect(() => {
    if (activeTool !== "weight") {
      setPendingWeightCell(null);
    }
  }, [activeTool]);

  const applyTool = useCallback(
    (cell: number) => {
      if (!typedRun || !canEdit || cell < 0 || cell >= totalCells) {
        return;
      }

      const blocked = new Set<number>(typedRun.input.blockedCells);
      const heavy = new Set<number>(typedRun.input.heavyCells);
      const previousBlocked = new Set<number>(typedRun.input.blockedCells);
      const previousHeavy = new Set<number>(typedRun.input.heavyCells);
      const nextWeightOverrides = parseWeightOverrides(weightOverridesText, totalCells);

      let nextStart = typedRun.input.startCell;
      let nextTarget = typedRun.input.targetCell;

      if (activeTool === "weight") {
        if (blocked.has(cell)) {
          return;
        }

        setPendingWeightCell(cell);
        setPendingWeightValue(String(nextWeightOverrides.get(cell) ?? typedRun.input.weights[cell]));
        return;
      }

      if (activeTool === "start") {
        nextStart = cell;
        blocked.delete(cell);
        heavy.delete(cell);
        nextWeightOverrides.delete(cell);
      } else if (activeTool === "target") {
        nextTarget = cell;
        blocked.delete(cell);
        heavy.delete(cell);
        nextWeightOverrides.delete(cell);
      } else if (activeTool === "block") {
        if (cell === nextStart || cell === nextTarget) {
          return;
        }
        blocked.add(cell);
        heavy.delete(cell);
        nextWeightOverrides.delete(cell);
      } else if (activeTool === "erase") {
        blocked.delete(cell);
      } else if (activeTool === "heavy") {
        if (blocked.has(cell) || cell === nextStart || cell === nextTarget) {
          return;
        }
        heavy.add(cell);
      } else if (activeTool === "unheavy") {
        heavy.delete(cell);
      }

      const nextOverridesText = serializeWeightOverrides(nextWeightOverrides);
      if (
        nextStart === typedRun.input.startCell &&
        nextTarget === typedRun.input.targetCell &&
        areNumberSetsEqual(blocked, previousBlocked) &&
        areNumberSetsEqual(heavy, previousHeavy) &&
        nextOverridesText === serializedWeightOverrides
      ) {
        return;
      }

      setPendingWeightCell(null);
      setParams({
        startCell: nextStart,
        targetCell: nextTarget,
        blockedCells: serializeCellList(blocked),
        heavyCells: serializeCellList(heavy),
        weightOverrides: nextOverridesText,
      });
    },
    [
      activeTool,
      canEdit,
      serializedWeightOverrides,
      setParams,
      totalCells,
      typedRun,
      weightOverridesText,
    ],
  );

  const paintHandlers = useGridPaint(
    activeTool,
    ["block", "erase", "heavy", "unheavy"],
    canEdit,
    applyTool,
  );

  const handleApplyWeight = useCallback(() => {
    if (!typedRun || !canEdit || pendingWeightCell === null) {
      return;
    }

    const nextWeight = Number(pendingWeightValue);
    if (!Number.isFinite(nextWeight)) {
      return;
    }

    const blocked = new Set<number>(typedRun.input.blockedCells);
    if (blocked.has(pendingWeightCell)) {
      return;
    }

    const nextWeightOverrides = parseWeightOverrides(weightOverridesText, totalCells);
    nextWeightOverrides.set(pendingWeightCell, Math.max(1, Math.min(15, Math.floor(nextWeight))));
    const nextOverridesText = serializeWeightOverrides(nextWeightOverrides);
    if (nextOverridesText === serializedWeightOverrides) {
      setPendingWeightCell(null);
      return;
    }

    setParams({ weightOverrides: nextOverridesText });
    setPendingWeightCell(null);
  }, [
    canEdit,
    pendingWeightCell,
    pendingWeightValue,
    serializedWeightOverrides,
    setParams,
    totalCells,
    typedRun,
    weightOverridesText,
  ]);

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
              A*
            </Badge>
          </div>
        </div>
        <CardDescription>
          Heuristic-guided weighted-grid search with open-set selection and score updates.
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
            <p className="text-muted-foreground text-[11px] uppercase">Expanded</p>
            <p className="font-mono text-base">{typedRun?.result.expandedCount ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Distance</p>
            <p className="font-mono text-base">{typedRun?.result.found ? typedRun.result.distance : "n/a"}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">
              {typedRun?.result.found ? "Path Found" : typedRun && frame.completed ? "Not Found" : "Searching"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="space-y-1.5 rounded-lg border border-border/70 bg-background/50 p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <GridToolBar
                activeTool={activeTool}
                tools={[
                  { id: "start", label: "Start" },
                  { id: "target", label: "Target" },
                  { id: "block", label: "Block" },
                  { id: "erase", label: "Erase" },
                  { id: "heavy", label: "Heavy" },
                  { id: "unheavy", label: "Unheavy" },
                  { id: "weight", label: "Weight" },
                ]}
                disabled={!typedRun || !canEdit}
                onToolChange={setActiveTool}
              />
              {!canEdit ? (
                <p className="text-muted-foreground text-[11px]">Pause playback to edit the grid.</p>
              ) : (
                <p className="text-muted-foreground text-[11px]">Click or drag to apply the active tool.</p>
              )}
            </div>
            {activeTool === "weight" && typedRun ? (
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[11px]">
                    {pendingWeightCell === null
                      ? "Select a non-blocked cell to edit its weight."
                      : `Cell ${pendingWeightCell} weight`}
                  </p>
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    value={pendingWeightValue}
                    onChange={(event) => setPendingWeightValue(event.target.value)}
                    className="h-8 w-28"
                    disabled={!canEdit || pendingWeightCell === null}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!canEdit || pendingWeightCell === null}
                  onClick={handleApplyWeight}
                >
                  Apply
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pendingWeightCell === null}
                  onClick={() => setPendingWeightCell(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : null}
          </div>
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
                const isClosed = frame.closed.has(cell);
                const isOpen = frame.open.has(cell);
                const isPath = frame.path.has(cell);
                const isCurrent = frame.current === cell;
                const isInspected = frame.inspected === cell;
                const isHeavy = frame.heavy.has(cell);
                const isOverridden = weightOverrides.has(cell);
                const g = frame.gScores.get(cell);
                const f = frame.fScores.get(cell);

                return (
                  <div
                    key={cell}
                    onPointerDown={() => paintHandlers.onPointerDown(cell)}
                    onPointerEnter={() => paintHandlers.onPointerEnter(cell)}
                    className={cn(
                      "rounded-lg border p-2 select-none",
                      isBlocked && "border-zinc-500/70 bg-zinc-500/25 text-zinc-100",
                      isClosed && "border-sky-300/60 bg-sky-500/12",
                      isOpen && "border-cyan-300/60 bg-cyan-500/12",
                      isPath && "border-emerald-300/70 bg-emerald-500/20",
                      isCurrent && "border-amber-300/70 bg-amber-500/20",
                      isHeavy && !isBlocked && "ring-1 ring-violet-300/50",
                      isOverridden && !isBlocked && "ring-1 ring-lime-300/60",
                      isInspected && frame.inspectStatus === "blocked" && "border-red-300/70 bg-red-500/18",
                      isInspected && frame.inspectStatus === "closed" && "border-orange-300/70 bg-orange-500/18",
                      isInspected && frame.inspectStatus === "update" && "border-violet-300/70 bg-violet-500/20",
                      isInspected && frame.inspectStatus === "skip" && "border-orange-300/70 bg-orange-500/20",
                      isStart && "ring-1 ring-blue-300/70",
                      isTarget && "ring-1 ring-rose-300/70",
                      typedRun && canEdit && "cursor-pointer",
                      (!typedRun || !canEdit) && "cursor-default",
                    )}
                  >
                    <p className="text-muted-foreground text-[10px]">{toGridLabel(cell, typedRun.input.cols)}</p>
                    <p className="font-mono text-xs">
                      {isStart ? "S" : isTarget ? "T" : isBlocked ? "#" : typedRun.input.weights[cell]}
                    </p>
                    <p className="text-[10px] text-muted-foreground">g={formatDistance(g)}</p>
                    <p className="text-[10px] text-muted-foreground">f={formatDistance(f)}</p>
                  </div>
                );
              })}
            </div>
          ) : null}
          {!typedRun ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <SearchIcon className="size-3.5" />
              No A* run available for visualization.
            </div>
          ) : null}
        </div>

        <div className="text-muted-foreground text-xs">
          Legend: <span className="font-medium">S/T</span> start/target, <span className="font-medium">#</span>{" "}
          blocked, cyan=open set, blue=closed set, violet ring = heavy, lime ring = weight override.
        </div>
      </CardContent>
    </Card>
  );
}

function deriveAStarFrame(
  run: {
    input: AStarInput;
    result: AStarResult;
    steps: AStarStepEvent[];
  } | null,
  cursor: number,
): AStarFrame {
  const frame: AStarFrame = {
    open: new Set<number>(),
    closed: new Set<number>(),
    blocked: new Set<number>(run?.input.blockedCells ?? []),
    heavy: new Set<number>(run?.input.heavyCells ?? []),
    path: new Set<number>(),
    gScores: new Map<number, number>(),
    fScores: new Map<number, number>(),
    current: null,
    inspected: null,
    inspectStatus: null,
    completed: false,
    found: false,
  };

  if (!run || cursor < 0 || run.steps.length === 0) {
    if (run) {
      const startH = getHeuristicEstimate(
        run.input.startCell,
        run.input.targetCell,
        run.input.cols,
        run.input.allowDiagonal,
        run.input.heuristicWeight,
      );
      frame.open.add(run.input.startCell);
      frame.gScores.set(run.input.startCell, 0);
      frame.fScores.set(run.input.startCell, startH);
    }
    return frame;
  }

  const startH = getHeuristicEstimate(
    run.input.startCell,
    run.input.targetCell,
    run.input.cols,
    run.input.allowDiagonal,
    run.input.heuristicWeight,
  );
  frame.open.add(run.input.startCell);
  frame.gScores.set(run.input.startCell, 0);
  frame.fScores.set(run.input.startCell, startH);

  const boundedCursor = Math.min(cursor, run.steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = run.steps[index];

    if (step.type === "open-select") {
      frame.current = step.payload.cell;
      frame.open.delete(step.payload.cell);
      frame.closed.add(step.payload.cell);
      frame.gScores.set(step.payload.cell, step.payload.g);
      frame.fScores.set(step.payload.cell, step.payload.f);
      frame.inspected = null;
      frame.inspectStatus = null;
      continue;
    }

    if (step.type === "inspect-neighbor") {
      frame.inspected = step.payload.to;
      frame.inspectStatus = step.payload.status;
      continue;
    }

    if (step.type === "score-update") {
      frame.gScores.set(step.payload.cell, step.payload.nextG);
      frame.fScores.set(step.payload.cell, step.payload.f);
      if (!frame.closed.has(step.payload.cell)) {
        frame.open.add(step.payload.cell);
      }
      continue;
    }

    if (step.type === "found") {
      frame.completed = true;
      frame.found = true;
      frame.current = step.payload.cell;
      frame.path = new Set<number>(run.result.pathCells);
      continue;
    }

    if (step.type === "not-found") {
      frame.completed = true;
      frame.found = false;
      frame.current = null;
      frame.inspected = null;
      frame.inspectStatus = null;
      continue;
    }

    frame.completed = true;
    frame.found = step.payload.found;
    frame.path = new Set<number>(run.result.pathCells);
  }

  return frame;
}

function formatAStarStepLabel(step: AStarStepEvent): string {
  if (step.type === "open-select") {
    return "Open Select";
  }

  if (step.type === "inspect-neighbor") {
    return "Inspect Neighbor";
  }

  if (step.type === "score-update") {
    return "Score Update";
  }

  if (step.type === "found") {
    return "Target Found";
  }

  if (step.type === "not-found") {
    return "No Path";
  }

  return "Complete";
}

function formatAStarStepMessage(step: AStarStepEvent): string {
  if (step.type === "open-select") {
    return `Select cell ${step.payload.cell} with f=${step.payload.f} (g=${step.payload.g}, h=${step.payload.h}).`;
  }

  if (step.type === "inspect-neighbor") {
    if (step.payload.status === "blocked") {
      return `Neighbor ${step.payload.to} from ${step.payload.from} is blocked.`;
    }

    if (step.payload.status === "closed") {
      return `Neighbor ${step.payload.to} from ${step.payload.from} is already in the closed set.`;
    }

    if (step.payload.status === "skip") {
      return `Neighbor ${step.payload.to} does not improve g-score (${step.payload.candidateG}).`;
    }

    return `Neighbor ${step.payload.to} gets an improved g-score candidate ${step.payload.candidateG}.`;
  }

  if (step.type === "score-update") {
    return `Update node ${step.payload.cell}: g=${step.payload.nextG}, h=${step.payload.h}, f=${step.payload.f}.`;
  }

  if (step.type === "found") {
    return `Target reached with total distance ${step.payload.distance} and path length ${step.payload.pathLength}.`;
  }

  if (step.type === "not-found") {
    return `No path after expanding ${step.payload.expandedCount} cell(s).`;
  }

  return step.payload.found
    ? `Completed with distance ${step.payload.distance} and ${step.payload.relaxations} update(s).`
    : `Completed without path after expanding ${step.payload.expandedCount} cells.`;
}

interface TopologicalSortFrame {
  indegrees: number[];
  queue: number[];
  outputOrder: number[];
  processedNodes: Set<number>;
  currentNode: number | null;
  inspectedEdge: [number, number] | null;
  completed: boolean;
  cycleDetected: boolean;
  edgeRelaxations: number;
}

function TopologicalSortVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("topological-sort", run);
  const typedRun =
    run && run.algorithmSlug === "topological-sort"
      ? {
          ...run,
          input: run.input as TopologicalSortInput,
          result: run.result as TopologicalSortResult,
          steps: run.steps as TopologicalSortStepEvent[],
        }
      : null;

  const nodeCount = typedRun?.input.nodeCount ?? 0;
  const nodeIds = useMemo(() => Array.from({ length: nodeCount }, (_, index) => index), [nodeCount]);
  const edges = typedRun?.input.edges ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveTopologicalSortFrame(typedRun, cursor), [typedRun, cursor]);
  const stepLabel = activeStep ? formatTopologicalSortStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep
    ? formatTopologicalSortStepMessage(activeStep)
    : "Press Play or Step to start execution.";
  const preferLowerIndex =
    typedRun && typeof typedRun.normalizedParams.preferLowerIndex === "boolean"
      ? typedRun.normalizedParams.preferLowerIndex
      : true;
  const queueDisplay = useMemo(
    () =>
      [...frame.queue].sort((left, right) =>
        preferLowerIndex ? left - right : right - left,
      ),
    [frame.queue, preferLowerIndex],
  );
  const queuedSet = useMemo(() => new Set(queueDisplay), [queueDisplay]);
  const graphLayout = useMemo(() => createTopologicalGraphLayout(typedRun?.input ?? null), [typedRun]);
  const nodePositions = graphLayout.positions;
  const nodeRadius = graphLayout.nodeRadius;
  const activeEdgeKey = frame.inspectedEdge ? `${frame.inspectedEdge[0]}:${frame.inspectedEdge[1]}` : null;
  const edgeCurvatures = useMemo(() => createTopologicalEdgeCurvatures(edges), [edges]);

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
              Topological Sort
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic Kahn traversal playback with indegree decrements, zero-indegree queue pushes, and
          dependency-safe output ordering.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Processed</p>
            <p className="font-mono text-base">{frame.outputOrder.length}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Queue Size</p>
            <p className="font-mono text-base">{queueDisplay.length}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Relaxations</p>
            <p className="font-mono text-base">{frame.edgeRelaxations}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Result</p>
            <p className="font-mono text-base">
              {frame.completed
                ? frame.cycleDetected
                  ? "Cycle Detected"
                  : "Valid Order"
                : "Processing"}
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

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-lg border border-border/80 bg-background/70 p-3">
              <p className="text-muted-foreground mb-1 text-[11px] uppercase">Output Order</p>
              <p className="font-mono text-xs">
                {frame.outputOrder.length > 0 ? frame.outputOrder.join(" -> ") : "n/a"}
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/70 p-3">
              <p className="text-muted-foreground mb-1 text-[11px] uppercase">Zero-Indegree Queue</p>
              <p className="font-mono text-xs">{queueDisplay.length > 0 ? queueDisplay.join(", ") : "empty"}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-background/70 p-3">
              <p className="text-muted-foreground mb-1 text-[11px] uppercase">Current Edge</p>
              <p className="font-mono text-xs">
                {frame.inspectedEdge ? `${frame.inspectedEdge[0]} -> ${frame.inspectedEdge[1]}` : "n/a"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-background/70 p-3">
            <div className="overflow-hidden rounded-lg border border-border/70 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.08),transparent_52%),radial-gradient(circle_at_80%_88%,rgba(99,102,241,0.08),transparent_48%)]">
              <svg viewBox={`0 0 ${graphLayout.width} ${graphLayout.height}`} className="h-[320px] w-full">
                <defs>
                  <marker
                    id="topological-arrow-default"
                    viewBox="0 0 6 6"
                    markerWidth="4.4"
                    markerHeight="4.4"
                    markerUnits="userSpaceOnUse"
                    refX="5.1"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 3, 0 6" fill="rgba(148, 163, 184, 0.78)" />
                  </marker>
                  <marker
                    id="topological-arrow-active"
                    viewBox="0 0 6 6"
                    markerWidth="4.4"
                    markerHeight="4.4"
                    markerUnits="userSpaceOnUse"
                    refX="5.1"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 3, 0 6" fill="rgba(99, 102, 241, 0.92)" />
                  </marker>
                </defs>

                {edges.map((edge, edgeIndex) => {
                  const fromPosition = nodePositions[edge[0]];
                  const toPosition = nodePositions[edge[1]];
                  if (!fromPosition || !toPosition) {
                    return null;
                  }

                  const edgeKey = `${edge[0]}:${edge[1]}`;
                  const isActive = activeEdgeKey === edgeKey;
                  const isFromProcessed = frame.processedNodes.has(edge[0]);
                  const curve = edgeCurvatures[edgeKey] ?? 0;
                  const path = projectCurvedEdgePath(fromPosition, toPosition, nodeRadius, curve);
                  const stroke = isActive
                    ? "rgba(99, 102, 241, 0.95)"
                    : isFromProcessed
                      ? "rgba(16, 185, 129, 0.62)"
                      : "rgba(148, 163, 184, 0.58)";

                  return (
                    <path
                      key={`edge-path-${edge[0]}-${edge[1]}-${edgeIndex}`}
                      d={path}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={isActive ? 1.3 : 0.95}
                      vectorEffect="non-scaling-stroke"
                      markerEnd={isActive ? "url(#topological-arrow-active)" : "url(#topological-arrow-default)"}
                    />
                  );
                })}

                {nodeIds.map((node) => {
                  const position = nodePositions[node];
                  if (!position) {
                    return null;
                  }

                  const isCurrent = frame.currentNode === node;
                  const isQueued = queuedSet.has(node);
                  const isProcessed = frame.processedNodes.has(node);
                  const isBlockedByCycle = frame.completed && frame.cycleDetected && !isProcessed;
                  const indegree = frame.indegrees[node] ?? 0;

                  const fill = isBlockedByCycle
                    ? "rgba(244, 63, 94, 0.25)"
                    : isProcessed
                      ? "rgba(16, 185, 129, 0.22)"
                      : isCurrent
                        ? "rgba(245, 158, 11, 0.24)"
                        : isQueued
                          ? "rgba(14, 165, 233, 0.2)"
                          : "rgba(148, 163, 184, 0.16)";
                  const stroke = isBlockedByCycle
                    ? "rgba(244, 63, 94, 0.78)"
                    : isProcessed
                      ? "rgba(16, 185, 129, 0.78)"
                      : isCurrent
                        ? "rgba(245, 158, 11, 0.84)"
                        : isQueued
                          ? "rgba(14, 165, 233, 0.78)"
                          : "rgba(148, 163, 184, 0.66)";

                  return (
                    <g key={`graph-node-${node}`} transform={`translate(${position.x} ${position.y})`}>
                      <circle r={nodeRadius} fill={fill} stroke={stroke} strokeWidth={1.2} />
                      <text
                        x="0"
                        y="0"
                        dy="0.03em"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="3"
                        fontWeight="600"
                        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                        className="fill-foreground"
                      >
                        {node}
                      </text>
                      <text
                        x="0"
                        y={nodeRadius + 3}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground font-mono text-[2.2px]"
                      >
                        in:{indegree}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-0.5">
                <span className="inline-block size-2 rounded-full bg-sky-500/70" />
                queued
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-0.5">
                <span className="inline-block size-2 rounded-full bg-amber-500/70" />
                current
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-0.5">
                <span className="inline-block size-2 rounded-full bg-emerald-500/70" />
                processed
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-0.5">
                <span className="inline-block size-2 rounded-full bg-rose-500/70" />
                cycle-blocked
              </span>
            </div>
          </div>

          {edges.length === 0 ? (
            <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-4 text-xs">
              <ArrowUpDownIcon className="size-3.5" />
              No edges available for visualization.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface GraphPoint {
  x: number;
  y: number;
}

interface TopologicalGraphLayout {
  positions: Record<number, GraphPoint>;
  width: number;
  height: number;
  nodeRadius: number;
}

function createTopologicalGraphLayout(
  input: Pick<TopologicalSortInput, "nodeCount" | "adjacency" | "indegrees"> | null,
): TopologicalGraphLayout {
  if (!input || input.nodeCount <= 0) {
    return {
      positions: {},
      width: 100,
      height: 64,
      nodeRadius: 4.9,
    };
  }

  const { nodeCount } = input;
  const indegrees = [...input.indegrees];
  const levels = Array.from({ length: nodeCount }, () => 0);
  const queue: number[] = [];

  for (let node = 0; node < nodeCount; node += 1) {
    if ((indegrees[node] ?? 0) === 0) {
      queue.push(node);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift() as number;
    for (const neighbor of input.adjacency[current] ?? []) {
      levels[neighbor] = Math.max(levels[neighbor], levels[current] + 1);
      indegrees[neighbor] -= 1;
      if (indegrees[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  const maxLevel = Math.max(...levels, 0);
  const layeredNodes = new Map<number, number[]>();
  for (let node = 0; node < nodeCount; node += 1) {
    const level = Math.max(0, Math.min(levels[node], maxLevel));
    const existing = layeredNodes.get(level);
    if (existing) {
      existing.push(node);
    } else {
      layeredNodes.set(level, [node]);
    }
  }

  let maxLayerSize = 0;
  for (let level = 0; level <= maxLevel; level += 1) {
    maxLayerSize = Math.max(maxLayerSize, layeredNodes.get(level)?.length ?? 0);
  }

  const width = Math.max(100, Math.min(160, 74 + (maxLevel + 1) * 18));
  const height = Math.max(64, Math.min(108, 42 + maxLayerSize * 12));
  const paddingX = Math.max(10, width * 0.09);
  const paddingY = Math.max(8, height * 0.08);
  const nodeRadius = maxLayerSize >= 6 ? 4.2 : maxLayerSize >= 4 ? 4.6 : 4.9;
  const availableHeight = height - paddingY * 2;
  const centerY = paddingY + availableHeight / 2;
  const sparseChainLikeLayout = maxLayerSize <= 1 && maxLevel >= 5;
  const lanePattern = [0, -1, 1, -2, 2, -1, 1];
  const laneSpacing = Math.max(5.5, Math.min(9, availableHeight / 7));
  const positions: Record<number, GraphPoint> = {};

  for (let level = 0; level <= maxLevel; level += 1) {
    const nodes = [...(layeredNodes.get(level) ?? [])].sort((left, right) => left - right);
    const x = maxLevel === 0 ? width / 2 : paddingX + ((width - paddingX * 2) * level) / maxLevel;
    const verticalStep = availableHeight / (nodes.length + 1);

    nodes.forEach((node, rowIndex) => {
      const y =
        sparseChainLikeLayout && nodes.length === 1
          ? clampValue(
              centerY + lanePattern[level % lanePattern.length] * laneSpacing,
              paddingY + nodeRadius,
              height - paddingY - nodeRadius,
            )
          : paddingY + verticalStep * (rowIndex + 1);

      positions[node] = {
        x,
        y,
      };
    });
  }

  return {
    positions,
    width,
    height,
    nodeRadius,
  };
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function createTopologicalEdgeCurvatures(
  edges: readonly (readonly [number, number])[],
): Record<string, number> {
  const outgoing = new Map<number, number[]>();
  const incoming = new Map<number, number[]>();

  for (const [from, to] of edges) {
    const fromTargets = outgoing.get(from);
    if (fromTargets) {
      fromTargets.push(to);
    } else {
      outgoing.set(from, [to]);
    }

    const toSources = incoming.get(to);
    if (toSources) {
      toSources.push(from);
    } else {
      incoming.set(to, [from]);
    }
  }

  const curvatures: Record<string, number> = {};
  for (const [from, to] of edges) {
    const fromTargets = [...(outgoing.get(from) ?? [])].sort((left, right) => left - right);
    const toSources = [...(incoming.get(to) ?? [])].sort((left, right) => left - right);

    const outIndex = fromTargets.indexOf(to);
    const inIndex = toSources.indexOf(from);
    const outCenter = (fromTargets.length - 1) / 2;
    const inCenter = (toSources.length - 1) / 2;
    const outBias = outIndex - outCenter;
    const inBias = inIndex - inCenter;
    const fallbackJitter = ((from * 31 + to * 17) % 3) - 1;
    const baseCurve = outBias * 1.25 + inBias * 0.85;
    const curve = Math.abs(baseCurve) < 0.1 ? fallbackJitter * 0.45 : baseCurve;

    curvatures[`${from}:${to}`] = curve;
  }

  return curvatures;
}

function projectCurvedEdgePath(
  from: GraphPoint,
  to: GraphPoint,
  radius: number,
  curveBias: number,
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= 0.001) {
    return `M ${from.x} ${from.y} Q ${from.x} ${from.y} ${to.x} ${to.y}`;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const startOffset = radius * 0.92;
  const endOffset = radius * 0.96;
  const startX = from.x + nx * startOffset;
  const startY = from.y + ny * startOffset;
  const endX = to.x - nx * endOffset;
  const endY = to.y - ny * endOffset;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const perpendicularX = -ny;
  const perpendicularY = nx;
  const curveDistance = Math.min(10, distance * 0.16) * curveBias;
  const controlX = midX + perpendicularX * curveDistance;
  const controlY = midY + perpendicularY * curveDistance;

  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

function deriveTopologicalSortFrame(
  run: {
    input: TopologicalSortInput;
    steps: TopologicalSortStepEvent[];
  } | null,
  cursor: number,
): TopologicalSortFrame {
  const nodeCount = run?.input.nodeCount ?? 0;
  const initialIndegrees = run?.input.indegrees ?? [];
  const frame: TopologicalSortFrame = {
    indegrees: Array.from({ length: nodeCount }, (_, node) => initialIndegrees[node] ?? 0),
    queue: [],
    outputOrder: [],
    processedNodes: new Set<number>(),
    currentNode: null,
    inspectedEdge: null,
    completed: false,
    cycleDetected: false,
    edgeRelaxations: 0,
  };

  if (!run || cursor < 0 || run.steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, run.steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = run.steps[index];

    if (step.type === "queue-push") {
      if (!frame.processedNodes.has(step.payload.node) && !frame.queue.includes(step.payload.node)) {
        frame.queue.push(step.payload.node);
      }
      frame.inspectedEdge = null;
      continue;
    }

    if (step.type === "node-output") {
      frame.queue = frame.queue.filter((node) => node !== step.payload.node);
      frame.outputOrder.push(step.payload.node);
      frame.processedNodes.add(step.payload.node);
      frame.currentNode = step.payload.node;
      frame.inspectedEdge = null;
      continue;
    }

    if (step.type === "indegree-decrement") {
      frame.indegrees[step.payload.to] = step.payload.nextIndegree;
      frame.inspectedEdge = [step.payload.from, step.payload.to];
      frame.edgeRelaxations += 1;
      continue;
    }

    frame.completed = true;
    frame.currentNode = null;
    frame.inspectedEdge = null;
    frame.cycleDetected = step.payload.cycleDetected;
    frame.edgeRelaxations = step.payload.edgeRelaxations;
  }

  return frame;
}

function formatTopologicalSortStepLabel(step: TopologicalSortStepEvent): string {
  if (step.type === "queue-push") {
    return "Queue Push";
  }

  if (step.type === "node-output") {
    return "Output Node";
  }

  if (step.type === "indegree-decrement") {
    return "Indegree Update";
  }

  return step.payload.cycleDetected ? "Cycle Detected" : "Complete";
}

function formatTopologicalSortStepMessage(step: TopologicalSortStepEvent): string {
  if (step.type === "queue-push") {
    return step.payload.reason === "initial-zero"
      ? `Node ${step.payload.node} starts with indegree 0 and enters the queue.`
      : `Node ${step.payload.node} reached indegree 0 and is queued.`;
  }

  if (step.type === "node-output") {
    return `Output node ${step.payload.node} at position ${step.payload.orderIndex}; queue size now ${step.payload.queueSize}.`;
  }

  if (step.type === "indegree-decrement") {
    return step.payload.queued
      ? `Process edge ${step.payload.from} -> ${step.payload.to}: indegree drops to 0, so node ${step.payload.to} is queued.`
      : `Process edge ${step.payload.from} -> ${step.payload.to}: indegree is now ${step.payload.nextIndegree}.`;
  }

  return step.payload.cycleDetected
    ? `Stopped after outputting ${step.payload.orderLength} node(s); ${step.payload.remainingCount} node(s) remain in a cycle.`
    : `Completed with valid order of ${step.payload.orderLength} node(s) and ${step.payload.edgeRelaxations} edge updates.`;
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

interface HeapSortFrame {
  values: number[];
  heapSize: number;
  activeRoot: number | null;
  comparedPair: [number, number] | null;
  swapPair: [number, number] | null;
  phase: "build" | "extract" | null;
  completed: boolean;
}

function HeapSortVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("heap-sort", run);
  const typedRun =
    run && run.algorithmSlug === "heap-sort"
      ? {
          ...run,
          input: run.input as HeapSortInput,
          result: run.result as HeapSortResult,
          steps: run.steps as HeapSortStepEvent[],
        }
      : null;

  const values = typedRun?.input.values ?? [];
  const steps = typedRun?.steps ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveHeapSortFrame(values, steps, cursor), [values, steps, cursor]);
  const stepLabel = activeStep ? formatHeapSortStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep ? formatHeapSortStepMessage(activeStep) : "Press Play or Step to start execution.";

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
              Heap Sort
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic max-heap build and extraction playback with sift-down compare and swap events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Phase</p>
            <p className="font-mono text-base">
              {frame.completed ? "Done" : frame.phase === "build" ? "Build Heap" : "Extract Max"}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Heap Size</p>
            <p className="font-mono text-base">{frame.heapSize}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Comparisons</p>
            <p className="font-mono text-base">{typedRun?.result.comparisons ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Swaps</p>
            <p className="font-mono text-base">{typedRun?.result.swaps ?? 0}</p>
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
              const isHeapCell = !frame.completed && index < frame.heapSize;
              const isSorted = frame.completed || index >= frame.heapSize;
              const isRoot = frame.activeRoot === index;
              const isCompared =
                frame.comparedPair !== null &&
                (index === frame.comparedPair[0] || index === frame.comparedPair[1]);
              const isSwapped =
                frame.swapPair !== null && (index === frame.swapPair[0] || index === frame.swapPair[1]);

              return (
                <div
                  key={`${value}-${index}`}
                  className={cn(
                    "rounded-lg border p-2",
                    isHeapCell && "border-sky-300/60 bg-sky-500/10",
                    isRoot && "border-cyan-300/60 bg-cyan-500/15",
                    isCompared && "border-indigo-300/60 bg-indigo-500/15",
                    isSwapped && "border-amber-300/60 bg-amber-500/20",
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

function deriveHeapSortFrame(initialValues: number[], steps: HeapSortStepEvent[], cursor: number): HeapSortFrame {
  const frame: HeapSortFrame = {
    values: [...initialValues],
    heapSize: initialValues.length,
    activeRoot: null,
    comparedPair: null,
    swapPair: null,
    phase: initialValues.length > 0 ? "build" : null,
    completed: false,
  };

  if (cursor < 0 || steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = steps[index];

    if (step.type === "heapify-start") {
      frame.heapSize = step.payload.heapSize;
      frame.activeRoot = step.payload.rootIndex;
      frame.comparedPair = null;
      frame.swapPair = null;
      frame.phase = step.payload.phase;
      continue;
    }

    if (step.type === "compare") {
      frame.heapSize = step.payload.heapSize;
      frame.activeRoot = step.payload.rootIndex;
      frame.comparedPair = [step.payload.candidateIndex, step.payload.comparedIndex];
      frame.swapPair = null;
      frame.phase = step.payload.phase;
      continue;
    }

    if (step.type === "swap") {
      const leftValue = frame.values[step.payload.leftIndex];
      frame.values[step.payload.leftIndex] = frame.values[step.payload.rightIndex];
      frame.values[step.payload.rightIndex] = leftValue;

      frame.heapSize = step.payload.sortedStart;
      frame.comparedPair = [step.payload.leftIndex, step.payload.rightIndex];
      frame.swapPair = [step.payload.leftIndex, step.payload.rightIndex];
      frame.phase = step.payload.phase;
      continue;
    }

    if (step.type === "heapify-complete") {
      frame.heapSize = step.payload.heapSize;
      frame.activeRoot = null;
      frame.comparedPair = null;
      frame.swapPair = null;
      frame.phase = step.payload.phase;
      continue;
    }

    frame.heapSize = 0;
    frame.activeRoot = null;
    frame.comparedPair = null;
    frame.swapPair = null;
    frame.phase = null;
    frame.completed = step.payload.isSorted;
  }

  return frame;
}

function formatHeapSortStepLabel(step: HeapSortStepEvent): string {
  if (step.type === "heapify-start") {
    return "Heapify";
  }

  if (step.type === "compare") {
    return "Compare";
  }

  if (step.type === "swap") {
    return step.payload.reason === "extract-root" ? "Extract Max" : "Sift Swap";
  }

  if (step.type === "heapify-complete") {
    return "Heapify Done";
  }

  return "Sorted";
}

function formatHeapSortStepMessage(step: HeapSortStepEvent): string {
  if (step.type === "heapify-start") {
    return `${step.payload.phase === "build" ? "Build" : "Extract"} phase: heapify root index ${step.payload.rootIndex} with heap size ${step.payload.heapSize}.`;
  }

  if (step.type === "compare") {
    return `Compare candidate index ${step.payload.candidateIndex} (${step.payload.candidateValue}) with child index ${step.payload.comparedIndex} (${step.payload.comparedValue}).`;
  }

  if (step.type === "swap") {
    if (step.payload.reason === "extract-root") {
      return `Move current max from root to index ${step.payload.rightIndex}; sorted suffix grows from index ${step.payload.sortedStart}.`;
    }

    return `Swap index ${step.payload.leftIndex} and ${step.payload.rightIndex} to restore max-heap order.`;
  }

  if (step.type === "heapify-complete") {
    return `Heapify complete for root ${step.payload.rootIndex} with heap size ${step.payload.heapSize}.`;
  }

  return `Completed with ${step.payload.comparisons} comparisons, ${step.payload.swaps} swaps, and ${step.payload.extractions} extractions.`;
}

interface QuickSortFrame {
  values: number[];
  activeRange: [number, number] | null;
  pivotIndex: number | null;
  comparedIndex: number | null;
  storeIndex: number | null;
  swapPair: [number, number] | null;
  finalizedIndices: Set<number>;
  depth: number | null;
  completed: boolean;
}

function QuickSortVisualizer({ run, cursor }: SharedVisualizerProps) {
  const compactComplexity = getCompactCurrentComplexity("quick-sort", run);
  const typedRun =
    run && run.algorithmSlug === "quick-sort"
      ? {
          ...run,
          input: run.input as QuickSortInput,
          result: run.result as QuickSortResult,
          steps: run.steps as QuickSortStepEvent[],
        }
      : null;

  const values = typedRun?.input.values ?? [];
  const steps = typedRun?.steps ?? [];
  const activeStep = typedRun && cursor >= 0 ? typedRun.steps[cursor] : null;
  const frame = useMemo(() => deriveQuickSortFrame(values, steps, cursor), [values, steps, cursor]);
  const stepLabel = activeStep ? formatQuickSortStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep ? formatQuickSortStepMessage(activeStep) : "Press Play or Step to start execution.";

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
              Quick Sort
            </Badge>
          </div>
        </div>
        <CardDescription>
          Deterministic partition playback with pivot selection, comparisons, and recursive sub-range splits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Comparisons</p>
            <p className="font-mono text-base">{typedRun?.result.comparisons ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Swaps</p>
            <p className="font-mono text-base">{typedRun?.result.swaps ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/70 p-3">
            <p className="text-muted-foreground text-[11px] uppercase">Partitions</p>
            <p className="font-mono text-base">{typedRun?.result.partitions ?? 0}</p>
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
              const isPivot = frame.pivotIndex === index;
              const isCompared = frame.comparedIndex === index;
              const isStoreIndex = frame.storeIndex === index;
              const isSwapped =
                frame.swapPair !== null &&
                (index === frame.swapPair[0] || index === frame.swapPair[1]);
              const isFinalized = frame.completed || frame.finalizedIndices.has(index);

              return (
                <div
                  key={`${value}-${index}`}
                  className={cn(
                    "rounded-lg border p-2",
                    inActiveRange && "border-sky-300/60 bg-sky-500/10",
                    isPivot && "border-cyan-300/60 bg-cyan-500/15",
                    isCompared && "border-indigo-300/60 bg-indigo-500/15",
                    isStoreIndex && "border-violet-300/60 bg-violet-500/15",
                    isSwapped && "border-amber-300/60 bg-amber-500/20",
                    isFinalized && "border-emerald-300/60 bg-emerald-500/15",
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

function deriveQuickSortFrame(
  initialValues: number[],
  steps: QuickSortStepEvent[],
  cursor: number,
): QuickSortFrame {
  const frame: QuickSortFrame = {
    values: [...initialValues],
    activeRange: null,
    pivotIndex: null,
    comparedIndex: null,
    storeIndex: null,
    swapPair: null,
    finalizedIndices: new Set<number>(),
    depth: null,
    completed: false,
  };

  if (cursor < 0 || steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = steps[index];

    if (step.type === "pivot-set") {
      frame.activeRange = [step.payload.low, step.payload.high];
      frame.pivotIndex = step.payload.activePivotIndex;
      frame.comparedIndex = null;
      frame.storeIndex = step.payload.low;
      frame.swapPair = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "compare") {
      frame.activeRange = [step.payload.low, step.payload.high];
      frame.comparedIndex = step.payload.comparedIndex;
      frame.storeIndex = step.payload.storeIndex;
      frame.swapPair = null;
      frame.depth = step.payload.depth;
      continue;
    }

    if (step.type === "partition-swap") {
      if (!step.payload.selfSwap) {
        const leftValue = frame.values[step.payload.leftIndex];
        frame.values[step.payload.leftIndex] = frame.values[step.payload.rightIndex];
        frame.values[step.payload.rightIndex] = leftValue;
      }

      frame.activeRange = [step.payload.low, step.payload.high];
      frame.comparedIndex = null;
      frame.swapPair = [step.payload.leftIndex, step.payload.rightIndex];
      frame.depth = step.payload.depth;
      if (step.payload.reason === "pivot-place") {
        frame.pivotIndex = step.payload.leftIndex;
      }
      continue;
    }

    if (step.type === "partition-complete") {
      frame.activeRange = [step.payload.low, step.payload.high];
      frame.pivotIndex = step.payload.pivotIndex;
      frame.comparedIndex = null;
      frame.storeIndex = null;
      frame.swapPair = null;
      frame.finalizedIndices.add(step.payload.pivotIndex);
      frame.depth = step.payload.depth;
      continue;
    }

    frame.activeRange = null;
    frame.pivotIndex = null;
    frame.comparedIndex = null;
    frame.storeIndex = null;
    frame.swapPair = null;
    frame.depth = null;
    frame.completed = step.payload.isSorted;
    frame.finalizedIndices = new Set(frame.values.map((_, valueIndex) => valueIndex));
  }

  return frame;
}

function formatQuickSortStepLabel(step: QuickSortStepEvent): string {
  if (step.type === "pivot-set") {
    return "Pivot Set";
  }

  if (step.type === "compare") {
    return "Compare";
  }

  if (step.type === "partition-swap") {
    if (step.payload.reason === "pivot-move") {
      return "Move Pivot";
    }
    if (step.payload.reason === "pivot-place") {
      return "Place Pivot";
    }
    return "Partition Swap";
  }

  if (step.type === "partition-complete") {
    return "Partition Complete";
  }

  return "Sorted";
}

function formatQuickSortStepMessage(step: QuickSortStepEvent): string {
  if (step.type === "pivot-set") {
    return `Depth ${step.payload.depth}: choose pivot ${step.payload.pivotValue} using ${step.payload.strategy} strategy on range [${step.payload.low}, ${step.payload.high}]. This pivot stays fixed during this partition.`;
  }

  if (step.type === "compare") {
    return `Compare index ${step.payload.comparedIndex} (${step.payload.comparedValue}) with fixed pivot ${step.payload.pivotValue}.`;
  }

  if (step.type === "partition-swap") {
    if (step.payload.reason === "pivot-move") {
      return `Move selected pivot into active end position at index ${step.payload.rightIndex}.`;
    }

    if (step.payload.reason === "pivot-place") {
      return step.payload.selfSwap
        ? `Pivot already in final position at index ${step.payload.leftIndex}.`
        : `Place pivot into final partition index ${step.payload.leftIndex}.`;
    }

    return `Swap index ${step.payload.leftIndex} and ${step.payload.rightIndex} inside the active partition.`;
  }

  if (step.type === "partition-complete") {
    return `Partition [${step.payload.low}, ${step.payload.high}] complete around pivot ${step.payload.pivotIndex}; left size ${step.payload.leftSize}, right size ${step.payload.rightSize}.`;
  }

  return `Completed with ${step.payload.comparisons} comparisons over ${step.payload.partitions} partitions.`;
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


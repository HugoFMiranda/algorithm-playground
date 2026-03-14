"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AlgorithmRunSnapshot {
  algorithmSlug: string;
  input: unknown;
  normalizedParams: Record<string, string | number | boolean>;
  steps: unknown[];
  result: unknown;
}

interface SimpleGridRendererProps {
  algorithmName: string;
  run: AlgorithmRunSnapshot | null;
  cursor: number;
}

interface SimpleGridFrame {
  rows: number;
  cols: number;
  startCell: number;
  targetCell: number;
  blockedCells: Set<number>;
  heavyCells: Set<number>;
  visitedCells: Set<number>;
  frontierCells: Set<number>;
  forwardVisited: Set<number>;
  backwardVisited: Set<number>;
  forwardFrontier: Set<number>;
  backwardFrontier: Set<number>;
  currentCell: number | null;
  currentDirection: "forward" | "backward" | null;
  pathCells: Set<number>;
  phaseLabel: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumberSet(value: unknown): Set<number> {
  if (!Array.isArray(value)) {
    return new Set<number>();
  }

  return new Set<number>(value.filter((item): item is number => typeof item === "number"));
}

function deriveSimpleGridFrame(run: AlgorithmRunSnapshot | null, cursor: number): SimpleGridFrame {
  const input = isRecord(run?.input) ? run.input : null;
  const result = isRecord(run?.result) ? run.result : null;
  const frame: SimpleGridFrame = {
    rows: typeof input?.rows === "number" ? input.rows : 0,
    cols: typeof input?.cols === "number" ? input.cols : 0,
    startCell: typeof input?.startCell === "number" ? input.startCell : -1,
    targetCell: typeof input?.targetCell === "number" ? input.targetCell : -1,
    blockedCells: toNumberSet(input?.blockedCells),
    heavyCells: toNumberSet(input?.heavyCells),
    visitedCells: new Set<number>(),
    frontierCells: new Set<number>(),
    forwardVisited: new Set<number>(),
    backwardVisited: new Set<number>(),
    forwardFrontier: new Set<number>(),
    backwardFrontier: new Set<number>(),
    currentCell: null,
    currentDirection: null,
    pathCells: new Set<number>(),
    phaseLabel: "Ready",
  };

  if (!run || cursor < 0 || run.steps.length === 0) {
    return frame;
  }

  const boundedCursor = Math.min(cursor, run.steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = run.steps[index];
    if (!isRecord(step) || typeof step.type !== "string" || !isRecord(step.payload)) {
      continue;
    }

    const payload = step.payload;
    frame.currentCell = null;
    frame.currentDirection = null;

    if (run.algorithmSlug === "bfs") {
      if (step.type === "enqueue") {
        if (typeof payload.cell === "number") {
          frame.frontierCells.add(payload.cell);
          frame.currentCell = payload.cell;
        }
        frame.phaseLabel = "Frontier";
        continue;
      }
      if (step.type === "visit") {
        if (typeof payload.cell === "number") {
          frame.frontierCells.delete(payload.cell);
          frame.visitedCells.add(payload.cell);
          frame.currentCell = payload.cell;
        }
        frame.phaseLabel = "Visit";
        continue;
      }
      if (step.type === "inspect-neighbor") {
        if (typeof payload.to === "number") {
          frame.currentCell = payload.to;
        }
        frame.phaseLabel = "Inspect";
        continue;
      }
      if (step.type === "found") {
        frame.pathCells = toNumberSet(result?.pathCells);
        frame.phaseLabel = "Path";
        continue;
      }
      if (step.type === "not-found") {
        frame.phaseLabel = "Done";
        continue;
      }
    }

    if (run.algorithmSlug === "dfs") {
      if (step.type === "push-stack") {
        if (typeof payload.cell === "number") {
          frame.frontierCells.add(payload.cell);
          frame.currentCell = payload.cell;
        }
        frame.phaseLabel = "Stack";
        continue;
      }
      if (step.type === "visit") {
        if (typeof payload.cell === "number") {
          frame.frontierCells.delete(payload.cell);
          frame.visitedCells.add(payload.cell);
          frame.currentCell = payload.cell;
        }
        frame.phaseLabel = "Visit";
        continue;
      }
      if (step.type === "inspect-neighbor") {
        if (typeof payload.to === "number") {
          frame.currentCell = payload.to;
        }
        frame.phaseLabel = "Inspect";
        continue;
      }
      if (step.type === "backtrack") {
        if (typeof payload.to === "number" && payload.to >= 0) {
          frame.currentCell = payload.to;
        }
        frame.phaseLabel = "Backtrack";
        continue;
      }
      if (step.type === "found") {
        frame.pathCells = toNumberSet(result?.pathCells);
        frame.phaseLabel = "Path";
        continue;
      }
      if (step.type === "not-found") {
        frame.phaseLabel = "Done";
        continue;
      }
    }

    if (run.algorithmSlug === "dijkstra") {
      if (step.type === "extract-min") {
        if (typeof payload.cell === "number") {
          frame.frontierCells.delete(payload.cell);
          frame.visitedCells.add(payload.cell);
          frame.currentCell = payload.cell;
        }
        frame.phaseLabel = "Expand";
        continue;
      }
      if (step.type === "distance-update") {
        if (typeof payload.cell === "number") {
          frame.frontierCells.add(payload.cell);
          frame.currentCell = payload.cell;
        }
        frame.phaseLabel = "Update";
        continue;
      }
      if (step.type === "relax-edge") {
        if (typeof payload.to === "number") {
          frame.currentCell = payload.to;
        }
        frame.phaseLabel = "Relax";
        continue;
      }
      if (step.type === "found" || step.type === "complete") {
        frame.pathCells = toNumberSet(result?.pathCells);
        frame.phaseLabel = "Path";
        continue;
      }
      if (step.type === "not-found") {
        frame.phaseLabel = "Done";
        continue;
      }
    }

    if (run.algorithmSlug === "a-star") {
      if (step.type === "open-select") {
        if (typeof payload.cell === "number") {
          frame.frontierCells.delete(payload.cell);
          frame.visitedCells.add(payload.cell);
          frame.currentCell = payload.cell;
        }
        frame.phaseLabel = "Expand";
        continue;
      }
      if (step.type === "score-update") {
        if (typeof payload.cell === "number") {
          frame.frontierCells.add(payload.cell);
          frame.currentCell = payload.cell;
        }
        frame.phaseLabel = "Score";
        continue;
      }
      if (step.type === "inspect-neighbor") {
        if (typeof payload.to === "number") {
          frame.currentCell = payload.to;
        }
        frame.phaseLabel = "Inspect";
        continue;
      }
      if (step.type === "found" || step.type === "complete") {
        frame.pathCells = toNumberSet(result?.pathCells);
        frame.phaseLabel = "Path";
        continue;
      }
      if (step.type === "not-found") {
        frame.phaseLabel = "Done";
        continue;
      }
    }

    if (run.algorithmSlug === "bidirectional-bfs") {
      if (step.type === "enqueue-frontier") {
        if (typeof payload.cell === "number" && typeof payload.direction === "string") {
          if (payload.direction === "forward") {
            frame.forwardFrontier.add(payload.cell);
          } else {
            frame.backwardFrontier.add(payload.cell);
          }
          frame.currentCell = payload.cell;
          frame.currentDirection = payload.direction === "forward" ? "forward" : "backward";
        }
        frame.phaseLabel = "Frontier";
        continue;
      }
      if (step.type === "visit") {
        if (typeof payload.cell === "number" && typeof payload.direction === "string") {
          if (payload.direction === "forward") {
            frame.forwardFrontier.delete(payload.cell);
            frame.forwardVisited.add(payload.cell);
          } else {
            frame.backwardFrontier.delete(payload.cell);
            frame.backwardVisited.add(payload.cell);
          }
          frame.currentCell = payload.cell;
          frame.currentDirection = payload.direction === "forward" ? "forward" : "backward";
        }
        frame.phaseLabel = "Visit";
        continue;
      }
      if (step.type === "inspect-neighbor") {
        if (typeof payload.to === "number" && typeof payload.direction === "string") {
          frame.currentCell = payload.to;
          frame.currentDirection = payload.direction === "forward" ? "forward" : "backward";
        }
        frame.phaseLabel = "Inspect";
        continue;
      }
      if (step.type === "meet-detected") {
        frame.pathCells = toNumberSet(result?.pathCells);
        if (typeof payload.meetingCell === "number") {
          frame.currentCell = payload.meetingCell;
        }
        frame.phaseLabel = "Meet";
        continue;
      }
      if (step.type === "not-found") {
        frame.phaseLabel = "Done";
        continue;
      }
    }
  }

  return frame;
}

export function SimpleGridRenderer({ algorithmName, run, cursor }: SimpleGridRendererProps) {
  const frame = useMemo(() => deriveSimpleGridFrame(run, cursor), [run, cursor]);
  const totalCells = frame.rows * frame.cols;
  const totalSteps = run?.steps.length ?? 0;
  const stepProgress = totalSteps > 0 ? `${Math.max(cursor + 1, 0)} / ${totalSteps}` : "0 / 0";
  const isBidirectional = run?.algorithmSlug === "bidirectional-bfs";

  return (
    <Card className="surface-card min-h-[420px] border-border/70 lg:min-h-[620px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full border-border/70">
              Simple
            </Badge>
            <Badge variant="outline" className="rounded-full border-border/70">
              Square Canvas
            </Badge>
          </div>
        </div>
        <CardDescription>
          Abstract square-grid playback for {algorithmName}, designed for cleaner motion and faster visual parsing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="rounded-full border-border/70">
            {frame.phaseLabel}
          </Badge>
          <Badge variant="outline" className="rounded-full border-border/70 tabular-nums">
            {stepProgress}
          </Badge>
          <Badge variant="outline" className="rounded-full border-border/70">
            {frame.rows} x {frame.cols} grid
          </Badge>
          <Badge variant="outline" className="rounded-full border-border/70">
            {totalCells} cells
          </Badge>
        </div>

        <div className="rounded-2xl border border-border/70 bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.08),transparent_42%),radial-gradient(circle_at_84%_82%,rgba(245,158,11,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-4">
          <div
            className="mx-auto grid max-w-[34rem] gap-1"
            style={{ gridTemplateColumns: `repeat(${frame.cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: totalCells }, (_, cell) => {
              const isBlocked = frame.blockedCells.has(cell);
              const isHeavy = frame.heavyCells.has(cell);
              const isStart = frame.startCell === cell;
              const isTarget = frame.targetCell === cell;
              const isCurrent = frame.currentCell === cell;
              const isPath = frame.pathCells.has(cell);
              const isVisited = frame.visitedCells.has(cell);
              const isFrontier = frame.frontierCells.has(cell);
              const isForwardVisited = frame.forwardVisited.has(cell);
              const isBackwardVisited = frame.backwardVisited.has(cell);
              const isForwardFrontier = frame.forwardFrontier.has(cell);
              const isBackwardFrontier = frame.backwardFrontier.has(cell);

              return (
                <div
                  key={`simple-grid-${cell}`}
                  className={cn(
                    "aspect-square rounded-[0.45rem] border transition-colors",
                    "border-border/40 bg-background/70",
                    isBlocked && "border-slate-500/40 bg-slate-600/75",
                    isHeavy && !isBlocked && "bg-amber-500/15",
                    isVisited && "bg-sky-500/22",
                    isFrontier && "bg-cyan-400/40",
                    isPath && "bg-emerald-400/75",
                    isForwardVisited && "bg-sky-500/28",
                    isBackwardVisited && "bg-fuchsia-500/24",
                    isForwardFrontier && "bg-cyan-400/45",
                    isBackwardFrontier && "bg-pink-400/45",
                    isCurrent && "scale-[1.06] border-amber-200/80 bg-amber-400/80 shadow-[0_0_16px_rgba(245,158,11,0.28)]",
                    isStart && "border-emerald-100/90 bg-emerald-400/85",
                    isTarget && "border-rose-100/90 bg-rose-400/85",
                  )}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-emerald-400" />
            start
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-rose-400" />
            target
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-cyan-400" />
            frontier
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-sky-500" />
            visited
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-amber-400" />
            current
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-emerald-300" />
            path
          </span>
          {isBidirectional ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
                <span className="inline-block size-2 rounded-full bg-cyan-400" />
                forward wave
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
                <span className="inline-block size-2 rounded-full bg-pink-400" />
                backward wave
              </span>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

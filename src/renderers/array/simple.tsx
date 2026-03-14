"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

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

interface SimpleArrayRendererProps {
  algorithmName: string;
  run: AlgorithmRunSnapshot | null;
  cursor: number;
}

interface SimpleArrayFrame {
  values: number[];
  activeIndices: Set<number>;
  comparedIndices: Set<number>;
  sortedIndices: Set<number>;
  midpointIndex: number | null;
  searchWindow: [number, number] | null;
  targetValue: number | null;
  foundIndex: number | null;
  bucketLabels: number[];
  bucketValues: number[];
  activeBucketIndex: number | null;
  outputValues: Array<number | null>;
  activeOutputIndex: number | null;
  phaseLabel: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getInputValues(input: unknown): number[] {
  if (!isRecord(input) || !Array.isArray(input.values)) {
    return [];
  }

  return input.values.filter((value): value is number => typeof value === "number");
}

function swap(values: number[], leftIndex: number, rightIndex: number) {
  const leftValue = values[leftIndex];
  values[leftIndex] = values[rightIndex] as number;
  values[rightIndex] = leftValue as number;
}

function deriveSimpleArrayFrame(run: AlgorithmRunSnapshot | null, cursor: number): SimpleArrayFrame {
  const values = getInputValues(run?.input);
  const frame: SimpleArrayFrame = {
    values: [...values],
    activeIndices: new Set<number>(),
    comparedIndices: new Set<number>(),
    sortedIndices: new Set<number>(),
    midpointIndex: null,
    searchWindow: null,
    targetValue: null,
    foundIndex: null,
    bucketLabels: [],
    bucketValues: [],
    activeBucketIndex: null,
    outputValues: [],
    activeOutputIndex: null,
    phaseLabel: "Ready",
  };

  if (!run || cursor < 0 || run.steps.length === 0) {
    return frame;
  }

  if (run.algorithmSlug === "counting-sort" && isRecord(run.result)) {
    const minValue = typeof run.result.minValue === "number" ? run.result.minValue : 0;
    const rangeSize = typeof run.result.rangeSize === "number" ? run.result.rangeSize : 0;
    frame.bucketLabels = Array.from({ length: rangeSize }, (_, index) => minValue + index);
    frame.bucketValues = Array.from({ length: rangeSize }, () => 0);
    frame.outputValues = Array.from({ length: values.length }, () => null);
  }

  const boundedCursor = Math.min(cursor, run.steps.length - 1);
  for (let index = 0; index <= boundedCursor; index += 1) {
    const step = run.steps[index];
    if (!isRecord(step) || typeof step.type !== "string" || !isRecord(step.payload)) {
      continue;
    }

    const payload = step.payload;
    frame.activeIndices = new Set<number>();
    frame.comparedIndices = new Set<number>();
    frame.activeBucketIndex = null;
    frame.activeOutputIndex = null;

    if (run.algorithmSlug === "binary-search") {
      if (step.type === "bounds-init") {
        frame.searchWindow = [
          typeof payload.low === "number" ? payload.low : 0,
          typeof payload.high === "number" ? payload.high : values.length - 1,
        ];
        frame.phaseLabel = "Bounds";
        continue;
      }

      if (step.type === "midpoint") {
        frame.searchWindow = [
          typeof payload.low === "number" ? payload.low : 0,
          typeof payload.high === "number" ? payload.high : values.length - 1,
        ];
        frame.midpointIndex = typeof payload.mid === "number" ? payload.mid : null;
        frame.targetValue = typeof payload.target === "number" ? payload.target : null;
        if (frame.midpointIndex !== null) {
          frame.activeIndices.add(frame.midpointIndex);
        }
        frame.phaseLabel = "Midpoint";
        continue;
      }

      if (step.type === "bound-update") {
        frame.searchWindow = [
          typeof payload.low === "number" ? payload.low : 0,
          typeof payload.high === "number" ? payload.high : values.length - 1,
        ];
        frame.phaseLabel = "Narrow";
        continue;
      }

      if (step.type === "found") {
        frame.foundIndex = typeof payload.index === "number" ? payload.index : null;
        frame.midpointIndex = frame.foundIndex;
        if (frame.foundIndex !== null) {
          frame.activeIndices.add(frame.foundIndex);
        }
        frame.phaseLabel = "Found";
        continue;
      }

      if (step.type === "not-found") {
        frame.phaseLabel = "Done";
        continue;
      }
    }

    if (step.type === "compare") {
      const indices = [
        payload.leftIndex,
        payload.rightIndex,
        payload.candidateIndex,
        payload.comparedIndex,
        payload.compareIndex,
      ].filter((value): value is number => typeof value === "number");
      frame.comparedIndices = new Set<number>(indices);
      frame.activeIndices = new Set<number>(indices);
      frame.phaseLabel = "Compare";
      continue;
    }

    if (step.type === "swap" || step.type === "partition-swap") {
      if (typeof payload.leftIndex === "number" && typeof payload.rightIndex === "number") {
        swap(frame.values, payload.leftIndex, payload.rightIndex);
        frame.activeIndices = new Set<number>([payload.leftIndex, payload.rightIndex]);
      }
      frame.phaseLabel = "Swap";
      continue;
    }

    if (step.type === "candidate-min") {
      if (typeof payload.minIndex === "number") {
        frame.activeIndices = new Set<number>([payload.minIndex]);
      }
      if (typeof payload.sortedEnd === "number") {
        for (let sortedIndex = 0; sortedIndex < payload.sortedEnd; sortedIndex += 1) {
          frame.sortedIndices.add(sortedIndex);
        }
      }
      frame.phaseLabel = "Candidate";
      continue;
    }

    if (step.type === "pass-complete") {
      if (typeof payload.sortedStart === "number") {
        for (let sortedIndex = payload.sortedStart; sortedIndex < frame.values.length; sortedIndex += 1) {
          frame.sortedIndices.add(sortedIndex);
        }
      }
      if (typeof payload.sortedEnd === "number") {
        for (let sortedIndex = 0; sortedIndex <= payload.sortedEnd; sortedIndex += 1) {
          frame.sortedIndices.add(sortedIndex);
        }
      }
      frame.phaseLabel = "Pass Complete";
      continue;
    }

    if (step.type === "select-key") {
      if (typeof payload.keyIndex === "number") {
        frame.activeIndices = new Set<number>([payload.keyIndex]);
      }
      if (typeof payload.sortedEnd === "number") {
        for (let sortedIndex = 0; sortedIndex <= payload.sortedEnd; sortedIndex += 1) {
          frame.sortedIndices.add(sortedIndex);
        }
      }
      frame.phaseLabel = "Select Key";
      continue;
    }

    if (step.type === "shift-right") {
      if (typeof payload.fromIndex === "number" && typeof payload.toIndex === "number") {
        frame.values[payload.toIndex] = frame.values[payload.fromIndex] as number;
        frame.activeIndices = new Set<number>([payload.fromIndex, payload.toIndex]);
      }
      frame.phaseLabel = "Shift";
      continue;
    }

    if (step.type === "insert") {
      if (typeof payload.toIndex === "number" && typeof payload.keyValue === "number") {
        frame.values[payload.toIndex] = payload.keyValue;
        frame.activeIndices = new Set<number>([payload.toIndex]);
      }
      frame.phaseLabel = "Insert";
      continue;
    }

    if (step.type === "merge-start") {
      const indices = [payload.start, payload.mid, payload.end].filter(
        (value): value is number => typeof value === "number",
      );
      frame.activeIndices = new Set<number>(indices);
      frame.phaseLabel = "Merge";
      continue;
    }

    if (step.type === "merge-compare") {
      const indices = [payload.leftIndex, payload.rightIndex, payload.targetIndex].filter(
        (value): value is number => typeof value === "number",
      );
      frame.activeIndices = new Set<number>(indices);
      frame.comparedIndices = new Set<number>(indices);
      frame.phaseLabel = "Merge Compare";
      continue;
    }

    if (step.type === "write-back") {
      if (run.algorithmSlug === "counting-sort") {
        if (typeof payload.writeIndex === "number" && typeof payload.value === "number") {
          frame.values[payload.writeIndex] = payload.value;
          frame.activeIndices = new Set<number>([payload.writeIndex]);
        } else if (typeof payload.targetIndex === "number" && typeof payload.value === "number") {
          frame.values[payload.targetIndex] = payload.value;
          frame.activeIndices = new Set<number>([payload.targetIndex]);
        }
      } else if (typeof payload.targetIndex === "number" && typeof payload.value === "number") {
        frame.values[payload.targetIndex] = payload.value;
        frame.activeIndices = new Set<number>([payload.targetIndex]);
      }
      frame.phaseLabel = "Write";
      continue;
    }

    if (step.type === "pivot-set") {
      const indices = [payload.low, payload.high, payload.activePivotIndex].filter(
        (value): value is number => typeof value === "number",
      );
      frame.activeIndices = new Set<number>(indices);
      frame.phaseLabel = "Pivot";
      continue;
    }

    if (step.type === "partition-complete") {
      if (typeof payload.pivotIndex === "number") {
        frame.sortedIndices.add(payload.pivotIndex);
        frame.activeIndices = new Set<number>([payload.pivotIndex]);
      }
      frame.phaseLabel = "Partition";
      continue;
    }

    if (step.type === "heapify-start") {
      if (typeof payload.rootIndex === "number") {
        frame.activeIndices = new Set<number>([payload.rootIndex]);
      }
      if (typeof payload.sortedStart === "number") {
        for (let sortedIndex = payload.sortedStart; sortedIndex < frame.values.length; sortedIndex += 1) {
          frame.sortedIndices.add(sortedIndex);
        }
      }
      frame.phaseLabel = "Heapify";
      continue;
    }

    if (step.type === "heapify-complete") {
      frame.phaseLabel = "Heap Ready";
      continue;
    }

    if (step.type === "count") {
      if (typeof payload.bucketIndex === "number" && typeof payload.bucketCount === "number") {
        frame.bucketValues[payload.bucketIndex] = payload.bucketCount;
        frame.activeBucketIndex = payload.bucketIndex;
      }
      if (typeof payload.sourceIndex === "number") {
        frame.activeIndices = new Set<number>([payload.sourceIndex]);
      }
      frame.phaseLabel = "Count";
      continue;
    }

    if (step.type === "prefix-sum") {
      if (typeof payload.bucketIndex === "number" && typeof payload.runningTotal === "number") {
        frame.bucketValues[payload.bucketIndex] = payload.runningTotal;
        frame.activeBucketIndex = payload.bucketIndex;
      }
      frame.phaseLabel = "Prefix";
      continue;
    }

    if (step.type === "place") {
      if (typeof payload.outputIndex === "number" && typeof payload.value === "number") {
        frame.outputValues[payload.outputIndex] = payload.value;
        frame.activeOutputIndex = payload.outputIndex;
      }
      if (typeof payload.bucketIndex === "number" && typeof payload.remainingCount === "number") {
        frame.bucketValues[payload.bucketIndex] = payload.remainingCount;
        frame.activeBucketIndex = payload.bucketIndex;
      }
      if (typeof payload.sourceIndex === "number") {
        frame.activeIndices = new Set<number>([payload.sourceIndex]);
      }
      frame.phaseLabel = "Place";
      continue;
    }

    if (step.type === "complete") {
      frame.sortedIndices = new Set<number>(frame.values.map((_, idx) => idx));
      frame.phaseLabel = "Done";
    }
  }

  if (run.algorithmSlug !== "binary-search" && isRecord(run.result) && Array.isArray(run.result.sortedValues)) {
    if (frame.phaseLabel === "Done") {
      frame.values = run.result.sortedValues.filter((value): value is number => typeof value === "number");
    }
  }

  return frame;
}

export function SimpleArrayRenderer({ algorithmName, run, cursor }: SimpleArrayRendererProps) {
  const frame = useMemo(() => deriveSimpleArrayFrame(run, cursor), [run, cursor]);
  const values = frame.values.length > 0 ? frame.values : getInputValues(run?.input);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 1;
  const spread = Math.max(maxValue - minValue, 1);
  const totalSteps = run?.steps.length ?? 0;
  const stepProgress = totalSteps > 0 ? `${Math.max(cursor + 1, 0)} / ${totalSteps}` : "0 / 0";

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
              Bar Motion
            </Badge>
          </div>
        </div>
        <CardDescription>
          Abstract bar-based playback for {algorithmName}, tuned for clean motion and short-form readability.
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
            {values.length} bars
          </Badge>
          {frame.targetValue !== null ? (
            <p className="text-muted-foreground">Target {frame.targetValue}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border/70 bg-[radial-gradient(circle_at_18%_12%,rgba(34,197,94,0.08),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.08),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-4">
          <div className="flex h-[280px] items-end gap-2 overflow-hidden rounded-xl">
            {values.map((value, index) => {
              const normalizedHeight = 24 + ((value - minValue) / spread) * 220;
              const inWindow =
                frame.searchWindow === null ||
                (index >= frame.searchWindow[0] && index <= frame.searchWindow[1]);

              return (
                <motion.div
                  key={`simple-bar-${index}-${value}`}
                  layout
                  transition={{ type: "spring", stiffness: 240, damping: 26 }}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">{value}</span>
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 240, damping: 26 }}
                    style={{ height: normalizedHeight, opacity: inWindow ? 1 : 0.24 }}
                    className={cn(
                      "w-full rounded-t-xl border border-transparent",
                      frame.sortedIndices.has(index) && "bg-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.24)]",
                      frame.comparedIndices.has(index) && "bg-sky-400/80 shadow-[0_0_24px_rgba(56,189,248,0.24)]",
                      frame.activeIndices.has(index) && "bg-amber-400/85 shadow-[0_0_24px_rgba(245,158,11,0.28)]",
                      frame.midpointIndex === index && "border-sky-100 bg-indigo-400/85",
                      frame.foundIndex === index && "border-emerald-100 bg-emerald-400/90",
                      !frame.sortedIndices.has(index) &&
                        !frame.comparedIndices.has(index) &&
                        !frame.activeIndices.has(index) &&
                        frame.midpointIndex !== index &&
                        "bg-primary/70",
                    )}
                  />
                  <span className="text-[10px] text-muted-foreground">{index}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-amber-400" />
            active
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-sky-400" />
            compare
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
            <span className="inline-block size-2 rounded-full bg-emerald-400" />
            settled
          </span>
          {run?.algorithmSlug === "binary-search" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1">
              <span className="inline-block size-2 rounded-full bg-indigo-400" />
              midpoint / found
            </span>
          ) : null}
        </div>

        {run?.algorithmSlug === "counting-sort" && frame.bucketLabels.length > 0 ? (
          <div className="rounded-xl border border-border/70 bg-background/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Buckets</p>
            <div className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-6 xl:grid-cols-8">
              {frame.bucketLabels.map((label, index) => (
                <div
                  key={`bucket-${label}`}
                  className={cn(
                    "rounded-lg border p-2",
                    frame.activeBucketIndex === index && "border-amber-300/60 bg-amber-500/15",
                  )}
                >
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="font-mono text-sm">{frame.bucketValues[index] ?? 0}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-6 xl:grid-cols-8">
              {frame.outputValues.map((value, index) => (
                <div
                  key={`output-${index}`}
                  className={cn(
                    "rounded-lg border p-2",
                    frame.activeOutputIndex === index && "border-sky-300/60 bg-sky-500/15",
                  )}
                >
                  <p className="text-[10px] text-muted-foreground">out {index}</p>
                  <p className="font-mono text-sm">{value === null ? "?" : value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

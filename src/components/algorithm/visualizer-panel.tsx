import { Grid2x2Icon, MonitorPlayIcon, SearchIcon } from "lucide-react";

import type { BinarySearchResult, BinarySearchInput } from "@/algorithms/binary-search/spec";
import type { BinarySearchStepEvent } from "@/algorithms/binary-search/engine";
import type { AlgorithmDefinition } from "@/data/algorithms";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VisualizerPanelProps {
  algorithm: AlgorithmDefinition;
}

export function VisualizerPanel({ algorithm }: VisualizerPanelProps) {
  const run = useAppStore((state) => state.run);
  const cursor = useAppStore((state) => state.playback.cursor);

  if (algorithm.slug !== "binary-search") {
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
  const stepLabel = activeStep ? formatStepLabel(activeStep) : "Ready";
  const stepMessage = activeStep ? formatStepMessage(activeStep) : "Press Play or Step to start execution.";

  return (
    <Card className="surface-card min-h-[380px] border-border/70 lg:min-h-[520px]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Visualizer</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Binary Search
          </Badge>
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

function formatStepLabel(step: BinarySearchStepEvent): string {
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

function formatStepMessage(step: BinarySearchStepEvent): string {
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

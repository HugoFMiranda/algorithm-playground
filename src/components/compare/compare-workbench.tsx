"use client";

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Link2Icon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  ScaleIcon,
  SearchIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";

import {
  createComparisonSnapshot,
  getComparisonSharedInputProfile,
  getComparableAlgorithms,
  getDefaultComparisonPair,
  getDefaultSharedInputParams,
  getImplementedComparisonAlgorithms,
  type ComparisonAlgorithmDefinition,
  type ComparisonMetric,
  type ComparisonSnapshot,
} from "@/lib/compare";
import {
  COMPARE_PLAYBACK_MAX_SPEED,
  COMPARE_PLAYBACK_MIN_SPEED,
  COMPARE_PLAYBACK_SPEED_STEP,
  DEFAULT_COMPARE_PLAYBACK_STATE,
  normalizeComparePlaybackSpeed,
  resetComparePlayback,
  stepComparePlaybackBackward,
  stepComparePlaybackForward,
  type ComparisonPlaybackState,
} from "@/lib/compare-playback";
import { getSimpleRendererFamily, supportsSimpleRenderer } from "@/lib/renderer-mode";
import { getAlgorithmEasyExplanation } from "@/data/easy-explanations";
import { PageTransition } from "@/components/layout/page-transition";
import { ThemeToggle } from "@/components/library/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SimpleArrayRenderer } from "@/renderers/array/simple";
import { SimpleGridRenderer } from "@/renderers/grid/simple";
import { cn } from "@/lib/utils";
import type { RawParams, StepEventBase } from "@/types/engine";

const ALL_ALGORITHMS = getImplementedComparisonAlgorithms();
const DEFAULT_PAIR = getDefaultComparisonPair();

function filterAlgorithms(algorithms: ComparisonAlgorithmDefinition[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return algorithms;
  }

  return algorithms.filter((algorithm) =>
    [
      algorithm.name,
      algorithm.slug,
      algorithm.category,
      algorithm.difficulty,
      algorithm.roadmapPhase,
      algorithm.rendererFamily,
      algorithm.shortDescription,
      ...algorithm.tags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

function formatStepDelta(leftSteps: number, rightSteps: number) {
  if (leftSteps === rightSteps) {
    return "same step count";
  }

  const delta = Math.abs(leftSteps - rightSteps);
  const leader = leftSteps < rightSteps ? "Left" : "Right";
  return `${leader} uses ${delta} fewer default steps`;
}

function formatComplexityComparison(left: ComparisonSnapshot, right: ComparisonSnapshot) {
  const leftAverage = left.complexitySummary?.timeAverage ?? "Unknown";
  const rightAverage = right.complexitySummary?.timeAverage ?? "Unknown";
  const leftSpace = left.complexitySummary?.space ?? "Unknown";
  const rightSpace = right.complexitySummary?.space ?? "Unknown";

  if (leftAverage === rightAverage && leftSpace === rightSpace) {
    return `Both default runs land on ${leftAverage} time and ${leftSpace} space summaries.`;
  }

  return `${left.algorithm.name}: ${leftAverage} time / ${leftSpace} space. ${right.algorithm.name}: ${rightAverage} time / ${rightSpace} space.`;
}

function getComparisonMetricRows(left: ComparisonSnapshot, right: ComparisonSnapshot) {
  const sharedKeys = Array.from(
    new Set(
      left.metrics
        .map((metric) => metric.key)
        .filter((key) => right.metrics.some((metric) => metric.key === key)),
    ),
  );

  return sharedKeys.slice(0, 6).map((key) => {
    const leftMetric = left.metrics.find((metric) => metric.key === key) as ComparisonMetric;
    const rightMetric = right.metrics.find((metric) => metric.key === key) as ComparisonMetric;

    return {
      key,
      label: leftMetric.label,
      leftValue: leftMetric.value,
      rightValue: rightMetric.value,
      delta: leftMetric.value - rightMetric.value,
    };
  });
}

function getActiveComparisonStep(snapshot: ComparisonSnapshot | null, cursor: number): StepEventBase | null {
  if (!snapshot || cursor < 0 || snapshot.steps.length === 0) {
    return null;
  }

  return snapshot.steps[Math.min(cursor, snapshot.steps.length - 1)] ?? null;
}

function formatStepType(type: string) {
  return type
    .split(/[-_]/g)
    .filter((part) => part.length > 0)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatPayloadValue(value: StepEventBase["payload"][string]) {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function CompareWorkbench() {
  const [leftSlug, setLeftSlug] = useState(DEFAULT_PAIR[0]);
  const [rightSlug, setRightSlug] = useState(DEFAULT_PAIR[1]);
  const [leftQuery, setLeftQuery] = useState("");
  const [rightQuery, setRightQuery] = useState("");
  const [playback, setPlayback] = useState<ComparisonPlaybackState>(DEFAULT_COMPARE_PLAYBACK_STATE);
  const sharedInputProfile = getComparisonSharedInputProfile(leftSlug, rightSlug);
  const [sharedInputParams, setSharedInputParams] = useState<RawParams>(() =>
    getDefaultSharedInputParams(sharedInputProfile, DEFAULT_PAIR[0]),
  );
  const previousProfileRef = useRef(sharedInputProfile);

  useEffect(() => {
    const comparable = getComparableAlgorithms(leftSlug).filter((algorithm) => algorithm.slug !== leftSlug);

    if (!comparable.some((algorithm) => algorithm.slug === rightSlug)) {
      setRightSlug(comparable[0]?.slug ?? leftSlug);
    }
  }, [leftSlug, rightSlug]);

  useEffect(() => {
    if (previousProfileRef.current !== sharedInputProfile) {
      setSharedInputParams(getDefaultSharedInputParams(sharedInputProfile, leftSlug));
      previousProfileRef.current = sharedInputProfile;
    }
  }, [leftSlug, sharedInputProfile]);

  const leftSnapshot = createComparisonSnapshot(leftSlug, sharedInputParams);
  const rightSnapshot = createComparisonSnapshot(rightSlug, sharedInputParams);
  const comparisonRows =
    leftSnapshot && rightSnapshot ? getComparisonMetricRows(leftSnapshot, rightSnapshot) : [];
  const rightPool = getComparableAlgorithms(leftSlug).filter((algorithm) => algorithm.slug !== leftSlug);
  const filteredLeftAlgorithms = filterAlgorithms(ALL_ALGORITHMS, leftQuery);
  const filteredRightAlgorithms = filterAlgorithms(rightPool, rightQuery);
  const maxStepCount = Math.max(leftSnapshot?.steps.length ?? 0, rightSnapshot?.steps.length ?? 0);
  const leftActiveStep = getActiveComparisonStep(leftSnapshot, playback.cursor);
  const rightActiveStep = getActiveComparisonStep(rightSnapshot, playback.cursor);
  const isPlaying = playback.status === "playing";
  const canStepBackward = playback.cursor >= 0;
  const canPlay = maxStepCount > 0;

  useEffect(() => {
    setPlayback((current) => resetComparePlayback(current.speed));
  }, [leftSlug, rightSlug, sharedInputParams]);

  useEffect(() => {
    if (!canPlay || playback.status !== "playing") {
      return undefined;
    }

    const intervalMs = Math.max(40, Math.round(700 / playback.speed));
    const timer = window.setInterval(() => {
      setPlayback((current) => stepComparePlaybackForward(current, maxStepCount, { keepStatus: true }));
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [canPlay, maxStepCount, playback.speed, playback.status]);

  const handlePlayPause = () => {
    if (!canPlay) {
      return;
    }

    if (isPlaying) {
      setPlayback((current) => ({
        ...current,
        status: "paused",
      }));
      return;
    }

    if (playback.status === "completed") {
      setPlayback((current) => resetComparePlayback(current.speed));
    }

    setPlayback((current) => ({
      ...current,
      status: "playing",
    }));
  };

  const handleResetPlayback = () => {
    setPlayback((current) => resetComparePlayback(current.speed));
  };

  const handleStepForward = () => {
    if (!canPlay) {
      return;
    }

    setPlayback((current) => stepComparePlaybackForward({ ...current, status: "paused" }, maxStepCount));
  };

  const handleStepBackward = () => {
    if (!canStepBackward) {
      return;
    }

    setPlayback((current) => stepComparePlaybackBackward({ ...current, status: "paused" }));
  };

  const handleSpeedChange = (delta: number) => {
    setPlayback((current) => ({
      ...current,
      speed: normalizeComparePlaybackSpeed(current.speed + delta),
    }));
  };

  return (
    <PageTransition className="relative min-h-svh overflow-hidden bg-background pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-18rem] mx-auto h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-cyan-500/14 via-amber-400/8 to-transparent blur-3xl"
      />
      <div className="container-page relative z-10 py-6 md:py-8">
        <header className="mb-8 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Library
            </Link>
          </Button>
          <ThemeToggle />
        </header>

        <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card className="surface-card border-border/70 shadow-2xl shadow-black/[0.04]">
            <CardHeader className="space-y-4">
              <Badge variant="secondary" className="w-fit rounded-full px-2.5 py-0.5 text-[10px] uppercase">
                Compare Mode
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  Compare two algorithms side by side.
                </CardTitle>
                <CardDescription className="max-w-3xl text-sm leading-relaxed">
                  This comparison slice overlays deterministic metrics, synchronized shared inputs, and local
                  playback controls on top of the shared-family matchup, so compatible comparisons can move
                  through both runs step by step.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="surface-card border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">Comparison Rules</CardTitle>
              <CardDescription>
                Shared-family picks only. Shared inputs sync only when both algorithms expose the same safe controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                <p className="font-medium">Current pool</p>
                <p className="text-muted-foreground mt-1">
                  {rightSnapshot?.algorithm.rendererFamily ?? "Unknown"} renderer family
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                <p className="font-medium">Shared sync profile</p>
                <p className="text-muted-foreground mt-1">
                  {sharedInputProfile === "array-values"
                    ? "Array values"
                    : sharedInputProfile === "path-grid"
                      ? "Pathfinding grid"
                      : "Unavailable for this pair"}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <SharedInputsPanel
          leftSlug={leftSlug}
          rightSlug={rightSlug}
          profile={sharedInputProfile}
          params={sharedInputParams}
          onChange={setSharedInputParams}
        />

        <PlaybackParityPanel
          playback={playback}
          maxStepCount={maxStepCount}
          canPlay={canPlay}
          canStepBackward={canStepBackward}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onReset={handleResetPlayback}
          onStepBackward={handleStepBackward}
          onStepForward={handleStepForward}
          onSpeedChange={handleSpeedChange}
        />

        {leftSnapshot && rightSnapshot ? (
          <section className="mb-6 grid gap-4 xl:grid-cols-3">
            <Card className="surface-card border-border/70 xl:col-span-2">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <ScaleIcon className="size-4 text-muted-foreground" />
                  <CardTitle className="text-base">Quick Read</CardTitle>
                </div>
                <CardDescription>
                  {leftSnapshot.algorithm.name} vs {rightSnapshot.algorithm.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <SummaryStat
                  label="Step Stream"
                  value={`${leftSnapshot.stepCount} / ${rightSnapshot.stepCount}`}
                  detail={formatStepDelta(leftSnapshot.stepCount, rightSnapshot.stepCount)}
                />
                <SummaryStat
                  label="Complexity"
                  value={`${leftSnapshot.compactComplexity ?? "n/a"} / ${rightSnapshot.compactComplexity ?? "n/a"}`}
                  detail={formatComplexityComparison(leftSnapshot, rightSnapshot)}
                />
                <SummaryStat
                  label="Category"
                  value={
                    leftSnapshot.algorithm.category === rightSnapshot.algorithm.category
                      ? leftSnapshot.algorithm.category
                      : `${leftSnapshot.algorithm.category} / ${rightSnapshot.algorithm.category}`
                  }
                  detail={`${leftSnapshot.algorithm.rendererFamily} renderer family`}
                />
              </CardContent>
            </Card>

            <Card className="surface-card border-border/70">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowLeftRightIcon className="size-4 text-muted-foreground" />
                  <CardTitle className="text-base">What This Shows</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Runs are generated from the same engine registry used by the main visualizer pages.</p>
                <p>Metrics overlays expose shared observed counts like steps, comparisons, visits, edges, or nodes when both runs produce them.</p>
                <p>Shared input sync keeps compatible pairs on the same array or grid configuration.</p>
                <p>Playback parity now keeps both runs on the same cursor and speed without using the main app store.</p>
                <p>Array and pathfinding pairs now reuse the same simple renderer surfaces inside compare mode.</p>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {leftSnapshot && rightSnapshot && comparisonRows.length > 0 ? (
          <section className="mb-6">
            <Card className="surface-card border-border/70">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <ScaleIcon className="size-4 text-muted-foreground" />
                  <CardTitle className="text-base">Metrics Overlay</CardTitle>
                </div>
                <CardDescription>
                  Shared observed metrics from both synchronized runs, normalized into one comparison board.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {comparisonRows.map((row) => (
                    <div
                      key={row.key}
                      className="grid items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-4 py-3 md:grid-cols-[minmax(0,1fr)_8rem_8rem_8rem]"
                    >
                      <div>
                        <p className="text-sm font-medium">{row.label}</p>
                        <p className="text-muted-foreground text-xs">
                          Delta {row.delta === 0 ? "0" : row.delta > 0 ? `+${row.delta}` : row.delta}
                        </p>
                      </div>
                      <p className="text-sm font-semibold md:text-right">{row.leftValue}</p>
                      <div className="flex justify-center">
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase">
                          {row.delta === 0 ? "even" : row.delta > 0 ? "left +" : "right +"}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold md:text-left">{row.rightValue}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <ComparisonColumn
            title="Left Algorithm"
            query={leftQuery}
            onQueryChange={setLeftQuery}
            algorithms={filteredLeftAlgorithms}
            selectedSlug={leftSlug}
            onSelect={(slug) => setLeftSlug(slug)}
            snapshot={leftSnapshot}
            activeStep={leftActiveStep}
            playbackCursor={playback.cursor}
            accentClassName="from-cyan-500/18 via-cyan-500/8"
          />

          <ComparisonColumn
            title="Right Algorithm"
            query={rightQuery}
            onQueryChange={setRightQuery}
            algorithms={filteredRightAlgorithms}
            selectedSlug={rightSlug}
            onSelect={(slug) => setRightSlug(slug)}
            snapshot={rightSnapshot}
            activeStep={rightActiveStep}
            playbackCursor={playback.cursor}
            accentClassName="from-amber-500/18 via-amber-500/8"
          />
        </section>
      </div>
    </PageTransition>
  );
}

interface SharedInputsPanelProps {
  leftSlug: string;
  rightSlug: string;
  profile: ReturnType<typeof getComparisonSharedInputProfile>;
  params: RawParams;
  onChange: Dispatch<SetStateAction<RawParams>>;
}

function SharedInputsPanel({
  leftSlug,
  rightSlug,
  profile,
  params,
  onChange,
}: SharedInputsPanelProps) {
  return (
    <section className="mb-6">
      <Card className="surface-card border-border/70">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Link2Icon className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Shared Inputs</CardTitle>
          </div>
          <CardDescription>
            {profile
              ? `Editing this panel regenerates both ${leftSlug} and ${rightSlug} with the same synchronized input subset.`
              : "This pair does not currently share a safe synchronized input schema."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile === "array-values" ? (
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-2">
                <label htmlFor="compare-shared-array-values" className="text-xs font-medium">
                  Shared values
                </label>
                <Input
                  id="compare-shared-array-values"
                  value={typeof params.arrayValues === "string" ? params.arrayValues : ""}
                  onChange={(event) =>
                    onChange((current) => ({
                      ...current,
                      arrayValues: event.target.value,
                    }))
                  }
                  placeholder="37, 12, 29, 8, 44, 19, 3, 25"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onChange(getDefaultSharedInputParams(profile, leftSlug))}
                >
                  Reset
                </Button>
              </div>
            </div>
          ) : null}

          {profile === "path-grid" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <SharedNumberField
                  id="compare-shared-rows"
                  label="Rows"
                  value={params.rows}
                  onChange={(value) => onChange((current) => ({ ...current, rows: value }))}
                />
                <SharedNumberField
                  id="compare-shared-cols"
                  label="Cols"
                  value={params.cols}
                  onChange={(value) => onChange((current) => ({ ...current, cols: value }))}
                />
                <SharedNumberField
                  id="compare-shared-start"
                  label="Start"
                  value={params.startCell}
                  onChange={(value) => onChange((current) => ({ ...current, startCell: value }))}
                />
                <SharedNumberField
                  id="compare-shared-target"
                  label="Target"
                  value={params.targetCell}
                  onChange={(value) => onChange((current) => ({ ...current, targetCell: value }))}
                />
                <div className="space-y-2">
                  <span className="text-xs font-medium">Diagonal</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={params.allowDiagonal ? "outline" : "secondary"}
                      onClick={() => onChange((current) => ({ ...current, allowDiagonal: false }))}
                    >
                      Off
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={params.allowDiagonal ? "secondary" : "outline"}
                      onClick={() => onChange((current) => ({ ...current, allowDiagonal: true }))}
                    >
                      On
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-2">
                  <label htmlFor="compare-shared-blocked" className="text-xs font-medium">
                    Blocked cells
                  </label>
                  <Input
                    id="compare-shared-blocked"
                    value={typeof params.blockedCells === "string" ? params.blockedCells : ""}
                    onChange={(event) =>
                      onChange((current) => ({
                        ...current,
                        blockedCells: event.target.value,
                      }))
                    }
                    placeholder="10, 11, 12, 20, 28"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onChange(getDefaultSharedInputParams(profile, leftSlug))}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {!profile ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-background/60 px-4 py-5 text-sm text-muted-foreground">
              Safe synchronized inputs currently exist for array values and pathfinding grid geometry only.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

interface PlaybackParityPanelProps {
  playback: ComparisonPlaybackState;
  maxStepCount: number;
  canPlay: boolean;
  canStepBackward: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onSpeedChange: (delta: number) => void;
}

function PlaybackParityPanel({
  playback,
  maxStepCount,
  canPlay,
  canStepBackward,
  isPlaying,
  onPlayPause,
  onReset,
  onStepBackward,
  onStepForward,
  onSpeedChange,
}: PlaybackParityPanelProps) {
  const canDecreaseSpeed = playback.speed > COMPARE_PLAYBACK_MIN_SPEED + 0.001;
  const canIncreaseSpeed = playback.speed < COMPARE_PLAYBACK_MAX_SPEED - 0.001;

  return (
    <section className="mb-6">
      <Card className="surface-card border-border/70">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <PlayIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Playback Parity</CardTitle>
          </div>
          <CardDescription>
            One local playback state drives both runs with the same cursor and speed, independent from the main
            algorithm-page store.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={isPlaying ? "secondary" : "default"}
              onClick={onPlayPause}
              disabled={!canPlay}
            >
              {isPlaying ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onReset}>
              <RotateCcwIcon className="size-3.5" />
              Reset
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onStepBackward} disabled={!canStepBackward}>
              <SkipBackIcon className="size-3.5" />
              Back
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onStepForward} disabled={!canPlay}>
              <SkipForwardIcon className="size-3.5" />
              Step
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSpeedChange(-COMPARE_PLAYBACK_SPEED_STEP)}
              disabled={!canDecreaseSpeed}
            >
              - Speed
            </Button>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 tabular-nums">
              {playback.speed.toFixed(2)}x
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSpeedChange(COMPARE_PLAYBACK_SPEED_STEP)}
              disabled={!canIncreaseSpeed}
            >
              + Speed
            </Button>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 tabular-nums">
              {maxStepCount > 0 ? `${Math.max(playback.cursor + 1, 0)} / ${maxStepCount}` : "No Steps"}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 uppercase">
              {playback.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface SharedNumberFieldProps {
  id: string;
  label: string;
  value: RawParams[string];
  onChange: (value: number | string) => void;
}

function SharedNumberField({ id, label, value, onChange }: SharedNumberFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-medium">
        {label}
      </label>
      <Input
        id={id}
        value={typeof value === "number" && Number.isFinite(value) ? String(value) : ""}
        onChange={(event) => {
          const nextValue = event.target.value.trim();
          onChange(nextValue.length === 0 ? "" : Number(event.target.value));
        }}
      />
    </div>
  );
}

interface ComparisonColumnProps {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  algorithms: ComparisonAlgorithmDefinition[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  snapshot: ComparisonSnapshot | null;
  activeStep: StepEventBase | null;
  playbackCursor: number;
  accentClassName: string;
}

function ComparisonColumn({
  title,
  query,
  onQueryChange,
  algorithms,
  selectedSlug,
  onSelect,
  snapshot,
  activeStep,
  playbackCursor,
  accentClassName,
}: ComparisonColumnProps) {
  return (
    <div className="space-y-4">
      <Card className="surface-card border-border/70">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{title}</CardTitle>
            {snapshot ? (
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase">
                {snapshot.algorithm.rendererFamily}
              </Badge>
            ) : null}
          </div>
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Filter algorithms"
              className="pl-9"
              aria-label={`${title} filter`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid max-h-[18rem] gap-2 overflow-y-auto pr-1">
            {algorithms.map((algorithm) => {
              const selected = algorithm.slug === selectedSlug;

              return (
                <button
                  key={algorithm.slug}
                  type="button"
                  onClick={() => onSelect(algorithm.slug)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary/40 bg-primary/6"
                      : "border-border/70 bg-background/70 hover:bg-accent/50",
                  )}
                  aria-pressed={selected}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{algorithm.name}</p>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                        {algorithm.shortDescription}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-full px-2 py-0 text-[10px]">
                      {algorithm.difficulty}
                    </Badge>
                  </div>
                </button>
              );
            })}
            {algorithms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-background/50 px-4 py-6 text-sm text-muted-foreground">
                No algorithms match this filter.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {snapshot ? (
        <Card className="surface-card relative overflow-hidden border-border/70">
          <div
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent", accentClassName)}
          />
          <CardHeader className="relative space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase">
                {snapshot.algorithm.category}
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">
                {snapshot.algorithm.roadmapPhase}
              </Badge>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{snapshot.algorithm.name}</CardTitle>
              <CardDescription>{getAlgorithmEasyExplanation(snapshot.algorithm.slug)}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <ComparisonVisualizerCard snapshot={snapshot} playbackCursor={playbackCursor} />

            <StepInspector step={activeStep} cursor={playbackCursor} totalSteps={snapshot.steps.length} />

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard
                label="Default Steps"
                value={String(snapshot.stepCount)}
                detail="Deterministic precomputed event count"
              />
              <MetricCard
                label="Current Complexity"
                value={snapshot.compactComplexity ?? "n/a"}
                detail={snapshot.complexitySummary?.current ?? "Complexity summary unavailable"}
              />
              <MetricCard
                label="Average Time"
                value={snapshot.complexitySummary?.timeAverage ?? "Unknown"}
                detail={snapshot.complexitySummary?.details[0] ?? "No additional detail"}
              />
              <MetricCard
                label="Space"
                value={snapshot.complexitySummary?.space ?? "Unknown"}
                detail={`${Object.keys(snapshot.normalizedParams).length} normalized params`}
              />
            </div>

            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Overlay Metrics
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {snapshot.metrics.slice(0, 6).map((metric) => (
                  <MetricCard
                    key={metric.key}
                    label={metric.label}
                    value={String(metric.value)}
                    detail={getMetricDetail(snapshot, metric)}
                  />
                ))}
              </div>
            </div>

            {snapshot.complexitySummary?.details?.length ? (
              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Observed Notes
                </p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {snapshot.complexitySummary.details.slice(0, 4).map((detail) => (
                    <p key={detail}>{detail}</p>
                  ))}
                </div>
              </div>
            ) : null}

            <Button asChild variant="secondary" className="w-full justify-between">
              <Link href={`/algorithms/${snapshot.algorithm.slug}`}>
                Open full visualizer
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

interface ComparisonVisualizerCardProps {
  snapshot: ComparisonSnapshot;
  playbackCursor: number;
}

function ComparisonVisualizerCard({ snapshot, playbackCursor }: ComparisonVisualizerCardProps) {
  const simpleRendererFamily = getSimpleRendererFamily(snapshot.algorithm.slug);
  const runSnapshot = {
    algorithmSlug: snapshot.algorithm.slug,
    input: snapshot.input,
    normalizedParams: snapshot.normalizedParams,
    steps: snapshot.steps,
    result: snapshot.result,
  };

  if (supportsSimpleRenderer(snapshot.algorithm.slug) && simpleRendererFamily === "array") {
    return (
      <SimpleArrayRenderer
        algorithmName={snapshot.algorithm.name}
        run={runSnapshot}
        cursor={playbackCursor}
      />
    );
  }

  if (supportsSimpleRenderer(snapshot.algorithm.slug) && simpleRendererFamily === "grid") {
    return (
      <SimpleGridRenderer
        algorithmName={snapshot.algorithm.name}
        run={runSnapshot}
        cursor={playbackCursor}
      />
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-background/60 px-4 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase">
          Visual Fallback
        </Badge>
        <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase">
          {snapshot.algorithm.rendererFamily}
        </Badge>
      </div>
      <p className="mt-3 text-sm font-medium">Comparison visuals are currently available for simple array and grid families.</p>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
        {snapshot.algorithm.name} still exposes synchronized metrics, shared inputs when supported, and active-step payload inspection here. Graph and tree compare visuals are the next renderer-coverage target.
      </p>
    </div>
  );
}

interface StepInspectorProps {
  step: StepEventBase | null;
  cursor: number;
  totalSteps: number;
}

function StepInspector({ step, cursor, totalSteps }: StepInspectorProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Active Step</p>
          <p className="mt-1 text-base font-semibold">{step ? formatStepType(step.type) : "Not started"}</p>
        </div>
        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 tabular-nums">
          {totalSteps > 0 ? `${Math.max(cursor + 1, 0)} / ${totalSteps}` : "0 / 0"}
        </Badge>
      </div>
      {step ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {Object.entries(step.payload)
            .slice(0, 6)
            .map(([key, value]) => (
              <div key={key} className="rounded-lg border border-border/70 bg-card/70 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{key}</p>
                <p className="mt-1 text-sm font-medium">{formatPayloadValue(value)}</p>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          Start playback or step forward to inspect the synchronized event stream.
        </p>
      )}
    </div>
  );
}

interface SummaryStatProps {
  label: string;
  value: string;
  detail: string;
}

function SummaryStat({ label, value, detail }: SummaryStatProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{detail}</p>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
}

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{detail}</p>
    </div>
  );
}

function getMetricDetail(snapshot: ComparisonSnapshot, metric: ComparisonMetric) {
  const matchedDetail = snapshot.complexitySummary?.details.find((detail) =>
    detail.toLowerCase().includes(metric.label.toLowerCase()),
  );

  if (matchedDetail) {
    return matchedDetail;
  }

  if (metric.key === "steps") {
    return "Deterministic precomputed event count";
  }

  if (metric.key === "input-size" || metric.key === "grid-cells" || metric.key === "nodes") {
    return "Default input scale";
  }

  if (metric.key === "edges" || metric.key === "operations" || metric.key === "queries") {
    return "Default structure size";
  }

  return "Observed during the default deterministic run";
}

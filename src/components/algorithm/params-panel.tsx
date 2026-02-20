"use client";

import { useMemo } from "react";
import { CircleHelpIcon, ShuffleIcon, SlidersHorizontalIcon } from "lucide-react";

import { A_STAR_DEFAULT_PARAMS, createRandomAStarParams } from "@/algorithms/a-star/spec";
import {
  BINARY_SEARCH_DEFAULT_PARAMS,
  createRandomBinarySearchParams,
} from "@/algorithms/binary-search/spec";
import { BFS_DEFAULT_PARAMS, createRandomBfsParams } from "@/algorithms/bfs/spec";
import {
  BUBBLE_SORT_DEFAULT_PARAMS,
  createRandomBubbleSortParams,
} from "@/algorithms/bubble-sort/spec";
import { DFS_DEFAULT_PARAMS, createRandomDfsParams } from "@/algorithms/dfs/spec";
import {
  DIJKSTRA_DEFAULT_PARAMS,
  createRandomDijkstraParams,
} from "@/algorithms/dijkstra/spec";
import {
  INSERTION_SORT_DEFAULT_PARAMS,
  createRandomInsertionSortParams,
} from "@/algorithms/insertion-sort/spec";
import {
  MERGE_SORT_DEFAULT_PARAMS,
  createRandomMergeSortParams,
} from "@/algorithms/merge-sort/spec";
import {
  SELECTION_SORT_DEFAULT_PARAMS,
  createRandomSelectionSortParams,
} from "@/algorithms/selection-sort/spec";
import { useAppStore } from "@/store/app-store";
import type { ParamPrimitive } from "@/types/engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseWeightOverrides } from "@/lib/path-grid-edit";

interface ParamsPanelProps {
  className?: string;
}

interface AlgorithmRunSnapshot {
  algorithmSlug: string;
  input: unknown;
  normalizedParams: Record<string, ParamPrimitive>;
  result: unknown;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function getInputValues(input: unknown): number[] {
  if (typeof input !== "object" || input === null || !("values" in input)) {
    return [];
  }

  const candidate = input.values;
  return isNumberArray(candidate) ? candidate : [];
}

function getSortedResultValues(result: unknown): number[] {
  if (typeof result !== "object" || result === null || !("sortedValues" in result)) {
    return [];
  }

  const candidate = result.sortedValues;
  return isNumberArray(candidate) ? candidate : [];
}

function coerceBoolean(value: ParamPrimitive | undefined, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return fallback;
}

function InlineHelp({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground inline-flex items-center"
            aria-label="Parameter help"
          >
            <CircleHelpIcon className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64 text-[11px] leading-relaxed">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ParamsPanel({ className }: ParamsPanelProps) {
  const selectedAlgorithmSlug = useAppStore((state) => state.selectedAlgorithmSlug);
  const params = useAppStore((state) => state.params);
  const run = useAppStore((state) => state.run);
  const setParam = useAppStore((state) => state.setParam);
  const setParams = useAppStore((state) => state.setParams);
  const resetParams = useAppStore((state) => state.resetParams);

  if (selectedAlgorithmSlug === "binary-search") {
    return (
      <BinarySearchParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "bfs") {
    return (
      <BfsParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "dfs") {
    return (
      <DfsParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "dijkstra") {
    return (
      <DijkstraParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "a-star") {
    return (
      <AStarParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "bubble-sort") {
    return (
      <BubbleSortParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "selection-sort") {
    return (
      <SelectionSortParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "insertion-sort") {
    return (
      <InsertionSortParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "merge-sort") {
    return (
      <MergeSortParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="outline" className="rounded-full border-border/70">
            Placeholder
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Parameter schema and validation are enabled for Binary Search, BFS, DFS, Dijkstra, A*, Bubble Sort,
          Selection Sort, Insertion Sort, and Merge Sort in this milestone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Other algorithms keep scaffolded controls until their engines are implemented.
        </p>
      </CardContent>
    </Card>
  );
}

interface AlgorithmParamsCardProps {
  className?: string;
  params: Record<string, ParamPrimitive>;
  run: AlgorithmRunSnapshot | null;
  setParam: (key: string, value: ParamPrimitive) => void;
  setParams: (partial: Partial<Record<string, ParamPrimitive>>) => void;
  resetParams: () => void;
}

function BinarySearchParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const arrayValues = useMemo(() => {
    const value = params.arrayValues;
    return typeof value === "string" ? value : BINARY_SEARCH_DEFAULT_PARAMS.arrayValues;
  }, [params.arrayValues]);

  const target = useMemo(() => {
    const value = params.target;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(BINARY_SEARCH_DEFAULT_PARAMS.target);
  }, [params.target]);

  const handleRandomize = () => {
    const randomParams = createRandomBinarySearchParams();
    setParams({
      arrayValues: randomParams.arrayValues,
      target: randomParams.target,
    });
  };

  const normalizedTarget =
    run && run.algorithmSlug === "binary-search" && typeof run.normalizedParams.target === "number"
      ? run.normalizedParams.target
      : null;
  const normalizedValues =
    run && run.algorithmSlug === "binary-search" ? getInputValues(run.input) : [];

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Binary Search
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Provide comma-separated numeric values and a target. The engine normalizes input into a sorted
          numeric array deterministically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-array-values" className="text-xs font-medium">
            Array Values
          </label>
          <Input
            id="param-array-values"
            value={arrayValues}
            onChange={(event) => setParam("arrayValues", event.target.value)}
            placeholder={BINARY_SEARCH_DEFAULT_PARAMS.arrayValues}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="param-target" className="text-xs font-medium">
            Target
          </label>
          <Input
            id="param-target"
            type="number"
            value={target}
            onChange={(event) =>
              setParam("target", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
            }
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Target: <span className="font-mono">{normalizedTarget ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Values ({normalizedValues.length}):{" "}
            <span className="font-mono">
              {normalizedValues.length > 0 ? normalizedValues.join(", ") : "n/a"}
            </span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

function BfsParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const rows = useMemo(() => {
    const value = params.rows;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(BFS_DEFAULT_PARAMS.rows);
  }, [params.rows]);

  const cols = useMemo(() => {
    const value = params.cols;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(BFS_DEFAULT_PARAMS.cols);
  }, [params.cols]);

  const startCell = useMemo(() => {
    const value = params.startCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(BFS_DEFAULT_PARAMS.startCell);
  }, [params.startCell]);

  const targetCell = useMemo(() => {
    const value = params.targetCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(BFS_DEFAULT_PARAMS.targetCell);
  }, [params.targetCell]);

  const blockedCells = useMemo(() => {
    const value = params.blockedCells;
    return typeof value === "string" ? value : BFS_DEFAULT_PARAMS.blockedCells;
  }, [params.blockedCells]);

  const allowDiagonal = useMemo(
    () => coerceBoolean(params.allowDiagonal, BFS_DEFAULT_PARAMS.allowDiagonal),
    [params.allowDiagonal],
  );

  const normalizedInput =
    run && run.algorithmSlug === "bfs" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          rows: number;
          cols: number;
          startCell: number;
          targetCell: number;
          blockedCells: number[];
          allowDiagonal: boolean;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "bfs" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          found: boolean;
          distance: number;
          visitedCount: number;
          layers: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomBfsParams();
    setParams({
      rows: randomParams.rows,
      cols: randomParams.cols,
      startCell: randomParams.startCell,
      targetCell: randomParams.targetCell,
      blockedCells: randomParams.blockedCells,
      allowDiagonal: randomParams.allowDiagonal,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            BFS
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure a grid, optional walls, start and target cells. BFS explores shortest unweighted routes
          layer by layer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-rows" className="text-xs font-medium">
              Rows
            </label>
            <Input
              id="param-rows"
              type="number"
              value={rows}
              onChange={(event) =>
                setParam("rows", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-cols" className="text-xs font-medium">
              Columns
            </label>
            <Input
              id="param-cols"
              type="number"
              value={cols}
              onChange={(event) =>
                setParam("cols", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-start-cell" className="text-xs font-medium">
              Start Cell
            </label>
            <Input
              id="param-start-cell"
              type="number"
              value={startCell}
              onChange={(event) =>
                setParam(
                  "startCell",
                  event.target.value.trim().length === 0 ? "" : Number(event.target.value),
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-target-cell" className="text-xs font-medium">
              Target Cell
            </label>
            <Input
              id="param-target-cell"
              type="number"
              value={targetCell}
              onChange={(event) =>
                setParam(
                  "targetCell",
                  event.target.value.trim().length === 0 ? "" : Number(event.target.value),
                )
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-blocked-cells" className="text-xs font-medium">
              Blocked Cells
            </label>
            <InlineHelp text="Cells in this list are treated like walls and cannot be entered." />
          </div>
          <Input
            id="param-blocked-cells"
            value={blockedCells}
            onChange={(event) => setParam("blockedCells", event.target.value)}
            placeholder={BFS_DEFAULT_PARAMS.blockedCells}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium">Neighbor Policy</p>
            <InlineHelp text="4-direction checks up/right/down/left. 8-direction also includes diagonals." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={allowDiagonal ? "outline" : "secondary"}
              onClick={() => setParam("allowDiagonal", false)}
            >
              4-Direction
            </Button>
            <Button
              type="button"
              size="sm"
              variant={allowDiagonal ? "secondary" : "outline"}
              onClick={() => setParam("allowDiagonal", true)}
            >
              8-Direction
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Grid:{" "}
            <span className="font-mono">
              {normalizedInput ? `${normalizedInput.rows} x ${normalizedInput.cols}` : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Start / Target:{" "}
            <span className="font-mono">
              {normalizedInput ? `${normalizedInput.startCell} / ${normalizedInput.targetCell}` : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Blocked Cells:{" "}
            <span className="font-mono">
              {normalizedInput ? normalizedInput.blockedCells.length : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.found
                  ? `found in ${normalizedResult.distance} step(s), visited ${normalizedResult.visitedCount}`
                  : `not found, visited ${normalizedResult.visitedCount}`
                : "n/a"}
            </span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

function DfsParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const rows = useMemo(() => {
    const value = params.rows;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DFS_DEFAULT_PARAMS.rows);
  }, [params.rows]);

  const cols = useMemo(() => {
    const value = params.cols;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DFS_DEFAULT_PARAMS.cols);
  }, [params.cols]);

  const startCell = useMemo(() => {
    const value = params.startCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DFS_DEFAULT_PARAMS.startCell);
  }, [params.startCell]);

  const targetCell = useMemo(() => {
    const value = params.targetCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DFS_DEFAULT_PARAMS.targetCell);
  }, [params.targetCell]);

  const blockedCells = useMemo(() => {
    const value = params.blockedCells;
    return typeof value === "string" ? value : DFS_DEFAULT_PARAMS.blockedCells;
  }, [params.blockedCells]);

  const allowDiagonal = useMemo(
    () => coerceBoolean(params.allowDiagonal, DFS_DEFAULT_PARAMS.allowDiagonal),
    [params.allowDiagonal],
  );
  const preferClockwise = useMemo(
    () => coerceBoolean(params.preferClockwise, DFS_DEFAULT_PARAMS.preferClockwise),
    [params.preferClockwise],
  );

  const normalizedInput =
    run && run.algorithmSlug === "dfs" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          rows: number;
          cols: number;
          startCell: number;
          targetCell: number;
          blockedCells: number[];
          allowDiagonal: boolean;
          preferClockwise: boolean;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "dfs" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          found: boolean;
          depth: number;
          visitedCount: number;
          backtracks: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomDfsParams();
    setParams({
      rows: randomParams.rows,
      cols: randomParams.cols,
      startCell: randomParams.startCell,
      targetCell: randomParams.targetCell,
      blockedCells: randomParams.blockedCells,
      allowDiagonal: randomParams.allowDiagonal,
      preferClockwise: randomParams.preferClockwise,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            DFS
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure a grid, optional walls, start and target cells. DFS explores one branch deeply before
          backtracking.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-dfs-rows" className="text-xs font-medium">
              Rows
            </label>
            <Input
              id="param-dfs-rows"
              type="number"
              value={rows}
              onChange={(event) =>
                setParam("rows", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-dfs-cols" className="text-xs font-medium">
              Columns
            </label>
            <Input
              id="param-dfs-cols"
              type="number"
              value={cols}
              onChange={(event) =>
                setParam("cols", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-dfs-start-cell" className="text-xs font-medium">
              Start Cell
            </label>
            <Input
              id="param-dfs-start-cell"
              type="number"
              value={startCell}
              onChange={(event) =>
                setParam(
                  "startCell",
                  event.target.value.trim().length === 0 ? "" : Number(event.target.value),
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-dfs-target-cell" className="text-xs font-medium">
              Target Cell
            </label>
            <Input
              id="param-dfs-target-cell"
              type="number"
              value={targetCell}
              onChange={(event) =>
                setParam(
                  "targetCell",
                  event.target.value.trim().length === 0 ? "" : Number(event.target.value),
                )
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-dfs-blocked-cells" className="text-xs font-medium">
              Blocked Cells
            </label>
            <InlineHelp text="Blocked cells are walls. DFS will skip them and backtrack when needed." />
          </div>
          <Input
            id="param-dfs-blocked-cells"
            value={blockedCells}
            onChange={(event) => setParam("blockedCells", event.target.value)}
            placeholder={DFS_DEFAULT_PARAMS.blockedCells}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium">Neighbor Policy</p>
            <InlineHelp text="4-direction uses orthogonal moves only. 8-direction includes diagonals too." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={allowDiagonal ? "outline" : "secondary"}
              onClick={() => setParam("allowDiagonal", false)}
            >
              4-Direction
            </Button>
            <Button
              type="button"
              size="sm"
              variant={allowDiagonal ? "secondary" : "outline"}
              onClick={() => setParam("allowDiagonal", true)}
            >
              8-Direction
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preferClockwise ? "secondary" : "outline"}
              onClick={() => setParam("preferClockwise", true)}
            >
              Clockwise
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preferClockwise ? "outline" : "secondary"}
              onClick={() => setParam("preferClockwise", false)}
            >
              Counterclockwise
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Grid:{" "}
            <span className="font-mono">
              {normalizedInput ? `${normalizedInput.rows} x ${normalizedInput.cols}` : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Start / Target:{" "}
            <span className="font-mono">
              {normalizedInput ? `${normalizedInput.startCell} / ${normalizedInput.targetCell}` : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Blocked Cells:{" "}
            <span className="font-mono">
              {normalizedInput ? normalizedInput.blockedCells.length : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.found
                  ? `found at depth ${normalizedResult.depth}, backtracks ${normalizedResult.backtracks}`
                  : `not found, visited ${normalizedResult.visitedCount}`
                : "n/a"}
            </span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

function DijkstraParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const rows = useMemo(() => {
    const value = params.rows;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DIJKSTRA_DEFAULT_PARAMS.rows);
  }, [params.rows]);

  const cols = useMemo(() => {
    const value = params.cols;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DIJKSTRA_DEFAULT_PARAMS.cols);
  }, [params.cols]);

  const startCell = useMemo(() => {
    const value = params.startCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DIJKSTRA_DEFAULT_PARAMS.startCell);
  }, [params.startCell]);

  const targetCell = useMemo(() => {
    const value = params.targetCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DIJKSTRA_DEFAULT_PARAMS.targetCell);
  }, [params.targetCell]);

  const blockedCells = useMemo(() => {
    const value = params.blockedCells;
    return typeof value === "string" ? value : DIJKSTRA_DEFAULT_PARAMS.blockedCells;
  }, [params.blockedCells]);

  const heavyCells = useMemo(() => {
    const value = params.heavyCells;
    return typeof value === "string" ? value : DIJKSTRA_DEFAULT_PARAMS.heavyCells;
  }, [params.heavyCells]);

  const weightSeed = useMemo(() => {
    const value = params.weightSeed;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(DIJKSTRA_DEFAULT_PARAMS.weightSeed);
  }, [params.weightSeed]);

  const weightOverrides = useMemo(() => {
    const value = params.weightOverrides;
    return typeof value === "string" ? value : DIJKSTRA_DEFAULT_PARAMS.weightOverrides;
  }, [params.weightOverrides]);

  const allowDiagonal = useMemo(
    () => coerceBoolean(params.allowDiagonal, DIJKSTRA_DEFAULT_PARAMS.allowDiagonal),
    [params.allowDiagonal],
  );

  const normalizedInput =
    run && run.algorithmSlug === "dijkstra" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          rows: number;
          cols: number;
          startCell: number;
          targetCell: number;
          blockedCells: number[];
          heavyCells: number[];
          allowDiagonal: boolean;
          weightSeed: number;
          weightOverrides: string;
          weights: number[];
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "dijkstra" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          found: boolean;
          distance: number;
          visitedCount: number;
          relaxations: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomDijkstraParams();
    setParams({
      rows: randomParams.rows,
      cols: randomParams.cols,
      startCell: randomParams.startCell,
      targetCell: randomParams.targetCell,
      blockedCells: randomParams.blockedCells,
      heavyCells: randomParams.heavyCells,
      allowDiagonal: randomParams.allowDiagonal,
      weightSeed: randomParams.weightSeed,
      weightOverrides: randomParams.weightOverrides,
    });
  };

  const weightOverridesCount = useMemo(
    () => (normalizedInput ? parseWeightOverrides(normalizedInput.weightOverrides, normalizedInput.weights.length).size : 0),
    [normalizedInput],
  );

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Dijkstra
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure a weighted grid, optional walls and heavy zones. Dijkstra finds the lowest total-cost
          path with deterministic relaxations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-dijkstra-rows" className="text-xs font-medium">
              Rows
            </label>
            <Input
              id="param-dijkstra-rows"
              type="number"
              value={rows}
              onChange={(event) =>
                setParam("rows", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-dijkstra-cols" className="text-xs font-medium">
              Columns
            </label>
            <Input
              id="param-dijkstra-cols"
              type="number"
              value={cols}
              onChange={(event) =>
                setParam("cols", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-dijkstra-start-cell" className="text-xs font-medium">
              Start Cell
            </label>
            <Input
              id="param-dijkstra-start-cell"
              type="number"
              value={startCell}
              onChange={(event) =>
                setParam(
                  "startCell",
                  event.target.value.trim().length === 0 ? "" : Number(event.target.value),
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-dijkstra-target-cell" className="text-xs font-medium">
              Target Cell
            </label>
            <Input
              id="param-dijkstra-target-cell"
              type="number"
              value={targetCell}
              onChange={(event) =>
                setParam(
                  "targetCell",
                  event.target.value.trim().length === 0 ? "" : Number(event.target.value),
                )
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-dijkstra-blocked-cells" className="text-xs font-medium">
              Blocked Cells
            </label>
            <InlineHelp text="Blocked cells are walls and cannot be entered by the pathfinding search." />
          </div>
          <Input
            id="param-dijkstra-blocked-cells"
            value={blockedCells}
            onChange={(event) => setParam("blockedCells", event.target.value)}
            placeholder={DIJKSTRA_DEFAULT_PARAMS.blockedCells}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-dijkstra-heavy-cells" className="text-xs font-medium">
              Heavy Cells
            </label>
            <InlineHelp text="Heavy cells increase travel cost, so shortest routes may go around them." />
          </div>
          <Input
            id="param-dijkstra-heavy-cells"
            value={heavyCells}
            onChange={(event) => setParam("heavyCells", event.target.value)}
            placeholder={DIJKSTRA_DEFAULT_PARAMS.heavyCells}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-dijkstra-weight-seed" className="text-xs font-medium">
              Weight Seed
            </label>
            <InlineHelp text="Deterministic seed used to generate base cell weights before overrides." />
          </div>
          <Input
            id="param-dijkstra-weight-seed"
            type="number"
            value={weightSeed}
            onChange={(event) =>
              setParam(
                "weightSeed",
                event.target.value.trim().length === 0 ? "" : Number(event.target.value),
              )
            }
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-dijkstra-weight-overrides" className="text-xs font-medium">
              Weight Overrides
            </label>
            <InlineHelp text="Manual per-cell weights in the format cell:weight. Example: 6:12, 9:3" />
          </div>
          <Input
            id="param-dijkstra-weight-overrides"
            value={weightOverrides}
            onChange={(event) => setParam("weightOverrides", event.target.value)}
            placeholder="6:12, 9:3"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium">Neighbor Policy</p>
            <InlineHelp text="4-direction allows orthogonal movement. 8-direction also allows diagonal movement." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={allowDiagonal ? "outline" : "secondary"}
              onClick={() => setParam("allowDiagonal", false)}
            >
              4-Direction
            </Button>
            <Button
              type="button"
              size="sm"
              variant={allowDiagonal ? "secondary" : "outline"}
              onClick={() => setParam("allowDiagonal", true)}
            >
              8-Direction
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Grid:{" "}
            <span className="font-mono">
              {normalizedInput ? `${normalizedInput.rows} x ${normalizedInput.cols}` : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Start / Target:{" "}
            <span className="font-mono">
              {normalizedInput ? `${normalizedInput.startCell} / ${normalizedInput.targetCell}` : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Blocked / Heavy:{" "}
            <span className="font-mono">
              {normalizedInput
                ? `${normalizedInput.blockedCells.length} / ${normalizedInput.heavyCells.length}`
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Weight Overrides: <span className="font-mono">{normalizedInput ? weightOverridesCount : "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.found
                  ? `distance ${normalizedResult.distance}, relaxations ${normalizedResult.relaxations}`
                  : `not found, visited ${normalizedResult.visitedCount}`
                : "n/a"}
            </span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

function AStarParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const rows = useMemo(() => {
    const value = params.rows;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(A_STAR_DEFAULT_PARAMS.rows);
  }, [params.rows]);

  const cols = useMemo(() => {
    const value = params.cols;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(A_STAR_DEFAULT_PARAMS.cols);
  }, [params.cols]);

  const startCell = useMemo(() => {
    const value = params.startCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(A_STAR_DEFAULT_PARAMS.startCell);
  }, [params.startCell]);

  const targetCell = useMemo(() => {
    const value = params.targetCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(A_STAR_DEFAULT_PARAMS.targetCell);
  }, [params.targetCell]);

  const blockedCells = useMemo(() => {
    const value = params.blockedCells;
    return typeof value === "string" ? value : A_STAR_DEFAULT_PARAMS.blockedCells;
  }, [params.blockedCells]);

  const heavyCells = useMemo(() => {
    const value = params.heavyCells;
    return typeof value === "string" ? value : A_STAR_DEFAULT_PARAMS.heavyCells;
  }, [params.heavyCells]);

  const weightSeed = useMemo(() => {
    const value = params.weightSeed;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(A_STAR_DEFAULT_PARAMS.weightSeed);
  }, [params.weightSeed]);

  const weightOverrides = useMemo(() => {
    const value = params.weightOverrides;
    return typeof value === "string" ? value : A_STAR_DEFAULT_PARAMS.weightOverrides;
  }, [params.weightOverrides]);

  const heuristicWeight = useMemo(() => {
    const value = params.heuristicWeight;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(A_STAR_DEFAULT_PARAMS.heuristicWeight);
  }, [params.heuristicWeight]);

  const allowDiagonal = useMemo(
    () => coerceBoolean(params.allowDiagonal, A_STAR_DEFAULT_PARAMS.allowDiagonal),
    [params.allowDiagonal],
  );

  const normalizedInput =
    run && run.algorithmSlug === "a-star" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          rows: number;
          cols: number;
          startCell: number;
          targetCell: number;
          blockedCells: number[];
          heavyCells: number[];
          allowDiagonal: boolean;
          weightSeed: number;
          weightOverrides: string;
          heuristicWeight: number;
          weights: number[];
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "a-star" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          found: boolean;
          distance: number;
          expandedCount: number;
          relaxations: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomAStarParams();
    setParams({
      rows: randomParams.rows,
      cols: randomParams.cols,
      startCell: randomParams.startCell,
      targetCell: randomParams.targetCell,
      blockedCells: randomParams.blockedCells,
      heavyCells: randomParams.heavyCells,
      allowDiagonal: randomParams.allowDiagonal,
      weightSeed: randomParams.weightSeed,
      weightOverrides: randomParams.weightOverrides,
      heuristicWeight: randomParams.heuristicWeight,
    });
  };

  const weightOverridesCount = useMemo(
    () =>
      normalizedInput
        ? parseWeightOverrides(normalizedInput.weightOverrides, normalizedInput.weights.length).size
        : 0,
    [normalizedInput],
  );

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            A*
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure a weighted grid and heuristic priority. A* combines distance-so-far and estimated
          remaining cost to focus search toward the target.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-a-star-rows" className="text-xs font-medium">
              Rows
            </label>
            <Input
              id="param-a-star-rows"
              type="number"
              value={rows}
              onChange={(event) =>
                setParam("rows", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-a-star-cols" className="text-xs font-medium">
              Columns
            </label>
            <Input
              id="param-a-star-cols"
              type="number"
              value={cols}
              onChange={(event) =>
                setParam("cols", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-a-star-start-cell" className="text-xs font-medium">
              Start Cell
            </label>
            <Input
              id="param-a-star-start-cell"
              type="number"
              value={startCell}
              onChange={(event) =>
                setParam(
                  "startCell",
                  event.target.value.trim().length === 0 ? "" : Number(event.target.value),
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-a-star-target-cell" className="text-xs font-medium">
              Target Cell
            </label>
            <Input
              id="param-a-star-target-cell"
              type="number"
              value={targetCell}
              onChange={(event) =>
                setParam(
                  "targetCell",
                  event.target.value.trim().length === 0 ? "" : Number(event.target.value),
                )
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-a-star-blocked-cells" className="text-xs font-medium">
              Blocked Cells
            </label>
            <InlineHelp text="Blocked cells are walls and cannot be entered by the search." />
          </div>
          <Input
            id="param-a-star-blocked-cells"
            value={blockedCells}
            onChange={(event) => setParam("blockedCells", event.target.value)}
            placeholder={A_STAR_DEFAULT_PARAMS.blockedCells}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-a-star-heavy-cells" className="text-xs font-medium">
              Heavy Cells
            </label>
            <InlineHelp text="Heavy cells have increased travel cost and can shift route choices." />
          </div>
          <Input
            id="param-a-star-heavy-cells"
            value={heavyCells}
            onChange={(event) => setParam("heavyCells", event.target.value)}
            placeholder={A_STAR_DEFAULT_PARAMS.heavyCells}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-a-star-weight-seed" className="text-xs font-medium">
              Weight Seed
            </label>
            <InlineHelp text="Deterministic seed used to generate base cell weights before overrides." />
          </div>
          <Input
            id="param-a-star-weight-seed"
            type="number"
            value={weightSeed}
            onChange={(event) =>
              setParam(
                "weightSeed",
                event.target.value.trim().length === 0 ? "" : Number(event.target.value),
              )
            }
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-a-star-weight-overrides" className="text-xs font-medium">
              Weight Overrides
            </label>
            <InlineHelp text="Manual per-cell weights in the format cell:weight. Example: 6:12, 9:3" />
          </div>
          <Input
            id="param-a-star-weight-overrides"
            value={weightOverrides}
            onChange={(event) => setParam("weightOverrides", event.target.value)}
            placeholder="6:12, 9:3"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label htmlFor="param-a-star-heuristic-weight" className="text-xs font-medium">
              Heuristic Weight
            </label>
            <InlineHelp text="Controls how strongly A* prefers cells closer to target (1 keeps classic A* balance)." />
          </div>
          <Input
            id="param-a-star-heuristic-weight"
            type="number"
            step="0.1"
            value={heuristicWeight}
            onChange={(event) =>
              setParam(
                "heuristicWeight",
                event.target.value.trim().length === 0 ? "" : Number(event.target.value),
              )
            }
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium">Neighbor Policy</p>
            <InlineHelp text="4-direction allows orthogonal movement. 8-direction also allows diagonal movement." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={allowDiagonal ? "outline" : "secondary"}
              onClick={() => setParam("allowDiagonal", false)}
            >
              4-Direction
            </Button>
            <Button
              type="button"
              size="sm"
              variant={allowDiagonal ? "secondary" : "outline"}
              onClick={() => setParam("allowDiagonal", true)}
            >
              8-Direction
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Grid:{" "}
            <span className="font-mono">
              {normalizedInput ? `${normalizedInput.rows} x ${normalizedInput.cols}` : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Start / Target:{" "}
            <span className="font-mono">
              {normalizedInput ? `${normalizedInput.startCell} / ${normalizedInput.targetCell}` : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Blocked / Heavy:{" "}
            <span className="font-mono">
              {normalizedInput
                ? `${normalizedInput.blockedCells.length} / ${normalizedInput.heavyCells.length}`
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Weight Overrides: <span className="font-mono">{normalizedInput ? weightOverridesCount : "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.found
                  ? `distance ${normalizedResult.distance}, expanded ${normalizedResult.expandedCount}`
                  : `not found, expanded ${normalizedResult.expandedCount}`
                : "n/a"}
            </span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

function BubbleSortParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const arrayValues = useMemo(() => {
    const value = params.arrayValues;
    return typeof value === "string" ? value : BUBBLE_SORT_DEFAULT_PARAMS.arrayValues;
  }, [params.arrayValues]);

  const optimizeEarlyExit = useMemo(
    () => coerceBoolean(params.optimizeEarlyExit, BUBBLE_SORT_DEFAULT_PARAMS.optimizeEarlyExit),
    [params.optimizeEarlyExit],
  );

  const normalizedValues = run && run.algorithmSlug === "bubble-sort" ? getInputValues(run.input) : [];
  const normalizedOptimize =
    run && run.algorithmSlug === "bubble-sort"
      ? coerceBoolean(
          run.normalizedParams.optimizeEarlyExit,
          BUBBLE_SORT_DEFAULT_PARAMS.optimizeEarlyExit,
        )
      : null;
  const sortedValues = run && run.algorithmSlug === "bubble-sort" ? getSortedResultValues(run.result) : [];

  const handleRandomize = () => {
    const randomParams = createRandomBubbleSortParams();
    setParams({
      arrayValues: randomParams.arrayValues,
      optimizeEarlyExit: randomParams.optimizeEarlyExit,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Bubble Sort
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Provide comma-separated numeric values. Bubble Sort preserves input ordering and performs adjacent
          swaps with deterministic pass playback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-array-values" className="text-xs font-medium">
            Array Values
          </label>
          <Input
            id="param-array-values"
            value={arrayValues}
            onChange={(event) => setParam("arrayValues", event.target.value)}
            placeholder={BUBBLE_SORT_DEFAULT_PARAMS.arrayValues}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Optimization</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={optimizeEarlyExit ? "secondary" : "outline"}
              onClick={() => setParam("optimizeEarlyExit", true)}
            >
              Early Exit On
            </Button>
            <Button
              type="button"
              size="sm"
              variant={optimizeEarlyExit ? "outline" : "secondary"}
              onClick={() => setParam("optimizeEarlyExit", false)}
            >
              Early Exit Off
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Early exit: <span className="font-mono">{normalizedOptimize === null ? "n/a" : String(normalizedOptimize)}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Values ({normalizedValues.length}):{" "}
            <span className="font-mono">
              {normalizedValues.length > 0 ? normalizedValues.join(", ") : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Sorted:{" "}
            <span className="font-mono">{sortedValues.length > 0 ? sortedValues.join(", ") : "n/a"}</span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

function SelectionSortParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const arrayValues = useMemo(() => {
    const value = params.arrayValues;
    return typeof value === "string" ? value : SELECTION_SORT_DEFAULT_PARAMS.arrayValues;
  }, [params.arrayValues]);

  const swapOnlyWhenNeeded = useMemo(
    () => coerceBoolean(params.swapOnlyWhenNeeded, SELECTION_SORT_DEFAULT_PARAMS.swapOnlyWhenNeeded),
    [params.swapOnlyWhenNeeded],
  );

  const normalizedValues = run && run.algorithmSlug === "selection-sort" ? getInputValues(run.input) : [];
  const normalizedSwapOnlyWhenNeeded =
    run && run.algorithmSlug === "selection-sort"
      ? coerceBoolean(
          run.normalizedParams.swapOnlyWhenNeeded,
          SELECTION_SORT_DEFAULT_PARAMS.swapOnlyWhenNeeded,
        )
      : null;
  const sortedValues = run && run.algorithmSlug === "selection-sort" ? getSortedResultValues(run.result) : [];

  const handleRandomize = () => {
    const randomParams = createRandomSelectionSortParams();
    setParams({
      arrayValues: randomParams.arrayValues,
      swapOnlyWhenNeeded: randomParams.swapOnlyWhenNeeded,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Selection Sort
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Provide comma-separated numeric values. Selection Sort scans the unsorted suffix to pick a
          minimum candidate and then commits one swap per pass.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-array-values" className="text-xs font-medium">
            Array Values
          </label>
          <Input
            id="param-array-values"
            value={arrayValues}
            onChange={(event) => setParam("arrayValues", event.target.value)}
            placeholder={SELECTION_SORT_DEFAULT_PARAMS.arrayValues}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Swap Behavior</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={swapOnlyWhenNeeded ? "secondary" : "outline"}
              onClick={() => setParam("swapOnlyWhenNeeded", true)}
            >
              Skip Self-Swaps
            </Button>
            <Button
              type="button"
              size="sm"
              variant={swapOnlyWhenNeeded ? "outline" : "secondary"}
              onClick={() => setParam("swapOnlyWhenNeeded", false)}
            >
              Force Swaps
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Swap only when needed:{" "}
            <span className="font-mono">
              {normalizedSwapOnlyWhenNeeded === null ? "n/a" : String(normalizedSwapOnlyWhenNeeded)}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Values ({normalizedValues.length}):{" "}
            <span className="font-mono">
              {normalizedValues.length > 0 ? normalizedValues.join(", ") : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Sorted:{" "}
            <span className="font-mono">{sortedValues.length > 0 ? sortedValues.join(", ") : "n/a"}</span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

function InsertionSortParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const arrayValues = useMemo(() => {
    const value = params.arrayValues;
    return typeof value === "string" ? value : INSERTION_SORT_DEFAULT_PARAMS.arrayValues;
  }, [params.arrayValues]);

  const allowEarlyPlacement = useMemo(
    () => coerceBoolean(params.allowEarlyPlacement, INSERTION_SORT_DEFAULT_PARAMS.allowEarlyPlacement),
    [params.allowEarlyPlacement],
  );

  const normalizedValues = run && run.algorithmSlug === "insertion-sort" ? getInputValues(run.input) : [];
  const normalizedAllowEarlyPlacement =
    run && run.algorithmSlug === "insertion-sort"
      ? coerceBoolean(
          run.normalizedParams.allowEarlyPlacement,
          INSERTION_SORT_DEFAULT_PARAMS.allowEarlyPlacement,
        )
      : null;
  const sortedValues = run && run.algorithmSlug === "insertion-sort" ? getSortedResultValues(run.result) : [];

  const handleRandomize = () => {
    const randomParams = createRandomInsertionSortParams();
    setParams({
      arrayValues: randomParams.arrayValues,
      allowEarlyPlacement: randomParams.allowEarlyPlacement,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Insertion Sort
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Provide comma-separated numeric values. Insertion Sort shifts larger prefix values right and
          places the selected key at its insertion index.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-array-values" className="text-xs font-medium">
            Array Values
          </label>
          <Input
            id="param-array-values"
            value={arrayValues}
            onChange={(event) => setParam("arrayValues", event.target.value)}
            placeholder={INSERTION_SORT_DEFAULT_PARAMS.arrayValues}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Inner Loop</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={allowEarlyPlacement ? "secondary" : "outline"}
              onClick={() => setParam("allowEarlyPlacement", true)}
            >
              Break On Place
            </Button>
            <Button
              type="button"
              size="sm"
              variant={allowEarlyPlacement ? "outline" : "secondary"}
              onClick={() => setParam("allowEarlyPlacement", false)}
            >
              Scan Full Prefix
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Break on placement:{" "}
            <span className="font-mono">
              {normalizedAllowEarlyPlacement === null ? "n/a" : String(normalizedAllowEarlyPlacement)}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Values ({normalizedValues.length}):{" "}
            <span className="font-mono">
              {normalizedValues.length > 0 ? normalizedValues.join(", ") : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Sorted:{" "}
            <span className="font-mono">{sortedValues.length > 0 ? sortedValues.join(", ") : "n/a"}</span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

function MergeSortParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const arrayValues = useMemo(() => {
    const value = params.arrayValues;
    return typeof value === "string" ? value : MERGE_SORT_DEFAULT_PARAMS.arrayValues;
  }, [params.arrayValues]);

  const preferLeftOnEqual = useMemo(
    () => coerceBoolean(params.preferLeftOnEqual, MERGE_SORT_DEFAULT_PARAMS.preferLeftOnEqual),
    [params.preferLeftOnEqual],
  );

  const normalizedValues = run && run.algorithmSlug === "merge-sort" ? getInputValues(run.input) : [];
  const normalizedPreferLeftOnEqual =
    run && run.algorithmSlug === "merge-sort"
      ? coerceBoolean(
          run.normalizedParams.preferLeftOnEqual,
          MERGE_SORT_DEFAULT_PARAMS.preferLeftOnEqual,
        )
      : null;
  const sortedValues = run && run.algorithmSlug === "merge-sort" ? getSortedResultValues(run.result) : [];

  const handleRandomize = () => {
    const randomParams = createRandomMergeSortParams();
    setParams({
      arrayValues: randomParams.arrayValues,
      preferLeftOnEqual: randomParams.preferLeftOnEqual,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Merge Sort
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Provide comma-separated numeric values. Merge Sort recursively splits ranges and merges sorted
          halves back with deterministic tie handling.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-array-values" className="text-xs font-medium">
            Array Values
          </label>
          <Input
            id="param-array-values"
            value={arrayValues}
            onChange={(event) => setParam("arrayValues", event.target.value)}
            placeholder={MERGE_SORT_DEFAULT_PARAMS.arrayValues}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Tie Handling</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={preferLeftOnEqual ? "secondary" : "outline"}
              onClick={() => setParam("preferLeftOnEqual", true)}
            >
              Prefer Left
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preferLeftOnEqual ? "outline" : "secondary"}
              onClick={() => setParam("preferLeftOnEqual", false)}
            >
              Prefer Right
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetParams}>
            Reset Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRandomize}>
            <ShuffleIcon className="size-3.5" />
            Randomize
          </Button>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <p className="font-medium">Normalized Run Input</p>
          <p className="text-muted-foreground leading-relaxed">
            Prefer left on equal:{" "}
            <span className="font-mono">
              {normalizedPreferLeftOnEqual === null ? "n/a" : String(normalizedPreferLeftOnEqual)}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Values ({normalizedValues.length}):{" "}
            <span className="font-mono">
              {normalizedValues.length > 0 ? normalizedValues.join(", ") : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Sorted:{" "}
            <span className="font-mono">{sortedValues.length > 0 ? sortedValues.join(", ") : "n/a"}</span>
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Parameter changes immediately regenerate a deterministic step stream.
        </div>
      </CardContent>
    </Card>
  );
}

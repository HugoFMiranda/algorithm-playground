"use client";

import { useMemo } from "react";
import { CircleHelpIcon, ShuffleIcon, SlidersHorizontalIcon } from "lucide-react";

import { A_STAR_DEFAULT_PARAMS, createRandomAStarParams } from "@/algorithms/a-star/spec";
import {
  BINARY_SEARCH_DEFAULT_PARAMS,
  createRandomBinarySearchParams,
} from "@/algorithms/binary-search/spec";
import {
  BIDIRECTIONAL_BFS_DEFAULT_PARAMS,
  createRandomBidirectionalBfsParams,
} from "@/algorithms/bidirectional-bfs/spec";
import {
  BELLMAN_FORD_DEFAULT_PARAMS,
  createRandomBellmanFordParams,
} from "@/algorithms/bellman-ford/spec";
import { BFS_DEFAULT_PARAMS, createRandomBfsParams } from "@/algorithms/bfs/spec";
import {
  BST_OPERATIONS_DEFAULT_PARAMS,
  createRandomBstOperationsParams,
} from "@/algorithms/bst-operations/spec";
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
  HEAP_SORT_DEFAULT_PARAMS,
  createRandomHeapSortParams,
} from "@/algorithms/heap-sort/spec";
import {
  INVERT_BINARY_TREE_DEFAULT_PARAMS,
  createRandomInvertBinaryTreeParams,
} from "@/algorithms/invert-binary-tree/spec";
import {
  INSERTION_SORT_DEFAULT_PARAMS,
  createRandomInsertionSortParams,
} from "@/algorithms/insertion-sort/spec";
import {
  KRUSKAL_MST_DEFAULT_PARAMS,
  createRandomKruskalMstParams,
} from "@/algorithms/kruskal-mst/spec";
import {
  MERGE_SORT_DEFAULT_PARAMS,
  createRandomMergeSortParams,
} from "@/algorithms/merge-sort/spec";
import { PRIM_MST_DEFAULT_PARAMS, createRandomPrimMstParams } from "@/algorithms/prim-mst/spec";
import {
  QUICK_SORT_DEFAULT_PARAMS,
  createRandomQuickSortParams,
} from "@/algorithms/quick-sort/spec";
import {
  SELECTION_SORT_DEFAULT_PARAMS,
  createRandomSelectionSortParams,
} from "@/algorithms/selection-sort/spec";
import {
  TOPOLOGICAL_SORT_DEFAULT_PARAMS,
  createRandomTopologicalSortParams,
} from "@/algorithms/topological-sort/spec";
import {
  TRIE_OPERATIONS_DEFAULT_PARAMS,
  createRandomTrieOperationsParams,
} from "@/algorithms/trie-operations/spec";
import {
  UNION_FIND_DEFAULT_PARAMS,
  createRandomUnionFindParams,
} from "@/algorithms/union-find/spec";
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

function formatNullableNumberList(values: Array<number | null>): string {
  if (values.length === 0) {
    return "empty";
  }

  return values.map((value) => (value === null ? "null" : String(value))).join(", ");
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

  if (selectedAlgorithmSlug === "quick-sort") {
    return (
      <QuickSortParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "heap-sort") {
    return (
      <HeapSortParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "topological-sort") {
    return (
      <TopologicalSortParamsCard
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

  if (selectedAlgorithmSlug === "union-find") {
    return (
      <UnionFindParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "kruskal-mst") {
    return (
      <KruskalMstParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "prim-mst") {
    return (
      <PrimMstParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "bellman-ford") {
    return (
      <BellmanFordParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "bst-operations") {
    return (
      <BstOperationsParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "bidirectional-bfs") {
    return (
      <BidirectionalBfsParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "trie-operations") {
    return (
      <TrieOperationsParamsCard
        className={className}
        params={params}
        run={run}
        setParam={setParam}
        setParams={setParams}
        resetParams={resetParams}
      />
    );
  }

  if (selectedAlgorithmSlug === "invert-binary-tree") {
    return (
      <InvertBinaryTreeParamsCard
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
          Parameter schema and validation are enabled for Binary Search, BFS, Bidirectional BFS, DFS,
          Dijkstra, A*, Bubble Sort, Quick Sort, Heap Sort, Topological Sort, Union-Find, Kruskal MST,
          Prim MST, Bellman-Ford, BST Operations, Selection Sort, Insertion Sort, Merge Sort, Invert
          Binary Tree, and Trie Operations in this milestone.
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

function HeapSortParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const arrayValues = useMemo(() => {
    const value = params.arrayValues;
    return typeof value === "string" ? value : HEAP_SORT_DEFAULT_PARAMS.arrayValues;
  }, [params.arrayValues]);

  const normalizedValues = run && run.algorithmSlug === "heap-sort" ? getInputValues(run.input) : [];
  const sortedValues = run && run.algorithmSlug === "heap-sort" ? getSortedResultValues(run.result) : [];

  const normalizedResult =
    run && run.algorithmSlug === "heap-sort" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          comparisons: number;
          swaps: number;
          heapifyCalls: number;
          extractions: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomHeapSortParams();
    setParams({
      arrayValues: randomParams.arrayValues,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Heap Sort
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Provide comma-separated numeric values. Heap Sort builds a max heap, then repeatedly moves the
          largest value to the sorted suffix.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-heap-sort-array-values" className="text-xs font-medium">
            Array Values
          </label>
          <Input
            id="param-heap-sort-array-values"
            value={arrayValues}
            onChange={(event) => setParam("arrayValues", event.target.value)}
            placeholder={HEAP_SORT_DEFAULT_PARAMS.arrayValues}
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
            Values ({normalizedValues.length}):{" "}
            <span className="font-mono">
              {normalizedValues.length > 0 ? normalizedValues.join(", ") : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `comparisons ${normalizedResult.comparisons}, swaps ${normalizedResult.swaps}, heapify calls ${normalizedResult.heapifyCalls}`
                : "n/a"}
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

function TopologicalSortParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const nodeCount = useMemo(() => {
    const value = params.nodeCount;
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "string") {
      return value;
    }

    return String(TOPOLOGICAL_SORT_DEFAULT_PARAMS.nodeCount);
  }, [params.nodeCount]);

  const edges = useMemo(() => {
    const value = params.edges;
    return typeof value === "string" ? value : TOPOLOGICAL_SORT_DEFAULT_PARAMS.edges;
  }, [params.edges]);

  const preferLowerIndex = useMemo(
    () => coerceBoolean(params.preferLowerIndex, TOPOLOGICAL_SORT_DEFAULT_PARAMS.preferLowerIndex),
    [params.preferLowerIndex],
  );

  const normalizedInput =
    run && run.algorithmSlug === "topological-sort" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          nodeCount: number;
          edges: Array<readonly [number, number]>;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "topological-sort" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          order: number[];
          cycleDetected: boolean;
          remainingCount: number;
          edgeRelaxations: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomTopologicalSortParams();
    setParams({
      nodeCount: randomParams.nodeCount,
      edges: randomParams.edges,
      preferLowerIndex: randomParams.preferLowerIndex,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Topological Sort
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure a directed graph with node count and edges. Kahn&apos;s algorithm outputs valid dependency
          order when no cycle exists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-topological-node-count" className="text-xs font-medium">
            Node Count
          </label>
          <Input
            id="param-topological-node-count"
            type="number"
            min={2}
            max={16}
            step={1}
            value={nodeCount}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setParam("nodeCount", Number.isFinite(parsed) ? parsed : event.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-topological-edges" className="text-xs font-medium">
              Directed Edges
            </label>
            <InlineHelp text="Use formats like 0>1, 0>2, 2>4. Invalid or out-of-range edges are ignored." />
          </div>
          <Input
            id="param-topological-edges"
            value={edges}
            onChange={(event) => setParam("edges", event.target.value)}
            placeholder={TOPOLOGICAL_SORT_DEFAULT_PARAMS.edges}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Zero-Indegree Priority</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={preferLowerIndex ? "secondary" : "outline"}
              onClick={() => setParam("preferLowerIndex", true)}
            >
              Lower Index First
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preferLowerIndex ? "outline" : "secondary"}
              onClick={() => setParam("preferLowerIndex", false)}
            >
              Higher Index First
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
            Node count: <span className="font-mono">{normalizedInput?.nodeCount ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Edge count: <span className="font-mono">{normalizedInput?.edges.length ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Output order:{" "}
            <span className="font-mono">
              {normalizedResult ? normalizedResult.order.join(", ") : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Cycle detected:{" "}
            <span className="font-mono">
              {normalizedResult ? String(normalizedResult.cycleDetected) : "n/a"}
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

function UnionFindParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const nodeCount = useMemo(() => {
    const value = params.nodeCount;
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(UNION_FIND_DEFAULT_PARAMS.nodeCount);
  }, [params.nodeCount]);

  const operations = useMemo(() => {
    const value = params.operations;
    return typeof value === "string" ? value : UNION_FIND_DEFAULT_PARAMS.operations;
  }, [params.operations]);

  const pathCompression = useMemo(
    () => coerceBoolean(params.pathCompression, UNION_FIND_DEFAULT_PARAMS.pathCompression),
    [params.pathCompression],
  );
  const unionByRank = useMemo(
    () => coerceBoolean(params.unionByRank, UNION_FIND_DEFAULT_PARAMS.unionByRank),
    [params.unionByRank],
  );

  const normalizedInput =
    run && run.algorithmSlug === "union-find" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          nodeCount: number;
          operations: Array<{ type: string; left: number; right: number | null }>;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "union-find" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          componentCount: number;
          successfulUnions: number;
          findQueries: number;
          connectedQueries: number;
          parents: number[];
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomUnionFindParams();
    setParams({
      nodeCount: randomParams.nodeCount,
      operations: randomParams.operations,
      pathCompression: randomParams.pathCompression,
      unionByRank: randomParams.unionByRank,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Union-Find
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure disjoint-set size and operation script. Supported operations are{" "}
          <span className="font-mono">union a b</span>, <span className="font-mono">find a</span>, and{" "}
          <span className="font-mono">connected a b</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-union-find-node-count" className="text-xs font-medium">
            Node Count
          </label>
          <Input
            id="param-union-find-node-count"
            type="number"
            min={2}
            max={24}
            step={1}
            value={nodeCount}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setParam("nodeCount", Number.isFinite(parsed) ? parsed : event.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-union-find-operations" className="text-xs font-medium">
              Operation Script
            </label>
            <InlineHelp text="Comma-separated operations, e.g. union 0 1, find 1, connected 1 2." />
          </div>
          <Input
            id="param-union-find-operations"
            value={operations}
            onChange={(event) => setParam("operations", event.target.value)}
            placeholder={UNION_FIND_DEFAULT_PARAMS.operations}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Optimization Settings</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={pathCompression ? "secondary" : "outline"}
              onClick={() => setParam("pathCompression", !pathCompression)}
            >
              {pathCompression ? "Path Compression On" : "Path Compression Off"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={unionByRank ? "secondary" : "outline"}
              onClick={() => setParam("unionByRank", !unionByRank)}
            >
              {unionByRank ? "Union By Rank On" : "Union By Rank Off"}
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
            Node count: <span className="font-mono">{normalizedInput?.nodeCount ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Operation count: <span className="font-mono">{normalizedInput?.operations.length ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `components ${normalizedResult.componentCount}, unions ${normalizedResult.successfulUnions}, finds ${normalizedResult.findQueries}, connected ${normalizedResult.connectedQueries}`
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Parents:{" "}
            <span className="font-mono">
              {normalizedResult ? normalizedResult.parents.join(", ") : "n/a"}
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

function KruskalMstParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const nodeCount = useMemo(() => {
    const value = params.nodeCount;
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "string") {
      return value;
    }
    return String(KRUSKAL_MST_DEFAULT_PARAMS.nodeCount);
  }, [params.nodeCount]);

  const edges = useMemo(() => {
    const value = params.edges;
    return typeof value === "string" ? value : KRUSKAL_MST_DEFAULT_PARAMS.edges;
  }, [params.edges]);

  const preferLowerIndex = useMemo(
    () => coerceBoolean(params.preferLowerIndex, KRUSKAL_MST_DEFAULT_PARAMS.preferLowerIndex),
    [params.preferLowerIndex],
  );
  const pathCompression = useMemo(
    () => coerceBoolean(params.pathCompression, KRUSKAL_MST_DEFAULT_PARAMS.pathCompression),
    [params.pathCompression],
  );
  const unionByRank = useMemo(
    () => coerceBoolean(params.unionByRank, KRUSKAL_MST_DEFAULT_PARAMS.unionByRank),
    [params.unionByRank],
  );

  const normalizedInput =
    run && run.algorithmSlug === "kruskal-mst" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          nodeCount: number;
          edges: Array<{ from: number; to: number; weight: number }>;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "kruskal-mst" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          totalWeight: number;
          edgesAccepted: number;
          edgesConsidered: number;
          cycleSkips: number;
          connected: boolean;
          mstEdges: Array<{ from: number; to: number; weight: number }>;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomKruskalMstParams();
    setParams({
      nodeCount: randomParams.nodeCount,
      edges: randomParams.edges,
      preferLowerIndex: randomParams.preferLowerIndex,
      pathCompression: randomParams.pathCompression,
      unionByRank: randomParams.unionByRank,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Kruskal MST
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure an undirected weighted graph and union policy controls. Edge format supports{" "}
          <span className="font-mono">u-v:w</span> (example: <span className="font-mono">0-1:4</span>).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-kruskal-node-count" className="text-xs font-medium">
            Node Count
          </label>
          <Input
            id="param-kruskal-node-count"
            type="number"
            min={2}
            max={18}
            step={1}
            value={nodeCount}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setParam("nodeCount", Number.isFinite(parsed) ? parsed : event.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-kruskal-edges" className="text-xs font-medium">
              Weighted Edges
            </label>
            <InlineHelp text="Use comma-separated edges like 0-1:4, 1-2:3. Out-of-range and invalid edges are ignored." />
          </div>
          <Input
            id="param-kruskal-edges"
            value={edges}
            onChange={(event) => setParam("edges", event.target.value)}
            placeholder={KRUSKAL_MST_DEFAULT_PARAMS.edges}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Tie-Break Ordering</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={preferLowerIndex ? "secondary" : "outline"}
              onClick={() => setParam("preferLowerIndex", true)}
            >
              Lower Index First
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preferLowerIndex ? "outline" : "secondary"}
              onClick={() => setParam("preferLowerIndex", false)}
            >
              Higher Index First
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Union Settings</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={pathCompression ? "secondary" : "outline"}
              onClick={() => setParam("pathCompression", !pathCompression)}
            >
              {pathCompression ? "Path Compression On" : "Path Compression Off"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={unionByRank ? "secondary" : "outline"}
              onClick={() => setParam("unionByRank", !unionByRank)}
            >
              {unionByRank ? "Union By Rank On" : "Union By Rank Off"}
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
            Node count: <span className="font-mono">{normalizedInput?.nodeCount ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Edge count: <span className="font-mono">{normalizedInput?.edges.length ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `accepted ${normalizedResult.edgesAccepted}, considered ${normalizedResult.edgesConsidered}, cycle skips ${normalizedResult.cycleSkips}, weight ${normalizedResult.totalWeight}`
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Connected: <span className="font-mono">{normalizedResult ? String(normalizedResult.connected) : "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            MST edges:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.mstEdges.map((edge) => `${edge.from}-${edge.to}:${edge.weight}`).join(", ")
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

function PrimMstParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const nodeCount = useMemo(() => {
    const value = params.nodeCount;
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "string") {
      return value;
    }
    return String(PRIM_MST_DEFAULT_PARAMS.nodeCount);
  }, [params.nodeCount]);

  const edges = useMemo(() => {
    const value = params.edges;
    return typeof value === "string" ? value : PRIM_MST_DEFAULT_PARAMS.edges;
  }, [params.edges]);

  const startNode = useMemo(() => {
    const value = params.startNode;
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "string") {
      return value;
    }
    return String(PRIM_MST_DEFAULT_PARAMS.startNode);
  }, [params.startNode]);

  const preferLowerIndex = useMemo(
    () => coerceBoolean(params.preferLowerIndex, PRIM_MST_DEFAULT_PARAMS.preferLowerIndex),
    [params.preferLowerIndex],
  );

  const normalizedInput =
    run && run.algorithmSlug === "prim-mst" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          nodeCount: number;
          startNode: number;
          edges: Array<{ from: number; to: number; weight: number }>;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "prim-mst" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          totalWeight: number;
          visitedCount: number;
          components: number;
          connected: boolean;
          edgeLocks: number;
          selectedEdges: Array<{ from: number; to: number; weight: number }>;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomPrimMstParams();
    setParams({
      nodeCount: randomParams.nodeCount,
      edges: randomParams.edges,
      startNode: randomParams.startNode,
      preferLowerIndex: randomParams.preferLowerIndex,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Prim MST
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure an undirected weighted graph and a deterministic start node. Prim grows a tree by
          repeatedly locking the cheapest frontier edge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-prim-node-count" className="text-xs font-medium">
            Node Count
          </label>
          <Input
            id="param-prim-node-count"
            type="number"
            min={2}
            max={18}
            step={1}
            value={nodeCount}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setParam("nodeCount", Number.isFinite(parsed) ? parsed : event.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="param-prim-start-node" className="text-xs font-medium">
            Start Node
          </label>
          <Input
            id="param-prim-start-node"
            type="number"
            min={0}
            value={startNode}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setParam("startNode", Number.isFinite(parsed) ? parsed : event.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-prim-edges" className="text-xs font-medium">
              Weighted Edges
            </label>
            <InlineHelp text="Use comma-separated edges like 0-1:4, 1-2:3. Out-of-range and invalid edges are ignored." />
          </div>
          <Input
            id="param-prim-edges"
            value={edges}
            onChange={(event) => setParam("edges", event.target.value)}
            placeholder={PRIM_MST_DEFAULT_PARAMS.edges}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Tie-Break Ordering</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={preferLowerIndex ? "secondary" : "outline"}
              onClick={() => setParam("preferLowerIndex", true)}
            >
              Lower Index First
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preferLowerIndex ? "outline" : "secondary"}
              onClick={() => setParam("preferLowerIndex", false)}
            >
              Higher Index First
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
            Node count: <span className="font-mono">{normalizedInput?.nodeCount ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Start node: <span className="font-mono">{normalizedInput?.startNode ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Edge count: <span className="font-mono">{normalizedInput?.edges.length ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `locked edges ${normalizedResult.edgeLocks}, visited ${normalizedResult.visitedCount}, components ${normalizedResult.components}, weight ${normalizedResult.totalWeight}`
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Connected: <span className="font-mono">{normalizedResult ? String(normalizedResult.connected) : "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Selected edges:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.selectedEdges
                    .map((edge) => `${edge.from}-${edge.to}:${edge.weight}`)
                    .join(", ")
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

function BellmanFordParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const nodeCount = useMemo(() => {
    const value = params.nodeCount;
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "string") {
      return value;
    }
    return String(BELLMAN_FORD_DEFAULT_PARAMS.nodeCount);
  }, [params.nodeCount]);

  const edges = useMemo(() => {
    const value = params.edges;
    return typeof value === "string" ? value : BELLMAN_FORD_DEFAULT_PARAMS.edges;
  }, [params.edges]);

  const startNode = useMemo(() => {
    const value = params.startNode;
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "string") {
      return value;
    }
    return String(BELLMAN_FORD_DEFAULT_PARAMS.startNode);
  }, [params.startNode]);

  const stopEarlyWhenStable = useMemo(
    () => coerceBoolean(params.stopEarlyWhenStable, BELLMAN_FORD_DEFAULT_PARAMS.stopEarlyWhenStable),
    [params.stopEarlyWhenStable],
  );
  const preferLowerIndex = useMemo(
    () => coerceBoolean(params.preferLowerIndex, BELLMAN_FORD_DEFAULT_PARAMS.preferLowerIndex),
    [params.preferLowerIndex],
  );

  const normalizedInput =
    run && run.algorithmSlug === "bellman-ford" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          nodeCount: number;
          startNode: number;
          edges: Array<{ from: number; to: number; weight: number }>;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "bellman-ford" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          distances: number[];
          roundsExecuted: number;
          relaxations: number;
          reachableCount: number;
          negativeCycle: boolean;
          cycleEdge: { from: number; to: number; weight: number } | null;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomBellmanFordParams();
    setParams({
      nodeCount: randomParams.nodeCount,
      edges: randomParams.edges,
      startNode: randomParams.startNode,
      stopEarlyWhenStable: randomParams.stopEarlyWhenStable,
      preferLowerIndex: randomParams.preferLowerIndex,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Bellman-Ford
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure a directed weighted graph. Edge format supports <span className="font-mono">u&gt;v:w</span>,
          including negative weights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-bellman-node-count" className="text-xs font-medium">
            Node Count
          </label>
          <Input
            id="param-bellman-node-count"
            type="number"
            min={2}
            max={18}
            step={1}
            value={nodeCount}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setParam("nodeCount", Number.isFinite(parsed) ? parsed : event.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="param-bellman-start-node" className="text-xs font-medium">
            Start Node
          </label>
          <Input
            id="param-bellman-start-node"
            type="number"
            min={0}
            value={startNode}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setParam("startNode", Number.isFinite(parsed) ? parsed : event.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-bellman-edges" className="text-xs font-medium">
              Directed Weighted Edges
            </label>
            <InlineHelp text="Use comma-separated edges like 0>1:6, 1>4:-4. Duplicate directions keep the lowest weight." />
          </div>
          <Input
            id="param-bellman-edges"
            value={edges}
            onChange={(event) => setParam("edges", event.target.value)}
            placeholder={BELLMAN_FORD_DEFAULT_PARAMS.edges}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Round Control</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={stopEarlyWhenStable ? "secondary" : "outline"}
              onClick={() => setParam("stopEarlyWhenStable", true)}
            >
              Stop When Stable
            </Button>
            <Button
              type="button"
              size="sm"
              variant={stopEarlyWhenStable ? "outline" : "secondary"}
              onClick={() => setParam("stopEarlyWhenStable", false)}
            >
              Run Full Passes
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Edge Ordering</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={preferLowerIndex ? "secondary" : "outline"}
              onClick={() => setParam("preferLowerIndex", true)}
            >
              Lower Index First
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preferLowerIndex ? "outline" : "secondary"}
              onClick={() => setParam("preferLowerIndex", false)}
            >
              Higher Index First
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
            Node count: <span className="font-mono">{normalizedInput?.nodeCount ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Start node: <span className="font-mono">{normalizedInput?.startNode ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Edge count: <span className="font-mono">{normalizedInput?.edges.length ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `rounds ${normalizedResult.roundsExecuted}, relaxations ${normalizedResult.relaxations}, reachable ${normalizedResult.reachableCount}`
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Negative cycle:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.negativeCycle
                  ? normalizedResult.cycleEdge
                    ? `${normalizedResult.cycleEdge.from}>${normalizedResult.cycleEdge.to}:${normalizedResult.cycleEdge.weight}`
                    : "detected"
                  : "none"
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Distances:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.distances
                    .map((distance) => (Number.isFinite(distance) ? String(distance) : "inf"))
                    .join(", ")
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

function BidirectionalBfsParamsCard({
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

    return String(BIDIRECTIONAL_BFS_DEFAULT_PARAMS.rows);
  }, [params.rows]);

  const cols = useMemo(() => {
    const value = params.cols;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(BIDIRECTIONAL_BFS_DEFAULT_PARAMS.cols);
  }, [params.cols]);

  const startCell = useMemo(() => {
    const value = params.startCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(BIDIRECTIONAL_BFS_DEFAULT_PARAMS.startCell);
  }, [params.startCell]);

  const targetCell = useMemo(() => {
    const value = params.targetCell;
    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "string") {
      return value;
    }

    return String(BIDIRECTIONAL_BFS_DEFAULT_PARAMS.targetCell);
  }, [params.targetCell]);

  const blockedCells = useMemo(() => {
    const value = params.blockedCells;
    return typeof value === "string" ? value : BIDIRECTIONAL_BFS_DEFAULT_PARAMS.blockedCells;
  }, [params.blockedCells]);

  const allowDiagonal = useMemo(
    () => coerceBoolean(params.allowDiagonal, BIDIRECTIONAL_BFS_DEFAULT_PARAMS.allowDiagonal),
    [params.allowDiagonal],
  );
  const expandSmallerFrontier = useMemo(
    () =>
      coerceBoolean(
        params.expandSmallerFrontier,
        BIDIRECTIONAL_BFS_DEFAULT_PARAMS.expandSmallerFrontier,
      ),
    [params.expandSmallerFrontier],
  );
  const preferForwardOnTie = useMemo(
    () => coerceBoolean(params.preferForwardOnTie, BIDIRECTIONAL_BFS_DEFAULT_PARAMS.preferForwardOnTie),
    [params.preferForwardOnTie],
  );

  const normalizedInput =
    run &&
    run.algorithmSlug === "bidirectional-bfs" &&
    typeof run.input === "object" &&
    run.input !== null
      ? (run.input as {
          rows: number;
          cols: number;
          startCell: number;
          targetCell: number;
          blockedCells: number[];
          allowDiagonal: boolean;
          expandSmallerFrontier: boolean;
          preferForwardOnTie: boolean;
        })
      : null;

  const normalizedResult =
    run &&
    run.algorithmSlug === "bidirectional-bfs" &&
    typeof run.result === "object" &&
    run.result !== null
      ? (run.result as {
          found: boolean;
          distance: number;
          visitedCount: number;
          forwardVisitedCount: number;
          backwardVisitedCount: number;
          meetingCell: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomBidirectionalBfsParams();
    setParams({
      rows: randomParams.rows,
      cols: randomParams.cols,
      startCell: randomParams.startCell,
      targetCell: randomParams.targetCell,
      blockedCells: randomParams.blockedCells,
      allowDiagonal: randomParams.allowDiagonal,
      expandSmallerFrontier: randomParams.expandSmallerFrontier,
      preferForwardOnTie: randomParams.preferForwardOnTie,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Bidirectional BFS
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure a grid, optional walls, and two-frontier scheduling rules. Bidirectional BFS grows
          search waves from both ends until they meet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="param-bidirectional-rows" className="text-xs font-medium">
              Rows
            </label>
            <Input
              id="param-bidirectional-rows"
              type="number"
              value={rows}
              onChange={(event) =>
                setParam("rows", event.target.value.trim().length === 0 ? "" : Number(event.target.value))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="param-bidirectional-cols" className="text-xs font-medium">
              Columns
            </label>
            <Input
              id="param-bidirectional-cols"
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
            <label htmlFor="param-bidirectional-start-cell" className="text-xs font-medium">
              Start Cell
            </label>
            <Input
              id="param-bidirectional-start-cell"
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
            <label htmlFor="param-bidirectional-target-cell" className="text-xs font-medium">
              Target Cell
            </label>
            <Input
              id="param-bidirectional-target-cell"
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
            <label htmlFor="param-bidirectional-blocked-cells" className="text-xs font-medium">
              Blocked Cells
            </label>
            <InlineHelp text="Blocked cells are removed from both search frontiers and cannot be crossed." />
          </div>
          <Input
            id="param-bidirectional-blocked-cells"
            value={blockedCells}
            onChange={(event) => setParam("blockedCells", event.target.value)}
            placeholder={BIDIRECTIONAL_BFS_DEFAULT_PARAMS.blockedCells}
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
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium">Frontier Scheduling</p>
            <InlineHelp text="Smaller-frontier mode expands whichever side currently has fewer queued cells." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={expandSmallerFrontier ? "secondary" : "outline"}
              onClick={() => setParam("expandSmallerFrontier", true)}
            >
              Smaller Frontier
            </Button>
            <Button
              type="button"
              size="sm"
              variant={expandSmallerFrontier ? "outline" : "secondary"}
              onClick={() => setParam("expandSmallerFrontier", false)}
            >
              Fixed Side
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium">Tie Policy</p>
            <InlineHelp text="Controls which side expands first when both frontiers are the same size." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={preferForwardOnTie ? "secondary" : "outline"}
              onClick={() => setParam("preferForwardOnTie", true)}
            >
              Prefer Forward
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preferForwardOnTie ? "outline" : "secondary"}
              onClick={() => setParam("preferForwardOnTie", false)}
            >
              Prefer Backward
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
            Strategy:{" "}
            <span className="font-mono">
              {normalizedInput
                ? `${normalizedInput.expandSmallerFrontier ? "smaller-frontier" : "fixed"} / ${normalizedInput.preferForwardOnTie ? "forward-tie" : "backward-tie"}`
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result:{" "}
            <span className="font-mono">
              {normalizedResult
                ? normalizedResult.found
                  ? `found in ${normalizedResult.distance} step(s), meet ${normalizedResult.meetingCell}, visited ${normalizedResult.visitedCount}`
                  : `not found, visited ${normalizedResult.visitedCount}`
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Frontier visits:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `${normalizedResult.forwardVisitedCount} / ${normalizedResult.backwardVisitedCount}`
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

function TrieOperationsParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const words = useMemo(() => {
    const value = params.words;
    return typeof value === "string" ? value : TRIE_OPERATIONS_DEFAULT_PARAMS.words;
  }, [params.words]);

  const queries = useMemo(() => {
    const value = params.queries;
    return typeof value === "string" ? value : TRIE_OPERATIONS_DEFAULT_PARAMS.queries;
  }, [params.queries]);

  const caseSensitive = useMemo(
    () => coerceBoolean(params.caseSensitive, TRIE_OPERATIONS_DEFAULT_PARAMS.caseSensitive),
    [params.caseSensitive],
  );

  const normalizedInput =
    run && run.algorithmSlug === "trie-operations" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          words: string[];
          queries: Array<{ type: "search" | "prefix"; term: string }>;
          caseSensitive: boolean;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "trie-operations" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          createdNodes: number;
          terminalNodes: number;
          wordsInserted: number;
          queryCount: number;
          searchHits: number;
          prefixHits: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomTrieOperationsParams();
    setParams({
      words: randomParams.words,
      queries: randomParams.queries,
      caseSensitive: randomParams.caseSensitive,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Trie Operations
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Insert words into a trie and execute deterministic query commands. Supported query commands are{" "}
          <span className="font-mono">search term</span> and <span className="font-mono">prefix term</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-trie-words" className="text-xs font-medium">
            Words
          </label>
          <Input
            id="param-trie-words"
            value={words}
            onChange={(event) => setParam("words", event.target.value)}
            placeholder={TRIE_OPERATIONS_DEFAULT_PARAMS.words}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-trie-queries" className="text-xs font-medium">
              Queries
            </label>
            <InlineHelp text="Examples: search car, search cart, prefix ca, prefix do." />
          </div>
          <Input
            id="param-trie-queries"
            value={queries}
            onChange={(event) => setParam("queries", event.target.value)}
            placeholder={TRIE_OPERATIONS_DEFAULT_PARAMS.queries}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Case Handling</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={caseSensitive ? "outline" : "secondary"}
              onClick={() => setParam("caseSensitive", false)}
            >
              Case Insensitive
            </Button>
            <Button
              type="button"
              size="sm"
              variant={caseSensitive ? "secondary" : "outline"}
              onClick={() => setParam("caseSensitive", true)}
            >
              Case Sensitive
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
            Case sensitive: <span className="font-mono">{normalizedInput ? String(normalizedInput.caseSensitive) : "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Words ({normalizedInput?.words.length ?? "n/a"}):{" "}
            <span className="font-mono">
              {normalizedInput && normalizedInput.words.length > 0
                ? normalizedInput.words.join(", ")
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Queries ({normalizedInput?.queries.length ?? "n/a"}):{" "}
            <span className="font-mono">
              {normalizedInput && normalizedInput.queries.length > 0
                ? normalizedInput.queries.map((query) => `${query.type} ${query.term}`).join(", ")
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `nodes ${normalizedResult.createdNodes}, terminal ${normalizedResult.terminalNodes}, searches ${normalizedResult.searchHits}, prefixes ${normalizedResult.prefixHits}`
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

function QuickSortParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const arrayValues = useMemo(() => {
    const value = params.arrayValues;
    return typeof value === "string" ? value : QUICK_SORT_DEFAULT_PARAMS.arrayValues;
  }, [params.arrayValues]);

  const pivotStrategy = useMemo(() => {
    const value = params.pivotStrategy;
    return value === "middle" || value === "last" ? value : QUICK_SORT_DEFAULT_PARAMS.pivotStrategy;
  }, [params.pivotStrategy]);

  const normalizedValues = run && run.algorithmSlug === "quick-sort" ? getInputValues(run.input) : [];
  const normalizedPivotStrategy =
    run && run.algorithmSlug === "quick-sort" && typeof run.normalizedParams.pivotStrategy === "string"
      ? run.normalizedParams.pivotStrategy
      : null;
  const sortedValues = run && run.algorithmSlug === "quick-sort" ? getSortedResultValues(run.result) : [];

  const normalizedResult =
    run && run.algorithmSlug === "quick-sort" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          comparisons: number;
          swaps: number;
          partitions: number;
          maxDepth: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomQuickSortParams();
    setParams({
      arrayValues: randomParams.arrayValues,
      pivotStrategy: randomParams.pivotStrategy,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Quick Sort
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Configure numeric values and pivot policy. Quick Sort partitions around pivots and recursively sorts
          both sides.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-quick-sort-array-values" className="text-xs font-medium">
            Array Values
          </label>
          <Input
            id="param-quick-sort-array-values"
            value={arrayValues}
            onChange={(event) => setParam("arrayValues", event.target.value)}
            placeholder={QUICK_SORT_DEFAULT_PARAMS.arrayValues}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Pivot Strategy</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={pivotStrategy === "last" ? "secondary" : "outline"}
              onClick={() => setParam("pivotStrategy", "last")}
            >
              Last Element
            </Button>
            <Button
              type="button"
              size="sm"
              variant={pivotStrategy === "middle" ? "secondary" : "outline"}
              onClick={() => setParam("pivotStrategy", "middle")}
            >
              Middle Element
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
            Pivot strategy: <span className="font-mono">{normalizedPivotStrategy ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Values ({normalizedValues.length}):{" "}
            <span className="font-mono">
              {normalizedValues.length > 0 ? normalizedValues.join(", ") : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `comparisons ${normalizedResult.comparisons}, swaps ${normalizedResult.swaps}, partitions ${normalizedResult.partitions}`
                : "n/a"}
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

function InvertBinaryTreeParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const treeValues = useMemo(() => {
    const value = params.treeValues;
    return typeof value === "string" ? value : INVERT_BINARY_TREE_DEFAULT_PARAMS.treeValues;
  }, [params.treeValues]);

  const traversalMode = useMemo(() => {
    const value = params.traversalMode;
    return value === "bfs" ? "bfs" : INVERT_BINARY_TREE_DEFAULT_PARAMS.traversalMode;
  }, [params.traversalMode]);

  const normalizedInput =
    run && run.algorithmSlug === "invert-binary-tree" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          nodes: Array<{ id: number; value: number; left: number | null; right: number | null }>;
          levelOrder: Array<number | null>;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "invert-binary-tree" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          invertedLevelOrder: Array<number | null>;
          visitedCount: number;
          swaps: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomInvertBinaryTreeParams();
    setParams({
      treeValues: randomParams.treeValues,
      traversalMode: randomParams.traversalMode,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Invert Binary Tree
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Provide level-order tree values with optional <span className="font-mono">null</span> placeholders.
          Traversal mode controls deterministic visit order while every visited node still swaps its children.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-invert-tree-values" className="text-xs font-medium">
              Tree Values (Level Order)
            </label>
            <InlineHelp text="Example: 4, 2, 7, 1, 3, 6, 9 or 1, 2, 3, null, 4." />
          </div>
          <Input
            id="param-invert-tree-values"
            value={treeValues}
            onChange={(event) => setParam("treeValues", event.target.value)}
            placeholder={INVERT_BINARY_TREE_DEFAULT_PARAMS.treeValues}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Traversal Mode</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={traversalMode === "dfs" ? "secondary" : "outline"}
              onClick={() => setParam("traversalMode", "dfs")}
            >
              DFS
            </Button>
            <Button
              type="button"
              size="sm"
              variant={traversalMode === "bfs" ? "secondary" : "outline"}
              onClick={() => setParam("traversalMode", "bfs")}
            >
              BFS
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
            Traversal mode: <span className="font-mono">{traversalMode.toUpperCase()}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Node count: <span className="font-mono">{normalizedInput?.nodes.length ?? "n/a"}</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Level order:{" "}
            <span className="font-mono">
              {normalizedInput ? formatNullableNumberList(normalizedInput.levelOrder) : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Inverted:{" "}
            <span className="font-mono">
              {normalizedResult ? formatNullableNumberList(normalizedResult.invertedLevelOrder) : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `visited ${normalizedResult.visitedCount}, swaps ${normalizedResult.swaps}`
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

function BstOperationsParamsCard({
  className,
  params,
  run,
  setParam,
  setParams,
  resetParams,
}: AlgorithmParamsCardProps) {
  const initialValues = useMemo(() => {
    const value = params.initialValues;
    return typeof value === "string" ? value : BST_OPERATIONS_DEFAULT_PARAMS.initialValues;
  }, [params.initialValues]);

  const operations = useMemo(() => {
    const value = params.operations;
    return typeof value === "string" ? value : BST_OPERATIONS_DEFAULT_PARAMS.operations;
  }, [params.operations]);

  const deleteStrategy = useMemo(() => {
    const value = params.deleteStrategy;
    return value === "predecessor" ? "predecessor" : BST_OPERATIONS_DEFAULT_PARAMS.deleteStrategy;
  }, [params.deleteStrategy]);

  const normalizedInput =
    run && run.algorithmSlug === "bst-operations" && typeof run.input === "object" && run.input !== null
      ? (run.input as {
          initialValues: number[];
          operations: Array<{ type: string; value: number }>;
          initialLevelOrder: Array<number | null>;
        })
      : null;

  const normalizedResult =
    run && run.algorithmSlug === "bst-operations" && typeof run.result === "object" && run.result !== null
      ? (run.result as {
          finalLevelOrder: Array<number | null>;
          traversedNodes: number;
          searchHits: number;
          insertsApplied: number;
          deletesApplied: number;
          duplicateInserts: number;
          missingDeletes: number;
          nodeCount: number;
          treeHeight: number;
        })
      : null;

  const handleRandomize = () => {
    const randomParams = createRandomBstOperationsParams();
    setParams({
      initialValues: randomParams.initialValues,
      operations: randomParams.operations,
      deleteStrategy: randomParams.deleteStrategy,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Parameters</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            BST Operations
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Build an initial BST from unique numeric values, then run a deterministic script of search,
          insert, and delete operations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-bst-initial-values" className="text-xs font-medium">
              Initial Values
            </label>
            <InlineHelp text="Comma-separated unique numbers used to build the starting BST." />
          </div>
          <Input
            id="param-bst-initial-values"
            value={initialValues}
            onChange={(event) => setParam("initialValues", event.target.value)}
            placeholder={BST_OPERATIONS_DEFAULT_PARAMS.initialValues}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="param-bst-operations" className="text-xs font-medium">
              Operation Script
            </label>
            <InlineHelp text="Use commands like: search 32, insert 29, delete 24." />
          </div>
          <Input
            id="param-bst-operations"
            value={operations}
            onChange={(event) => setParam("operations", event.target.value)}
            placeholder={BST_OPERATIONS_DEFAULT_PARAMS.operations}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Delete Policy</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={deleteStrategy === "successor" ? "secondary" : "outline"}
              onClick={() => setParam("deleteStrategy", "successor")}
            >
              Successor
            </Button>
            <Button
              type="button"
              size="sm"
              variant={deleteStrategy === "predecessor" ? "secondary" : "outline"}
              onClick={() => setParam("deleteStrategy", "predecessor")}
            >
              Predecessor
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
            Initial values ({normalizedInput?.initialValues.length ?? 0}):{" "}
            <span className="font-mono">
              {normalizedInput?.initialValues.length
                ? normalizedInput.initialValues.join(", ")
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Operations ({normalizedInput?.operations.length ?? 0}):{" "}
            <span className="font-mono">
              {normalizedInput?.operations.length
                ? normalizedInput.operations
                    .map((operation) => `${operation.type} ${operation.value}`)
                    .join(", ")
                : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Initial tree:{" "}
            <span className="font-mono">
              {normalizedInput ? formatNullableNumberList(normalizedInput.initialLevelOrder) : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Final tree:{" "}
            <span className="font-mono">
              {normalizedResult ? formatNullableNumberList(normalizedResult.finalLevelOrder) : "n/a"}
            </span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Result metrics:{" "}
            <span className="font-mono">
              {normalizedResult
                ? `nodes ${normalizedResult.nodeCount}, height ${normalizedResult.treeHeight}, traversals ${normalizedResult.traversedNodes}`
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

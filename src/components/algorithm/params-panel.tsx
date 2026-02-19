"use client";

import { useMemo } from "react";
import { ShuffleIcon, SlidersHorizontalIcon } from "lucide-react";

import {
  BINARY_SEARCH_DEFAULT_PARAMS,
  createRandomBinarySearchParams,
} from "@/algorithms/binary-search/spec";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ParamsPanelProps {
  className?: string;
}

export function ParamsPanel({ className }: ParamsPanelProps) {
  const selectedAlgorithmSlug = useAppStore((state) => state.selectedAlgorithmSlug);
  const params = useAppStore((state) => state.params);
  const run = useAppStore((state) => state.run);
  const setParam = useAppStore((state) => state.setParam);
  const setParams = useAppStore((state) => state.setParams);
  const resetParams = useAppStore((state) => state.resetParams);

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

  if (selectedAlgorithmSlug !== "binary-search") {
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
            Parameter schema and validation are enabled only for Binary Search in this milestone.
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

  const normalizedTarget =
    run && run.algorithmSlug === "binary-search" && typeof run.normalizedParams.target === "number"
      ? run.normalizedParams.target
      : null;
  const normalizedValues =
    run &&
    run.algorithmSlug === "binary-search" &&
    typeof run.input === "object" &&
    run.input !== null &&
    "values" in run.input &&
    Array.isArray(run.input.values)
      ? run.input.values
      : [];

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

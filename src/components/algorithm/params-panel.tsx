"use client";

import { useMemo } from "react";
import { SlidersHorizontalIcon } from "lucide-react";

import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ParamsPanelProps {
  className?: string;
}

export function ParamsPanel({ className }: ParamsPanelProps) {
  const params = useAppStore((state) => state.params);
  const setParam = useAppStore((state) => state.setParam);

  const gridSize = useMemo(() => {
    const value = params.gridSize;
    return typeof value === "number" ? value : 28;
  }, [params.gridSize]);

  const heuristicWeight = useMemo(() => {
    const value = params.heuristicWeight;
    return typeof value === "number" ? value : 1;
  }, [params.heuristicWeight]);

  const startNode = useMemo(() => {
    const value = params.startNode;
    return typeof value === "string" ? value : "A1";
  }, [params.startNode]);

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
          Parameter schema and validation will be generated per algorithm in a later phase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="param-grid-size" className="text-xs font-medium">
            Grid Size
          </label>
          <Input
            id="param-grid-size"
            type="number"
            min={8}
            max={96}
            value={gridSize}
            onChange={(event) => setParam("gridSize", Number(event.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="param-heuristic-weight" className="text-xs font-medium">
            Heuristic Weight
          </label>
          <Input
            id="param-heuristic-weight"
            type="number"
            min={0.1}
            max={3}
            step={0.1}
            value={heuristicWeight}
            onChange={(event) => setParam("heuristicWeight", Number(event.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="param-start-node" className="text-xs font-medium">
            Start Node
          </label>
          <Input
            id="param-start-node"
            value={startNode}
            onChange={(event) => setParam("startNode", event.target.value)}
          />
        </div>
        <Separator />
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <SlidersHorizontalIcon className="size-3.5" />
          Controls are scaffolded only. Execution logic is intentionally omitted.
        </div>
      </CardContent>
    </Card>
  );
}

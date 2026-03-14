"use client";

import { SparklesIcon } from "lucide-react";

import type { RendererMode } from "@/lib/renderer-mode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RendererModeToggleProps {
  mode: RendererMode;
  onModeChange: (mode: RendererMode) => void;
}

export function RendererModeToggle({ mode, onModeChange }: RendererModeToggleProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium">Renderer Mode</p>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          `Simple` uses abstract, short-form-friendly visuals. `Advanced` keeps the current detailed view.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "advanced" ? "secondary" : "outline"}
          onClick={() => onModeChange("advanced")}
        >
          Advanced
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "simple" ? "secondary" : "outline"}
          onClick={() => onModeChange("simple")}
        >
          Simple
        </Button>
        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase">
          Arrays + Grid
        </Badge>
      </div>
    </div>
  );
}

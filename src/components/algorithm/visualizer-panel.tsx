import { Grid2x2Icon, MonitorPlayIcon } from "lucide-react";

import type { AlgorithmDefinition } from "@/data/algorithms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VisualizerPanelProps {
  algorithm: AlgorithmDefinition;
}

export function VisualizerPanel({ algorithm }: VisualizerPanelProps) {
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

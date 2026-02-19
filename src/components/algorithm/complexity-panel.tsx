"use client";

import { ActivityIcon } from "lucide-react";

import { getComplexitySummary } from "@/lib/complexity";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ComplexityPanelProps {
  algorithmSlug: string;
  className?: string;
}

export function ComplexityPanel({ algorithmSlug, className }: ComplexityPanelProps) {
  const run = useAppStore((state) => state.run);
  const complexity = getComplexitySummary(algorithmSlug, run);

  if (!complexity) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Complexity</CardTitle>
            <Badge variant="outline" className="rounded-full border-border/70">
              Placeholder
            </Badge>
          </div>
          <CardDescription className="text-xs leading-relaxed">
            Param-aware complexity breakdowns are available for implemented algorithms.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Complexity</CardTitle>
          <Badge variant="secondary" className="rounded-full border-border/70">
            Param Aware
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Time and space complexity with current-run context derived from normalized params and input size.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <ComplexityMetric label="Best Time" value={complexity.timeBest} />
          <ComplexityMetric label="Average Time" value={complexity.timeAverage} />
          <ComplexityMetric label="Worst Time" value={complexity.timeWorst} />
          <ComplexityMetric label="Space" value={complexity.space} />
        </div>
        <div className="rounded-lg border border-border/80 bg-background/70 p-3">
          <p className="text-muted-foreground text-[11px] uppercase">Current Run</p>
          <p className="mt-1 text-sm font-medium">{complexity.current}</p>
        </div>
        <div className="space-y-1 text-xs">
          {complexity.details.map((detail) => (
            <p key={detail} className="text-muted-foreground leading-relaxed">
              {detail}
            </p>
          ))}
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <ActivityIcon className="size-3.5" />
          Complexity updates when params regenerate the deterministic run.
        </div>
      </CardContent>
    </Card>
  );
}

interface ComplexityMetricProps {
  label: string;
  value: string;
}

function ComplexityMetric({ label, value }: ComplexityMetricProps) {
  return (
    <div className="rounded-lg border border-border/80 bg-background/70 p-3">
      <p className="text-muted-foreground text-[11px] uppercase">{label}</p>
      <p className="font-mono text-base">{value}</p>
    </div>
  );
}

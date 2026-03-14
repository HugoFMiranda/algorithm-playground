"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";

import type { AlgorithmDefinition } from "@/data/algorithms";
import { getAlgorithmEasyExplanation } from "@/data/easy-explanations";
import { useAppStore } from "@/store/app-store";
import { ComplexityPanel } from "@/components/algorithm/complexity-panel";
import { ImplementationExamples } from "@/components/algorithm/implementation-examples";
import { PlaybackControls } from "@/components/algorithm/playback-controls";
import { ParamsPanel } from "@/components/algorithm/params-panel";
import { RendererModeToggle } from "@/components/algorithm/renderer-mode-toggle";
import { VisualizerPanel } from "@/components/algorithm/visualizer-panel";
import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supportsSimpleRenderer } from "@/lib/renderer-mode";

interface AlgorithmPageShellProps {
  algorithm: AlgorithmDefinition;
}

export function AlgorithmPageShell({ algorithm }: AlgorithmPageShellProps) {
  const initializeAlgorithm = useAppStore((state) => state.initializeAlgorithm);
  const rendererMode = useAppStore((state) => state.rendererMode);
  const setRendererMode = useAppStore((state) => state.setRendererMode);
  const easyExplanation = getAlgorithmEasyExplanation(algorithm.slug);
  const simpleModeSupported = supportsSimpleRenderer(algorithm.slug);

  useEffect(() => {
    initializeAlgorithm(algorithm.slug);
    return () => {
      initializeAlgorithm(null);
    };
  }, [algorithm.slug, initializeAlgorithm]);

  return (
    <PageTransition className="min-h-svh bg-background pb-28">
      <div className="container-page py-6 md:py-8">
        <header className="mb-6 flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href="/">
                <ArrowLeftIcon className="size-4" />
                Library
              </Link>
            </Button>
            <ChevronRightIcon className="size-4" />
            <span className="max-w-[180px] truncate font-medium text-foreground sm:max-w-none">
              {algorithm.name}
            </span>
          </nav>
        </header>

        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase">
              {algorithm.category}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px]">
              {algorithm.difficulty}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">
              {algorithm.roadmapPhase}
            </Badge>
            {algorithm.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{algorithm.name}</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base">
            {algorithm.shortDescription}
          </p>
          <div className="max-w-3xl rounded-xl border border-border/70 bg-card/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Easy Explanation
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{easyExplanation}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            {simpleModeSupported ? (
              <RendererModeToggle mode={rendererMode} onModeChange={setRendererMode} />
            ) : null}
            <VisualizerPanel algorithm={algorithm} mode={rendererMode} />
          </div>
          <aside className="space-y-6">
            <ParamsPanel className="surface-card border-border/70" />
            <ComplexityPanel algorithmSlug={algorithm.slug} className="surface-card border-border/70" />
          </aside>
        </div>

        <div className="mt-6">
          <ImplementationExamples algorithmSlug={algorithm.slug} className="surface-card border-border/70" />
        </div>
      </div>
      <PlaybackControls />
    </PageTransition>
  );
}

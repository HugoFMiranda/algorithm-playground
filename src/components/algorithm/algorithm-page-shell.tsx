"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";

import type { AlgorithmDefinition } from "@/data/algorithms";
import { useAppStore } from "@/store/app-store";
import { PlaybackControls } from "@/components/algorithm/playback-controls";
import { ParamsPanel } from "@/components/algorithm/params-panel";
import { VisualizerPanel } from "@/components/algorithm/visualizer-panel";
import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AlgorithmPageShellProps {
  algorithm: AlgorithmDefinition;
}

export function AlgorithmPageShell({ algorithm }: AlgorithmPageShellProps) {
  const setSelectedAlgorithmSlug = useAppStore((state) => state.setSelectedAlgorithmSlug);

  useEffect(() => {
    setSelectedAlgorithmSlug(algorithm.slug);
    return () => {
      setSelectedAlgorithmSlug(null);
    };
  }, [algorithm.slug, setSelectedAlgorithmSlug]);

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
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <VisualizerPanel algorithm={algorithm} />
          <aside>
            <ParamsPanel className="surface-card border-border/70" />
          </aside>
        </div>
      </div>
      <PlaybackControls />
    </PageTransition>
  );
}

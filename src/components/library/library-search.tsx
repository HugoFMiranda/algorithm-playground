"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeftIcon, SearchIcon } from "lucide-react";

import type { AlgorithmDefinition } from "@/data/algorithms";
import { useAppStore } from "@/store/app-store";
import { AlgorithmResultItem } from "@/components/library/algorithm-result-item";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LibrarySearchProps {
  algorithms: AlgorithmDefinition[];
}

export function LibrarySearch({ algorithms }: LibrarySearchProps) {
  const router = useRouter();
  const setSelectedAlgorithmSlug = useAppStore((state) => state.setSelectedAlgorithmSlug);
  const [query, setQuery] = useState("");

  const filteredAlgorithms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return algorithms;
    }

    return algorithms.filter((algorithm) => {
      const searchableText = [
        algorithm.name,
        algorithm.slug,
        algorithm.category,
        algorithm.shortDescription,
        ...algorithm.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [algorithms, query]);

  const handleSelectAlgorithm = (slug: string) => {
    setSelectedAlgorithmSlug(slug);
    router.push(`/algorithms/${slug}`);
  };

  return (
    <Card className="surface-card w-full border-border/70 shadow-2xl shadow-black/[0.04]">
      <CardHeader className="space-y-4 pb-2">
        <Badge variant="secondary" className="w-fit rounded-full px-2.5 py-0.5 text-[10px] uppercase">
          algorithm-playground Library
        </Badge>
        <div className="space-y-2">
          <CardTitle className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Explore visual algorithms.
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-relaxed">
            Search the algorithm catalog and open visualizer pages. Binary Search includes the first complete
            deterministic engine + playback implementation.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <Command className="rounded-xl border border-border/70 bg-background/80">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            className="h-11"
            placeholder="Search by name, slug, category, or tag"
            aria-label="Search algorithms"
          />
          <CommandList className="max-h-[320px] px-1 pb-1">
            <CommandEmpty className="py-8">
              <p className="text-muted-foreground text-sm">No matching algorithms yet.</p>
            </CommandEmpty>
            <CommandGroup heading={`${filteredAlgorithms.length} Available`}>
              {filteredAlgorithms.map((algorithm) => (
                <AlgorithmResultItem
                  key={algorithm.slug}
                  algorithm={algorithm}
                  onSelect={handleSelectAlgorithm}
                />
              ))}
            </CommandGroup>
            <CommandSeparator />
          </CommandList>
        </Command>
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 px-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <SearchIcon className="size-3.5" />
            Type to filter
          </span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeftIcon className="size-3.5" />
            Press enter to open
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

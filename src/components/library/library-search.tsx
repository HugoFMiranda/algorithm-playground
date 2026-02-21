"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeftIcon, SearchIcon } from "lucide-react";

import type { AlgorithmDefinition } from "@/data/algorithms";
import { getAlgorithmEasyExplanation } from "@/data/easy-explanations";
import { useAppStore } from "@/store/app-store";
import { AlgorithmResultItem } from "@/components/library/algorithm-result-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  const categoryOptions = useMemo(
    () => Array.from(new Set(algorithms.map((algorithm) => algorithm.category))).sort((a, b) => a.localeCompare(b)),
    [algorithms],
  );
  const difficultyOptions = useMemo(
    () =>
      Array.from(new Set(algorithms.map((algorithm) => algorithm.difficulty))).sort((a, b) => a.localeCompare(b)),
    [algorithms],
  );
  const phaseOptions = useMemo(
    () =>
      Array.from(new Set(algorithms.map((algorithm) => algorithm.roadmapPhase))).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    [algorithms],
  );

  const filteredAlgorithms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return algorithms
      .filter((algorithm) => {
        if (categoryFilter !== "all" && algorithm.category !== categoryFilter) {
          return false;
        }

        if (difficultyFilter !== "all" && algorithm.difficulty !== difficultyFilter) {
          return false;
        }

        if (phaseFilter !== "all" && algorithm.roadmapPhase !== phaseFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const searchableText = [
          algorithm.name,
          algorithm.slug,
          algorithm.category,
          algorithm.shortDescription,
          getAlgorithmEasyExplanation(algorithm.slug),
          ...algorithm.tags,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .toSorted((left, right) => left.name.localeCompare(right.name));
  }, [algorithms, categoryFilter, difficultyFilter, phaseFilter, query]);

  const hasActiveFilters =
    categoryFilter !== "all" || difficultyFilter !== "all" || phaseFilter !== "all";

  const handleSelectAlgorithm = (slug: string) => {
    setSelectedAlgorithmSlug(slug);
    router.push(`/algorithms/${slug}`);
  };

  return (
    <Card className="surface-card w-full border-border/70 shadow-2xl shadow-black/[0.04]">
      <CardHeader className="space-y-4 pb-2">
        <Badge variant="secondary" className="w-fit rounded-full px-2.5 py-0.5 text-[10px] uppercase">
        🦅 algorithm-playground 🦅
        </Badge>
        <div className="space-y-2">
          <CardTitle className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Explore visual algorithms.
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-relaxed">
            Search the algorithm catalog and open visualizer pages. Binary Search, BFS, DFS, Dijkstra, A*,
            Bubble Sort, Quick Sort, Heap Sort, Topological Sort, Selection Sort, Insertion Sort, and Merge
            Sort currently include complete deterministic engine + playback implementations.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <div className="space-y-2 rounded-xl border border-border/70 bg-background/70 p-3">
          <FilterChips
            label="Category"
            options={categoryOptions}
            selected={categoryFilter}
            onSelect={setCategoryFilter}
          />
          <FilterChips
            label="Difficulty"
            options={difficultyOptions}
            selected={difficultyFilter}
            onSelect={setDifficultyFilter}
          />
          <FilterChips label="Phase" options={phaseOptions} selected={phaseFilter} onSelect={setPhaseFilter} />
          {hasActiveFilters ? (
            <div className="pt-1">
              <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={() => {
                  setCategoryFilter("all");
                  setDifficultyFilter("all");
                  setPhaseFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : null}
        </div>
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

interface FilterChipsProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

function FilterChips({ label, options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground mr-1 text-[11px] uppercase tracking-wide">{label}</span>
      <Button
        type="button"
        size="xs"
        variant={selected === "all" ? "secondary" : "outline"}
        onClick={() => onSelect("all")}
        aria-pressed={selected === "all"}
        className="rounded-full"
      >
        All
      </Button>
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          size="xs"
          variant={selected === option ? "secondary" : "outline"}
          onClick={() => onSelect(option)}
          aria-pressed={selected === option}
          className="rounded-full"
        >
          {option}
        </Button>
      ))}
    </div>
  );
}

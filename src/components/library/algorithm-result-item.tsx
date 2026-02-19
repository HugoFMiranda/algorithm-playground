import type { AlgorithmDefinition } from "@/data/algorithms";
import { Badge } from "@/components/ui/badge";
import { CommandItem, CommandShortcut } from "@/components/ui/command";

interface AlgorithmResultItemProps {
  algorithm: AlgorithmDefinition;
  onSelect: (slug: string) => void;
}

export function AlgorithmResultItem({ algorithm, onSelect }: AlgorithmResultItemProps) {
  return (
    <CommandItem
      value={`${algorithm.name} ${algorithm.slug} ${algorithm.category} ${algorithm.tags.join(" ")}`}
      onSelect={() => onSelect(algorithm.slug)}
      className="group rounded-lg px-3 py-2.5"
    >
      <div className="w-full space-y-2">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{algorithm.name}</p>
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
              {algorithm.shortDescription}
            </p>
          </div>
          <div className="shrink-0 space-y-1 text-right">
            <Badge variant="outline" className="border-border/80 bg-card/70 text-[10px] uppercase">
              {algorithm.category}
            </Badge>
            <CommandShortcut className="hidden text-[10px] sm:block">
              {algorithm.slug}
            </CommandShortcut>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {algorithm.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </CommandItem>
  );
}

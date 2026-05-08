"use client";

import { CircleHelpIcon, KeyboardIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function AboutSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="rounded-full">
          <CircleHelpIcon className="size-4" />
          About
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>algorithm-playground Phase One</SheetTitle>
          <SheetDescription>
            The current app ships the full roadmap backlog plus comparison mode. Array, grid, graph, and
            tree algorithms all run through deterministic engine-backed visualization slices.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium">What is included</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Library Search</Badge>
              <Badge variant="secondary">Route Shells</Badge>
              <Badge variant="secondary">Easy Explanations</Badge>
              <Badge variant="secondary">Binary Search</Badge>
              <Badge variant="secondary">BFS</Badge>
              <Badge variant="secondary">DFS</Badge>
              <Badge variant="secondary">Dijkstra</Badge>
              <Badge variant="secondary">A*</Badge>
              <Badge variant="secondary">Bubble Sort</Badge>
              <Badge variant="secondary">Counting Sort</Badge>
              <Badge variant="secondary">Quick Sort</Badge>
              <Badge variant="secondary">Heap Sort</Badge>
              <Badge variant="secondary">Topological Sort</Badge>
              <Badge variant="secondary">Selection Sort</Badge>
              <Badge variant="secondary">Insertion Sort</Badge>
              <Badge variant="secondary">Merge Sort</Badge>
              <Badge variant="secondary">Playback Controls</Badge>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Disclaimer</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              This is a personal learning project. I built it as a centralized library for algorithms I
              practiced and studied. I aim for correctness, but it can still contain mistakes or incomplete
              explanations. Use it as a study aid, and verify important details with your own checks and
              trusted references.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Keyboard hints</h3>
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <KeyboardIcon className="size-3.5" />
              Use arrow keys to navigate results and enter to open a selected algorithm.
            </p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Created by <a href="https://github.com/HugoFMiranda" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline underline-offset-2">HugoFMiranda</a></span>
            <a href="https://github.com/HugoFMiranda/algorithm-playground" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

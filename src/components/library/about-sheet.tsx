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
            Core UI, routing, and state scaffolding are available. Algorithm engines are intentionally not
            implemented yet.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium">What is included</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Library Search</Badge>
              <Badge variant="secondary">Route Shells</Badge>
              <Badge variant="secondary">Playback Scaffold</Badge>
              <Badge variant="secondary">Zustand State</Badge>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Keyboard hints</h3>
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <KeyboardIcon className="size-3.5" />
              Use arrow keys to navigate results and enter to open a selected algorithm.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

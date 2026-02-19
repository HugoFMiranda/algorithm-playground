"use client";

import { PauseIcon, PlayIcon, RotateCcwIcon, SkipForwardIcon } from "lucide-react";

import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function PlaybackControls() {
  const playback = useAppStore((state) => state.playback);
  const setPlaybackStatus = useAppStore((state) => state.setPlaybackStatus);
  const setPlaybackSpeed = useAppStore((state) => state.setPlaybackSpeed);

  const isPlaying = playback.status === "playing";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/80 backdrop-blur">
      <div className="container-page flex min-h-16 flex-wrap items-center gap-2 py-2 sm:flex-nowrap sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={isPlaying ? "secondary" : "default"}
            onClick={() => setPlaybackStatus(isPlaying ? "paused" : "playing")}
          >
            {isPlaying ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setPlaybackStatus("idle")}>
            <RotateCcwIcon className="size-3.5" />
            Reset
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setPlaybackStatus("paused")}>
            <SkipForwardIcon className="size-3.5" />
            Step
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPlaybackSpeed(playback.speed - 0.25)}
          >
            - Speed
          </Button>
          <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 tabular-nums">
            {playback.speed.toFixed(2)}x
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPlaybackSpeed(playback.speed + 0.25)}
          >
            + Speed
          </Button>
        </div>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              Phase Notes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Playback layer is scaffolded only</DialogTitle>
              <DialogDescription>
                Controls currently mutate UI state only. Algorithm step generation and renderer playback
                coordination will be integrated in a later phase.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

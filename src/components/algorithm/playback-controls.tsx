"use client";

import { useEffect } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon, SkipForwardIcon } from "lucide-react";

import {
  PLAYBACK_MIN_SPEED,
  getPlaybackMaxSpeed,
  getPlaybackSpeedStep,
} from "@/lib/playback-config";
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
  const run = useAppStore((state) => state.run);
  const selectedAlgorithmSlug = useAppStore((state) => state.selectedAlgorithmSlug);
  const playback = useAppStore((state) => state.playback);
  const setPlaybackStatus = useAppStore((state) => state.setPlaybackStatus);
  const setPlaybackSpeed = useAppStore((state) => state.setPlaybackSpeed);
  const resetPlayback = useAppStore((state) => state.resetPlayback);
  const stepForward = useAppStore((state) => state.stepForward);

  const isPlaying = playback.status === "playing";
  const hasRun = run !== null;
  const hasSteps = (run?.steps.length ?? 0) > 0;
  const speedStep = getPlaybackSpeedStep(selectedAlgorithmSlug);
  const maxSpeed = getPlaybackMaxSpeed(selectedAlgorithmSlug);
  const canDecreaseSpeed = hasRun && playback.speed > PLAYBACK_MIN_SPEED;
  const canIncreaseSpeed = hasRun && playback.speed < maxSpeed;

  useEffect(() => {
    if (!hasRun || !hasSteps || playback.status !== "playing") {
      return undefined;
    }

    const intervalMs = Math.max(90, Math.round(700 / playback.speed));
    const timer = window.setInterval(() => {
      stepForward({ keepStatus: true });
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [hasRun, hasSteps, playback.speed, playback.status, stepForward]);

  const handlePlayPause = () => {
    if (!hasRun || !hasSteps) {
      return;
    }

    if (isPlaying) {
      setPlaybackStatus("paused");
      return;
    }

    if (playback.status === "completed") {
      resetPlayback();
    }

    setPlaybackStatus("playing");
  };

  const handleStep = () => {
    if (!hasRun || !hasSteps) {
      return;
    }

    setPlaybackStatus("paused");
    stepForward();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/80 backdrop-blur">
      <div className="container-page flex min-h-16 flex-wrap items-center gap-2 py-2 sm:flex-nowrap sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={isPlaying ? "secondary" : "default"}
            onClick={handlePlayPause}
            disabled={!hasRun || !hasSteps}
          >
            {isPlaying ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={resetPlayback} disabled={!hasRun}>
            <RotateCcwIcon className="size-3.5" />
            Reset
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleStep} disabled={!hasRun || !hasSteps}>
            <SkipForwardIcon className="size-3.5" />
            Step
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPlaybackSpeed(playback.speed - speedStep)}
            disabled={!canDecreaseSpeed}
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
            onClick={() => setPlaybackSpeed(playback.speed + speedStep)}
            disabled={!canIncreaseSpeed}
          >
            + Speed
          </Button>
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 tabular-nums">
            {hasRun ? `${Math.max(playback.cursor + 1, 0)} / ${run?.steps.length ?? 0}` : "No Run"}
          </Badge>
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
              <DialogTitle>Playback engine behavior</DialogTitle>
              <DialogDescription>
                Playback runs against precomputed deterministic steps. Speed changes timing only, and reset
                always returns the cursor to the initial state.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

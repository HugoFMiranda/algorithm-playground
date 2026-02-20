import { create } from "zustand";

import { getAlgorithmDefaultParams, getAlgorithmRuntime } from "@/algorithms/registry";
import {
  PLAYBACK_MIN_SPEED,
  getPlaybackDefaultSpeed,
  getPlaybackMaxSpeed,
} from "@/lib/playback-config";
import type { ParamPrimitive, StepEventBase } from "@/types/engine";

export type PlaybackStatus = "idle" | "playing" | "paused" | "completed";
export type ParamValue = ParamPrimitive;

interface PlaybackState {
  status: PlaybackStatus;
  speed: number;
  cursor: number;
}

interface AlgorithmRunState {
  algorithmSlug: string;
  input: unknown;
  normalizedParams: Record<string, ParamValue>;
  steps: StepEventBase[];
  result: unknown;
}

interface AppState {
  selectedAlgorithmSlug: string | null;
  playback: PlaybackState;
  params: Record<string, ParamValue>;
  run: AlgorithmRunState | null;
  setSelectedAlgorithmSlug: (slug: string | null) => void;
  initializeAlgorithm: (slug: string | null) => void;
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setPlaybackSpeed: (speed: number) => void;
  resetPlayback: () => void;
  setParam: (key: string, value: ParamValue) => void;
  setParams: (partial: Partial<Record<string, ParamValue>>) => void;
  resetParams: () => void;
  regenerateRun: () => void;
  stepForward: (options?: { keepStatus?: boolean }) => void;
  stepBackward: (options?: { keepStatus?: boolean }) => void;
}

const defaultPlayback: PlaybackState = {
  status: "idle",
  speed: getPlaybackDefaultSpeed(null),
  cursor: -1,
};

function createIdlePlayback(speed: number): PlaybackState {
  return {
    status: "idle",
    speed,
    cursor: -1,
  };
}

function createRun(
  selectedAlgorithmSlug: string | null,
  params: Record<string, ParamValue>,
): AlgorithmRunState | null {
  if (!selectedAlgorithmSlug) {
    return null;
  }

  const runtime = getAlgorithmRuntime(selectedAlgorithmSlug);

  if (!runtime) {
    return null;
  }

  const runData = runtime.createRun(params);

  return {
    algorithmSlug: selectedAlgorithmSlug,
    input: runData.input,
    normalizedParams: runData.normalizedParams,
    steps: runData.steps,
    result: runData.result,
  };
}

function sanitizeParamPatch(
  partial: Partial<Record<string, ParamValue>>,
): Record<string, ParamValue> {
  const entries = Object.entries(partial).filter((entry): entry is [string, ParamValue] => {
    const [, value] = entry;
    return value !== undefined;
  });

  return Object.fromEntries(entries);
}

export const useAppStore = create<AppState>((set) => ({
  selectedAlgorithmSlug: null,
  playback: defaultPlayback,
  params: {},
  run: null,
  setSelectedAlgorithmSlug: (slug) => set({ selectedAlgorithmSlug: slug }),
  initializeAlgorithm: (slug) =>
    set((state) => {
      if (!slug) {
        return {
          selectedAlgorithmSlug: null,
          params: {},
          run: null,
          playback: createIdlePlayback(state.playback.speed),
        };
      }

      const nextParams = getAlgorithmDefaultParams(slug);
      const nextRun = createRun(slug, nextParams);
      const nextSpeed = getPlaybackDefaultSpeed(slug);

      return {
        selectedAlgorithmSlug: slug,
        params: nextParams,
        run: nextRun,
        playback: createIdlePlayback(nextSpeed),
      };
    }),
  setPlaybackStatus: (status) =>
    set((state) => {
      if (!state.run && status !== "idle") {
        return state;
      }

      return { playback: { ...state.playback, status } };
    }),
  setPlaybackSpeed: (speed) =>
    set((state) => ({
      playback: {
        ...state.playback,
        speed: Math.max(
          PLAYBACK_MIN_SPEED,
          Math.min(speed, getPlaybackMaxSpeed(state.selectedAlgorithmSlug)),
        ),
      },
    })),
  resetPlayback: () =>
    set((state) => ({
      playback: createIdlePlayback(state.playback.speed),
    })),
  setParam: (key, value) =>
    set((state) => {
      const nextParams = {
        ...state.params,
        [key]: value,
      };
      const nextRun = createRun(state.selectedAlgorithmSlug, nextParams);

      return {
        params: nextParams,
        run: nextRun,
        playback: createIdlePlayback(state.playback.speed),
      };
    }),
  setParams: (partial) =>
    set((state) => {
      const sanitizedPartial = sanitizeParamPatch(partial);
      const nextParams = {
        ...state.params,
        ...sanitizedPartial,
      };
      const nextRun = createRun(state.selectedAlgorithmSlug, nextParams);

      return {
        params: nextParams,
        run: nextRun,
        playback: createIdlePlayback(state.playback.speed),
      };
    }),
  resetParams: () =>
    set((state) => {
      if (!state.selectedAlgorithmSlug) {
        return {
          params: {},
          run: null,
          playback: createIdlePlayback(state.playback.speed),
        };
      }

      const nextParams = getAlgorithmDefaultParams(state.selectedAlgorithmSlug);
      const nextRun = createRun(state.selectedAlgorithmSlug, nextParams);

      return {
        params: nextParams,
        run: nextRun,
        playback: createIdlePlayback(state.playback.speed),
      };
    }),
  regenerateRun: () =>
    set((state) => ({
      run: createRun(state.selectedAlgorithmSlug, state.params),
      playback: createIdlePlayback(state.playback.speed),
    })),
  stepForward: (options) =>
    set((state) => {
      if (!state.run) {
        return state;
      }

      const lastStepIndex = state.run.steps.length - 1;

      if (lastStepIndex < 0) {
        return {
          playback: {
            ...state.playback,
            status: "completed",
            cursor: -1,
          },
        };
      }

      const nextCursor = Math.min(state.playback.cursor + 1, lastStepIndex);
      const shouldKeepStatus = options?.keepStatus ?? false;
      const nextStatus: PlaybackStatus =
        nextCursor >= lastStepIndex
          ? "completed"
          : shouldKeepStatus
            ? state.playback.status
            : "paused";

      return {
        playback: {
          ...state.playback,
          cursor: nextCursor,
          status: nextStatus,
        },
      };
    }),
  stepBackward: (options) =>
    set((state) => {
      if (!state.run) {
        return state;
      }

      const hasSteps = state.run.steps.length > 0;
      if (!hasSteps) {
        return {
          playback: {
            ...state.playback,
            status: "idle",
            cursor: -1,
          },
        };
      }

      const nextCursor = Math.max(state.playback.cursor - 1, -1);
      const shouldKeepStatus = options?.keepStatus ?? false;
      const nextStatus: PlaybackStatus =
        nextCursor < 0 ? "idle" : shouldKeepStatus ? state.playback.status : "paused";

      return {
        playback: {
          ...state.playback,
          cursor: nextCursor,
          status: nextStatus,
        },
      };
    }),
}));

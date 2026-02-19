import { create } from "zustand";

export type PlaybackStatus = "idle" | "playing" | "paused";
export type ParamValue = string | number | boolean;

interface PlaybackState {
  status: PlaybackStatus;
  speed: number;
}

interface AppState {
  selectedAlgorithmSlug: string | null;
  playback: PlaybackState;
  params: Record<string, ParamValue>;
  setSelectedAlgorithmSlug: (slug: string | null) => void;
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setPlaybackSpeed: (speed: number) => void;
  setParam: (key: string, value: ParamValue) => void;
  resetParams: () => void;
}

const defaultParams: Record<string, ParamValue> = {
  gridSize: 28,
  allowDiagonal: true,
  heuristicWeight: 1,
};

const defaultPlayback: PlaybackState = {
  status: "idle",
  speed: 1,
};

export const useAppStore = create<AppState>((set) => ({
  selectedAlgorithmSlug: null,
  playback: defaultPlayback,
  params: defaultParams,
  setSelectedAlgorithmSlug: (slug) => set({ selectedAlgorithmSlug: slug }),
  setPlaybackStatus: (status) =>
    set((state) => ({ playback: { ...state.playback, status } })),
  setPlaybackSpeed: (speed) =>
    set((state) => ({
      playback: {
        ...state.playback,
        speed: Math.max(0.25, Math.min(speed, 3)),
      },
    })),
  setParam: (key, value) =>
    set((state) => ({
      params: {
        ...state.params,
        [key]: value,
      },
    })),
  resetParams: () => set({ params: defaultParams }),
}));

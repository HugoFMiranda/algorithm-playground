export type ComparisonPlaybackStatus = "idle" | "playing" | "paused" | "completed";

export interface ComparisonPlaybackState {
  status: ComparisonPlaybackStatus;
  speed: number;
  cursor: number;
}

export const COMPARE_PLAYBACK_MIN_SPEED = 0.25;
export const COMPARE_PLAYBACK_MAX_SPEED = 8;
export const COMPARE_PLAYBACK_SPEED_STEP = 0.25;
export const DEFAULT_COMPARE_PLAYBACK_STATE: ComparisonPlaybackState = {
  status: "idle",
  speed: 1,
  cursor: -1,
};

export function normalizeComparePlaybackSpeed(rawSpeed: number): number {
  const snapped = Math.round(rawSpeed / COMPARE_PLAYBACK_SPEED_STEP) * COMPARE_PLAYBACK_SPEED_STEP;
  const rounded = Math.round(snapped * 100) / 100;
  return Math.max(COMPARE_PLAYBACK_MIN_SPEED, Math.min(rounded, COMPARE_PLAYBACK_MAX_SPEED));
}

export function resetComparePlayback(speed: number): ComparisonPlaybackState {
  return {
    status: "idle",
    speed: normalizeComparePlaybackSpeed(speed),
    cursor: -1,
  };
}

export function stepComparePlaybackForward(
  state: ComparisonPlaybackState,
  maxStepCount: number,
  options?: { keepStatus?: boolean },
): ComparisonPlaybackState {
  if (maxStepCount <= 0) {
    return {
      ...state,
      status: "completed",
      cursor: -1,
    };
  }

  const lastStepIndex = maxStepCount - 1;
  const nextCursor = Math.min(state.cursor + 1, lastStepIndex);
  const shouldKeepStatus = options?.keepStatus ?? false;

  return {
    ...state,
    cursor: nextCursor,
    status:
      nextCursor >= lastStepIndex
        ? "completed"
        : shouldKeepStatus
          ? state.status
          : "paused",
  };
}

export function stepComparePlaybackBackward(state: ComparisonPlaybackState): ComparisonPlaybackState {
  const nextCursor = Math.max(state.cursor - 1, -1);

  return {
    ...state,
    cursor: nextCursor,
    status: nextCursor < 0 ? "idle" : "paused",
  };
}

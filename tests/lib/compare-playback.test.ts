import { describe, expect, it } from "vitest";

import {
  COMPARE_PLAYBACK_MAX_SPEED,
  COMPARE_PLAYBACK_MIN_SPEED,
  DEFAULT_COMPARE_PLAYBACK_STATE,
  normalizeComparePlaybackSpeed,
  resetComparePlayback,
  stepComparePlaybackBackward,
  stepComparePlaybackForward,
  type ComparisonPlaybackState,
} from "@/lib/compare-playback";

describe("compare playback helpers", () => {
  it("normalizes speed into the supported stepped range", () => {
    expect(normalizeComparePlaybackSpeed(0.1)).toBe(COMPARE_PLAYBACK_MIN_SPEED);
    expect(normalizeComparePlaybackSpeed(1.13)).toBe(1.25);
    expect(normalizeComparePlaybackSpeed(99)).toBe(COMPARE_PLAYBACK_MAX_SPEED);
  });

  it("resets playback to the idle pre-step cursor while preserving normalized speed", () => {
    expect(resetComparePlayback(1.12)).toEqual({
      status: "idle",
      speed: 1,
      cursor: -1,
    });
  });

  it("steps forward to the last synchronized cursor and marks completion", () => {
    const first = stepComparePlaybackForward(DEFAULT_COMPARE_PLAYBACK_STATE, 3);
    const second = stepComparePlaybackForward(first, 3);
    const third = stepComparePlaybackForward(second, 3);
    const fourth = stepComparePlaybackForward(third, 3);

    expect(first).toEqual({
      status: "paused",
      speed: 1,
      cursor: 0,
    });
    expect(second.cursor).toBe(1);
    expect(third).toEqual({
      status: "completed",
      speed: 1,
      cursor: 2,
    });
    expect(fourth).toEqual(third);
  });

  it("can preserve playing status while auto-advancing before completion", () => {
    const playingState: ComparisonPlaybackState = {
      status: "playing",
      speed: 1.5,
      cursor: 0,
    };

    expect(stepComparePlaybackForward(playingState, 4, { keepStatus: true })).toEqual({
      status: "playing",
      speed: 1.5,
      cursor: 1,
    });
    expect(stepComparePlaybackForward(playingState, 2, { keepStatus: true })).toEqual({
      status: "completed",
      speed: 1.5,
      cursor: 1,
    });
  });

  it("steps backward to the idle cursor floor", () => {
    const activeState: ComparisonPlaybackState = {
      status: "completed",
      speed: 2,
      cursor: 2,
    };

    expect(stepComparePlaybackBackward(activeState)).toEqual({
      status: "paused",
      speed: 2,
      cursor: 1,
    });
    expect(
      stepComparePlaybackBackward({
        status: "paused",
        speed: 2,
        cursor: 0,
      }),
    ).toEqual({
      status: "idle",
      speed: 2,
      cursor: -1,
    });
  });

  it("treats empty step streams as completed forward playback", () => {
    expect(stepComparePlaybackForward(DEFAULT_COMPARE_PLAYBACK_STATE, 0)).toEqual({
      status: "completed",
      speed: 1,
      cursor: -1,
    });
  });
});

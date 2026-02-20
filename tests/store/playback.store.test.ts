import { beforeEach, describe, expect, it } from "vitest";

import { useAppStore } from "@/store/app-store";

describe("app store playback", () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  it("initializes bubble sort run from runtime registry", () => {
    const store = useAppStore.getState();
    store.initializeAlgorithm("bubble-sort");

    const state = useAppStore.getState();
    expect(state.selectedAlgorithmSlug).toBe("bubble-sort");
    expect(state.run).not.toBeNull();
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
  });

  it("initializes binary search run from runtime registry", () => {
    const store = useAppStore.getState();
    store.initializeAlgorithm("binary-search");

    const state = useAppStore.getState();
    expect(state.selectedAlgorithmSlug).toBe("binary-search");
    expect(state.run).not.toBeNull();
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
  });

  it("advances cursor and reaches completed state", () => {
    useAppStore.getState().initializeAlgorithm("binary-search");
    useAppStore.getState().setPlaybackStatus("playing");

    const totalSteps = useAppStore.getState().run?.steps.length ?? 0;
    for (let index = 0; index < totalSteps; index += 1) {
      useAppStore.getState().stepForward({ keepStatus: true });
    }

    const state = useAppStore.getState();
    expect(state.playback.cursor).toBe(totalSteps - 1);
    expect(state.playback.status).toBe("completed");
  });

  it("resets playback cursor without mutating run data", () => {
    useAppStore.getState().initializeAlgorithm("binary-search");
    useAppStore.getState().stepForward();
    useAppStore.getState().resetPlayback();

    const state = useAppStore.getState();
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
    expect(state.run?.steps.length).toBeGreaterThan(0);
  });

  it("steps backward by one event and pauses playback", () => {
    useAppStore.getState().initializeAlgorithm("binary-search");
    useAppStore.getState().setPlaybackStatus("playing");
    useAppStore.getState().stepForward({ keepStatus: true });
    useAppStore.getState().stepForward({ keepStatus: true });

    useAppStore.getState().stepBackward();

    const state = useAppStore.getState();
    expect(state.playback.cursor).toBe(0);
    expect(state.playback.status).toBe("paused");
  });

  it("returns to idle start when stepping backward from first step", () => {
    useAppStore.getState().initializeAlgorithm("binary-search");
    useAppStore.getState().stepForward();

    useAppStore.getState().stepBackward();

    const state = useAppStore.getState();
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
  });

  it("regenerates run when params change", () => {
    useAppStore.getState().initializeAlgorithm("binary-search");
    useAppStore.getState().setParam("target", 999);

    const state = useAppStore.getState();
    expect(state.run?.normalizedParams.target).toBe(999);
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
  });

  it("initializes a-star run from runtime registry", () => {
    const store = useAppStore.getState();
    store.initializeAlgorithm("a-star");

    const state = useAppStore.getState();
    expect(state.selectedAlgorithmSlug).toBe("a-star");
    expect(state.run).not.toBeNull();
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
  });

  it("initializes quick-sort run from runtime registry", () => {
    const store = useAppStore.getState();
    store.initializeAlgorithm("quick-sort");

    const state = useAppStore.getState();
    expect(state.selectedAlgorithmSlug).toBe("quick-sort");
    expect(state.run).not.toBeNull();
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
  });

  it("initializes heap-sort run from runtime registry", () => {
    const store = useAppStore.getState();
    store.initializeAlgorithm("heap-sort");

    const state = useAppStore.getState();
    expect(state.selectedAlgorithmSlug).toBe("heap-sort");
    expect(state.run).not.toBeNull();
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
  });

  it("resets playback when dijkstra grid params are edited", () => {
    useAppStore.getState().initializeAlgorithm("dijkstra");
    useAppStore.getState().setPlaybackStatus("playing");
    useAppStore.getState().stepForward({ keepStatus: true });
    useAppStore.getState().setParams({
      blockedCells: "3, 4, 5",
      heavyCells: "6, 7",
      weightOverrides: "7:15",
    });

    const state = useAppStore.getState();
    expect(state.run?.algorithmSlug).toBe("dijkstra");
    expect(state.run?.normalizedParams.blockedCells).toBe("3, 4, 5");
    expect(state.playback.cursor).toBe(-1);
    expect(state.playback.status).toBe("idle");
  });
});

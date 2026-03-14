import { describe, expect, it } from "vitest";

import {
  getSimpleRendererFamily,
  RENDERER_MODE_STORAGE_KEY,
  supportsSimpleRenderer,
} from "@/lib/renderer-mode";

describe("renderer mode support", () => {
  it("supports simple renderers for array rollout algorithms", () => {
    expect(supportsSimpleRenderer("bubble-sort")).toBe(true);
    expect(supportsSimpleRenderer("binary-search")).toBe(true);
    expect(supportsSimpleRenderer("counting-sort")).toBe(true);
    expect(getSimpleRendererFamily("bubble-sort")).toBe("array");
    expect(getSimpleRendererFamily("binary-search")).toBe("array");
  });

  it("supports simple renderers for grid rollout algorithms", () => {
    expect(supportsSimpleRenderer("bfs")).toBe(true);
    expect(supportsSimpleRenderer("dijkstra")).toBe(true);
    expect(supportsSimpleRenderer("bidirectional-bfs")).toBe(true);
    expect(getSimpleRendererFamily("bfs")).toBe("grid");
  });

  it("keeps graph and tree families advanced-only", () => {
    expect(supportsSimpleRenderer("topological-sort")).toBe(false);
    expect(supportsSimpleRenderer("avl-rotations")).toBe(false);
    expect(getSimpleRendererFamily("trie-operations")).toBeNull();
  });

  it("uses a stable local storage key for renderer mode persistence", () => {
    expect(RENDERER_MODE_STORAGE_KEY).toBe("algorithm-playground.renderer-mode");
  });
});

import { describe, expect, it } from "vitest";

import { getAlgorithmExamplesBySlug } from "@/algorithms/examples/registry";

describe("algorithm examples registry", () => {
  it("returns binary search snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("binary-search");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns null for algorithms without examples", () => {
    expect(getAlgorithmExamplesBySlug("dfs")).toBeNull();
  });
});

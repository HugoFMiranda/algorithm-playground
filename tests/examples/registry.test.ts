import { describe, expect, it } from "vitest";

import { getAlgorithmExamplesBySlug } from "@/algorithms/examples/registry";

describe("algorithm examples registry", () => {
  it("returns bubble sort snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("bubble-sort");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns a-star snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("a-star");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns quick-sort snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("quick-sort");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns heap-sort snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("heap-sort");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns topological-sort snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("topological-sort");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns invert-binary-tree snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("invert-binary-tree");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns union-find snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("union-find");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns kruskal-mst snippets in pseudocode and typescript", () => {
    const examples = getAlgorithmExamplesBySlug("kruskal-mst");

    expect(examples).not.toBeNull();
    expect(examples?.snippets.map((snippet) => snippet.language)).toEqual(["pseudocode", "typescript"]);
  });

  it("returns null for algorithms without examples", () => {
    expect(getAlgorithmExamplesBySlug("prim-mst")).toBeNull();
  });
});

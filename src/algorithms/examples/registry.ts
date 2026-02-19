import { binarySearchExamples } from "@/algorithms/examples/binary-search";
import type { AlgorithmExamples } from "@/types/examples";

const EXAMPLES_REGISTRY: Record<string, AlgorithmExamples> = {
  "binary-search": binarySearchExamples,
};

export function getAlgorithmExamplesBySlug(slug: string): AlgorithmExamples | null {
  return EXAMPLES_REGISTRY[slug] ?? null;
}

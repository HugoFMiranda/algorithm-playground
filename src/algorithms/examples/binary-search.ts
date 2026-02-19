import type { AlgorithmExamples } from "@/types/examples";

export const binarySearchExamples: AlgorithmExamples = {
  algorithmSlug: "binary-search",
  title: "Binary Search Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "binary-search-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function binarySearch(values, target):
  low <- 0
  high <- length(values) - 1

  while low <= high:
    mid <- low + floor((high - low) / 2)

    if values[mid] == target:
      return mid

    if values[mid] < target:
      low <- mid + 1
    else:
      high <- mid - 1

  return -1`,
    },
    {
      id: "binary-search-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function binarySearch(values: number[], target: number): number {
  let low = 0;
  let high = values.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const current = values[mid];

    if (current === target) {
      return mid;
    }

    if (current < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}`,
    },
  ],
};

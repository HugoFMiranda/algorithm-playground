import type { AlgorithmExamples } from "@/types/examples";

export const insertionSortExamples: AlgorithmExamples = {
  algorithmSlug: "insertion-sort",
  title: "Insertion Sort Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "insertion-sort-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function insertionSort(values):
  n <- length(values)

  for pass from 1 to n - 1:
    key <- values[pass]
    j <- pass - 1

    while j >= 0 and values[j] > key:
      values[j + 1] <- values[j]
      j <- j - 1

    values[j + 1] <- key

  return values`,
    },
    {
      id: "insertion-sort-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function insertionSort(values: number[], allowEarlyPlacement = true): number[] {
  const output = [...values];

  for (let pass = 1; pass < output.length; pass += 1) {
    const key = output[pass];
    let insertionIndex = pass;

    for (let index = pass - 1; index >= 0; index -= 1) {
      if (output[index] > key) {
        output[index + 1] = output[index];
        insertionIndex = index;
      } else if (allowEarlyPlacement) {
        break;
      }
    }

    output[insertionIndex] = key;
  }

  return output;
}`,
    },
  ],
};

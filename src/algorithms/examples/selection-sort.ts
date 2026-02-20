import type { AlgorithmExamples } from "@/types/examples";

export const selectionSortExamples: AlgorithmExamples = {
  algorithmSlug: "selection-sort",
  title: "Selection Sort Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "selection-sort-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function selectionSort(values):
  n <- length(values)

  for pass from 0 to n - 2:
    minIndex <- pass

    for i from pass + 1 to n - 1:
      if values[i] < values[minIndex]:
        minIndex <- i

    if minIndex != pass:
      swap values[pass], values[minIndex]

  return values`,
    },
    {
      id: "selection-sort-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function selectionSort(values: number[], swapOnlyWhenNeeded = true): number[] {
  const output = [...values];

  for (let pass = 0; pass < output.length - 1; pass += 1) {
    let minIndex = pass;

    for (let index = pass + 1; index < output.length; index += 1) {
      if (output[index] < output[minIndex]) {
        minIndex = index;
      }
    }

    if (!swapOnlyWhenNeeded || minIndex !== pass) {
      [output[pass], output[minIndex]] = [output[minIndex], output[pass]];
    }
  }

  return output;
}`,
    },
  ],
};

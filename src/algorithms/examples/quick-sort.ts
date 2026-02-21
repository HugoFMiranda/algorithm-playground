import type { AlgorithmExamples } from "@/types/examples";

export const quickSortExamples: AlgorithmExamples = {
  algorithmSlug: "quick-sort",
  title: "Quick Sort Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "quick-sort-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function quickSort(values, low, high):
  if low >= high:
    return

  pivot <- values[high]
  store <- low

  for i from low to high - 1:
    if values[i] < pivot:
      swap values[i], values[store]
      store <- store + 1

  swap values[store], values[high]

  quickSort(values, low, store - 1)
  quickSort(values, store + 1, high)`,
    },
    {
      id: "quick-sort-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function quickSort(values: number[]): number[] {
  const output = [...values];

  const partition = (low: number, high: number): number => {
    const pivot = output[high];
    let store = low;

    for (let i = low; i < high; i += 1) {
      if (output[i] < pivot) {
        [output[i], output[store]] = [output[store], output[i]];
        store += 1;
      }
    }

    [output[store], output[high]] = [output[high], output[store]];
    return store;
  };

  const sort = (low: number, high: number): void => {
    if (low >= high) {
      return;
    }

    const pivotIndex = partition(low, high);
    sort(low, pivotIndex - 1);
    sort(pivotIndex + 1, high);
  };

  sort(0, output.length - 1);
  return output;
}`,
    },
  ],
};

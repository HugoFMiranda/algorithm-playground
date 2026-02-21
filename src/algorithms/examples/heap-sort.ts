import type { AlgorithmExamples } from "@/types/examples";

export const heapSortExamples: AlgorithmExamples = {
  algorithmSlug: "heap-sort",
  title: "Heap Sort Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "heap-sort-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function heapSort(values):
  n <- length(values)

  for i from floor(n / 2) - 1 down to 0:
    siftDown(values, i, n)

  for end from n - 1 down to 1:
    swap values[0], values[end]
    siftDown(values, 0, end)

  return values

function siftDown(values, root, heapSize):
  while true:
    largest <- root
    left <- 2 * root + 1
    right <- left + 1

    if left < heapSize and values[left] > values[largest]:
      largest <- left

    if right < heapSize and values[right] > values[largest]:
      largest <- right

    if largest == root:
      break

    swap values[root], values[largest]
    root <- largest`,
    },
    {
      id: "heap-sort-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function heapSort(values: number[]): number[] {
  const output = [...values];

  const siftDown = (startIndex: number, heapSize: number): void => {
    let root = startIndex;

    while (true) {
      let largest = root;
      const left = root * 2 + 1;
      const right = left + 1;

      if (left < heapSize && output[left] > output[largest]) {
        largest = left;
      }

      if (right < heapSize && output[right] > output[largest]) {
        largest = right;
      }

      if (largest === root) {
        return;
      }

      [output[root], output[largest]] = [output[largest], output[root]];
      root = largest;
    }
  };

  for (let index = Math.floor(output.length / 2) - 1; index >= 0; index -= 1) {
    siftDown(index, output.length);
  }

  for (let end = output.length - 1; end > 0; end -= 1) {
    [output[0], output[end]] = [output[end], output[0]];
    siftDown(0, end);
  }

  return output;
}`,
    },
  ],
};

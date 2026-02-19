import type { AlgorithmExamples } from "@/types/examples";

export const bubbleSortExamples: AlgorithmExamples = {
  algorithmSlug: "bubble-sort",
  title: "Bubble Sort Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "bubble-sort-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function bubbleSort(values):
  n <- length(values)

  for pass from 0 to n - 2:
    swapped <- false

    for i from 0 to n - pass - 2:
      if values[i] > values[i + 1]:
        swap values[i], values[i + 1]
        swapped <- true

    if swapped == false:
      break

  return values`,
    },
    {
      id: "bubble-sort-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function bubbleSort(values: number[], optimizeEarlyExit = true): number[] {
  const output = [...values];

  for (let pass = 0; pass < output.length - 1; pass += 1) {
    let swapped = false;

    for (let index = 0; index < output.length - pass - 1; index += 1) {
      if (output[index] > output[index + 1]) {
        [output[index], output[index + 1]] = [output[index + 1], output[index]];
        swapped = true;
      }
    }

    if (optimizeEarlyExit && !swapped) {
      break;
    }
  }

  return output;
}`,
    },
  ],
};

import type { AlgorithmExamples } from "@/types/examples";

export const mergeSortExamples: AlgorithmExamples = {
  algorithmSlug: "merge-sort",
  title: "Merge Sort Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "merge-sort-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function mergeSort(values):
  if length(values) <= 1:
    return values

  mid <- floor(length(values) / 2)
  left <- mergeSort(values[0..mid-1])
  right <- mergeSort(values[mid..end])

  return merge(left, right)

function merge(left, right):
  output <- []
  i <- 0
  j <- 0

  while i < length(left) and j < length(right):
    if left[i] <= right[j]:
      append left[i] to output
      i <- i + 1
    else:
      append right[j] to output
      j <- j + 1

  append remaining left and right values to output
  return output`,
    },
    {
      id: "merge-sort-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function mergeSort(values: number[]): number[] {
  if (values.length <= 1) {
    return [...values];
  }

  const mid = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, mid));
  const right = mergeSort(values.slice(mid));
  const output: number[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      output.push(left[i]);
      i += 1;
    } else {
      output.push(right[j]);
      j += 1;
    }
  }

  while (i < left.length) {
    output.push(left[i]);
    i += 1;
  }

  while (j < right.length) {
    output.push(right[j]);
    j += 1;
  }

  return output;
}`,
    },
  ],
};

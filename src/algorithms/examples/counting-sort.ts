import type { AlgorithmExamples } from "@/types/examples";

export const countingSortExamples: AlgorithmExamples = {
  algorithmSlug: "counting-sort",
  title: "Counting Sort Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "counting-sort-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function countingSort(values):
  minValue <- min(values)
  maxValue <- max(values)
  counts <- array(maxValue - minValue + 1, fill 0)
  output <- array(length(values))

  for value in values:
    counts[value - minValue] <- counts[value - minValue] + 1

  for i from 1 to length(counts) - 1:
    counts[i] <- counts[i] + counts[i - 1]

  for i from length(values) - 1 down to 0:
    value <- values[i]
    bucket <- value - minValue
    counts[bucket] <- counts[bucket] - 1
    output[counts[bucket]] <- value

  return output`,
    },
    {
      id: "counting-sort-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function countingSort(values: number[]): number[] {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const counts = Array.from({ length: maxValue - minValue + 1 }, () => 0);

  for (const value of values) {
    counts[value - minValue] += 1;
  }

  for (let index = 1; index < counts.length; index += 1) {
    counts[index] += counts[index - 1];
  }

  const output = Array.from({ length: values.length }, () => 0);
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    const bucketIndex = value - minValue;
    counts[bucketIndex] -= 1;
    output[counts[bucketIndex]] = value;
  }

  return output;
}`,
    },
  ],
};

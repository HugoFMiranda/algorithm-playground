import type { AlgorithmExamples } from "@/types/examples";

export const dfsExamples: AlgorithmExamples = {
  algorithmSlug: "dfs",
  title: "Depth-First Search Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "dfs-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function dfs(graph, start, target):
  stack <- [start]
  visited <- { start }
  parent[start] <- none

  while stack is not empty:
    node <- pop(stack)

    if node == target:
      return reconstruct_path(parent, target)

    for neighbor in neighbors(node):
      if neighbor not in visited:
        visited.add(neighbor)
        parent[neighbor] <- node
        push(stack, neighbor)

  return no path`,
    },
    {
      id: "dfs-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function dfsPath(
  adjacency: number[][],
  start: number,
  target: number,
): number[] {
  const stack: number[] = [start];
  const visited = new Set<number>([start]);
  const parent = new Map<number, number>();

  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) {
      break;
    }

    if (node === target) {
      const path: number[] = [];
      let cursor: number | undefined = target;

      while (cursor !== undefined) {
        path.push(cursor);
        cursor = parent.get(cursor);
      }

      return path.reverse();
    }

    for (const neighbor of adjacency[node] ?? []) {
      if (visited.has(neighbor)) {
        continue;
      }

      visited.add(neighbor);
      parent.set(neighbor, node);
      stack.push(neighbor);
    }
  }

  return [];
}`,
    },
  ],
};

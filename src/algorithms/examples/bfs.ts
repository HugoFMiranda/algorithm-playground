import type { AlgorithmExamples } from "@/types/examples";

export const bfsExamples: AlgorithmExamples = {
  algorithmSlug: "bfs",
  title: "Breadth-First Search Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "bfs-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function bfs(graph, start, target):
  queue <- [start]
  visited <- { start }
  parent[start] <- none

  while queue is not empty:
    node <- pop_front(queue)

    if node == target:
      return reconstruct_path(parent, target)

    for neighbor in neighbors(node):
      if neighbor not in visited:
        visited.add(neighbor)
        parent[neighbor] <- node
        push_back(queue, neighbor)

  return no path`,
    },
    {
      id: "bfs-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function bfsShortestPath(
  adjacency: number[][],
  start: number,
  target: number,
): number[] {
  const queue: number[] = [start];
  const visited = new Set<number>([start]);
  const parent = new Map<number, number>();

  while (queue.length > 0) {
    const node = queue.shift();
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
      queue.push(neighbor);
    }
  }

  return [];
}`,
    },
  ],
};

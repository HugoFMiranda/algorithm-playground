import type { AlgorithmExamples } from "@/types/examples";

export const aStarExamples: AlgorithmExamples = {
  algorithmSlug: "a-star",
  title: "A* Search Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "a-star-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function a_star(graph, start, target, heuristic):
  open_set <- { start }
  g[start] <- 0
  f[start] <- heuristic(start, target)
  parent <- empty

  while open_set is not empty:
    node <- open_set node with lowest f
    remove node from open_set

    if node == target:
      return g[target], reconstruct_path(parent, target)

    for each (neighbor, weight) in edges(node):
      candidate_g <- g[node] + weight
      if candidate_g < g[neighbor]:
        parent[neighbor] <- node
        g[neighbor] <- candidate_g
        f[neighbor] <- candidate_g + heuristic(neighbor, target)
        add neighbor to open_set

  return not found`,
    },
    {
      id: "a-star-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function aStarPath(
  adjacency: Array<Array<{ to: number; weight: number }>>,
  start: number,
  target: number,
  heuristic: (from: number, to: number) => number,
): { distance: number; path: number[] } {
  const n = adjacency.length;
  const open = new Set<number>([start]);
  const parent = Array<number>(n).fill(-1);
  const g = Array<number>(n).fill(Number.POSITIVE_INFINITY);
  const f = Array<number>(n).fill(Number.POSITIVE_INFINITY);
  g[start] = 0;
  f[start] = heuristic(start, target);

  while (open.size > 0) {
    let node = -1;
    let bestF = Number.POSITIVE_INFINITY;

    for (const candidate of open) {
      if (f[candidate] < bestF) {
        node = candidate;
        bestF = f[candidate];
      }
    }

    open.delete(node);
    if (node === target) {
      const path: number[] = [];
      let cursor = target;
      while (cursor !== -1) {
        path.push(cursor);
        cursor = parent[cursor];
      }
      return { distance: g[target], path: path.reverse() };
    }

    for (const edge of adjacency[node] ?? []) {
      const candidateG = g[node] + edge.weight;
      if (candidateG < g[edge.to]) {
        parent[edge.to] = node;
        g[edge.to] = candidateG;
        f[edge.to] = candidateG + heuristic(edge.to, target);
        open.add(edge.to);
      }
    }
  }

  return { distance: -1, path: [] };
}`,
    },
  ],
};

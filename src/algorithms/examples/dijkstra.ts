import type { AlgorithmExamples } from "@/types/examples";

export const dijkstraExamples: AlgorithmExamples = {
  algorithmSlug: "dijkstra",
  title: "Dijkstra Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "dijkstra-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function dijkstra(graph, start, target):
  dist[start] <- 0
  dist[others] <- infinity
  parent <- empty
  frontier <- { start }

  while frontier is not empty:
    node <- frontier node with smallest dist
    remove node from frontier

    if node == target:
      return dist[target], reconstruct_path(parent, target)

    for each (neighbor, weight) in edges(node):
      candidate <- dist[node] + weight
      if candidate < dist[neighbor]:
        dist[neighbor] <- candidate
        parent[neighbor] <- node
        add neighbor to frontier

  return not found`,
    },
    {
      id: "dijkstra-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function dijkstraShortestPath(
  adjacency: Array<Array<{ to: number; weight: number }>>,
  start: number,
  target: number,
): { distance: number; path: number[] } {
  const n = adjacency.length;
  const dist = Array<number>(n).fill(Number.POSITIVE_INFINITY);
  const parent = Array<number>(n).fill(-1);
  const frontier = new Set<number>([start]);
  dist[start] = 0;

  while (frontier.size > 0) {
    let node = -1;
    let best = Number.POSITIVE_INFINITY;

    for (const candidate of frontier) {
      if (dist[candidate] < best) {
        node = candidate;
        best = dist[candidate];
      }
    }

    frontier.delete(node);
    if (node === target) {
      const path: number[] = [];
      let cursor = target;
      while (cursor !== -1) {
        path.push(cursor);
        cursor = parent[cursor];
      }
      return { distance: dist[target], path: path.reverse() };
    }

    for (const edge of adjacency[node] ?? []) {
      const candidate = dist[node] + edge.weight;
      if (candidate < dist[edge.to]) {
        dist[edge.to] = candidate;
        parent[edge.to] = node;
        frontier.add(edge.to);
      }
    }
  }

  return { distance: -1, path: [] };
}`,
    },
  ],
};

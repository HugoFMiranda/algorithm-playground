import type { AlgorithmExamples } from "@/types/examples";

export const bellmanFordExamples: AlgorithmExamples = {
  algorithmSlug: "bellman-ford",
  title: "Bellman-Ford Implementation",
  description:
    "These examples isolate the repeated edge-relaxation idea so the shortest-path updates and negative-cycle check are easy to map back to playback.",
  snippets: [
    {
      id: "bellman-ford-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function bellman_ford(edges, node_count, start):
  distance[start] <- 0
  distance[others] <- infinity
  parent[*] <- none

  repeat node_count - 1 times:
    changed <- false

    for (u, v, w) in edges:
      if distance[u] is infinity:
        continue

      candidate <- distance[u] + w
      if candidate < distance[v]:
        distance[v] <- candidate
        parent[v] <- u
        changed <- true

    if not changed:
      break

  for (u, v, w) in edges:
    if distance[u] + w < distance[v]:
      return negative_cycle

  return distance, parent`,
    },
    {
      id: "bellman-ford-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `type Edge = { from: number; to: number; weight: number };

export function bellmanFord(
  nodeCount: number,
  edges: Edge[],
  startNode: number,
): { distances: number[]; parents: number[]; negativeCycle: boolean } {
  const distances = Array.from({ length: nodeCount }, () => Number.POSITIVE_INFINITY);
  const parents = Array.from({ length: nodeCount }, () => -1);
  distances[startNode] = 0;

  for (let round = 0; round < nodeCount - 1; round += 1) {
    let changed = false;

    for (const edge of edges) {
      if (!Number.isFinite(distances[edge.from])) {
        continue;
      }

      const candidate = distances[edge.from] + edge.weight;
      if (candidate >= distances[edge.to]) {
        continue;
      }

      distances[edge.to] = candidate;
      parents[edge.to] = edge.from;
      changed = true;
    }

    if (!changed) {
      break;
    }
  }

  for (const edge of edges) {
    if (Number.isFinite(distances[edge.from]) && distances[edge.from] + edge.weight < distances[edge.to]) {
      return { distances, parents, negativeCycle: true };
    }
  }

  return { distances, parents, negativeCycle: false };
}`,
    },
  ],
};

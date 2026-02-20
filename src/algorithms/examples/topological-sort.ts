import type { AlgorithmExamples } from "@/types/examples";

export const topologicalSortExamples: AlgorithmExamples = {
  algorithmSlug: "topological-sort",
  title: "Topological Sort Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "topological-sort-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function topologicalSort(nodeCount, edges):
  indegree <- array of nodeCount filled with 0
  graph <- adjacency list

  for each (from, to) in edges:
    add to to graph[from]
    indegree[to] <- indegree[to] + 1

  queue <- all nodes with indegree 0
  order <- []

  while queue not empty:
    node <- pop from queue
    append node to order

    for each neighbor in graph[node]:
      indegree[neighbor] <- indegree[neighbor] - 1
      if indegree[neighbor] == 0:
        push neighbor to queue

  if length(order) != nodeCount:
    return { hasCycle: true, order: order }

  return { hasCycle: false, order: order }`,
    },
    {
      id: "topological-sort-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function topologicalSort(
  nodeCount: number,
  edges: Array<[number, number]>,
): { order: number[]; hasCycle: boolean } {
  const adjacency = Array.from({ length: nodeCount }, () => [] as number[]);
  const indegrees = Array.from({ length: nodeCount }, () => 0);

  for (const [from, to] of edges) {
    adjacency[from].push(to);
    indegrees[to] += 1;
  }

  const queue: number[] = [];
  for (let node = 0; node < nodeCount; node += 1) {
    if (indegrees[node] === 0) {
      queue.push(node);
    }
  }

  const order: number[] = [];
  while (queue.length > 0) {
    const node = queue.shift() as number;
    order.push(node);

    for (const neighbor of adjacency[node]) {
      indegrees[neighbor] -= 1;
      if (indegrees[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return {
    order,
    hasCycle: order.length !== nodeCount,
  };
}`,
    },
  ],
};

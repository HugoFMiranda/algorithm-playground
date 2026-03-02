import type { AlgorithmExamples } from "@/types/examples";

export const primMstExamples: AlgorithmExamples = {
  algorithmSlug: "prim-mst",
  title: "Prim MST Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "prim-mst-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function primMst(nodeCount, edges, start):
  inTree <- set with start
  mst <- []
  totalWeight <- 0

  while inTree has not all nodes:
    bestEdge <- null

    for each edge (u, v, w):
      if u inTree and v not inTree:
        consider (u, v, w)
      else if v inTree and u not inTree:
        consider (v, u, w)

      keep the minimum candidate edge by weight

    if bestEdge is null:
      break  // disconnected component finished

    add bestEdge.to to inTree
    append bestEdge to mst
    totalWeight <- totalWeight + bestEdge.weight

  return { mst, totalWeight }`,
    },
    {
      id: "prim-mst-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `type Edge = { from: number; to: number; weight: number };

export function primMst(
  nodeCount: number,
  edges: Edge[],
  start: number,
): { mst: Edge[]; totalWeight: number } {
  const visited = new Set<number>([start]);
  const mst: Edge[] = [];
  let totalWeight = 0;

  while (visited.size < nodeCount) {
    let best: Edge | null = null;

    for (const edge of edges) {
      const fromVisited = visited.has(edge.from);
      const toVisited = visited.has(edge.to);
      if (fromVisited === toVisited) {
        continue;
      }

      const oriented = fromVisited
        ? edge
        : { from: edge.to, to: edge.from, weight: edge.weight };

      if (!best || oriented.weight < best.weight) {
        best = oriented;
      }
    }

    if (!best) {
      break;
    }

    visited.add(best.to);
    mst.push(best);
    totalWeight += best.weight;
  }

  return { mst, totalWeight };
}`,
    },
  ],
};

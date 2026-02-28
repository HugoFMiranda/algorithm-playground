import type { AlgorithmExamples } from "@/types/examples";

export const kruskalMstExamples: AlgorithmExamples = {
  algorithmSlug: "kruskal-mst",
  title: "Kruskal MST Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "kruskal-mst-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function kruskalMst(nodeCount, edges):
  sort edges by ascending weight
  parent <- [0..nodeCount-1]
  rank <- array(nodeCount, 0)
  mst <- []
  totalWeight <- 0

  for each edge (u, v, w) in sorted edges:
    rootU <- find(parent, u)
    rootV <- find(parent, v)

    if rootU == rootV:
      continue

    union(parent, rank, rootU, rootV)
    append edge to mst
    totalWeight <- totalWeight + w

    if length(mst) == nodeCount - 1:
      break

  return { mst, totalWeight }`,
    },
    {
      id: "kruskal-mst-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `type Edge = { from: number; to: number; weight: number };

function find(parent: number[], node: number): number {
  if (parent[node] !== node) {
    parent[node] = find(parent, parent[node]);
  }
  return parent[node];
}

function union(parent: number[], rank: number[], left: number, right: number): void {
  if (rank[left] < rank[right]) {
    parent[left] = right;
    return;
  }

  if (rank[right] < rank[left]) {
    parent[right] = left;
    return;
  }

  parent[right] = left;
  rank[left] += 1;
}

export function kruskalMst(nodeCount: number, edges: Edge[]): { mst: Edge[]; totalWeight: number } {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);
  const parent = Array.from({ length: nodeCount }, (_, index) => index);
  const rank = Array.from({ length: nodeCount }, () => 0);
  const mst: Edge[] = [];
  let totalWeight = 0;

  for (const edge of sorted) {
    const leftRoot = find(parent, edge.from);
    const rightRoot = find(parent, edge.to);
    if (leftRoot === rightRoot) {
      continue;
    }

    union(parent, rank, leftRoot, rightRoot);
    mst.push(edge);
    totalWeight += edge.weight;

    if (mst.length === nodeCount - 1) {
      break;
    }
  }

  return { mst, totalWeight };
}`,
    },
  ],
};

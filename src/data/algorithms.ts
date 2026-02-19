export type AlgorithmCategory = "Pathfinding" | "Graph" | "Sorting";

export interface AlgorithmDefinition {
  name: string;
  slug: string;
  category: AlgorithmCategory;
  tags: string[];
  shortDescription: string;
}

export const ALGORITHMS: AlgorithmDefinition[] = [
  {
    name: "A* Search",
    slug: "a-star",
    category: "Pathfinding",
    tags: ["heuristic", "grid", "shortest-path"],
    shortDescription:
      "Heuristic-driven shortest path search balancing speed and optimality.",
  },
  {
    name: "Dijkstra",
    slug: "dijkstra",
    category: "Pathfinding",
    tags: ["weighted", "graph", "shortest-path"],
    shortDescription:
      "Deterministic shortest path baseline for weighted graphs with non-negative edges.",
  },
  {
    name: "Breadth-First Search",
    slug: "bfs",
    category: "Graph",
    tags: ["unweighted", "traversal", "queue"],
    shortDescription:
      "Layer-by-layer traversal that guarantees shortest paths in unweighted graphs.",
  },
  {
    name: "Depth-First Search",
    slug: "dfs",
    category: "Graph",
    tags: ["traversal", "stack", "exploration"],
    shortDescription:
      "Depth-prioritized traversal useful for connectivity and structure discovery.",
  },
  {
    name: "Merge Sort",
    slug: "merge-sort",
    category: "Sorting",
    tags: ["divide-and-conquer", "stable", "array"],
    shortDescription:
      "Stable divide-and-conquer sort with predictable O(n log n) behavior.",
  },
  {
    name: "Quick Sort",
    slug: "quick-sort",
    category: "Sorting",
    tags: ["partition", "in-place", "array"],
    shortDescription:
      "Partition-based sort known for strong average-case performance.",
  },
];

export function getAlgorithmBySlug(slug: string): AlgorithmDefinition | undefined {
  return ALGORITHMS.find((algorithm) => algorithm.slug === slug);
}

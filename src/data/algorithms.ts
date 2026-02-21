export type AlgorithmCategory =
  | "Sorting"
  | "Pathfinding"
  | "Graph Theory"
  | "Trees & Search";
export type AlgorithmDifficulty = "D1" | "D2" | "D3";
export type RoadmapPhase = "Phase 1" | "Phase 2" | "Phase 3";

export interface AlgorithmDefinition {
  name: string;
  slug: string;
  category: AlgorithmCategory;
  difficulty: AlgorithmDifficulty;
  roadmapPhase: RoadmapPhase;
  tags: string[];
  shortDescription: string;
}

export const ALGORITHMS: AlgorithmDefinition[] = [
  {
    name: "Bubble Sort",
    slug: "bubble-sort",
    category: "Sorting",
    difficulty: "D1",
    roadmapPhase: "Phase 1",
    tags: ["array", "adjacent-swap", "intro"],
    shortDescription:
      "Baseline sorting visual to introduce comparisons, swaps, and pass optimization.",
  },
  {
    name: "Selection Sort",
    slug: "selection-sort",
    category: "Sorting",
    difficulty: "D1",
    roadmapPhase: "Phase 1",
    tags: ["array", "min-selection", "intro"],
    shortDescription:
      "Selection-based sorting walkthrough focused on invariant tracking across partitions.",
  },
  {
    name: "Insertion Sort",
    slug: "insertion-sort",
    category: "Sorting",
    difficulty: "D1",
    roadmapPhase: "Phase 1",
    tags: ["array", "in-place", "adaptive"],
    shortDescription:
      "Incremental insertion flow ideal for understanding nearly sorted behavior.",
  },
  {
    name: "Merge Sort",
    slug: "merge-sort",
    category: "Sorting",
    difficulty: "D2",
    roadmapPhase: "Phase 1",
    tags: ["divide-and-conquer", "stable", "array"],
    shortDescription:
      "Stable divide-and-conquer sort with predictable O(n log n) behavior.",
  },
  {
    name: "Quick Sort",
    slug: "quick-sort",
    category: "Sorting",
    difficulty: "D2",
    roadmapPhase: "Phase 2",
    tags: ["partition", "in-place", "array"],
    shortDescription:
      "Partition-based sort known for strong average-case performance.",
  },
  {
    name: "Heap Sort",
    slug: "heap-sort",
    category: "Sorting",
    difficulty: "D3",
    roadmapPhase: "Phase 2",
    tags: ["heap", "in-place", "selection"],
    shortDescription:
      "Heap-backed sorting sequence visualizing sift-up and sift-down operations.",
  },
  {
    name: "Breadth-First Search",
    slug: "bfs",
    category: "Pathfinding",
    difficulty: "D1",
    roadmapPhase: "Phase 1",
    tags: ["unweighted", "traversal", "queue"],
    shortDescription:
      "Layer-by-layer traversal that guarantees shortest paths in unweighted graphs.",
  },
  {
    name: "Depth-First Search",
    slug: "dfs",
    category: "Pathfinding",
    difficulty: "D1",
    roadmapPhase: "Phase 1",
    tags: ["traversal", "stack", "exploration"],
    shortDescription:
      "Depth-prioritized traversal useful for connectivity and structure discovery.",
  },
  {
    name: "Dijkstra",
    slug: "dijkstra",
    category: "Pathfinding",
    difficulty: "D2",
    roadmapPhase: "Phase 1",
    tags: ["weighted", "graph", "shortest-path"],
    shortDescription:
      "Deterministic shortest path baseline for weighted graphs with non-negative edges.",
  },
  {
    name: "A* Search",
    slug: "a-star",
    category: "Pathfinding",
    difficulty: "D2",
    roadmapPhase: "Phase 1",
    tags: ["heuristic", "grid", "shortest-path"],
    shortDescription:
      "Heuristic-driven shortest path search balancing speed and optimality.",
  },
  {
    name: "Bidirectional BFS",
    slug: "bidirectional-bfs",
    category: "Pathfinding",
    difficulty: "D3",
    roadmapPhase: "Phase 3",
    tags: ["two-frontiers", "meet-point", "shortest-path"],
    shortDescription:
      "Two-ended BFS expansion to demonstrate frontier intersection optimization.",
  },
  {
    name: "Topological Sort",
    slug: "topological-sort",
    category: "Graph Theory",
    difficulty: "D2",
    roadmapPhase: "Phase 2",
    tags: ["dag", "ordering", "indegree"],
    shortDescription:
      "Directed acyclic graph ordering with indegree queue transitions.",
  },
  {
    name: "Union-Find",
    slug: "union-find",
    category: "Graph Theory",
    difficulty: "D2",
    roadmapPhase: "Phase 2",
    tags: ["disjoint-set", "path-compression", "rank"],
    shortDescription:
      "Component connectivity visual with path compression and union by rank.",
  },
  {
    name: "Kruskal MST",
    slug: "kruskal-mst",
    category: "Graph Theory",
    difficulty: "D2",
    roadmapPhase: "Phase 2",
    tags: ["minimum-spanning-tree", "edges", "union-find"],
    shortDescription:
      "Greedy edge selection for MST construction with cycle avoidance feedback.",
  },
  {
    name: "Prim MST",
    slug: "prim-mst",
    category: "Graph Theory",
    difficulty: "D2",
    roadmapPhase: "Phase 2",
    tags: ["minimum-spanning-tree", "priority-queue", "greedy"],
    shortDescription:
      "Vertex growth process for MST formation emphasizing candidate edge relaxation.",
  },
  {
    name: "Bellman-Ford",
    slug: "bellman-ford",
    category: "Graph Theory",
    difficulty: "D3",
    roadmapPhase: "Phase 3",
    tags: ["negative-weights", "relaxation", "cycle-detection"],
    shortDescription:
      "Edge-relaxation rounds including negative-cycle detection semantics.",
  },
  {
    name: "Binary Search",
    slug: "binary-search",
    category: "Trees & Search",
    difficulty: "D1",
    roadmapPhase: "Phase 1",
    tags: ["sorted-array", "divide-and-conquer", "bounds"],
    shortDescription:
      "Low-level search baseline illustrating midpoint decision boundaries.",
  },
  {
    name: "Invert Binary Tree",
    slug: "invert-binary-tree",
    category: "Trees & Search",
    difficulty: "D1",
    roadmapPhase: "Phase 2",
    tags: ["tree", "recursion", "transformation"],
    shortDescription:
      "Mirror a binary tree by swapping each node's left and right children.",
  },
  {
    name: "BST Operations",
    slug: "bst-operations",
    category: "Trees & Search",
    difficulty: "D2",
    roadmapPhase: "Phase 3",
    tags: ["tree", "insert", "delete", "search"],
    shortDescription:
      "Binary search tree insertion, lookup, and deletion walkthroughs.",
  },
  {
    name: "AVL Rotations",
    slug: "avl-rotations",
    category: "Trees & Search",
    difficulty: "D3",
    roadmapPhase: "Phase 3",
    tags: ["self-balancing", "rotations", "height"],
    shortDescription:
      "Balance-factor-driven single and double rotation visual explanation.",
  },
  {
    name: "Trie Operations",
    slug: "trie-operations",
    category: "Trees & Search",
    difficulty: "D2",
    roadmapPhase: "Phase 2",
    tags: ["prefix-tree", "insert", "lookup"],
    shortDescription:
      "Prefix tree operations showcasing branching and shared-prefix structure.",
  },
];

export function getAlgorithmBySlug(slug: string): AlgorithmDefinition | undefined {
  return ALGORITHMS.find((algorithm) => algorithm.slug === slug);
}

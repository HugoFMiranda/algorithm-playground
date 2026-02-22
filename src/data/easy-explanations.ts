const ALGORITHM_EASY_EXPLANATIONS: Record<string, string> = {
  "bubble-sort":
    "Bubble Sort repeatedly compares neighboring numbers and swaps them until larger values bubble to the end.",
  "selection-sort":
    "Selection Sort finds the smallest remaining value each pass and places it at the next sorted position.",
  "insertion-sort":
    "Insertion Sort grows a sorted left side by inserting each new value into the correct spot in that side.",
  "merge-sort":
    "Merge Sort splits the array into smaller pieces, sorts each piece, then merges them back in order.",
  "quick-sort":
    "Quick Sort picks a pivot, groups smaller values to one side and larger values to the other, then repeats.",
  "heap-sort":
    "Heap Sort builds a max-heap so the largest value is easy to remove, then repeats to produce sorted order.",
  bfs: "BFS explores neighbors level by level, so the first time it reaches a target is the shortest unweighted path.",
  dfs: "DFS explores one path deeply before backtracking, which is useful for full traversal and structure discovery.",
  dijkstra:
    "Dijkstra always expands the currently cheapest known node, guaranteeing shortest paths with non-negative weights.",
  "a-star":
    "A* uses distance-so-far plus a heuristic guess to focus search toward the goal while still finding optimal paths.",
  "bidirectional-bfs":
    "Bidirectional BFS searches from both start and goal at once, meeting in the middle to reduce explored area.",
  "topological-sort":
    "Topological Sort orders tasks so every prerequisite appears before the tasks that depend on it.",
  "union-find":
    "Union-Find quickly tracks which elements belong to the same group and merges groups efficiently.",
  "kruskal-mst":
    "Kruskal builds a minimum spanning tree by taking the cheapest edges that do not create cycles.",
  "prim-mst":
    "Prim grows a minimum spanning tree from one node by repeatedly taking the cheapest edge to a new node.",
  "bellman-ford":
    "Bellman-Ford relaxes edges repeatedly to find shortest paths and can detect negative-weight cycles.",
  "binary-search":
    "Binary Search checks the middle of a sorted list and discards half each step until it finds the target.",
  "invert-binary-tree":
    "Invert Binary Tree mirrors a tree by swapping the left and right child at every node.",
  "bst-operations":
    "BST operations follow left-smaller and right-larger rules to search, insert, and delete values efficiently.",
  "avl-rotations":
    "AVL rotations rebalance a binary search tree after updates so lookups stay fast.",
  "trie-operations":
    "Trie operations store words by shared prefixes, making prefix searches and autocomplete efficient.",
};

const DEFAULT_EASY_EXPLANATION =
  "This algorithm has a plain-language explanation that focuses on what it does and why it is useful.";

export function getAlgorithmEasyExplanation(slug: string): string {
  return ALGORITHM_EASY_EXPLANATIONS[slug] ?? DEFAULT_EASY_EXPLANATION;
}

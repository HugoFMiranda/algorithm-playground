import type { AlgorithmExamples } from "@/types/examples";

export const unionFindExamples: AlgorithmExamples = {
  algorithmSlug: "union-find",
  title: "Union-Find Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "union-find-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function find(x):
  if parent[x] != x:
    parent[x] <- find(parent[x])
  return parent[x]

function union(a, b):
  rootA <- find(a)
  rootB <- find(b)

  if rootA == rootB:
    return false

  if rank[rootA] < rank[rootB]:
    swap rootA, rootB

  parent[rootB] <- rootA
  if rank[rootA] == rank[rootB]:
    rank[rootA] <- rank[rootA] + 1

  return true`,
    },
    {
      id: "union-find-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export class UnionFind {
  private readonly parent: number[];
  private readonly rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, index) => index);
    this.rank = Array.from({ length: size }, () => 0);
  }

  find(node: number): number {
    if (this.parent[node] !== node) {
      this.parent[node] = this.find(this.parent[node]);
    }

    return this.parent[node];
  }

  union(left: number, right: number): boolean {
    let rootLeft = this.find(left);
    let rootRight = this.find(right);

    if (rootLeft === rootRight) {
      return false;
    }

    if (this.rank[rootLeft] < this.rank[rootRight]) {
      [rootLeft, rootRight] = [rootRight, rootLeft];
    }

    this.parent[rootRight] = rootLeft;

    if (this.rank[rootLeft] === this.rank[rootRight]) {
      this.rank[rootLeft] += 1;
    }

    return true;
  }

  connected(left: number, right: number): boolean {
    return this.find(left) === this.find(right);
  }
}`,
    },
  ],
};

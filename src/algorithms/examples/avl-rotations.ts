import type { AlgorithmExamples } from "@/types/examples";

export const avlRotationsExamples: AlgorithmExamples = {
  algorithmSlug: "avl-rotations",
  title: "AVL Rotations Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "avl-rotations-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function rebalance(node):
  updateHeight(node)
  balance <- height(node.left) - height(node.right)

  if balance > 1:
    if height(node.left.left) < height(node.left.right):
      node.left <- rotateLeft(node.left)
    return rotateRight(node)

  if balance < -1:
    if height(node.right.right) < height(node.right.left):
      node.right <- rotateRight(node.right)
    return rotateLeft(node)

  return node`,
    },
    {
      id: "avl-rotations-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `type AvlNode = {
  value: number;
  height: number;
  left: AvlNode | null;
  right: AvlNode | null;
};

function rotateLeft(pivot: AvlNode): AvlNode {
  const nextRoot = pivot.right as AvlNode;
  pivot.right = nextRoot.left;
  nextRoot.left = pivot;
  updateHeight(pivot);
  updateHeight(nextRoot);
  return nextRoot;
}

function rotateRight(pivot: AvlNode): AvlNode {
  const nextRoot = pivot.left as AvlNode;
  pivot.left = nextRoot.right;
  nextRoot.right = pivot;
  updateHeight(pivot);
  updateHeight(nextRoot);
  return nextRoot;
}`,
    },
  ],
};

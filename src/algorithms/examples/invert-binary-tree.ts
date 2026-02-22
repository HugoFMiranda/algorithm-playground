import type { AlgorithmExamples } from "@/types/examples";

export const invertBinaryTreeExamples: AlgorithmExamples = {
  algorithmSlug: "invert-binary-tree",
  title: "Invert Binary Tree Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "invert-binary-tree-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function invertTree(node):
  if node is null:
    return null

  swap node.left and node.right

  invertTree(node.left)
  invertTree(node.right)

  return node`,
    },
    {
      id: "invert-binary-tree-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `type TreeNode = {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

export function invertBinaryTree(root: TreeNode | null): TreeNode | null {
  if (!root) {
    return null;
  }

  const temp = root.left;
  root.left = root.right;
  root.right = temp;

  invertBinaryTree(root.left);
  invertBinaryTree(root.right);

  return root;
}`,
    },
  ],
};

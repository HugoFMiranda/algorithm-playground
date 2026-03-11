import type { AlgorithmExamples } from "@/types/examples";

export const bstOperationsExamples: AlgorithmExamples = {
  algorithmSlug: "bst-operations",
  title: "BST Operations Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "bst-operations-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function search(node, target):
  while node is not null:
    if target == node.value:
      return node
    if target < node.value:
      node <- node.left
    else:
      node <- node.right
  return null

function insert(node, value):
  if node is null:
    return new Node(value)
  if value < node.value:
    node.left <- insert(node.left, value)
  else if value > node.value:
    node.right <- insert(node.right, value)
  return node`,
    },
    {
      id: "bst-operations-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `type TreeNode = {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

export function search(root: TreeNode | null, target: number): TreeNode | null {
  let node = root;

  while (node) {
    if (target === node.value) {
      return node;
    }

    node = target < node.value ? node.left : node.right;
  }

  return null;
}

export function insert(root: TreeNode | null, value: number): TreeNode {
  if (!root) {
    return { value, left: null, right: null };
  }

  if (value < root.value) {
    root.left = insert(root.left, value);
  } else if (value > root.value) {
    root.right = insert(root.right, value);
  }

  return root;
}`,
    },
  ],
};

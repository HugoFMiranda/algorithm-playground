import type { AlgorithmExamples } from "@/types/examples";

export const trieOperationsExamples: AlgorithmExamples = {
  algorithmSlug: "trie-operations",
  title: "Trie Operations Implementation",
  description:
    "Reference implementation examples are intentionally abstracted from the playback engine so learners can map concepts to code.",
  snippets: [
    {
      id: "trie-operations-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function insert(root, word):
  node <- root
  for each char in word:
    if char not in node.children:
      node.children[char] <- new TrieNode()
    node <- node.children[char]
  node.isTerminal <- true

function search(root, word):
  node <- root
  for each char in word:
    if char not in node.children:
      return false
    node <- node.children[char]
  return node.isTerminal

function startsWith(root, prefix):
  node <- root
  for each char in prefix:
    if char not in node.children:
      return false
    node <- node.children[char]
  return true`,
    },
    {
      id: "trie-operations-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `type TrieNode = {
  children: Map<string, TrieNode>;
  terminal: boolean;
};

export class Trie {
  private readonly root: TrieNode = { children: new Map(), terminal: false };

  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), terminal: false });
      }
      node = node.children.get(char) as TrieNode;
    }
    node.terminal = true;
  }

  search(word: string): boolean {
    const node = this.walk(word);
    return Boolean(node?.terminal);
  }

  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== null;
  }

  private walk(token: string): TrieNode | null {
    let node: TrieNode = this.root;
    for (const char of token) {
      const next = node.children.get(char);
      if (!next) {
        return null;
      }
      node = next;
    }
    return node;
  }
}`,
    },
  ],
};

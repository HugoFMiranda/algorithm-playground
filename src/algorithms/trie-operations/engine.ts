import type { AlgorithmEngine, AlgorithmRunOutput, RawParams, StepEventBase } from "@/types/engine";

import {
  type TrieNodeSnapshot,
  type TrieOperationsInput,
  type TrieOperationsParams,
  type TrieOperationsResult,
  type TrieQuery,
  normalizeTrieOperationsInput,
  normalizeTrieOperationsParams,
} from "@/algorithms/trie-operations/spec";

type NodeCreateEvent = StepEventBase<
  "search",
  "node-create",
  {
    nodeId: number;
    parentId: number;
    char: string;
    depth: number;
    word: string;
    wordIndex: number;
  }
>;

type TraverseCharEvent = StepEventBase<
  "search",
  "traverse-char",
  {
    mode: "insert" | "search" | "prefix";
    token: string;
    tokenIndex: number;
    char: string;
    charIndex: number;
    fromNodeId: number;
    toNodeId: number | null;
    existed: boolean;
  }
>;

type WordTerminalSetEvent = StepEventBase<
  "search",
  "word-terminal-set",
  {
    nodeId: number;
    word: string;
    wordIndex: number;
    terminalNodes: number;
  }
>;

type QueryResultEvent = StepEventBase<
  "search",
  "query-result",
  {
    queryType: "search" | "prefix";
    term: string;
    queryIndex: number;
    matched: boolean;
    matchedNodeId: number | null;
  }
>;

type CompleteEvent = StepEventBase<
  "search",
  "complete",
  {
    createdNodes: number;
    terminalNodes: number;
    wordsInserted: number;
    queryCount: number;
    searchHits: number;
    prefixHits: number;
  }
>;

export type TrieOperationsStepEvent =
  | NodeCreateEvent
  | TraverseCharEvent
  | WordTerminalSetEvent
  | QueryResultEvent
  | CompleteEvent;

function createEvent<TEvent extends TrieOperationsStepEvent>(
  index: number,
  type: TEvent["type"],
  payload: TEvent["payload"],
): TEvent {
  return {
    id: `trie-operations-${index}`,
    index,
    family: "search",
    type,
    payload,
  } as TEvent;
}

interface TrieNodeMutable {
  id: number;
  char: string;
  parentId: number | null;
  depth: number;
  terminal: boolean;
  children: Record<string, number>;
}

function createRootNode(): TrieNodeMutable {
  return {
    id: 0,
    char: "",
    parentId: null,
    depth: 0,
    terminal: false,
    children: {},
  };
}

function toNodeSnapshots(nodes: TrieNodeMutable[]): TrieNodeSnapshot[] {
  return nodes.map((node) => ({
    id: node.id,
    char: node.char,
    parentId: node.parentId,
    depth: node.depth,
    terminal: node.terminal,
  }));
}

function processQuery(
  query: TrieQuery,
  queryIndex: number,
  nodes: TrieNodeMutable[],
  emit: (step: TrieOperationsStepEvent) => void,
  getNextIndex: () => number,
): { matched: boolean; matchedNodeId: number | null } {
  let cursor = 0;
  let matched = true;

  for (let charIndex = 0; charIndex < query.term.length; charIndex += 1) {
    const char = query.term[charIndex] as string;
    const nextNodeId = nodes[cursor]?.children[char] ?? null;
    emit(
      createEvent(getNextIndex(), "traverse-char", {
        mode: query.type,
        token: query.term,
        tokenIndex: queryIndex,
        char,
        charIndex,
        fromNodeId: cursor,
        toNodeId: nextNodeId,
        existed: nextNodeId !== null,
      }),
    );

    if (nextNodeId === null) {
      matched = false;
      break;
    }

    cursor = nextNodeId;
  }

  if (!matched) {
    return { matched: false, matchedNodeId: null };
  }

  if (query.type === "search" && !nodes[cursor]?.terminal) {
    return { matched: false, matchedNodeId: cursor };
  }

  return { matched: true, matchedNodeId: cursor };
}

export const trieOperationsEngine: AlgorithmEngine<
  TrieOperationsInput,
  TrieOperationsParams,
  TrieOperationsStepEvent,
  TrieOperationsResult
> = {
  normalizeParams: normalizeTrieOperationsParams,
  normalizeInput: normalizeTrieOperationsInput,
  generate: (input) => {
    const steps: TrieOperationsStepEvent[] = [];
    const nodes: TrieNodeMutable[] = [createRootNode()];
    let nextIndex = 0;
    let createdNodes = 0;
    let terminalNodes = 0;
    let searchHits = 0;
    let prefixHits = 0;

    const emit = (step: TrieOperationsStepEvent) => {
      steps.push(step);
      nextIndex += 1;
    };

    const getNextIndex = (): number => nextIndex;

    input.words.forEach((word, wordIndex) => {
      let cursor = 0;

      for (let charIndex = 0; charIndex < word.length; charIndex += 1) {
        const char = word[charIndex] as string;
        const existingNodeId = nodes[cursor]?.children[char];
        const existed = typeof existingNodeId === "number";
        let nextNodeId = existed ? (existingNodeId as number) : null;

        if (!existed) {
          nextNodeId = nodes.length;
          const nextNode: TrieNodeMutable = {
            id: nextNodeId,
            char,
            parentId: cursor,
            depth: nodes[cursor].depth + 1,
            terminal: false,
            children: {},
          };
          nodes.push(nextNode);
          nodes[cursor].children[char] = nextNodeId;
          createdNodes += 1;
          emit(
            createEvent(getNextIndex(), "node-create", {
              nodeId: nextNodeId,
              parentId: cursor,
              char,
              depth: nextNode.depth,
              word,
              wordIndex,
            }),
          );
        }

        emit(
          createEvent(getNextIndex(), "traverse-char", {
            mode: "insert",
            token: word,
            tokenIndex: wordIndex,
            char,
            charIndex,
            fromNodeId: cursor,
            toNodeId: nextNodeId,
            existed,
          }),
        );

        cursor = nextNodeId as number;
      }

      if (!nodes[cursor].terminal) {
        nodes[cursor].terminal = true;
        terminalNodes += 1;
        emit(
          createEvent(getNextIndex(), "word-terminal-set", {
            nodeId: cursor,
            word,
            wordIndex,
            terminalNodes,
          }),
        );
      }
    });

    input.queries.forEach((query, queryIndex) => {
      const queryResult = processQuery(query, queryIndex, nodes, emit, getNextIndex);
      if (query.type === "search" && queryResult.matched) {
        searchHits += 1;
      }
      if (query.type === "prefix" && queryResult.matched) {
        prefixHits += 1;
      }

      emit(
        createEvent(getNextIndex(), "query-result", {
          queryType: query.type,
          term: query.term,
          queryIndex,
          matched: queryResult.matched,
          matchedNodeId: queryResult.matchedNodeId,
        }),
      );
    });

    emit(
      createEvent(getNextIndex(), "complete", {
        createdNodes,
        terminalNodes,
        wordsInserted: input.words.length,
        queryCount: input.queries.length,
        searchHits,
        prefixHits,
      }),
    );

    return {
      steps,
      result: {
        nodes: toNodeSnapshots(nodes),
        createdNodes,
        terminalNodes,
        wordsInserted: input.words.length,
        queryCount: input.queries.length,
        searchHits,
        prefixHits,
      },
    };
  },
};

export function createTrieOperationsRun(
  rawParams: RawParams,
): AlgorithmRunOutput<
  TrieOperationsInput,
  TrieOperationsParams,
  TrieOperationsStepEvent,
  TrieOperationsResult
> {
  const normalizedParams = trieOperationsEngine.normalizeParams(rawParams);
  const input = trieOperationsEngine.normalizeInput(undefined, normalizedParams);
  const { steps, result } = trieOperationsEngine.generate(input, normalizedParams);

  return {
    input,
    normalizedParams,
    steps,
    result,
  };
}

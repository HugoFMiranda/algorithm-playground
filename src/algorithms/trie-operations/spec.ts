import type { ParamPrimitive, RawParams } from "@/types/engine";

export type TrieQueryType = "search" | "prefix";

export interface TrieQuery {
  type: TrieQueryType;
  term: string;
  source: string;
}

export interface TrieNodeSnapshot {
  id: number;
  char: string;
  parentId: number | null;
  depth: number;
  terminal: boolean;
}

export interface TrieOperationsParams extends Record<string, ParamPrimitive> {
  words: string;
  queries: string;
  caseSensitive: boolean;
}

export interface TrieOperationsInput {
  words: string[];
  queries: TrieQuery[];
  caseSensitive: boolean;
}

export interface TrieOperationsResult {
  nodes: TrieNodeSnapshot[];
  createdNodes: number;
  terminalNodes: number;
  wordsInserted: number;
  queryCount: number;
  searchHits: number;
  prefixHits: number;
}

const DEFAULT_WORD_LIST = ["cat", "car", "dog", "dart", "deal"] as const;
const DEFAULT_QUERY_LIST = ["search car", "search cap", "prefix da", "prefix ca"] as const;
const DEFAULT_CASE_SENSITIVE = false;

export const TRIE_OPERATIONS_DEFAULT_PARAMS: TrieOperationsParams = {
  words: DEFAULT_WORD_LIST.join(", "),
  queries: DEFAULT_QUERY_LIST.join(", "),
  caseSensitive: DEFAULT_CASE_SENSITIVE,
};

function parseBoolean(rawValue: RawParams[keyof RawParams], fallback: boolean): boolean {
  if (typeof rawValue === "boolean") {
    return rawValue;
  }

  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return rawValue !== 0;
  }

  if (typeof rawValue === "string") {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return fallback;
}

function parseText(rawValue: RawParams[keyof RawParams], fallback: string): string {
  if (typeof rawValue === "string" && rawValue.trim().length > 0) {
    return rawValue;
  }

  return fallback;
}

function normalizeToken(token: string, caseSensitive: boolean): string {
  const base = token.trim();
  const cleaned = base.replace(/[^a-zA-Z]/g, "");
  if (cleaned.length === 0) {
    return "";
  }

  return caseSensitive ? cleaned : cleaned.toLowerCase();
}

function uniqueWords(words: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const word of words) {
    if (seen.has(word)) {
      continue;
    }
    seen.add(word);
    normalized.push(word);
  }

  return normalized;
}

function parseWords(wordsText: string, caseSensitive: boolean): string[] {
  const tokens = wordsText
    .split(/[\s,;\n\r\t]+/g)
    .map((token) => normalizeToken(token, caseSensitive))
    .filter((token) => token.length > 0);

  const words = uniqueWords(tokens);
  return words.length > 0 ? words : [...DEFAULT_WORD_LIST];
}

function parseQueryType(token: string): TrieQueryType | null {
  const normalized = token.trim().toLowerCase();
  if (normalized === "search" || normalized === "find") {
    return "search";
  }
  if (normalized === "prefix" || normalized === "startswith" || normalized === "starts-with") {
    return "prefix";
  }
  return null;
}

function parseQueries(queriesText: string, caseSensitive: boolean): TrieQuery[] {
  const segments = queriesText
    .split(/[\n,;]+/g)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const queries: TrieQuery[] = [];
  for (const segment of segments) {
    const match = segment.match(/^([a-zA-Z-]+)\s+(.+)$/);
    if (!match) {
      continue;
    }

    const type = parseQueryType(match[1]);
    if (!type) {
      continue;
    }

    const term = normalizeToken(match[2], caseSensitive);
    if (term.length === 0) {
      continue;
    }

    queries.push({
      type,
      term,
      source: segment,
    });
  }

  if (queries.length > 0) {
    return queries;
  }

  return DEFAULT_QUERY_LIST.map((queryText) => {
    const [rawType, ...rest] = queryText.split(/\s+/g);
    const type = parseQueryType(rawType) as TrieQueryType;
    const term = normalizeToken(rest.join(" "), caseSensitive);
    return { type, term, source: queryText };
  });
}

export function normalizeTrieOperationsParams(rawParams: RawParams): TrieOperationsParams {
  return {
    words: parseText(rawParams.words, TRIE_OPERATIONS_DEFAULT_PARAMS.words),
    queries: parseText(rawParams.queries, TRIE_OPERATIONS_DEFAULT_PARAMS.queries),
    caseSensitive: parseBoolean(rawParams.caseSensitive, DEFAULT_CASE_SENSITIVE),
  };
}

export function normalizeTrieOperationsInput(
  rawInput: unknown,
  params: TrieOperationsParams,
): TrieOperationsInput {
  const caseSensitive = params.caseSensitive;
  let words = parseWords(params.words, caseSensitive);
  let queries = parseQueries(params.queries, caseSensitive);

  if (typeof rawInput === "object" && rawInput !== null) {
    if ("words" in rawInput && Array.isArray(rawInput.words)) {
      const rawWords = rawInput.words
        .filter((value): value is string => typeof value === "string")
        .map((value) => normalizeToken(value, caseSensitive))
        .filter((value) => value.length > 0);
      if (rawWords.length > 0) {
        words = uniqueWords(rawWords);
      }
    }

    if ("queries" in rawInput && Array.isArray(rawInput.queries)) {
      const rawQueries = rawInput.queries.filter(
        (query): query is TrieQuery =>
          typeof query === "object" &&
          query !== null &&
          "type" in query &&
          "term" in query &&
          (query.type === "search" || query.type === "prefix") &&
          typeof query.term === "string",
      );
      if (rawQueries.length > 0) {
        queries = rawQueries
          .map((query) => ({
            type: query.type,
            term: normalizeToken(query.term, caseSensitive),
            source: `${query.type} ${query.term}`,
          }))
          .filter((query) => query.term.length > 0);
      }
    }
  }

  return {
    words,
    queries: queries.length > 0 ? queries : parseQueries(TRIE_OPERATIONS_DEFAULT_PARAMS.queries, caseSensitive),
    caseSensitive,
  };
}

function getRandomInteger(minInclusive: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

const RANDOM_WORD_POOL = [
  "cat",
  "car",
  "cart",
  "care",
  "dog",
  "dove",
  "dart",
  "deal",
  "deer",
  "dot",
  "apple",
  "app",
  "apt",
] as const;

export function createRandomTrieOperationsParams(): TrieOperationsParams {
  const caseSensitive = Math.random() >= 0.65;
  const wordCount = getRandomInteger(5, 8);
  const pool = [...RANDOM_WORD_POOL];
  const words: string[] = [];

  while (words.length < wordCount && pool.length > 0) {
    const index = getRandomInteger(0, pool.length - 1);
    const next = pool.splice(index, 1)[0] as string;
    words.push(caseSensitive && Math.random() >= 0.7 ? next.toUpperCase() : next);
  }

  const queries: string[] = [];
  const searchTerm = words[getRandomInteger(0, words.length - 1)] ?? "cat";
  queries.push(`search ${searchTerm}`);
  queries.push(`search ${searchTerm.slice(0, Math.max(1, searchTerm.length - 1))}z`);
  const prefixTerm = searchTerm.slice(0, Math.min(2, searchTerm.length));
  queries.push(`prefix ${prefixTerm}`);
  queries.push(`prefix zz`);

  return {
    words: words.join(", "),
    queries: queries.join(", "),
    caseSensitive,
  };
}

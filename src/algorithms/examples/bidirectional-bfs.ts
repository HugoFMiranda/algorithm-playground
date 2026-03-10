import type { AlgorithmExamples } from "@/types/examples";

export const bidirectionalBfsExamples: AlgorithmExamples = {
  algorithmSlug: "bidirectional-bfs",
  title: "Bidirectional BFS Implementation",
  description:
    "These examples show the core two-frontier idea independently from the playback engine so the meeting logic is easier to read.",
  snippets: [
    {
      id: "bidirectional-bfs-pseudocode",
      label: "Pseudocode",
      language: "pseudocode",
      code: `function bidirectional_bfs(graph, start, target):
  if start == target:
    return [start]

  forward_queue <- [start]
  backward_queue <- [target]
  forward_parent[start] <- none
  backward_parent[target] <- none
  forward_seen <- { start }
  backward_seen <- { target }

  while forward_queue not empty and backward_queue not empty:
    active_direction <- choose_frontier(forward_queue, backward_queue)

    for each node in current_layer(active_direction):
      for neighbor in neighbors(node):
        if neighbor already seen by active_direction:
          continue

        record parent for neighbor in active_direction

        if neighbor seen by opposite_direction:
          return stitch_paths(forward_parent, backward_parent, neighbor)

        mark neighbor seen
        push neighbor into active frontier

  return no path`,
    },
    {
      id: "bidirectional-bfs-typescript",
      label: "TypeScript",
      language: "typescript",
      code: `export function bidirectionalBfsShortestPath(
  adjacency: number[][],
  start: number,
  target: number,
): number[] {
  if (start === target) {
    return [start];
  }

  const forwardQueue: number[] = [start];
  const backwardQueue: number[] = [target];
  const forwardParent = new Map<number, number>();
  const backwardParent = new Map<number, number>();
  const forwardSeen = new Set<number>([start]);
  const backwardSeen = new Set<number>([target]);

  const buildPath = (meeting: number): number[] => {
    const left: number[] = [];
    let cursor: number | undefined = meeting;
    while (cursor !== undefined) {
      left.push(cursor);
      cursor = forwardParent.get(cursor);
    }

    const right: number[] = [];
    cursor = backwardParent.get(meeting);
    while (cursor !== undefined) {
      right.push(cursor);
      cursor = backwardParent.get(cursor);
    }

    return [...left.reverse(), ...right];
  };

  while (forwardQueue.length > 0 && backwardQueue.length > 0) {
    const expandForward = forwardQueue.length <= backwardQueue.length;
    const queue = expandForward ? forwardQueue : backwardQueue;
    const seen = expandForward ? forwardSeen : backwardSeen;
    const oppositeSeen = expandForward ? backwardSeen : forwardSeen;
    const parent = expandForward ? forwardParent : backwardParent;

    const layerSize = queue.length;
    for (let index = 0; index < layerSize; index += 1) {
      const node = queue.shift();
      if (node === undefined) {
        break;
      }

      for (const neighbor of adjacency[node] ?? []) {
        if (seen.has(neighbor)) {
          continue;
        }

        parent.set(neighbor, node);
        if (oppositeSeen.has(neighbor)) {
          return buildPath(neighbor);
        }

        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return [];
}`,
    },
  ],
};

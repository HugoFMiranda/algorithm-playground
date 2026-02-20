const PATHFINDING_ALGORITHM_SLUGS = new Set([
  "bfs",
  "dfs",
  "dijkstra",
  "a-star",
  "bidirectional-bfs",
]);
const GRAPH_ALGORITHM_SLUGS = new Set([
  "topological-sort",
  "union-find",
  "kruskal-mst",
  "prim-mst",
  "bellman-ford",
]);

export const PLAYBACK_MIN_SPEED = 0.25;
export const PLAYBACK_DEFAULT_SPEED = 1;
export const PLAYBACK_MAX_SPEED = 10;
export const PLAYBACK_SPEED_STEP = 0.25;
export const PLAYBACK_GRAPH_PATH_SPEED_MULTIPLIER = 2.5;

export function isPathfindingAlgorithm(slug: string | null): boolean {
  if (!slug) {
    return false;
  }

  return PATHFINDING_ALGORITHM_SLUGS.has(slug);
}

export function isGraphAlgorithm(slug: string | null): boolean {
  if (!slug) {
    return false;
  }

  return GRAPH_ALGORITHM_SLUGS.has(slug);
}

function isGraphOrPathAlgorithm(slug: string | null): boolean {
  return isPathfindingAlgorithm(slug) || isGraphAlgorithm(slug);
}

export function getPlaybackDefaultSpeed(slug: string | null): number {
  return PLAYBACK_DEFAULT_SPEED;
}

export function getPlaybackMaxSpeed(slug: string | null): number {
  return PLAYBACK_MAX_SPEED;
}

export function getPlaybackSpeedStep(slug: string | null): number {
  return PLAYBACK_SPEED_STEP;
}

export function getPlaybackEffectiveSpeed(slug: string | null, speed: number): number {
  return isGraphOrPathAlgorithm(slug) ? speed * PLAYBACK_GRAPH_PATH_SPEED_MULTIPLIER : speed;
}

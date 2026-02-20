const PATHFINDING_ALGORITHM_SLUGS = new Set([
  "bfs",
  "dfs",
  "dijkstra",
  "a-star",
  "bidirectional-bfs",
]);

export const PLAYBACK_MIN_SPEED = 0.25;
export const PLAYBACK_DEFAULT_SPEED = 1;
export const PLAYBACK_DEFAULT_PATHFINDING_SPEED = 3;
export const PLAYBACK_MAX_SPEED = 3;
export const PLAYBACK_MAX_PATHFINDING_SPEED = 6;
export const PLAYBACK_SPEED_STEP = 0.25;
export const PLAYBACK_PATHFINDING_SPEED_STEP = 0.5;

export function isPathfindingAlgorithm(slug: string | null): boolean {
  if (!slug) {
    return false;
  }

  return PATHFINDING_ALGORITHM_SLUGS.has(slug);
}

export function getPlaybackDefaultSpeed(slug: string | null): number {
  return isPathfindingAlgorithm(slug) ? PLAYBACK_DEFAULT_PATHFINDING_SPEED : PLAYBACK_DEFAULT_SPEED;
}

export function getPlaybackMaxSpeed(slug: string | null): number {
  return isPathfindingAlgorithm(slug) ? PLAYBACK_MAX_PATHFINDING_SPEED : PLAYBACK_MAX_SPEED;
}

export function getPlaybackSpeedStep(slug: string | null): number {
  return isPathfindingAlgorithm(slug) ? PLAYBACK_PATHFINDING_SPEED_STEP : PLAYBACK_SPEED_STEP;
}

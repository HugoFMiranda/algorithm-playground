export function parseCellList(text: string, cellCount: number): number[] {
  if (typeof text !== "string" || text.trim().length === 0 || cellCount <= 0) {
    return [];
  }

  const cells = text
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.floor(value))
    .filter((value) => value >= 0 && value < cellCount);

  return [...new Set(cells)].sort((left, right) => left - right);
}

export function serializeCellList(cells: Iterable<number>): string {
  const normalized = [...cells]
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.floor(value))
    .filter((value, index, values) => value >= 0 && values.indexOf(value) === index)
    .sort((left, right) => left - right);

  return normalized.join(", ");
}

export function parseWeightOverrides(
  text: string,
  cellCount: number,
  minWeight = 1,
  maxWeight = 15,
): Map<number, number> {
  if (typeof text !== "string" || text.trim().length === 0 || cellCount <= 0) {
    return new Map<number, number>();
  }

  const parsed = new Map<number, number>();
  const tokens = text
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  for (const token of tokens) {
    const [cellText, weightText] = token.split(":");
    if (!cellText || !weightText) {
      continue;
    }

    const cell = Number(cellText);
    const weight = Number(weightText);
    if (!Number.isFinite(cell) || !Number.isFinite(weight)) {
      continue;
    }

    const normalizedCell = Math.floor(cell);
    if (normalizedCell < 0 || normalizedCell >= cellCount) {
      continue;
    }

    const normalizedWeight = Math.max(minWeight, Math.min(maxWeight, Math.floor(weight)));
    parsed.set(normalizedCell, normalizedWeight);
  }

  return new Map([...parsed.entries()].sort((left, right) => left[0] - right[0]));
}

export function serializeWeightOverrides(overrides: Map<number, number>): string {
  const entries = [...overrides.entries()]
    .filter(([cell, weight]) => Number.isFinite(cell) && Number.isFinite(weight))
    .map(([cell, weight]) => [Math.floor(cell), Math.floor(weight)] as const)
    .filter(([cell]) => cell >= 0)
    .sort((left, right) => left[0] - right[0]);

  return entries.map(([cell, weight]) => `${cell}:${weight}`).join(", ");
}

import { describe, expect, it } from "vitest";

import {
  parseCellList,
  parseWeightOverrides,
  serializeCellList,
  serializeWeightOverrides,
} from "@/lib/path-grid-edit";

describe("path grid edit utilities", () => {
  it("parses and serializes cell lists deterministically", () => {
    const parsed = parseCellList("8, 2, 8, -1, 3, 20, x, 1", 12);

    expect(parsed).toEqual([1, 2, 3, 8]);
    expect(serializeCellList(parsed)).toBe("1, 2, 3, 8");
  });

  it("parses and serializes weight overrides with clamping", () => {
    const parsed = parseWeightOverrides("6:12, 9:3, 100:1, bad, 9:4, 4:0, 2:20", 12);

    expect([...parsed.entries()]).toEqual([
      [2, 15],
      [4, 1],
      [6, 12],
      [9, 4],
    ]);
    expect(serializeWeightOverrides(parsed)).toBe("2:15, 4:1, 6:12, 9:4");
  });
});

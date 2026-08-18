import { describe, expect, it } from "vitest";
import {
  getIndexesForRetainedRowIds,
  normalizeVirtualizedRenderCacheSize,
} from "../../../src/components-core/utils/virtualized-render-cache";

describe("virtualized render cache", () => {
  it("normalizes cache sizes", () => {
    expect(normalizeVirtualizedRenderCacheSize(12.8)).toBe(12);
    expect(normalizeVirtualizedRenderCacheSize(-1)).toBe(0);
    expect(normalizeVirtualizedRenderCacheSize(Number.NaN, 7)).toBe(7);
    expect(normalizeVirtualizedRenderCacheSize(undefined, 7)).toBe(7);
  });

  it("remaps retained row identities to current indexes", () => {
    const rows = ["d", "b", "a", "c"];

    expect(
      getIndexesForRetainedRowIds({
        retainedIds: ["a", "b", "missing"],
        rowCount: rows.length,
        getRowId: (index) => rows[index],
        maxSize: 10,
      }),
    ).toEqual([1, 2]);
  });

  it("caps retained indexes and ignores duplicate current identities", () => {
    const rows = ["a", "b", "a", "c"];

    expect(
      getIndexesForRetainedRowIds({
        retainedIds: ["a", "b", "c"],
        rowCount: rows.length,
        getRowId: (index) => rows[index],
        maxSize: 2,
      }),
    ).toEqual([0, 1]);
  });

  it("returns no indexes when disabled by size or empty data", () => {
    expect(
      getIndexesForRetainedRowIds({
        retainedIds: ["a"],
        rowCount: 1,
        getRowId: () => "a",
        maxSize: 0,
      }),
    ).toEqual([]);
    expect(
      getIndexesForRetainedRowIds({
        retainedIds: ["a"],
        rowCount: 0,
        getRowId: () => "a",
        maxSize: 10,
      }),
    ).toEqual([]);
  });
});

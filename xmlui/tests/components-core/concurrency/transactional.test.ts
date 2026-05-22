/**
 * W7-1 / plan #06 Phase 4 — transactional buffer tests.
 */

import { describe, it, expect } from "vitest";
import {
  createTransactionalBuffer,
  detectSnapshotConflict,
} from "../../../src/components-core/concurrency/transactional";

describe("createTransactionalBuffer", () => {
  it("starts empty and reports size", () => {
    const b = createTransactionalBuffer();
    expect(b.size).toBe(0);
    expect(b.drain()).toEqual([]);
  });

  it("buffers writes and drains them in insertion order", () => {
    const b = createTransactionalBuffer();
    b.push({ pathArray: ["x"], newValue: 1, target: {}, action: "set" });
    b.push({ pathArray: ["y"], newValue: 2, target: {}, action: "set" });
    expect(b.size).toBe(2);
    const out = b.drain();
    expect(out.map((w) => w.pathArray[0])).toEqual(["x", "y"]);
    expect(b.size).toBe(0);
  });

  it("discard() drops all buffered writes", () => {
    const b = createTransactionalBuffer();
    b.push({ pathArray: ["x"], newValue: 1, target: {}, action: "set" });
    b.discard();
    expect(b.size).toBe(0);
    expect(b.drain()).toEqual([]);
  });
});

describe("detectSnapshotConflict", () => {
  it("returns false when snapshot matches live state for all written keys", () => {
    const ref = { x: 1, y: { a: 2 } };
    const snap = { ...ref };
    const live = { ...ref };
    expect(detectSnapshotConflict(snap, live, [["x"], ["y", "a"]])).toBe(false);
  });

  it("returns true when any written top-level key differs by reference", () => {
    const obj = { a: 1 };
    const snap = { x: 0, y: obj };
    const live = { x: 0, y: { ...obj } }; // y has a fresh reference
    expect(detectSnapshotConflict(snap, live, [["y", "a"]])).toBe(true);
  });

  it("returns false when paths is empty", () => {
    expect(detectSnapshotConflict({ x: 1 }, { x: 2 }, [])).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { computeNextFocusIndex } from "../../../src/components/TileGrid/TileGridReact";

// ---------------------------------------------------------------------------
// Base test scenario: 12 items displayed in a 4-column grid
// Layout (0-based flat indices):
//   [0]  [1]  [2]  [3]
//   [4]  [5]  [6]  [7]
//   [8]  [9]  [10] [11]
// ---------------------------------------------------------------------------
const BASE = { count: 12, cols: 4, visibleRows: 2, ctrl: false };

function nav(key: string, focusedIndex: number, overrides: Partial<typeof BASE> = {}) {
  return computeNextFocusIndex({ ...BASE, ...overrides, key, focusedIndex, ctrl: overrides.ctrl ?? false });
}

function navCtrl(key: string, focusedIndex: number, overrides: Partial<typeof BASE> = {}) {
  return computeNextFocusIndex({ ...BASE, ...overrides, key, focusedIndex, ctrl: true });
}

describe("computeNextFocusIndex — basic movement", () => {
  it("ArrowRight moves one step right", () => {
    expect(nav("ArrowRight", 3)).toBe(4);
    expect(nav("ArrowRight", 0)).toBe(1);
    expect(nav("ArrowRight", 7)).toBe(8);
  });

  it("ArrowRight clamps at last item", () => {
    expect(nav("ArrowRight", 11)).toBe(11);
  });

  it("ArrowLeft moves one step left", () => {
    expect(nav("ArrowLeft", 1)).toBe(0);
    expect(nav("ArrowLeft", 5)).toBe(4);
  });

  it("ArrowLeft clamps at first item", () => {
    expect(nav("ArrowLeft", 0)).toBe(0);
  });

  it("ArrowDown moves one row down (same column)", () => {
    expect(nav("ArrowDown", 0)).toBe(4);
    expect(nav("ArrowDown", 3)).toBe(7);
    expect(nav("ArrowDown", 5)).toBe(9);
  });

  it("ArrowDown clamps at last row — stays in place (same column)", () => {
    // items 8-11 are the last row — each stays at its own index
    expect(nav("ArrowDown", 8)).toBe(8);
    expect(nav("ArrowDown", 9)).toBe(9);
    expect(nav("ArrowDown", 10)).toBe(10);
    expect(nav("ArrowDown", 11)).toBe(11);
  });

  it("ArrowUp moves one row up (same column)", () => {
    expect(nav("ArrowUp", 4)).toBe(0);
    expect(nav("ArrowUp", 7)).toBe(3);
    expect(nav("ArrowUp", 9)).toBe(5);
  });

  it("ArrowUp clamps at first row — stays in place (same column)", () => {
    expect(nav("ArrowUp", 0)).toBe(0);
    expect(nav("ArrowUp", 1)).toBe(1);
    expect(nav("ArrowUp", 2)).toBe(2);
    expect(nav("ArrowUp", 3)).toBe(3);
  });
});

describe("computeNextFocusIndex — Home / End", () => {
  it("Home moves to start of current row", () => {
    expect(nav("Home", 3)).toBe(0);
    expect(nav("Home", 6)).toBe(4);
    expect(nav("Home", 9)).toBe(8);
    expect(nav("Home", 0)).toBe(0);
  });

  it("End moves to last item in current row", () => {
    expect(nav("End", 0)).toBe(3);
    expect(nav("End", 5)).toBe(7);
    expect(nav("End", 9)).toBe(11);
    expect(nav("End", 3)).toBe(3);
  });

  it("End clamps to last item when row is not full", () => {
    // 10 items, 4 cols → last row has items 8, 9 only
    expect(nav("End", 8, { count: 10 })).toBe(9);
    expect(nav("End", 9, { count: 10 })).toBe(9);
  });

  it("Ctrl+Home goes to absolute first item", () => {
    expect(navCtrl("Home", 11)).toBe(0);
    expect(navCtrl("Home", 5)).toBe(0);
    expect(navCtrl("Home", 0)).toBe(0);
  });

  it("Ctrl+End goes to absolute last item", () => {
    expect(navCtrl("End", 0)).toBe(11);
    expect(navCtrl("End", 5)).toBe(11);
    expect(navCtrl("End", 11)).toBe(11);
  });
});

describe("computeNextFocusIndex — PageUp / PageDown", () => {
  it("PageDown moves visibleRows rows down", () => {
    // visibleRows=2, cols=4 → move 8 items
    expect(nav("PageDown", 0)).toBe(8);
    expect(nav("PageDown", 1)).toBe(9);
  });

  it("PageDown clamps at last item", () => {
    expect(nav("PageDown", 8)).toBe(11);
    expect(nav("PageDown", 11)).toBe(11);
  });

  it("PageUp moves visibleRows rows up", () => {
    expect(nav("PageUp", 8)).toBe(0);
    expect(nav("PageUp", 9)).toBe(1);
  });

  it("PageUp clamps at first item", () => {
    expect(nav("PageUp", 0)).toBe(0);
    expect(nav("PageUp", 2)).toBe(0);
  });
});

describe("computeNextFocusIndex — empty grid", () => {
  it("returns null when count is zero", () => {
    expect(nav("ArrowDown", -1, { count: 0 })).toBeNull();
    expect(nav("Home", 0, { count: 0 })).toBeNull();
  });
});

describe("computeNextFocusIndex — no current focus (focusedIndex = -1)", () => {
  it("any navigation key returns 0 when nothing is focused", () => {
    expect(nav("ArrowDown", -1)).toBe(0);
    expect(nav("ArrowUp", -1)).toBe(0);
    expect(nav("ArrowLeft", -1)).toBe(0);
    expect(nav("ArrowRight", -1)).toBe(0);
    expect(nav("Home", -1)).toBe(0);
    expect(nav("End", -1)).toBe(0);
    expect(nav("PageDown", -1)).toBe(0);
    expect(nav("PageUp", -1)).toBe(0);
  });
});

describe("computeNextFocusIndex — single column grid", () => {
  const single = { count: 5, cols: 1, visibleRows: 3 };

  it("ArrowDown is identical to ArrowRight in a 1-col grid", () => {
    expect(nav("ArrowDown", 0, single)).toBe(1);
    expect(nav("ArrowDown", 4, single)).toBe(4); // clamp
  });

  it("ArrowUp is identical to ArrowLeft in a 1-col grid", () => {
    expect(nav("ArrowUp", 2, single)).toBe(1);
    expect(nav("ArrowUp", 0, single)).toBe(0); // clamp
  });
});

describe("computeNextFocusIndex — unrecognised keys return null", () => {
  it("returns null for non-navigation keys", () => {
    expect(nav("Enter", 0)).toBeNull();
    expect(nav(" ", 0)).toBeNull();
    expect(nav("Tab", 0)).toBeNull();
    expect(nav("Escape", 0)).toBeNull();
    expect(nav("a", 0)).toBeNull();
  });
});

describe("computeNextFocusIndex — single-item grid", () => {
  const one = { count: 1, cols: 1, visibleRows: 1 };

  it("all movement keys stay at 0", () => {
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].forEach(
      (key) => {
        expect(nav(key, 0, one)).toBe(0);
      },
    );
  });
});

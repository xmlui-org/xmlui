import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readLocalStorage,
  writeLocalStorage,
  deleteLocalStorage,
  clearLocalStorage,
} from "../../src/components-core/appContext/local-storage-functions";

// ============================================================================
// localStorage mock helpers
// ============================================================================

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    _store: () => store,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe("local-storage-functions", () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
    vi.stubGlobal("localStorage", mockStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // --------------------------------------------------------------------------
  // readLocalStorage
  // --------------------------------------------------------------------------

  describe("readLocalStorage", () => {
    it("returns fallback when key is absent", () => {
      expect(readLocalStorage("missing")).toBeUndefined();
      expect(readLocalStorage("missing", "default")).toBe("default");
    });

    it("reads and JSON-parses a stored value", () => {
      mockStorage.setItem("count", "42");
      expect(readLocalStorage("count")).toBe(42);
    });

    it("reads a stored object", () => {
      mockStorage.setItem("prefs", JSON.stringify({ name: "Jane", age: 30 }));
      expect(readLocalStorage("prefs")).toEqual({ name: "Jane", age: 30 });
    });

    it("reads a nested subpath", () => {
      mockStorage.setItem("prefs", JSON.stringify({ theme: { tone: "dark" } }));
      expect(readLocalStorage("prefs.theme.tone")).toBe("dark");
    });

    it("returns fallback for missing subpath", () => {
      mockStorage.setItem("prefs", JSON.stringify({ name: "Jane" }));
      expect(readLocalStorage("prefs.missing.key", "fallback")).toBe("fallback");
    });

    it("returns fallback when stored value is invalid JSON", () => {
      mockStorage.setItem("bad", "not-json{{");
      expect(readLocalStorage("bad", "safe")).toBe("safe");
    });

    it("returns fallback when SecurityError is thrown", () => {
      mockStorage.getItem.mockImplementation(() => { throw new DOMException("SecurityError"); });
      expect(readLocalStorage("key", "fallback")).toBe("fallback");
    });

    it("reads null stored value as null (not fallback)", () => {
      mockStorage.setItem("nullVal", "null");
      // null is a valid JSON value; fallback should NOT be used
      expect(readLocalStorage("nullVal", "default")).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // writeLocalStorage
  // --------------------------------------------------------------------------

  describe("writeLocalStorage", () => {
    it("writes a primitive under a simple key", () => {
      writeLocalStorage("count", 5);
      expect(JSON.parse(mockStorage._store()["count"])).toBe(5);
    });

    it("writes an object under a simple key", () => {
      writeLocalStorage("prefs", { name: "Jane" });
      expect(JSON.parse(mockStorage._store()["prefs"])).toEqual({ name: "Jane" });
    });

    it("removes entry when value is undefined", () => {
      mockStorage.setItem("count", "5");
      writeLocalStorage("count", undefined);
      expect(mockStorage.removeItem).toHaveBeenCalledWith("count");
    });

    it("writes a subpath, merging into existing root entry", () => {
      mockStorage.setItem("prefs", JSON.stringify({ name: "Jane", age: 30 }));
      writeLocalStorage("prefs.name", "Alice");
      const stored = JSON.parse(mockStorage._store()["prefs"]);
      expect(stored).toEqual({ name: "Alice", age: 30 });
    });

    it("creates root entry when writing to subpath that does not exist", () => {
      writeLocalStorage("prefs.theme.tone", "dark");
      const stored = JSON.parse(mockStorage._store()["prefs"]);
      expect(stored).toEqual({ theme: { tone: "dark" } });
    });

    it("removes subpath when value is undefined", () => {
      mockStorage.setItem("prefs", JSON.stringify({ name: "Jane", extra: "data" }));
      writeLocalStorage("prefs.name", undefined);
      const stored = JSON.parse(mockStorage._store()["prefs"]);
      expect(stored).toEqual({ extra: "data" });
    });

    it("silently ignores QuotaExceededError", () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });
      expect(() => writeLocalStorage("key", "value")).not.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // deleteLocalStorage
  // --------------------------------------------------------------------------

  describe("deleteLocalStorage", () => {
    it("removes an existing simple key", () => {
      mockStorage.setItem("count", "5");
      deleteLocalStorage("count");
      expect(mockStorage.removeItem).toHaveBeenCalledWith("count");
    });

    it("is a no-op for a missing simple key", () => {
      expect(() => deleteLocalStorage("missing")).not.toThrow();
    });

    it("removes a subpath, keeping the rest of the root entry", () => {
      mockStorage.setItem("prefs", JSON.stringify({ name: "Jane", age: 30 }));
      deleteLocalStorage("prefs.name");
      const stored = JSON.parse(mockStorage._store()["prefs"]);
      expect(stored).toEqual({ age: 30 });
    });

    it("is a no-op for a missing subpath", () => {
      mockStorage.setItem("prefs", JSON.stringify({ name: "Jane" }));
      expect(() => deleteLocalStorage("prefs.missing")).not.toThrow();
    });

    it("silently ignores SecurityError on removeItem", () => {
      mockStorage.removeItem.mockImplementation(() => {
        throw new DOMException("SecurityError");
      });
      expect(() => deleteLocalStorage("key")).not.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // clearLocalStorage
  // --------------------------------------------------------------------------

  describe("clearLocalStorage", () => {
    it("clears all entries when called without a prefix", () => {
      mockStorage.setItem("a", "1");
      mockStorage.setItem("b", "2");
      clearLocalStorage();
      expect(mockStorage.clear).toHaveBeenCalled();
    });

    it("removes only entries whose root key starts with the prefix", () => {
      // Rebuild mock store with controlled keys
      const freshStore: Record<string, string> = {
        "myApp.v1": "1",
        "myApp.v2": "2",
        "otherApp": "3",
      };
      const keys = Object.keys(freshStore);
      mockStorage.getItem.mockImplementation((k: string) => freshStore[k] ?? null);
      Object.defineProperty(mockStorage, "length", { get: () => keys.length, configurable: true });
      mockStorage.key.mockImplementation((i: number) => keys[i] ?? null);
      mockStorage.removeItem.mockImplementation((k: string) => { delete freshStore[k]; });

      clearLocalStorage("myApp");

      expect(mockStorage.removeItem).toHaveBeenCalledWith("myApp.v1");
      expect(mockStorage.removeItem).toHaveBeenCalledWith("myApp.v2");
      expect(mockStorage.removeItem).not.toHaveBeenCalledWith("otherApp");
    });
  });
});

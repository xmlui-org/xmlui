/**
 * Step 2.1 — App.appGlobals.appStateKeys schema validation for AppState.
 *
 * When `createAppState(ctx, { allowedKeys })` is configured, every method
 * rejects bucket names whose top-level key is not in the list, throwing
 * `AppStateSchemaError`. When `allowedKeys` is undefined (default), AppState
 * is permissive — any bucket name is accepted.
 */

import { describe, expect, it } from "vitest";
import {
  AppStateSchemaError,
  createAppState,
} from "../../../src/components-core/rendering/appState";
import type { IAppStateContext } from "../../../src/components/App/AppStateContext";

function makeCtx(initial: Record<string, any> = {}): IAppStateContext {
  const state: Record<string, any> = { ...initial };
  return {
    appState: state,
    update(id, patch) {
      const isObject =
        patch !== null && typeof patch === "object" && !Array.isArray(patch);
      if (isObject && state[id] && typeof state[id] === "object" && !Array.isArray(state[id])) {
        state[id] = { ...state[id], ...patch };
      } else {
        state[id] = patch;
      }
    },
  };
}

describe("Step 2.1 — appStateKeys schema", () => {
  describe("when allowedKeys is undefined (permissive mode)", () => {
    it("accepts any bucket name", () => {
      const AppState = createAppState(makeCtx());
      expect(() => AppState.set("anything", 1)).not.toThrow();
      expect(() => AppState.get("whatever")).not.toThrow();
    });
  });

  describe("when allowedKeys = ['user', 'cart']", () => {
    const allowedKeys = ["user", "cart"];

    it("set() with a declared bucket succeeds", () => {
      const AppState = createAppState(makeCtx(), { allowedKeys });
      expect(() => AppState.set("user", { name: "x" })).not.toThrow();
      expect(() => AppState.set("cart", [])).not.toThrow();
    });

    it("set() with an unknown bucket throws AppStateSchemaError", () => {
      const AppState = createAppState(makeCtx(), { allowedKeys });
      expect(() => AppState.set("secrets", "x")).toThrow(AppStateSchemaError);
    });

    it("get() with an unknown bucket throws", () => {
      const AppState = createAppState(makeCtx(), { allowedKeys });
      expect(() => AppState.get("ghost")).toThrow(AppStateSchemaError);
    });

    it("define() with an unknown bucket throws", () => {
      const AppState = createAppState(makeCtx(), { allowedKeys });
      expect(() => AppState.define("ghost", {})).toThrow(AppStateSchemaError);
    });

    it("array methods reject unknown buckets", () => {
      const AppState = createAppState(makeCtx({ list: [] }), { allowedKeys });
      expect(() => AppState.append("nope", 1)).toThrow(AppStateSchemaError);
      expect(() => AppState.push("nope", 1)).toThrow(AppStateSchemaError);
      expect(() => AppState.pop("nope")).toThrow(AppStateSchemaError);
      expect(() => AppState.shift("nope")).toThrow(AppStateSchemaError);
      expect(() => AppState.unshift("nope", 1)).toThrow(AppStateSchemaError);
      expect(() => AppState.removeAt("nope", 0)).toThrow(AppStateSchemaError);
      expect(() => AppState.remove("nope", 1)).toThrow(AppStateSchemaError);
      expect(() => AppState.insertAt("nope", 0, 1)).toThrow(AppStateSchemaError);
    });

    it("update() with unknown bucket rejects", async () => {
      const AppState = createAppState(makeCtx(), { allowedKeys });
      await expect(AppState.update("nope", { x: 1 })).rejects.toThrow(
        AppStateSchemaError,
      );
    });

    it("updateWith() with unknown bucket rejects", async () => {
      const AppState = createAppState(makeCtx(), { allowedKeys });
      await expect(AppState.updateWith("nope", () => ({}))).rejects.toThrow(
        AppStateSchemaError,
      );
    });

    it("removeBy() with unknown bucket rejects", async () => {
      const AppState = createAppState(makeCtx(), { allowedKeys });
      await expect(AppState.removeBy("nope", () => true)).rejects.toThrow(
        AppStateSchemaError,
      );
    });

    it("dot-path bucket validates only the top-level segment", () => {
      const AppState = createAppState(makeCtx({ user: { profile: {} } }), { allowedKeys });
      // 'user.profile.name' → top-level 'user' is allowed
      expect(() => AppState.set("user.profile.name", "x")).not.toThrow();
      // 'admin.foo' → top-level 'admin' is not allowed
      expect(() => AppState.set("admin.foo", "x")).toThrow(AppStateSchemaError);
    });

    it("error message lists the allowed buckets", () => {
      const AppState = createAppState(makeCtx(), { allowedKeys });
      try {
        AppState.set("ghost", 1);
      } catch (e: any) {
        expect(e).toBeInstanceOf(AppStateSchemaError);
        expect(e.message).toContain("ghost");
        expect(e.message).toContain("appStateKeys");
        expect(e.message).toContain("cart");
        expect(e.message).toContain("user");
      }
    });
  });

  describe("when allowedKeys = []", () => {
    it("rejects every bucket", () => {
      const AppState = createAppState(makeCtx(), { allowedKeys: [] });
      expect(() => AppState.set("any", 1)).toThrow(AppStateSchemaError);
    });
  });
});

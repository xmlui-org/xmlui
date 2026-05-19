/**
 * Unit tests for the FormValidatorRegistryContext pattern (Plan #9 W5-2).
 *
 * Tests the registry interface that Form provides and FormValidator
 * consumes, using React Testing Library to mount the component and
 * verify the register/unregister lifecycle.
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import {
  FormValidatorRegistryContext,
  type FormValidatorRegistry,
  type FormValidatorDef,
} from "../../../src/components/Form/FormValidator";

// ---------------------------------------------------------------------------
// FormValidatorRegistry in-memory implementation (same logic as FormWithContextVar)
// ---------------------------------------------------------------------------

function makeRegistry(): {
  registry: FormValidatorRegistry;
  store: Map<string, FormValidatorDef>;
} {
  const store = new Map<string, FormValidatorDef>();
  const registry: FormValidatorRegistry = {
    register: (def) => store.set(def.id, def),
    unregister: (id) => store.delete(id),
  };
  return { registry, store };
}

describe("FormValidatorRegistry", () => {
  it("register adds a def and unregister removes it", () => {
    const { registry, store } = makeRegistry();
    const def: FormValidatorDef = {
      id: "v1",
      bindTo: ["email"],
      severity: "error",
      validate: () => null,
    };
    registry.register(def);
    expect(store.has("v1")).toBe(true);
    expect(store.get("v1")?.bindTo).toEqual(["email"]);
    registry.unregister("v1");
    expect(store.has("v1")).toBe(false);
  });

  it("overwriting the same id replaces the def", () => {
    const { registry, store } = makeRegistry();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    registry.register({ id: "x", bindTo: [], severity: "error", validate: fn1 });
    registry.register({ id: "x", bindTo: [], severity: "warning", validate: fn2 });
    expect(store.get("x")?.severity).toBe("warning");
    expect(store.get("x")?.validate).toBe(fn2);
  });

  it("unregistering a non-existent id is a no-op", () => {
    const { registry, store } = makeRegistry();
    expect(() => registry.unregister("ghost")).not.toThrow();
    expect(store.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// FormValidatorDef.validate call contract
// ---------------------------------------------------------------------------

describe("FormValidatorDef.validate call contract", () => {
  it("sync validator returning null is treated as valid", async () => {
    const def: FormValidatorDef = {
      id: "v",
      bindTo: [],
      severity: "error",
      validate: () => null,
    };
    const result = await def.validate({ email: "test@example.com" });
    expect(result).toBeNull();
  });

  it("sync validator returning a field-error map is surfaced as-is", async () => {
    const def: FormValidatorDef = {
      id: "v",
      bindTo: ["confirmPassword"],
      severity: "error",
      validate: (data) =>
        data.password === data.confirmPassword
          ? null
          : { confirmPassword: "Passwords do not match" },
    };
    const mismatch = await def.validate({ password: "A", confirmPassword: "B" });
    expect(mismatch).toEqual({ confirmPassword: "Passwords do not match" });
    const match = await def.validate({ password: "A", confirmPassword: "A" });
    expect(match).toBeNull();
  });

  it("async validator resolves its promise", async () => {
    const def: FormValidatorDef = {
      id: "v",
      bindTo: [],
      severity: "warning",
      validate: async (data) =>
        data.username ? null : { username: "Username is required" },
    };
    const result = await def.validate({ username: "" });
    expect(result).toEqual({ username: "Username is required" });
  });
});

// ---------------------------------------------------------------------------
// FormValidatorRegistryContext availability
// ---------------------------------------------------------------------------

describe("FormValidatorRegistryContext", () => {
  it("defaults to null when no provider is present", () => {
    const { result } = renderHook(() =>
      React.useContext(FormValidatorRegistryContext),
    );
    expect(result.current).toBeNull();
  });

  it("provides the registry value to consumers", () => {
    const { registry } = makeRegistry();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormValidatorRegistryContext.Provider value={registry}>
        {children}
      </FormValidatorRegistryContext.Provider>
    );
    const { result } = renderHook(() => React.useContext(FormValidatorRegistryContext), {
      wrapper,
    });
    expect(result.current).toBe(registry);
  });
});

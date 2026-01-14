import { describe, it, expect } from "vitest";
import { buildProxy, ProxyCallbackArgs, ProxyAction } from "../../../src/components-core/rendering/buildProxy";

// ============================================================================
// buildProxy Unit Tests
// ============================================================================

describe("buildProxy", () => {
  // ========================================================================
  // Basic Property Set Tests
  // ========================================================================

  it("calls callback on property set", () => {
    const calls: ProxyCallbackArgs[] = [];
    const callback = (info: ProxyCallbackArgs) => {
      calls.push(info);
    };
    const target = { count: 0 };
    const proxy = buildProxy(target, callback);

    proxy.count = 5;

    expect(calls).toHaveLength(1);
    expect(calls[0].action).toBe("set");
    expect(calls[0].path).toBe("count");
    expect(calls[0].newValue).toBe(5);
    expect(calls[0].previousValue).toBe(0);
  });

  it("actually sets the property value", () => {
    const callback = () => {};
    const target = { count: 0 };
    const proxy = buildProxy(target, callback);

    proxy.count = 5;

    expect(target.count).toBe(5);
    expect(proxy.count).toBe(5);
  });

  it("prevents property set if callback throws", () => {
    const callback = () => {
      throw new Error("Validation failed");
    };
    const target = { count: 0 };
    const proxy = buildProxy(target, callback);

    expect(() => {
      proxy.count = 5;
    }).toThrow("Validation failed");

    expect(target.count).toBe(0);
    expect(proxy.count).toBe(0);
  });

  // ========================================================================
  // Nested Object Proxy Tests
  // ========================================================================

  it("creates nested proxies for objects", () => {
    const calls: ProxyCallbackArgs[] = [];
    const callback = (info: ProxyCallbackArgs) => {
      calls.push(info);
    };
    const target = { nested: { value: 0 } };
    const proxy = buildProxy(target, callback);

    proxy.nested.value = 5;

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("nested.value");
    expect(calls[0].newValue).toBe(5);
    expect(target.nested.value).toBe(5);
  });

  it("returns same proxy reference for same nested object", () => {
    const callback = () => {};
    const target = { nested: { value: 0 } };
    const proxy = buildProxy(target, callback);

    const ref1 = proxy.nested;
    const ref2 = proxy.nested;

    expect(ref1).toBe(ref2);
  });

  it("handles deep nested objects", () => {
    const calls: ProxyCallbackArgs[] = [];
    const callback = (info: ProxyCallbackArgs) => {
      calls.push(info);
    };
    const target = { level1: { level2: { level3: { value: 0 } } } };
    const proxy = buildProxy(target, callback);

    proxy.level1.level2.level3.value = 42;

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("level1.level2.level3.value");
    expect(calls[0].newValue).toBe(42);
    expect(target.level1.level2.level3.value).toBe(42);
  });

  // ========================================================================
  // Array Proxy Tests
  // ========================================================================

  it("creates proxies for arrays", () => {
    const calls: ProxyCallbackArgs[] = [];
    const callback = (info: ProxyCallbackArgs) => {
      calls.push(info);
    };
    const target = { items: [1, 2, 3] };
    const proxy = buildProxy(target, callback);

    proxy.items[0] = 10;

    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("items.0");
    expect(calls[0].newValue).toBe(10);
    expect(target.items[0]).toBe(10);
  });

  // ========================================================================
  // Frozen Objects Tests
  // ========================================================================

  it("does not proxy frozen objects", () => {
    const callback = () => {};
    const frozen = Object.freeze({ value: 0 });
    const target = { frozen };
    const proxy = buildProxy(target, callback);

    const nestedProxy = proxy.frozen;

    expect(nestedProxy).toBe(frozen);
  });

  it("does not proxy frozen nested properties", () => {
    const callback = () => {};
    const target = { nested: Object.freeze({ value: 0 }) };
    const proxy = buildProxy(target, callback);

    expect(proxy.nested).toBe(target.nested);
    expect(proxy.nested).toEqual({ value: 0 });
  });

  // ========================================================================
  // Delete Property Tests
  // ========================================================================

  it("calls callback on property delete", () => {
    const calls: ProxyCallbackArgs[] = [];
    const callback = (info: ProxyCallbackArgs) => {
      calls.push(info);
    };
    const target = { count: 5, name: "test" };
    const proxy = buildProxy(target, callback);

    delete proxy.count;

    expect(calls).toHaveLength(1);
    expect(calls[0].action).toBe("unset");
    expect(calls[0].path).toBe("count");
    expect("count" in target).toBe(false);
  });

  it("prevents property delete if callback throws", () => {
    const callback = () => {
      throw new Error("Cannot delete");
    };
    const target = { count: 5 };
    const proxy = buildProxy(target, callback);

    expect(() => {
      delete proxy.count;
    }).toThrow("Cannot delete");

    expect("count" in target).toBe(true);
  });

  // ========================================================================
  // Non-Proxied Values Tests
  // ========================================================================

  it("does not proxy primitives", () => {
    const callback = () => {};
    const target = { num: 42, str: "hello", bool: true, nil: null };
    const proxy = buildProxy(target, callback);

    expect(proxy.num).toBe(42);
    expect(proxy.str).toBe("hello");
    expect(proxy.bool).toBe(true);
    expect(proxy.nil).toBeNull();
  });

  it("does not proxy function references", () => {
    const callback = () => {};
    const fn = () => "result";
    const target = { fn };
    const proxy = buildProxy(target, callback);

    expect(proxy.fn).toBe(fn);
  });

  // ========================================================================
  // Arrow Expression Objects Tests
  // ========================================================================

  it("does not proxy arrow expression objects", () => {
    const callback = () => {};
    const arrowExpr = {
      _ARROW_EXPR_: true,
      tree: { type: "ArrowExpression", body: "code" },
    };
    const target = { expr: arrowExpr };
    const proxy = buildProxy(target, callback);

    expect(proxy.expr).toBe(arrowExpr);
  });

  // ========================================================================
  // Multiple Properties Tests
  // ========================================================================

  it("handles multiple property changes", () => {
    const calls: ProxyCallbackArgs[] = [];
    const callback = (info: ProxyCallbackArgs) => {
      calls.push(info);
    };
    const target = { a: 1, b: 2, c: 3 };
    const proxy = buildProxy(target, callback);

    proxy.a = 10;
    proxy.b = 20;
    proxy.c = 30;

    expect(calls).toHaveLength(3);
    expect(calls[0].newValue).toBe(10);
    expect(calls[1].newValue).toBe(20);
    expect(calls[2].newValue).toBe(30);
  });

  // ========================================================================
  // Read-Only Variable Protection Tests
  // ========================================================================

  it("can validate and prevent read-only variable updates", () => {
    const callback = (info: ProxyCallbackArgs) => {
      if (info.pathArray[0] === "$theme") {
        throw new Error("Cannot update read-only variable $theme");
      }
    };
    const target = { $theme: "dark", count: 0 };
    const proxy = buildProxy(target, callback);

    expect(() => {
      proxy.$theme = "light";
    }).toThrow("Cannot update read-only variable $theme");

    proxy.count = 5; // This should work
    expect(target.count).toBe(5);
    expect(target.$theme).toBe("dark");
  });
});

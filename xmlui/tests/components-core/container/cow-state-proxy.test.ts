import { describe, it, expect, vi } from "vitest";
import { createCoWStateProxy } from "../../../src/components-core/container/cow-state-proxy";

describe("createCoWStateProxy — read passthrough", () => {
  it("reads top-level primitives from original state", () => {
    const state = { count: 7, name: "Alice" };
    const proxy = createCoWStateProxy(state, vi.fn());
    expect(proxy.count).toBe(7);
    expect(proxy.name).toBe("Alice");
  });

  it("reads nested values from original state", () => {
    const state = { user: { age: 30, tags: ["a", "b"] } };
    const proxy = createCoWStateProxy(state, vi.fn());
    expect(proxy.user.age).toBe(30);
    expect(proxy.user.tags[0]).toBe("a");
  });

  it("does not clone any node on read-only access", () => {
    const user = { name: "Alice" };
    const state = { user };
    const proxy = createCoWStateProxy(state, vi.fn());
    void proxy.user.name; // pure read
    expect(state.user).toBe(user); // identity preserved — no clone happened
  });

  it("'in' operator reflects original keys", () => {
    const state = { a: 1, b: 2 };
    const proxy = createCoWStateProxy(state, vi.fn());
    expect("a" in proxy).toBe(true);
    expect("z" in proxy).toBe(false);
  });

  it("Object.keys reflects original keys", () => {
    const state = { a: 1, b: 2 };
    const proxy = createCoWStateProxy(state, vi.fn());
    expect(Object.keys(proxy).sort()).toEqual(["a", "b"]);
  });

  it("returns the same proxy reference for the same nested key (stable identity)", () => {
    const state = { user: { name: "Alice" } };
    const proxy = createCoWStateProxy(state, vi.fn());
    expect(proxy.user).toBe(proxy.user);
  });
});

describe("createCoWStateProxy — copy-on-write for top-level keys", () => {
  it("writing a top-level primitive does not mutate original", () => {
    const state = { count: 0 };
    const proxy = createCoWStateProxy(state, vi.fn());
    proxy.count = 99;
    expect(state.count).toBe(0);
    expect(proxy.count).toBe(99);
  });

  it("replacing a top-level object does not mutate original", () => {
    const state = { user: { name: "Alice" } };
    const proxy = createCoWStateProxy(state, vi.fn());
    proxy.user = { name: "Bob" };
    expect(state.user.name).toBe("Alice");
    expect(proxy.user.name).toBe("Bob");
  });
});

describe("createCoWStateProxy — copy-on-write for nested keys", () => {
  it("shallow-clones only the affected path, not siblings", () => {
    const sibling = { value: 1 };
    const user = { name: "Alice" };
    const state = { user, sibling };
    const proxy = createCoWStateProxy(state, vi.fn());

    proxy.user.name = "Bob";

    expect(state.user.name).toBe("Alice");  // original untouched
    expect(proxy.user.name).toBe("Bob");    // proxy sees new value
    expect(state.sibling).toBe(sibling);    // unrelated node not cloned
  });

  it("does not clone nodes below the written path", () => {
    const deep = { x: 1 };
    const state = { a: { b: { deep } } };
    const proxy = createCoWStateProxy(state, vi.fn());

    proxy.a.b = { deep: { x: 2 } };

    expect(state.a.b.deep).toBe(deep); // original 'deep' untouched
    expect(proxy.a.b.deep.x).toBe(2);  // proxy reflects new assignment
  });

  it("second write to same path does not re-clone", () => {
    const state = { user: { name: "Alice", age: 30 } };
    const proxy = createCoWStateProxy(state, vi.fn());

    proxy.user.name = "Bob";
    const userAfterFirstWrite = proxy.user; // the cloned user node

    proxy.user.age = 31;
    expect(proxy.user).toBe(userAfterFirstWrite); // same clone object reused
  });
});

describe("createCoWStateProxy — onWrite callback", () => {
  it("fires with correct ProxyCallbackArgs on top-level set", () => {
    const onWrite = vi.fn();
    const state = { count: 0 };
    const proxy = createCoWStateProxy(state, onWrite);

    proxy.count = 5;

    expect(onWrite).toHaveBeenCalledOnce();
    const args = onWrite.mock.calls[0][0];
    expect(args.action).toBe("set");
    expect(args.path).toBe("count");
    expect(args.pathArray).toEqual(["count"]);
    expect(args.newValue).toBe(5);
    expect(args.previousValue).toBe(0);
  });

  it("fires with correct pathArray on nested set", () => {
    const onWrite = vi.fn();
    const state = { user: { name: "Alice" } };
    const proxy = createCoWStateProxy(state, onWrite);

    proxy.user.name = "Bob";

    const args = onWrite.mock.calls[0][0];
    expect(args.action).toBe("set");
    expect(args.path).toBe("user.name");
    expect(args.pathArray).toEqual(["user", "name"]);
    expect(args.newValue).toBe("Bob");
    expect(args.previousValue).toBe("Alice");
  });

  it("fires with action='unset' on deleteProperty", () => {
    const onWrite = vi.fn();
    const state: any = { count: 1 };
    const proxy = createCoWStateProxy(state, onWrite);

    delete proxy.count;

    expect(onWrite).toHaveBeenCalledOnce();
    const args = onWrite.mock.calls[0][0];
    expect(args.action).toBe("unset");
    expect(args.pathArray).toEqual(["count"]);
  });

  it("does NOT fire for no-op assignment (same primitive value)", () => {
    const onWrite = vi.fn();
    const state = { count: 5 };
    const proxy = createCoWStateProxy(state, onWrite);

    proxy.count = 5;

    expect(onWrite).not.toHaveBeenCalled();
  });

  it("does NOT fire for structurally equal object replacement", () => {
    const onWrite = vi.fn();
    const state = { user: { name: "Alice" } };
    const proxy = createCoWStateProxy(state, onWrite);

    proxy.user = { name: "Alice" }; // new reference, same structure

    expect(onWrite).not.toHaveBeenCalled();
  });

  it("fires multiple times for multiple distinct writes", () => {
    const onWrite = vi.fn();
    const state = { a: 1, b: 2 };
    const proxy = createCoWStateProxy(state, onWrite);

    proxy.a = 10;
    proxy.b = 20;

    expect(onWrite).toHaveBeenCalledTimes(2);
    expect(onWrite.mock.calls[0][0].pathArray).toEqual(["a"]);
    expect(onWrite.mock.calls[1][0].pathArray).toEqual(["b"]);
  });
});

describe("createCoWStateProxy — array handling", () => {
  it("reads array elements from original", () => {
    const state = { items: [1, 2, 3] };
    const proxy = createCoWStateProxy(state, vi.fn());
    expect(proxy.items[0]).toBe(1);
    expect(proxy.items.length).toBe(3);
  });

  it("writing an array index does not mutate original", () => {
    const state = { items: [1, 2, 3] };
    const proxy = createCoWStateProxy(state, vi.fn());

    proxy.items[0] = 99;

    expect(state.items[0]).toBe(1);
    expect(proxy.items[0]).toBe(99);
  });
});

describe("createCoWStateProxy — regression & edge cases", () => {
  it("dotted-key state name does not collide with a nested path (isolation preserved)", () => {
    const literal = { x: 1 };
    const nestedB = { y: 2 };
    const state: any = { "a.b": literal, a: { b: nestedB } };
    const proxy = createCoWStateProxy(state, () => {});

    proxy["a.b"].x = 88;
    proxy.a.b.y = 99;

    // Original nested objects must stay untouched (no shared mutation).
    expect(state["a.b"]).toBe(literal);
    expect(literal.x).toBe(1);
    expect(state.a.b).toBe(nestedB);
    expect(nestedB.y).toBe(2);
    // Proxy reflects both writes.
    expect(proxy["a.b"].x).toBe(88);
    expect(proxy.a.b.y).toBe(99);
  });

  it("writing a brand-new top-level key does not appear on original", () => {
    const state: any = { existing: 1 };
    const proxy = createCoWStateProxy(state, () => {});

    proxy.brandNew = 42;

    expect(proxy.brandNew).toBe(42);
    expect("brandNew" in state).toBe(false);
  });

  it("deleting a nested key isolates the original parent", () => {
    const onWrite = vi.fn();
    const user = { name: "Alice", age: 30 };
    const state: any = { user };
    const proxy = createCoWStateProxy(state, onWrite);

    delete proxy.user.age;

    expect("age" in proxy.user).toBe(false);
    expect(state.user).toBe(user);        // original parent untouched
    expect(user.age).toBe(30);            // original value intact
    const args = onWrite.mock.calls[0][0];
    expect(args.action).toBe("unset");
    expect(args.pathArray).toEqual(["user", "age"]);
  });

  it("three-level nested write isolates the deepest original", () => {
    const leaf = { v: 1 };
    const state: any = { a: { b: { c: leaf } } };
    const proxy = createCoWStateProxy(state, () => {});

    proxy.a.b.c.v = 2;

    expect(state.a.b.c).toBe(leaf); // deepest original untouched
    expect(leaf.v).toBe(1);
    expect(proxy.a.b.c.v).toBe(2);
  });

  it("read-then-write-then-read within one handler reflects the write", () => {
    const state: any = { user: { name: "Alice" } };
    const proxy = createCoWStateProxy(state, () => {});

    const before = proxy.user.name;
    proxy.user.name = "Bob";
    const after = proxy.user.name;

    expect(before).toBe("Alice");
    expect(after).toBe("Bob");
  });

  it("extending an array by index does not mutate the original array", () => {
    const arr = [1, 2, 3];
    const state: any = { items: arr };
    const proxy = createCoWStateProxy(state, () => {});

    proxy.items[3] = 4;

    expect(state.items).toBe(arr);   // original array reference untouched
    expect(arr.length).toBe(3);      // original length unchanged
    expect(proxy.items[3]).toBe(4);
    expect(proxy.items.length).toBe(4);
  });
});

describe("createCoWStateProxy — real-state shape (type preservation)", () => {
  it("Array.isArray is true for array-valued state keys", () => {
    const state: any = { items: [1, 2, 3] };
    const proxy = createCoWStateProxy(state, vi.fn());
    expect(Array.isArray(proxy.items)).toBe(true);
  });

  it("reading an array keeps array shape under spread and JSON serialization", () => {
    const state: any = { list: ["init"] };
    const proxy = createCoWStateProxy(state, vi.fn());
    const read = proxy.list;
    expect(Array.isArray(read)).toBe(true);
    expect([...read]).toEqual(["init"]);
    // Mirrors the dispatch path: a proxied array must serialize as an array, not {}.
    expect(JSON.parse(JSON.stringify(read))).toEqual(["init"]);
  });

  it("does not throw when the scope is spread over symbol-keyed object values", () => {
    // Component APIs live under Symbol keys whose values are objects. Spreading
    // the handler scope must not stringify symbol path segments.
    const apiSym = Symbol("myButton");
    const apiObj = { focus: () => {}, value: 1 };
    const state: any = { count: 0, [apiSym]: apiObj };
    const proxy = createCoWStateProxy(state, vi.fn());
    expect(() => ({ ...proxy })).not.toThrow();
  });

  it("array mutator methods keep array-ness and update length (push)", () => {
    const arr = ["a"];
    const state: any = { arr };
    const proxy = createCoWStateProxy(state, vi.fn());

    proxy.arr.push("b");

    expect(Array.isArray(proxy.arr)).toBe(true);
    expect(proxy.arr.length).toBe(2);
    expect([...proxy.arr]).toEqual(["a", "b"]);
    // Original array must remain isolated.
    expect(state.arr).toBe(arr);
    expect(arr.length).toBe(1);
  });

  it("Array.isArray is still true for an array key AFTER a CoW clone (write to element)", () => {
    // Guards the dispatch path: when reducer receives the proxied value after a
    // write, it must see an array, not a plain object.
    const state: any = { items: ["a", "b", "c"] };
    const proxy = createCoWStateProxy(state, vi.fn());

    proxy.items[0] = "z"; // triggers CoW clone of the array

    expect(Array.isArray(proxy.items)).toBe(true);
    expect(proxy.items.length).toBe(3);
  });

  it("JSON.stringify of an array-valued key produces array JSON (not '{}')", () => {
    // This is the exact failure that caused init-cleanup-events: testState was
    // a proxied array ["init"] but serialized as {}.
    const state: any = { list: ["init"] };
    const proxy = createCoWStateProxy(state, vi.fn());

    expect(JSON.stringify(proxy.list)).toBe('["init"]');

    // And after a CoW write the serialization must still be correct.
    proxy.list[0] = "done";
    expect(JSON.stringify(proxy.list)).toBe('["done"]');
  });

  it("for...of iteration works over an array-valued proxy key", () => {
    const state: any = { tags: ["x", "y", "z"] };
    const proxy = createCoWStateProxy(state, vi.fn());
    const collected: string[] = [];
    for (const t of proxy.tags) collected.push(t);
    expect(collected).toEqual(["x", "y", "z"]);
  });

  it("symbol-keyed value is readable through the proxy (returns proxy wrapping original)", () => {
    // Component APIs live under Symbol UIDs in state. The proxy wraps them in a
    // sub-proxy (same as buildProxy), so referential identity changes, but the
    // VALUE must be correct and accessible — no throw, no undefined.
    const apiSym = Symbol("myButton");
    const apiObj = { value: 42 };
    const state: any = { count: 0, [apiSym]: apiObj };
    const proxy = createCoWStateProxy(state, vi.fn());

    expect(proxy[apiSym]).not.toBeUndefined();
    expect(proxy[apiSym].value).toBe(42);
  });

  it("symbol-keyed value remains accessible after a write to a string key (CoW clone of root)", () => {
    // After any write the root is shallow-cloned. The clone must carry symbol-
    // keyed properties so subsequent handler reads still find the API objects.
    const apiSym = Symbol("ds");
    const apiObj = { loaded: true };
    const state: any = { flag: false, [apiSym]: apiObj };
    const proxy = createCoWStateProxy(state, vi.fn());

    proxy.flag = true; // triggers root clone

    // Symbol key must survive the clone — value is accessible and correct.
    expect(proxy[apiSym]).not.toBeUndefined();
    expect(proxy[apiSym].loaded).toBe(true);
  });

  it("reads from an Immer-frozen nested object without throwing invariant errors", () => {
    // Immer calls Object.freeze() on every object in state after each produce().
    // The proxy target discipline (using an extensible proxyTarget copy) must
    // prevent invariant errors when the JS engine checks proxy/target consistency
    // for frozen sub-objects.
    const frozenApi = Object.freeze({ value: 42, label: "ok" });
    const state: any = { count: 0, ds: frozenApi };
    const proxy = createCoWStateProxy(state, vi.fn());

    // Reads must work without throwing.
    expect(proxy.ds.value).toBe(42);
    expect(proxy.ds.label).toBe("ok");

    // A write to an unrelated key must not disturb the frozen sub-object.
    expect(() => {
      proxy.count = 1;
    }).not.toThrow();
    expect(proxy.ds.value).toBe(42);
  });
});

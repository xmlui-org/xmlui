/**
 * Unit tests for the Step 0 DOM API sandbox infrastructure:
 *
 *  - `isBannedMember` (bannedMembers.ts) — pure guard function
 *  - `BannedApiError` (bannedFunctions.ts) — error class
 *  - Integration through the eval-tree (eval-tree-common.ts)
 *
 * All denylist sets are empty at Step 0.  Tests that require a banned entry
 * temporarily seed one using beforeEach/afterEach so they are hermetic.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { evalBinding, evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";
import { evalBindingAsync } from "../../../src/components-core/script-runner/eval-tree-async";
import { BannedApiError } from "../../../src/components-core/script-runner/bannedFunctions";
import {
  isBannedMember,
  BANNED_GLOBAL_KEYS,
  BANNED_DOCUMENT_KEYS,
  BANNED_NAVIGATOR_KEYS,
  BANNED_ELEMENT_SETTER_KEYS,
  BANNED_GLOBAL_HELP,
} from "../../../src/components-core/script-runner/bannedMembers";
import { createEvalContext } from "./test-helpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sentinel key used only inside these tests — never collides with real APIs. */
const TEST_KEY = "__xmlui_sandbox_test__";

function addTestGlobalEntry(help?: string): void {
  BANNED_GLOBAL_KEYS.add(TEST_KEY);
  if (help) BANNED_GLOBAL_HELP.set(TEST_KEY, help);
  // Also expose the key on globalThis so eval expressions can reach it.
  (globalThis as any)[TEST_KEY] = "test-value";
}

function removeTestGlobalEntry(): void {
  BANNED_GLOBAL_KEYS.delete(TEST_KEY);
  BANNED_GLOBAL_HELP.delete(TEST_KEY);
  delete (globalThis as any)[TEST_KEY];
}

// ---------------------------------------------------------------------------
// 1. isBannedMember — pure function tests (no eval-tree involved)
// ---------------------------------------------------------------------------

describe("isBannedMember — pure function", () => {
  describe("empty denylists (Step 0 baseline)", () => {
    it("never bans member access on arbitrary (non-global) objects", () => {
      // A selection of common globals that are now banned at the global level.
      // Confirm the ban does NOT fire for identically-named keys on plain objects.
      const obj = { localStorage: 1, WebSocket: 2, fetch: 3 };
      expect(isBannedMember(obj, "localStorage").banned).toBe(false);
      expect(isBannedMember(obj, "WebSocket").banned).toBe(false);
      expect(isBannedMember(obj, "fetch").banned).toBe(false);
    });

    it("never bans member access on arbitrary objects", () => {
      const obj = { foo: 1, bar: 2 };
      expect(isBannedMember(obj, "foo").banned).toBe(false);
      expect(isBannedMember(obj, "bar").banned).toBe(false);
    });

    it("returns banned:false for symbol keys regardless of root", () => {
      const sym = Symbol("test");
      expect(isBannedMember(globalThis, sym).banned).toBe(false);
    });

    it("returns banned:false for null receiver", () => {
      expect(isBannedMember(null, "anything").banned).toBe(false);
    });

    it("returns banned:false for undefined receiver", () => {
      expect(isBannedMember(undefined, "anything").banned).toBe(false);
    });
  });

  describe("globalThis / window surface", () => {
    beforeEach(() => addTestGlobalEntry("Use the managed alternative."));
    afterEach(() => removeTestGlobalEntry());

    it("detects a banned key on globalThis", () => {
      const result = isBannedMember(globalThis, TEST_KEY);
      expect(result.banned).toBe(true);
    });

    it("includes the api label 'window.<key>'", () => {
      const result = isBannedMember(globalThis, TEST_KEY);
      expect(result.api).toBe(`window.${TEST_KEY}`);
    });

    it("includes the help text when set", () => {
      const result = isBannedMember(globalThis, TEST_KEY);
      expect(result.help).toBe("Use the managed alternative.");
    });

    it("does not ban an unlisted key on globalThis", () => {
      expect(isBannedMember(globalThis, "Math").banned).toBe(false);
    });
  });

  describe("document surface", () => {
    const DOC_KEY = "__xmlui_doc_test__";

    beforeEach(() => {
      BANNED_DOCUMENT_KEYS.add(DOC_KEY);
    });
    afterEach(() => {
      BANNED_DOCUMENT_KEYS.delete(DOC_KEY);
    });

    it("detects a banned key on document", () => {
      if (typeof document === "undefined") return; // skip in non-DOM env
      const result = isBannedMember(document, DOC_KEY);
      expect(result.banned).toBe(true);
      expect(result.api).toBe(`document.${DOC_KEY}`);
    });

    it("does not ban an unlisted key on document", () => {
      if (typeof document === "undefined") return;
      // 'baseURI' is a safe, read-only property not in any denylist.
      expect(isBannedMember(document, "baseURI").banned).toBe(false);
    });
  });

  describe("navigator surface", () => {
    const NAV_KEY = "__xmlui_nav_test__";

    beforeEach(() => {
      BANNED_NAVIGATOR_KEYS.add(NAV_KEY);
    });
    afterEach(() => {
      BANNED_NAVIGATOR_KEYS.delete(NAV_KEY);
    });

    it("detects a banned key on navigator", () => {
      if (typeof navigator === "undefined") return;
      const result = isBannedMember(navigator, NAV_KEY);
      expect(result.banned).toBe(true);
      expect(result.api).toBe(`navigator.${NAV_KEY}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. BannedApiError — error class
// ---------------------------------------------------------------------------

describe("BannedApiError", () => {
  it("extends Error", () => {
    const err = new BannedApiError("window.location");
    expect(err).toBeInstanceOf(Error);
  });

  it("has name 'BannedApiError'", () => {
    const err = new BannedApiError("window.location");
    expect(err.name).toBe("BannedApiError");
  });

  it("exposes the api property", () => {
    const err = new BannedApiError("window.location", "Use navigate().");
    expect(err.api).toBe("window.location");
  });

  it("exposes the helpText property", () => {
    const err = new BannedApiError("window.location", "Use navigate().");
    expect(err.helpText).toBe("Use navigate().");
  });

  it("includes the api name in the message", () => {
    const err = new BannedApiError("window.open");
    expect(err.message).toContain("window.open");
  });

  it("includes the help text in the message when provided", () => {
    const err = new BannedApiError("window.open", "Use App.openExternal() instead.");
    expect(err.message).toContain("Use App.openExternal() instead.");
  });
});

// ---------------------------------------------------------------------------
// 3. Eval-tree integration — warn mode (strictDomSandbox: false / omitted)
// ---------------------------------------------------------------------------

describe("Eval-tree integration — warn mode", () => {
  beforeEach(() => addTestGlobalEntry("Use the managed alternative."));
  afterEach(() => removeTestGlobalEntry());

  it("allows access to a banned global identifier (warn mode)", () => {
    // In warn mode the access MUST NOT throw — the expression proceeds.
    const ctx = createEvalContext({
      localContext: {},
      options: { strictDomSandbox: false },
    });
    // The test sentinel is on globalThis with value "test-value".
    const value = evalBindingExpression(TEST_KEY, ctx);
    expect(value).toBe("test-value");
  });

  it("emits console.warn for a banned global identifier (warn mode)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const ctx = createEvalContext({
        localContext: {},
        options: { strictDomSandbox: false },
      });
      evalBindingExpression(TEST_KEY, ctx);
      expect(warnSpy).toHaveBeenCalledOnce();
      const [msg] = warnSpy.mock.calls[0];
      expect(msg).toContain("[XMLUI sandbox]");
      expect(msg).toContain(TEST_KEY);
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("calls sandboxWarnLogger callback in warn mode", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const loggerCalls: { api?: string; help?: string; text: string }[] = [];
    try {
      const ctx = createEvalContext({
        localContext: {},
        options: {
          strictDomSandbox: false,
          sandboxWarnLogger: (entry) => loggerCalls.push(entry),
        },
      });
      evalBindingExpression(TEST_KEY, ctx);
      expect(loggerCalls).toHaveLength(1);
      expect(loggerCalls[0].api).toContain(TEST_KEY);
      expect(loggerCalls[0].text).toContain(TEST_KEY);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("allows member access on a banned global (warn mode)", () => {
    // e.g. `window.__xmlui_sandbox_test__` via member access
    const wParser = new Parser(`window.${TEST_KEY}`);
    const expr = wParser.parseExpr()!;
    const ctx = createEvalContext({
      localContext: {},
      options: { strictDomSandbox: false },
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      // In jsdom, window === globalThis, so window[TEST_KEY] = "test-value"
      const value = evalBinding(expr, ctx);
      expect(value).toBe("test-value");
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("does NOT warn for access when all sets are empty (no sentinel added)", () => {
    // Remove the sentinel to ensure empty-set baseline does not warn.
    removeTestGlobalEntry();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const ctx = createEvalContext({ localContext: {}, options: { strictDomSandbox: false } });
      // Accessing Math should never warn.
      evalBindingExpression("Math.PI", ctx);
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
      // Re-add for other tests in this suite.
      addTestGlobalEntry("Use the managed alternative.");
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Eval-tree integration — strict mode (strictDomSandbox: true)
// ---------------------------------------------------------------------------

describe("Eval-tree integration — strict mode", () => {
  beforeEach(() => addTestGlobalEntry("Use the managed alternative."));
  afterEach(() => removeTestGlobalEntry());

  it("throws BannedApiError for a banned global identifier", () => {
    const ctx = createEvalContext({
      localContext: {},
      options: { strictDomSandbox: true },
    });
    expect(() => evalBindingExpression(TEST_KEY, ctx)).toThrow(BannedApiError);
  });

  it("BannedApiError contains the api name", () => {
    const ctx = createEvalContext({
      localContext: {},
      options: { strictDomSandbox: true },
    });
    try {
      evalBindingExpression(TEST_KEY, ctx);
    } catch (e) {
      expect(e).toBeInstanceOf(BannedApiError);
      expect((e as BannedApiError).api).toContain(TEST_KEY);
    }
  });

  it("throws BannedApiError for a banned member access (a.bannedProp)", () => {
    // window[TEST_KEY] is banned via BANNED_GLOBAL_KEYS.
    // Accessing it as `window.__xmlui_sandbox_test__` goes through evalMemberAccessCore.
    const wParser = new Parser(`window.${TEST_KEY}`);
    const expr = wParser.parseExpr()!;
    const ctx = createEvalContext({
      localContext: {},
      options: { strictDomSandbox: true },
    });
    expect(() => evalBinding(expr, ctx)).toThrow(BannedApiError);
  });

  it("throws BannedApiError for a banned calculated member access (a['bannedProp'])", () => {
    const wParser = new Parser(`window['${TEST_KEY}']`);
    const expr = wParser.parseExpr()!;
    const ctx = createEvalContext({
      localContext: {},
      options: { strictDomSandbox: true },
    });
    expect(() => evalBinding(expr, ctx)).toThrow(BannedApiError);
  });

  it("throws BannedApiError on write assignment to banned member", () => {
    const ctx = createEvalContext({
      localContext: {},
      options: { strictDomSandbox: true },
    });
    // Assignment: window.__xmlui_sandbox_test__ = "x"
    expect(() =>
      evalBindingExpression(`window.${TEST_KEY} = "overwrite"`, ctx),
    ).toThrow(BannedApiError);
  });

  it("does NOT throw for non-banned access even in strict mode", () => {
    const ctx = createEvalContext({
      localContext: { arr: [1, 2, 3] },
      options: { strictDomSandbox: true },
    });
    // Math.PI is not in any denylist — must not throw.
    const value = evalBindingExpression("Math.PI", ctx);
    expect(value).toBeCloseTo(3.14159, 4);
  });

  it("does NOT throw for local-context access in strict mode", () => {
    const ctx = createEvalContext({
      localContext: { msg: "hello" },
      options: { strictDomSandbox: true },
    });
    const value = evalBindingExpression("msg", ctx);
    expect(value).toBe("hello");
  });
});

// ---------------------------------------------------------------------------
// 5. Async eval-tree integration
// ---------------------------------------------------------------------------

describe("Eval-tree async integration — strict mode", () => {
  beforeEach(() => addTestGlobalEntry());
  afterEach(() => removeTestGlobalEntry());

  it("throws BannedApiError for a banned global identifier in async eval", async () => {
    const wParser = new Parser(TEST_KEY);
    const expr = wParser.parseExpr()!;
    const ctx = createEvalContext({
      localContext: {},
      options: { strictDomSandbox: true },
    });
    await expect(evalBindingAsync(expr, ctx, undefined)).rejects.toThrow(BannedApiError);
  });
});

// ---------------------------------------------------------------------------
// 6. Default behaviour (no option set) — must not throw or warn
// ---------------------------------------------------------------------------

describe("Default behaviour (strictDomSandbox not set)", () => {
  beforeEach(() => addTestGlobalEntry());
  afterEach(() => removeTestGlobalEntry());

  it("allows access to a banned entry when strictDomSandbox is not set (default warn)", () => {
    const ctx = createEvalContext({ localContext: {} }); // no options set
    // Default: warn mode, access allowed.
    const value = evalBindingExpression(TEST_KEY, ctx);
    expect(value).toBe("test-value");
  });
});

/**
 * Unit tests for Phase 1 denylist entries (Steps 1.1 – 1.9).
 *
 * Tests are organised to match the steps in dom-api-hardening.md and verify:
 *  - `isBannedMember()` returns `{ banned: true }` for each entry.
 *  - Eval-tree strict mode throws `BannedApiError` when accessing a real
 *    banned global.
 *  - Eval-tree warn mode (default) allows access but emits `console.warn`.
 */

import { describe, expect, it, vi } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { ParserError } from "../../../src/parsers/scripting/ParserError";
import { evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";
import { BannedApiError, isBannedFunction } from "../../../src/components-core/script-runner/bannedFunctions";
import {
  isBannedMember,
  BANNED_GLOBAL_KEYS,
  BANNED_GLOBAL_HELP,
  BANNED_DOCUMENT_KEYS,
  BANNED_NAVIGATOR_KEYS,
  BANNED_ELEMENT_SETTER_KEYS,
} from "../../../src/components-core/script-runner/bannedMembers";
import { createEvalContext } from "./test-helpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function strictCtx(localContext: Record<string, unknown> = {}) {
  return createEvalContext({ localContext, options: { strictDomSandbox: true } });
}

function warnCtx(localContext: Record<string, unknown> = {}) {
  return createEvalContext({ localContext, options: { strictDomSandbox: false } });
}

// ---------------------------------------------------------------------------
// Step 1.1 — Function constructor and WebAssembly
// ---------------------------------------------------------------------------

describe("Step 1.1 — Function constructor and WebAssembly", () => {
  it("globalThis.Function is in the bannedFunctions list", () => {
    const result = isBannedFunction(globalThis.Function);
    expect(result.banned).toBe(true);
  });

  it("Function has a help text", () => {
    const result = isBannedFunction(globalThis.Function);
    expect(result.help).toBeTruthy();
  });

  it("WebAssembly.compile is in the bannedFunctions list (if available)", () => {
    if (typeof WebAssembly === "undefined") return;
    expect(isBannedFunction(WebAssembly.compile).banned).toBe(true);
  });

  it("WebAssembly.instantiate is in the bannedFunctions list (if available)", () => {
    if (typeof WebAssembly === "undefined") return;
    expect(isBannedFunction(WebAssembly.instantiate).banned).toBe(true);
  });

  it("WebAssembly.compileStreaming is in the bannedFunctions list (if available)", () => {
    if (typeof WebAssembly === "undefined") return;
    expect(isBannedFunction(WebAssembly.compileStreaming as any).banned).toBe(true);
  });

  it("WebAssembly.instantiateStreaming is in the bannedFunctions list (if available)", () => {
    if (typeof WebAssembly === "undefined") return;
    expect(isBannedFunction(WebAssembly.instantiateStreaming as any).banned).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 1.2 — debugger keyword at parse time
// ---------------------------------------------------------------------------

describe("Step 1.2 — debugger is rejected by the parser", () => {
  it("reports a parse error for standalone 'debugger'", () => {
    const parser = new Parser("debugger");
    try { parser.parseStatements(); } catch (e) { /* expected */ }
    expect(parser.errors.some((e) => e.code === "W046")).toBe(true);
  });

  it("reports a parse error for 'debugger' in a block", () => {
    const parser = new Parser("let x = 1; debugger; return x;");
    try { parser.parseStatements(); } catch (e) { /* expected */ }
    expect(parser.errors.some((e) => e.code === "W046")).toBe(true);
  });

  it("throws ParserError when 'debugger' is encountered", () => {
    const parser = new Parser("debugger");
    expect(() => parser.parseStatements()).toThrow(ParserError);
  });

  it("does NOT produce a parse error for an identifier named 'debug'", () => {
    const parser = new Parser("debug");
    try { parser.parseStatements(); } catch (e) { /* ignore other errors */ }
    expect(parser.errors.some((e) => e.code === "W046")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Step 1.3 — DOM mutation APIs: BANNED_DOCUMENT_KEYS
// ---------------------------------------------------------------------------

describe("Step 1.3 — Document mutation APIs are banned", () => {
  const docKeys = [
    "body",
    "documentElement",
    "head",
    "querySelector",
    "querySelectorAll",
    "getElementById",
    "getElementsByClassName",
    "getElementsByTagName",
    "getElementsByName",
    "createElement",
    "createElementNS",
    "createTextNode",
    "createDocumentFragment",
    "createRange",
    "write",
    "writeln",
    "execCommand",
    "domain",
    "cookie",
    "title",
  ];

  for (const key of docKeys) {
    it(`document.${key} is in BANNED_DOCUMENT_KEYS`, () => {
      expect(BANNED_DOCUMENT_KEYS.has(key)).toBe(true);
    });

    it(`isBannedMember(document, '${key}') returns banned:true`, () => {
      if (typeof document === "undefined") return;
      expect(isBannedMember(document, key).banned).toBe(true);
    });
  }
});

describe("Step 1.3 — DOM mutation APIs: BANNED_GLOBAL_KEYS (observers)", () => {
  const globalObserverKeys = [
    "MutationObserver",
    "ResizeObserver",
    "IntersectionObserver",
    "PerformanceObserver",
    "Range",
    "Selection",
    "getSelection",
  ];

  for (const key of globalObserverKeys) {
    it(`window.${key} is in BANNED_GLOBAL_KEYS`, () => {
      expect(BANNED_GLOBAL_KEYS.has(key)).toBe(true);
    });
  }
});

describe("Step 1.3 — Element setter/mutation keys", () => {
  const elementKeys = [
    "innerHTML",
    "outerHTML",
    "insertAdjacentHTML",
    "insertAdjacentElement",
    "insertAdjacentText",
    "setAttribute",
    "removeAttribute",
    "setAttributeNS",
    "appendChild",
    "insertBefore",
    "replaceChild",
    "removeChild",
    "replaceWith",
    "before",
    "after",
    "prepend",
    "append",
  ];

  for (const key of elementKeys) {
    it(`Element.${key} is in BANNED_ELEMENT_SETTER_KEYS`, () => {
      expect(BANNED_ELEMENT_SETTER_KEYS.has(key)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Step 1.4 — Background execution and concurrency
// ---------------------------------------------------------------------------

describe("Step 1.4 — Concurrency/background APIs are banned", () => {
  const globalConcurrencyKeys = [
    "Worker",
    "SharedWorker",
    "MessageChannel",
    "MessagePort",
    "BroadcastChannel",
    "SharedArrayBuffer",
    "Atomics",
  ];

  for (const key of globalConcurrencyKeys) {
    it(`window.${key} is in BANNED_GLOBAL_KEYS`, () => {
      expect(BANNED_GLOBAL_KEYS.has(key)).toBe(true);
    });
  }

  it("navigator.serviceWorker is in BANNED_NAVIGATOR_KEYS", () => {
    expect(BANNED_NAVIGATOR_KEYS.has("serviceWorker")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 1.5 — Storage and persistence
// ---------------------------------------------------------------------------

describe("Step 1.5 — Storage APIs are banned", () => {
  const storageGlobalKeys = [
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "caches",
    "cookieStore",
    "PushManager",
    "PeriodicSyncManager",
    "BackgroundFetchManager",
  ];

  for (const key of storageGlobalKeys) {
    it(`window.${key} is in BANNED_GLOBAL_KEYS`, () => {
      expect(BANNED_GLOBAL_KEYS.has(key)).toBe(true);
    });
  }

  it("navigator.storage is in BANNED_NAVIGATOR_KEYS", () => {
    expect(BANNED_NAVIGATOR_KEYS.has("storage")).toBe(true);
  });

  it("BANNED_GLOBAL_HELP for localStorage mentions AppState", () => {
    const help = BANNED_GLOBAL_HELP.get("localStorage");
    expect(help).toMatch(/AppState/);
  });
});

// ---------------------------------------------------------------------------
// Step 1.6 — Sensors and user-environment
// ---------------------------------------------------------------------------

describe("Step 1.6 — Sensor/environment APIs are banned", () => {
  it("window.Notification is in BANNED_GLOBAL_KEYS", () => {
    expect(BANNED_GLOBAL_KEYS.has("Notification")).toBe(true);
  });

  const navKeys = [
    "geolocation",
    "mediaDevices",
    "clipboard",
    "permissions",
    "bluetooth",
    "usb",
    "serial",
    "hid",
    "credentials",
    "locks",
  ];

  for (const key of navKeys) {
    it(`navigator.${key} is in BANNED_NAVIGATOR_KEYS`, () => {
      expect(BANNED_NAVIGATOR_KEYS.has(key)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Step 1.7 — Navigation, window, and page-identity
// ---------------------------------------------------------------------------

describe("Step 1.7 — Navigation APIs are banned", () => {
  const navGlobalKeys = ["open", "close", "stop", "print", "focus", "blur", "history", "location"];

  for (const key of navGlobalKeys) {
    it(`window.${key} is in BANNED_GLOBAL_KEYS`, () => {
      expect(BANNED_GLOBAL_KEYS.has(key)).toBe(true);
    });
  }

  it("document.title is in BANNED_DOCUMENT_KEYS", () => {
    expect(BANNED_DOCUMENT_KEYS.has("title")).toBe(true);
  });

  it("BANNED_GLOBAL_HELP for location mentions navigate()", () => {
    const help = BANNED_GLOBAL_HELP.get("location");
    expect(help).toMatch(/navigate\(\)/);
  });
});

// ---------------------------------------------------------------------------
// Step 1.8 — Direct network constructors
// ---------------------------------------------------------------------------

describe("Step 1.8 — Network constructors are banned", () => {
  const networkKeys = ["XMLHttpRequest", "EventSource", "WebSocket"];

  for (const key of networkKeys) {
    it(`window.${key} is in BANNED_GLOBAL_KEYS`, () => {
      expect(BANNED_GLOBAL_KEYS.has(key)).toBe(true);
    });
  }

  it("navigator.sendBeacon is in BANNED_NAVIGATOR_KEYS", () => {
    expect(BANNED_NAVIGATOR_KEYS.has("sendBeacon")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 1.9 — Crypto and DevTools surface
// ---------------------------------------------------------------------------

describe("Step 1.9 — Crypto, performance, and console are banned", () => {
  for (const key of ["crypto", "performance", "console"]) {
    it(`window.${key} is in BANNED_GLOBAL_KEYS`, () => {
      expect(BANNED_GLOBAL_KEYS.has(key)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Eval-tree integration — strict mode throws on real banned globals
// ---------------------------------------------------------------------------

describe("Eval-tree strict mode — real banned globals throw BannedApiError", () => {
  it("accessing localStorage throws in strict mode", () => {
    const ctx = strictCtx();
    expect(() => evalBindingExpression("localStorage", ctx)).toThrow(BannedApiError);
  });

  it("accessing console throws in strict mode (allowConsole: false)", () => {
    const ctx = createEvalContext({ localContext: {}, options: { strictDomSandbox: true, allowConsole: false } });
    expect(() => evalBindingExpression("console", ctx)).toThrow(BannedApiError);
  });

  it("accessing location throws in strict mode", () => {
    const ctx = strictCtx();
    expect(() => evalBindingExpression("location", ctx)).toThrow(BannedApiError);
  });

  it("accessing history throws in strict mode", () => {
    const ctx = strictCtx();
    expect(() => evalBindingExpression("history", ctx)).toThrow(BannedApiError);
  });

  it("accessing XMLHttpRequest throws in strict mode", () => {
    const ctx = strictCtx();
    expect(() => evalBindingExpression("XMLHttpRequest", ctx)).toThrow(BannedApiError);
  });

  it("accessing Worker throws in strict mode (if available in env)", () => {
    if (typeof (globalThis as any).Worker === "undefined") return;
    const ctx = strictCtx();
    expect(() => evalBindingExpression("Worker", ctx)).toThrow(BannedApiError);
  });
});

// ---------------------------------------------------------------------------
// Eval-tree warn mode — real banned globals emit console.warn but don't throw
// ---------------------------------------------------------------------------

describe("Eval-tree warn mode — real banned globals emit console.warn", () => {
  it("accessing localStorage emits console.warn but returns value", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const ctx = warnCtx();
      // In warn mode it must not throw; the value is the native localStorage object.
      expect(() => evalBindingExpression("localStorage", ctx)).not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      const [msg] = warnSpy.mock.calls[0];
      expect(msg).toContain("[XMLUI sandbox]");
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("accessing console emits console.warn when allowConsole: false", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const ctx = createEvalContext({ localContext: {}, options: { strictDomSandbox: false, allowConsole: false } });
      expect(() => evalBindingExpression("console", ctx)).not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// Unaffected APIs — ensure common safe globals are NOT banned
// ---------------------------------------------------------------------------

describe("Safe globals are NOT banned", () => {
  const safeGlobals = [
    "Math",
    "JSON",
    "Date",
    "Array",
    "Object",
    "String",
    "Number",
    "Boolean",
    "Promise",
    // NOTE: `fetch` was safe in Phase 1 but is banned in Phase 3 (Step 3.2); see phase3-globals.test.ts
    "encodeURIComponent",
    "decodeURIComponent",
    "parseInt",
    "parseFloat",
    "isNaN",
    "isFinite",
  ];

  for (const key of safeGlobals) {
    it(`${key} is NOT in BANNED_GLOBAL_KEYS`, () => {
      expect(BANNED_GLOBAL_KEYS.has(key)).toBe(false);
    });
  }
});

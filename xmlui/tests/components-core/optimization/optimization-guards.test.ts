import { describe, it, expect, vi, afterEach } from "vitest";
import {
  validateInjectedVars,
  EVENT_PAYLOAD_RESERVED_NAMES,
} from "../../../src/components-core/optimization/validateInjectedVars";
import { XMLUI_GLOBAL_NAMES } from "../../../src/components-core/state/FrameworkGlobals";

// ---------------------------------------------------------------------------
// validateInjectedVars — guards against missing injected variable declarations
// ---------------------------------------------------------------------------

describe("validateInjectedVars — mismatch detection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits console.error when a $-var is dispatched but not declared in childInjectedVars", () => {
    expect(() => {
      validateInjectedVars(
        "CustomList",
        { childInjectedVars: [] } as any,
        { $secret: "value" },
      );
    }).toThrowError(/Lexical Scoping.*\$secret.*childInjectedVars/);
  });

  it("emits console.error when event $-var is dispatched but not in injectedVars", () => {
    expect(() => {
      validateInjectedVars(
        "CustomLoader",
        {
          events: {
            fetch: { description: "", injectedVars: [] },
          },
        } as any,
        { $queryParams: {} },
        "fetch",
      );
    }).toThrowError(/Lexical Scoping.*\$queryParams.*events\["fetch"\]\.injectedVars/);
  });

  it("does NOT report when $-var IS declared in childInjectedVars", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    validateInjectedVars(
      "List",
      { childInjectedVars: ["$item"] } as any,
      { $item: { id: 1 } },
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("does NOT report when event $-var IS declared in injectedVars", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    validateInjectedVars(
      "DataSource",
      {
        events: {
          fetch: { description: "", injectedVars: ["$queryParams"] },
        },
      } as any,
      { $queryParams: { q: "test" } },
      "fetch",
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns early (no error) when contextVars is undefined", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    validateInjectedVars("List", { childInjectedVars: [] } as any, undefined);
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns early (no error) when metadata is undefined", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    validateInjectedVars("Unknown", undefined, { $item: {} });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("validateInjectedVars — EVENT_PAYLOAD_RESERVED_NAMES exemptions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([...EVENT_PAYLOAD_RESERVED_NAMES])(
    "%s is NOT reported even when absent from metadata",
    (reserved) => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      validateInjectedVars(
        "SomeComponent",
        { childInjectedVars: [] } as any,
        { [reserved]: "x" },
      );
      expect(spy).not.toHaveBeenCalled();
    },
  );
});

// ---------------------------------------------------------------------------
// XMLUI_GLOBAL_NAMES spread integrity — guards against missing utility spreads
// ---------------------------------------------------------------------------

describe("XMLUI_GLOBAL_NAMES spread integrity", () => {
  it.each([
    ["formatDate",       "dateFunctions"],
    ["avg",              "mathFunctions"],
    ["readLocalStorage", "localStorageFunctions"],
    ["capitalize",       "miscellaneousUtils"],
  ])("contains '%s' (from %s)", (key) => {
    expect(XMLUI_GLOBAL_NAMES.has(key)).toBe(true);
  });
});

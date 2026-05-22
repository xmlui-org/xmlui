import { describe, it, expect, vi, afterEach } from "vitest";
import {
  validateInjectedVars,
  EVENT_PAYLOAD_RESERVED_NAMES,
} from "../../../src/components-core/optimization/validateInjectedVars";
import { OPTIMIZER_METADATA } from "../../../src/components-core/optimization/optimizer-metadata";
import { collectedComponentMetadata } from "../../../src/components/collectedComponentMetadata";
import { DataLoaderMd } from "../../../src/components-core/loader/DataLoader";
import { DataSourceMd } from "../../../src/components/DataSource/DataSource";
import { APICallMd } from "../../../src/components/APICall/APICall";

// ---------------------------------------------------------------------------
// U-val.1: validateInjectedVars reports missing declaration
// ---------------------------------------------------------------------------

describe("validateInjectedVars — mismatch detection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("U-val.1: emits console.error when a $-var is dispatched but not declared in childInjectedVars", () => {
    expect(() => {
      validateInjectedVars(
        "CustomList",
        { childInjectedVars: [] } as any,
        { $secret: "value" },
      );
    }).toThrowError(/Lexical Scoping.*\$secret.*childInjectedVars/);
  });

  it("U-val.1b: emits console.error when event $-var is dispatched but not in injectedVars", () => {
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

// ---------------------------------------------------------------------------
// U-val.2: EVENT_PAYLOAD_RESERVED_NAMES are never reported as missing
// ---------------------------------------------------------------------------

describe("validateInjectedVars — EVENT_PAYLOAD_RESERVED_NAMES exemptions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([...EVENT_PAYLOAD_RESERVED_NAMES])(
    "U-val.2: %s is NOT reported even when absent from metadata",
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
// U-audit.1: OPTIMIZER_METADATA registry is reflected in each component's runtime metadata
//
// After the SSOT migration each component's `.tsx` imports its optimizer-relevant
// fields from `OPTIMIZER_METADATA`. If a component accidentally hardcodes its
// `childInjectedVars` / events[*].injectedVars instead of referencing the
// registry, the runtime metadata will diverge from the registry — this test
// catches that.
//
// The opposite direction (registry referenced but value wrong) is impossible by
// construction since the registry IS the value.
// ---------------------------------------------------------------------------

const RUNTIME_METADATA: Record<string, any> = {
  ...collectedComponentMetadata,
  DataLoader: DataLoaderMd,
  DataSource: DataSourceMd,
  APICall: APICallMd,
};

describe("OPTIMIZER_METADATA reflected in runtime metadata (U-audit.1)", () => {
  for (const [componentType, registryEntry] of Object.entries(OPTIMIZER_METADATA)) {
    const runtime = RUNTIME_METADATA[componentType];
    const entry = registryEntry as { childInjectedVars?: readonly string[]; events?: Record<string, { injectedVars?: readonly string[] }> };

    if (entry.childInjectedVars) {
      it(`${componentType}: runtime metadata uses OPTIMIZER_METADATA.${componentType}.childInjectedVars`, () => {
        expect(runtime).toBeDefined();
        expect([...(runtime.childInjectedVars ?? [])].sort()).toEqual(
          [...entry.childInjectedVars!].sort(),
        );
      });
    }

    if (entry.events) {
      for (const [eventName, eventEntry] of Object.entries(entry.events)) {
        it(`${componentType}.events.${eventName}: runtime metadata uses OPTIMIZER_METADATA entry`, () => {
          expect(runtime).toBeDefined();
          const runtimeEvent = runtime?.events?.[eventName];
          expect(runtimeEvent).toBeDefined();
          expect([...(runtimeEvent?.injectedVars ?? [])].sort()).toEqual(
            [...(eventEntry.injectedVars ?? [])].sort(),
          );
        });
      }
    }
  }
});

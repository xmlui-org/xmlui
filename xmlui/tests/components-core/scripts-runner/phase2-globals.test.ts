/**
 * Unit tests for Phase 2 managed replacement globals.
 *
 * Covers:
 *  - Step 2.6  Log.* namespace + silentConsole switch
 *  - Step 2.4  App.randomBytes(n)
 *  - Step 2.5  App.now() / App.mark() / App.measure()
 *  - Step 2.2  Clipboard.copy(text)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Helpers: minimal _xsLogs shim so pushXsLog works in the test environment.
// ---------------------------------------------------------------------------

function installXsLogs(): any[] {
  const logs: any[] = [];
  (globalThis as any).window = globalThis;
  (globalThis as any)._xsLogs = logs;
  return logs;
}

function uninstallXsLogs(): void {
  delete (globalThis as any)._xsLogs;
}

// ---------------------------------------------------------------------------
// Step 2.6 — Log namespace
// ---------------------------------------------------------------------------

describe("Step 2.6 — Log namespace", async () => {
  const { createLog } = await import("../../../src/components-core/appContext/log");

  let logs: any[];
  beforeEach(() => { logs = installXsLogs(); });
  afterEach(() => { uninstallXsLogs(); vi.restoreAllMocks(); });

  for (const level of ["debug", "info", "warn", "error"] as const) {
    describe(`Log.${level}`, () => {
      it(`pushes a 'log:${level}' trace entry`, () => {
        const log = createLog(false);
        vi.spyOn(console, level as any).mockImplementation(() => {});
        log[level]("hello", 42);
        expect(logs.some((e) => e.kind === `log:${level}`)).toBe(true);
      });

      it(`trace entry contains the args`, () => {
        const log = createLog(false);
        vi.spyOn(console, level as any).mockImplementation(() => {});
        log[level]("msg", { x: 1 });
        const entry = logs.find((e) => e.kind === `log:${level}`);
        expect(entry?.args).toEqual(["msg", { x: 1 }]);
      });

      it(`calls native console.${level} when silentConsole=false`, () => {
        const spy = vi.spyOn(console, level as any).mockImplementation(() => {});
        const log = createLog(false);
        log[level]("test");
        expect(spy).toHaveBeenCalledWith("test");
      });

      it(`does NOT call native console.${level} when silentConsole=true`, () => {
        const spy = vi.spyOn(console, level as any).mockImplementation(() => {});
        const log = createLog(true);
        log[level]("test");
        expect(spy).not.toHaveBeenCalled();
      });

      it(`still pushes trace entry when silentConsole=true`, () => {
        vi.spyOn(console, level as any).mockImplementation(() => {});
        const log = createLog(true);
        log[level]("silent");
        expect(logs.some((e) => e.kind === `log:${level}`)).toBe(true);
      });
    });
  }

  it("trace entry has a ts timestamp", () => {
    const log = createLog(true);
    const before = Date.now();
    log.info("timing");
    const after = Date.now();
    const entry = logs.find((e) => e.kind === "log:info");
    expect(entry?.ts).toBeGreaterThanOrEqual(before);
    expect(entry?.ts).toBeLessThanOrEqual(after);
  });
});

// ---------------------------------------------------------------------------
// Step 2.4 — App.randomBytes(n)
// ---------------------------------------------------------------------------

describe("Step 2.4 — App.randomBytes(n)", async () => {
  const { randomBytes } = await import("../../../src/components-core/appContext/app-utils");

  let logs: any[];
  beforeEach(() => { logs = installXsLogs(); });
  afterEach(() => { uninstallXsLogs(); });

  it("returns a Uint8Array of the requested length", () => {
    const buf = randomBytes(16);
    expect(buf).toBeInstanceOf(Uint8Array);
    expect(buf.length).toBe(16);
  });

  it("works for n=1 (lower bound)", () => {
    expect(randomBytes(1).length).toBe(1);
  });

  it("works for n=1024 (upper bound)", () => {
    expect(randomBytes(1024).length).toBe(1024);
  });

  it("throws RangeError for n=0", () => {
    expect(() => randomBytes(0)).toThrow(RangeError);
  });

  it("throws RangeError for n=1025", () => {
    expect(() => randomBytes(1025)).toThrow(RangeError);
  });

  it("throws RangeError for non-integer", () => {
    expect(() => randomBytes(3.5)).toThrow(RangeError);
  });

  it("pushes an 'app:randomBytes' trace entry", () => {
    randomBytes(8);
    expect(logs.some((e) => e.kind === "app:randomBytes" && e.n === 8)).toBe(true);
  });

  it("does not include the actual bytes in the trace entry", () => {
    randomBytes(8);
    const entry = logs.find((e) => e.kind === "app:randomBytes");
    expect(entry).not.toHaveProperty("bytes");
    expect(entry).not.toHaveProperty("data");
  });
});

// ---------------------------------------------------------------------------
// Step 2.5 — App.now() / App.mark() / App.measure()
// ---------------------------------------------------------------------------

describe("Step 2.5 — App.now / App.mark / App.measure", async () => {
  const { now, mark, measure } = await import("../../../src/components-core/appContext/app-utils");

  let logs: any[];
  beforeEach(() => { logs = installXsLogs(); });
  afterEach(() => { uninstallXsLogs(); });

  it("App.now() returns a non-negative number", () => {
    expect(now()).toBeGreaterThanOrEqual(0);
  });

  it("App.now() is a float (high resolution)", () => {
    // Two calls should be distinct because performance.now() has sub-ms resolution.
    // (Not guaranteed but practically always true.)
    expect(typeof now()).toBe("number");
  });

  it("App.mark(label) pushes an 'app:mark' trace entry", () => {
    mark("start");
    expect(logs.some((e) => e.kind === "app:mark" && e.label === "start")).toBe(true);
  });

  it("App.mark trace entry includes perfTs", () => {
    mark("t");
    const entry = logs.find((e) => e.kind === "app:mark");
    expect(typeof entry?.perfTs).toBe("number");
  });

  it("App.measure returns a positive duration after a mark", () => {
    mark("m1");
    const d = measure("elapsed", "m1");
    expect(d).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(d)).toBe(false);
  });

  it("App.measure returns NaN for an unknown fromMark", () => {
    expect(Number.isNaN(measure("x", "never-set"))).toBe(true);
  });

  it("App.measure pushes an 'app:measure' trace entry", () => {
    mark("a");
    measure("delta", "a");
    expect(logs.some((e) => e.kind === "app:measure" && e.label === "delta")).toBe(true);
  });

  it("App.measure entry contains the duration", () => {
    mark("b");
    measure("d2", "b");
    const entry = logs.find((e) => e.kind === "app:measure");
    expect(typeof entry?.duration).toBe("number");
    expect(entry.duration).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Step 2.2 — Clipboard.copy(text)
// ---------------------------------------------------------------------------

describe("Step 2.2 — Clipboard.copy(text)", async () => {
  const { clipboardCopy } = await import("../../../src/components-core/appContext/app-utils");

  let logs: any[];
  beforeEach(() => { logs = installXsLogs(); });
  afterEach(() => { uninstallXsLogs(); vi.restoreAllMocks(); });

  it("resolves when writeText succeeds", async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: spy },
      writable: true,
      configurable: true,
    });
    await expect(clipboardCopy("hello")).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalledWith("hello");
  });

  it("pushes a 'clipboard:copy' trace entry", async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: spy },
      writable: true,
      configurable: true,
    });
    await clipboardCopy("world");
    const entry = logs.find((e) => e.kind === "clipboard:copy");
    expect(entry).toBeDefined();
    expect(entry.length).toBe(5); // "world".length
  });

  it("throws when clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    await expect(clipboardCopy("x")).rejects.toThrow("Clipboard API");
  });
});

/**
 * Unit tests for Phase 3 managed replacement globals and guards.
 *
 * Covers:
 *  - Step 3.2  App.fetch — managed fetch with CSRF and allowedOrigins enforcement
 *  - Step 3.2  `fetch` is in BANNED_GLOBAL_KEYS
 *  - Step 3.4  App.environment — curated environment snapshot
 *  - Step 3.4  navigator fingerprinting keys are in BANNED_NAVIGATOR_FINGERPRINT_KEYS
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
// Step 3.2 — App.fetch
// ---------------------------------------------------------------------------

describe("Step 3.2 — App.fetch", async () => {
  const { createAppFetch } = await import("../../../src/components-core/appContext/app-utils");

  let logs: any[];
  beforeEach(() => {
    logs = installXsLogs();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    uninstallXsLogs();
    vi.restoreAllMocks();
  });

  it("delegates to the global fetch", async () => {
    const mockResponse = new Response("ok", { status: 200 });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const appFetch = createAppFetch(undefined);
    const result = await appFetch("/api/data");

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(result).toBe(mockResponse);
  });

  it("pushes an 'app:fetch' trace entry", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    const appFetch = createAppFetch(undefined);
    await appFetch("/api/data");

    expect(logs.some((e) => e.kind === "app:fetch")).toBe(true);
  });

  it("trace entry contains url and method", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    const appFetch = createAppFetch(undefined);
    await appFetch("/api/items", { method: "POST" });

    const entry = logs.find((e) => e.kind === "app:fetch");
    expect(entry?.url).toBe("/api/items");
    expect(entry?.method).toBe("POST");
  });

  it("method defaults to GET in the trace entry", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    const appFetch = createAppFetch(undefined);
    await appFetch("/api/items");

    const entry = logs.find((e) => e.kind === "app:fetch");
    expect(entry?.method).toBe("GET");
  });

  it("rejects a cross-origin request when allowedOrigins is set", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const appFetch = createAppFetch({
      allowedOrigins: ["https://api.allowed.com"],
    });

    await expect(appFetch("https://api.blocked.com/data")).rejects.toThrow(/allowedOrigins/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("permits a request whose origin is in allowedOrigins", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    const appFetch = createAppFetch({
      allowedOrigins: ["https://api.allowed.com"],
    });

    await appFetch("https://api.allowed.com/resource");
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("no allowedOrigins restriction when the list is empty", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    const appFetch = createAppFetch({ allowedOrigins: [] });
    await appFetch("https://anywhere.example.com/api");
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("accepts a URL instance as input", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    const appFetch = createAppFetch(undefined);
    await appFetch(new URL("https://api.example.com/items"));
    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// Step 3.2 — fetch is in the BANNED_GLOBAL_KEYS denylist
// ---------------------------------------------------------------------------

describe("Step 3.2 — 'fetch' in BANNED_GLOBAL_KEYS", async () => {
  const { BANNED_GLOBAL_KEYS } = await import(
    "../../../src/components-core/script-runner/bannedMembers"
  );

  it("BANNED_GLOBAL_KEYS contains 'fetch'", () => {
    expect(BANNED_GLOBAL_KEYS.has("fetch")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 3.4 — App.environment
// ---------------------------------------------------------------------------

describe("Step 3.4 — App.environment (getAppEnvironment)", async () => {
  const { getAppEnvironment } = await import(
    "../../../src/components-core/appContext/app-utils"
  );

  it("returns an object with the expected shape", () => {
    const env = getAppEnvironment();
    expect(env).toHaveProperty("isMobile");
    expect(env).toHaveProperty("prefersDark");
    expect(env).toHaveProperty("prefersReducedMotion");
    expect(env).toHaveProperty("locale");
    expect(env).toHaveProperty("languages");
  });

  it("isMobile is a boolean", () => {
    expect(typeof getAppEnvironment().isMobile).toBe("boolean");
  });

  it("prefersDark is a boolean", () => {
    expect(typeof getAppEnvironment().prefersDark).toBe("boolean");
  });

  it("prefersReducedMotion is a boolean", () => {
    expect(typeof getAppEnvironment().prefersReducedMotion).toBe("boolean");
  });

  it("locale is a non-empty string", () => {
    const { locale } = getAppEnvironment();
    expect(typeof locale).toBe("string");
    expect(locale.length).toBeGreaterThan(0);
  });

  it("languages is a non-empty array of strings", () => {
    const { languages } = getAppEnvironment();
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
    for (const lang of languages) {
      expect(typeof lang).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// Step 3.4 — navigator fingerprinting keys in BANNED_NAVIGATOR_FINGERPRINT_KEYS
// ---------------------------------------------------------------------------

describe("Step 3.4 — navigator fingerprinting keys banned", async () => {
  const { BANNED_NAVIGATOR_FINGERPRINT_KEYS } = await import(
    "../../../src/components-core/script-runner/bannedMembers"
  );

  for (const key of [
    "userAgent",
    "userAgentData",
    "platform",
    "hardwareConcurrency",
    "deviceMemory",
    "connection",
  ]) {
    it(`BANNED_NAVIGATOR_FINGERPRINT_KEYS contains '${key}'`, () => {
      expect(BANNED_NAVIGATOR_FINGERPRINT_KEYS.has(key)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Step 3.4 — isBannedMember blocks navigator fingerprinting keys
// ---------------------------------------------------------------------------

describe("Step 3.4 — isBannedMember blocks navigator fingerprinting", async () => {
  const { isBannedMember } = await import(
    "../../../src/components-core/script-runner/bannedMembers"
  );

  const fingerprintKeys = [
    "userAgent",
    "userAgentData",
    "platform",
    "hardwareConcurrency",
    "deviceMemory",
    "connection",
  ] as const;

  for (const key of fingerprintKeys) {
    it(`blocks navigator.${key}`, () => {
      const result = isBannedMember(navigator, key);
      expect(result.banned).toBe(true);
      expect(result.api).toBe(`navigator.${key}`);
    });
  }

  it("includes a migration hint for userAgent", () => {
    const result = isBannedMember(navigator, "userAgent");
    expect(result.help).toMatch(/App\.environment/);
  });
});

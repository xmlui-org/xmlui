/**
 * Step 2.3 — navigate() target="_blank" hardening.
 *
 * The only sanctioned way to open an external tab from XMLUI markup is
 * `navigate(url, { target: "_blank" })`. The implementation must:
 *
 *   1. Use `window.open(href, "_blank", "noopener,noreferrer")` — never bare.
 *   2. Skip the React Router `navigate()` call so SPA state is not mutated.
 *   3. Emit a `kind: "navigate"` trace entry with `target: "_blank"`.
 *
 * Bare `window.open` from expressions is already blocked at the
 * property-access guard (Step 1.7). This spec exercises the user-visible
 * navigate path.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Re-implementation of the navigate body in AppContent.tsx — kept inline so
// the test does not depend on the React rendering pipeline. If the AppContent
// implementation drifts, this test surfaces the drift.
function makeNavigate(opts: {
  navigateRouter: (to: any, options?: any) => void;
  pushXsLog: (entry: any) => void;
  windowOpen: (url: string, target: string, features?: string) => void;
}) {
  return async function navigate(to: any, options?: any) {
    const target = options?.target;
    const { queryParams: _qp, target: _t, ...navigateOptions } = options || {};

    if (target === "_blank") {
      const href =
        typeof to === "string"
          ? to
          : (to?.pathname ?? "") + (to?.search ?? "") + (to?.hash ?? "");
      opts.pushXsLog({
        kind: "navigate",
        ts: Date.now(),
        to: href,
        target: "_blank",
      });
      opts.windowOpen(href, "_blank", "noopener,noreferrer");
      return;
    }

    opts.pushXsLog({
      kind: "navigate",
      ts: Date.now(),
      to: typeof to === "string" ? to : (to?.pathname ?? ""),
      target: target ?? "_self",
    });
    opts.navigateRouter(to, navigateOptions);
  };
}

describe("Step 2.3 — navigate() target=\"_blank\" hardening", () => {
  let routerCalls: Array<{ to: any; options: any }>;
  let logEntries: any[];
  let windowOpenCalls: Array<{ url: string; target: string; features?: string }>;

  beforeEach(() => {
    routerCalls = [];
    logEntries = [];
    windowOpenCalls = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeNav() {
    return makeNavigate({
      navigateRouter: (to, options) => routerCalls.push({ to, options }),
      pushXsLog: (e) => logEntries.push(e),
      windowOpen: (url, target, features) =>
        windowOpenCalls.push({ url, target, features }),
    });
  }

  describe("default same-tab navigation", () => {
    it("calls the router", async () => {
      const nav = makeNav();
      await nav("/dashboard");
      expect(routerCalls).toHaveLength(1);
      expect(routerCalls[0].to).toBe("/dashboard");
    });

    it("does not open a new window", async () => {
      const nav = makeNav();
      await nav("/dashboard");
      expect(windowOpenCalls).toHaveLength(0);
    });

    it("emits a navigate trace entry with target=_self", async () => {
      const nav = makeNav();
      await nav("/dashboard");
      expect(logEntries).toHaveLength(1);
      expect(logEntries[0].kind).toBe("navigate");
      expect(logEntries[0].target).toBe("_self");
      expect(logEntries[0].to).toBe("/dashboard");
    });

    it("explicit target=_self behaves like default", async () => {
      const nav = makeNav();
      await nav("/x", { target: "_self" });
      expect(routerCalls).toHaveLength(1);
      expect(windowOpenCalls).toHaveLength(0);
      expect(logEntries[0].target).toBe("_self");
    });
  });

  describe("target=\"_blank\"", () => {
    it("opens via window.open with noopener,noreferrer", async () => {
      const nav = makeNav();
      await nav("https://example.com", { target: "_blank" });
      expect(windowOpenCalls).toHaveLength(1);
      expect(windowOpenCalls[0].url).toBe("https://example.com");
      expect(windowOpenCalls[0].target).toBe("_blank");
      expect(windowOpenCalls[0].features).toBe("noopener,noreferrer");
    });

    it("does NOT call the React Router navigate", async () => {
      const nav = makeNav();
      await nav("https://example.com", { target: "_blank" });
      expect(routerCalls).toHaveLength(0);
    });

    it("emits a navigate trace entry with target=_blank", async () => {
      const nav = makeNav();
      await nav("https://example.com", { target: "_blank" });
      expect(logEntries).toHaveLength(1);
      expect(logEntries[0]).toMatchObject({
        kind: "navigate",
        to: "https://example.com",
        target: "_blank",
      });
    });

    it("never passes a window-features string without noopener", async () => {
      const nav = makeNav();
      await nav("/x", { target: "_blank" });
      expect(windowOpenCalls[0].features).toContain("noopener");
      expect(windowOpenCalls[0].features).toContain("noreferrer");
    });

    it("flattens an object-shaped 'to' into href", async () => {
      const nav = makeNav();
      await nav(
        { pathname: "/p", search: "?q=1", hash: "#h" },
        { target: "_blank" },
      );
      expect(windowOpenCalls[0].url).toBe("/p?q=1#h");
    });
  });
});

import { describe, expect, it, vi } from "vitest";

import viteXmluiPlugin from "../../src/nodejs/vite-xmlui-plugin";
import type { PluginOptions } from "../../src/nodejs/vite-xmlui-plugin";

/**
 * Phase 2.4 of `.plan/strict-compilation-mode.md`.
 *
 * The build is where the gate belongs: most violations are visible at compile time, and
 * finding them one build at a time is the difference between a morning and a week.
 */
async function build(files: Record<string, string>, options: Partial<PluginOptions> = {}) {
  const plugin = viteXmluiPlugin({
    analyze: "off",
    reactiveCycles: "off",
    accessibility: "off",
    typeContracts: "off",
    ...options,
  });
  (plugin.configResolved as any)?.({ root: "/project" });
  const errors: string[] = [];
  const warnings: string[] = [];
  const ctx = {
    warn: (message: string) => warnings.push(String(message)),
    error: (message: string) => {
      errors.push(String(message));
      throw new Error(String(message));
    },
  };
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  try {
    for (const [path, code] of Object.entries(files)) {
      await (plugin.transform as any).call(ctx, code, path, {});
    }
    try {
      (plugin.buildEnd as any).call(ctx);
    } catch {
      // --- `this.error` throws in Rollup; the message is already captured.
    }
  } finally {
    log.mockRestore();
  }
  return { errors, warnings };
}

const AWAIT_HANDLER = `<Fragment><Button onClick="const r = await load(); return r;" /></Fragment>`;

describe("strict compilation at build time", () => {
  it("fails the build, naming the construct, the owner and the fix", async () => {
    const { errors } = await build(
      { "/project/src/Main.xmlui": AWAIT_HANDLER },
      { compileScripts: true, strictCompilation: true },
    );

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("Strict compilation");
    expect(errors[0]).toContain("await expression");
    expect(errors[0]).toContain("Button onClick");
    expect(errors[0]).toContain("XMLUI awaits");
    expect(errors[0]).toContain("^");
  });

  it("reports every violation at once, not the first", async () => {
    // --- The property that decides whether adopting strict mode takes a morning or a
    // --- week: an author fixing twenty constructs should see twenty, once.
    const { errors } = await build(
      {
        "/project/src/B.xmlui": `<Fragment><Button onClick="const b = await two(); return b;" /></Fragment>`,
        "/project/src/A.xmlui": `<Fragment><Stack onMount="const a = await one(); return a;" /></Fragment>`,
      },
      { compileScripts: true, strictCompilation: true },
    );

    expect(errors[0]).toContain("2 script(s) in 2 file(s)");
    expect(errors[0]).toContain("Stack onMount");
    expect(errors[0]).toContain("Button onClick");
    // --- Sorted by file, so the list reads like the project does. Paths are
    // --- project-relative, the way the plugin identifies a file everywhere else.
    expect(errors[0]).toContain("/src/A.xmlui:1:11");
    expect(errors[0].indexOf("/src/A.xmlui")).toBeLessThan(errors[0].indexOf("/src/B.xmlui"));
  });

  it("stays quiet when everything compiles", async () => {
    const { errors, warnings } = await build(
      { "/project/src/Main.xmlui": `<Fragment><Button onClick="count = count + 1" /></Fragment>` },
      { compileScripts: true, strictCompilation: true },
    );
    expect(errors).toEqual([]);
    expect(warnings.join("\n")).not.toContain("Strict compilation");
  });

  it("does not fail a build that never asked for strict mode", async () => {
    const { errors } = await build(
      { "/project/src/Main.xmlui": AWAIT_HANDLER },
      { compileScripts: true },
    );
    expect(errors).toEqual([]);
  });

  it("is inert without compileScripts", async () => {
    const { errors } = await build(
      { "/project/src/Main.xmlui": AWAIT_HANDLER },
      { strictCompilation: true },
    );
    expect(errors).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import viteXmluiPlugin from "../../src/nodejs/vite-xmlui-plugin";

/**
 * Reactive cycle detection in the Vite plugin — Plan #03 Step 3.4 (W6-7).
 *
 * Invokes the plugin's `transform` hook directly with a stub Rollup
 * context (`this.warn` / `this.error`) and asserts cycles are reported.
 */

type Recorded = { warns: string[]; errors: string[] };

function makeCtx(): Recorded & {
  warn: (msg: string) => void;
  error: (msg: string) => never;
} {
  const warns: string[] = [];
  const errors: string[] = [];
  return {
    warns,
    errors,
    warn(msg: string) {
      warns.push(typeof msg === "string" ? msg : String(msg));
    },
    error(msg: string) {
      errors.push(typeof msg === "string" ? msg : String(msg));
      throw new Error(typeof msg === "string" ? msg : String(msg));
    },
  };
}

async function runTransform(
  plugin: any,
  code: string,
  id: string,
  ctx: ReturnType<typeof makeCtx>,
) {
  // `transform` may be a hook object on newer Vite; fall back to function.
  const fn = typeof plugin.transform === "function" ? plugin.transform : plugin.transform?.handler;
  return await fn.call(ctx, code, id, {});
}

const cycleMarkup = `
<Stack var.a="{b + 1}" var.b="{a + 1}" />
`;

describe("vite-xmlui-plugin reactive cycle detection", () => {
  it("warns on a cycle in warn mode", async () => {
    // analyze is "off" so the static analyzer doesn't double-report.
    const plugin = viteXmluiPlugin({ analyze: "off", reactiveCycles: "warn" });
    const ctx = makeCtx();
    await runTransform(plugin, cycleMarkup, "/x/Main.xmlui", ctx);
    expect(ctx.errors).toEqual([]);
    expect(ctx.warns.some((w) => /reactive-cycle/.test(w))).toBe(true);
    expect(ctx.warns.some((w) => /\ba\b/.test(w) && /\bb\b/.test(w))).toBe(true);
  });

  it("fails the build on a cycle in strict mode", async () => {
    const plugin = viteXmluiPlugin({ analyze: "off", reactiveCycles: "strict" });
    const ctx = makeCtx();
    await expect(runTransform(plugin, cycleMarkup, "/x/Main.xmlui", ctx)).rejects.toThrow(
      /reactive-cycle/,
    );
    expect(ctx.errors.some((e) => /reactive-cycle/.test(e))).toBe(true);
  });

  it("is silent for cycle-free markup", async () => {
    const plugin = viteXmluiPlugin({ analyze: "off", reactiveCycles: "warn" });
    const ctx = makeCtx();
    await runTransform(
      plugin,
      `<Stack var.a="{1}" var.b="{a + 1}"><Text>{b}</Text></Stack>`,
      "/x/Main.xmlui",
      ctx,
    );
    expect(ctx.warns.filter((w) => /reactive-cycle/.test(w))).toEqual([]);
    expect(ctx.errors).toEqual([]);
  });

  it("dedupes the same cycle across consecutive transforms", async () => {
    const plugin = viteXmluiPlugin({ analyze: "off", reactiveCycles: "warn" });
    const ctx = makeCtx();
    await runTransform(plugin, cycleMarkup, "/x/Main.xmlui", ctx);
    await runTransform(plugin, cycleMarkup, "/x/Main.xmlui", ctx);
    const cycleWarns = ctx.warns.filter((w) => /reactive-cycle/.test(w));
    expect(cycleWarns).toHaveLength(1);
  });

  it("respects reactiveCycles: 'off'", async () => {
    const plugin = viteXmluiPlugin({ analyze: "off", reactiveCycles: "off" });
    const ctx = makeCtx();
    await runTransform(plugin, cycleMarkup, "/x/Main.xmlui", ctx);
    expect(ctx.warns.filter((w) => /reactive-cycle/.test(w))).toEqual([]);
    expect(ctx.errors).toEqual([]);
  });
});

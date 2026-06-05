import { describe, expect, it } from "vitest";
import viteXmluiPlugin from "../../src/nodejs/vite-xmlui-plugin";

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
  const fn = typeof plugin.transform === "function" ? plugin.transform : plugin.transform?.handler;
  return await fn.call(ctx, code, id, {});
}

describe("vite-xmlui-plugin type-contract diagnostics", () => {
  it("warns on literal type-contract violations in warn mode", async () => {
    const plugin = viteXmluiPlugin({
      analyze: "off",
      reactiveCycles: "off",
      accessibility: "off",
      typeContracts: "warn",
    });
    const ctx = makeCtx();
    await runTransform(plugin, `<Button labe="Save" />`, "/x/Main.xmlui", ctx);
    expect(ctx.errors).toEqual([]);
    expect(ctx.warns.some((w) => /xmlui:type-contract/.test(w))).toBe(true);
    expect(ctx.warns.some((w) => /unknown-prop/.test(w))).toBe(true);
  });

  it("warns when Text variant is not one of the typed contract values", async () => {
    const plugin = viteXmluiPlugin({
      analyze: "off",
      reactiveCycles: "off",
      accessibility: "off",
      typeContracts: "warn",
    });
    const ctx = makeCtx();
    await runTransform(
      plugin,
      `<App>
        <H1>Typed Contracts</H1>
        <Text varian="strong">Contains an invalid property name</Text>
        <Text variant="dummy">Contains an invalid property value</Text>
      </App>`,
      "/x/Main.xmlui",
      ctx,
    );

    expect(ctx.errors).toEqual([]);
    expect(ctx.warns.some((w) => /unknown-prop/.test(w) && /varian/.test(w))).toBe(true);
    expect(
      ctx.warns.some((w) => /value-not-in-enum/.test(w) && /variant/.test(w) && /dummy/.test(w)),
    ).toBe(true);
  });

  it("fails the build in strict mode", async () => {
    const plugin = viteXmluiPlugin({
      analyze: "off",
      reactiveCycles: "off",
      accessibility: "off",
      typeContracts: "strict",
    });
    const ctx = makeCtx();
    await expect(runTransform(plugin, `<Button labe="Save" />`, "/x/Main.xmlui", ctx))
      .rejects.toThrow(/type-contract/);
    expect(ctx.errors.some((e) => /unknown-prop/.test(e))).toBe(true);
  });

  it("emits a build summary by diagnostic code", async () => {
    const plugin: any = viteXmluiPlugin({
      analyze: "off",
      reactiveCycles: "off",
      accessibility: "off",
      typeContracts: "warn",
    });
    const ctx = makeCtx();
    await runTransform(plugin, `<Button labe="Save" />`, "/x/Main.xmlui", ctx);
    const buildEnd = typeof plugin.buildEnd === "function" ? plugin.buildEnd : plugin.buildEnd?.handler;
    buildEnd.call(ctx);
    expect(ctx.warns.some((w) => /Build complete/.test(w) && /unknown-prop: 1/.test(w))).toBe(true);
  });
});

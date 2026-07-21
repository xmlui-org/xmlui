import { describe, expect, it } from "vitest";

import {
  createCompiledScriptArtifact,
  createCompiledScriptCache,
  createCompiledScriptCacheKey,
} from "../../../src/components-core/script-compiler";

describe("compiled script cache", () => {
  it("returns cached artifacts without invoking the factory again", () => {
    const cache = createCompiledScriptCache();
    const key = createCompiledScriptCacheKey({
      target: "binding-sync",
      sourceId: "Main.xmlui#expr-1",
      sourceText: "{count}",
    });
    let calls = 0;

    const artifact = cache.getOrCreate(key, () => {
      calls++;
      return createCompiledScriptArtifact({
        target: "binding-sync",
        sourceId: "Main.xmlui#expr-1",
        sourceText: "{count}",
        dependencies: ["count"],
        js: "return runtime.resolve('count');",
      });
    });

    expect(cache.getOrCreate(key, () => {
      calls++;
      return createCompiledScriptArtifact({
        target: "binding-sync",
        sourceId: "Main.xmlui#expr-1",
        js: "return 0;",
      });
    })).toBe(artifact);
    expect(calls).toBe(1);
  });

  it("includes target, source, ast node, options, and compiler version in keys", () => {
    const base = {
      target: "binding-sync" as const,
      sourceId: "Main.xmlui#expr-1",
      sourceText: "{count}",
      astNodeId: 1,
      optionsKey: "compileBindings:true",
    };

    expect(createCompiledScriptCacheKey(base)).not.toBe(
      createCompiledScriptCacheKey({ ...base, target: "event-handler" }),
    );
    expect(createCompiledScriptCacheKey(base)).not.toBe(
      createCompiledScriptCacheKey({ ...base, sourceText: "{other}" }),
    );
    expect(createCompiledScriptCacheKey(base)).not.toBe(
      createCompiledScriptCacheKey({ ...base, astNodeId: 2 }),
    );
    expect(createCompiledScriptCacheKey(base)).not.toBe(
      createCompiledScriptCacheKey({ ...base, optionsKey: "compileBindings:false" }),
    );
    expect(createCompiledScriptCacheKey(base)).not.toBe(
      createCompiledScriptCacheKey({ ...base, compilerVersion: 2 }),
    );
  });

  it("evicts the oldest entry when the maximum size is reached", () => {
    const cache = createCompiledScriptCache(1);
    const first = createCompiledScriptArtifact({
      target: "binding-sync",
      sourceId: "first",
      js: "return 1;",
    });
    const second = createCompiledScriptArtifact({
      target: "binding-sync",
      sourceId: "second",
      js: "return 2;",
    });

    cache.set("first", first);
    cache.set("second", second);

    expect(cache.get("first")).toBeUndefined();
    expect(cache.get("second")).toBe(second);
    expect(cache.size).toBe(1);
  });
});


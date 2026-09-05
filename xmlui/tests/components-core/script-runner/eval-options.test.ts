import { describe, expect, it } from "vitest";

import {
  createBindingEvalOptions,
  createEventEvalOptions,
  getScriptExecutionMode,
} from "../../../src/components-core/script-runner/eval-options";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { extractParam } from "../../../src/components-core/utils/extractParam";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { parseAttributeValue } from "../../../src/components-core/script-runner/AttributeValueParser";
import { evalBinding } from "../../../src/components-core/script-runner/eval-tree-sync";

/**
 * One switch decides for every script path. These cases pin that down: the binding
 * options and the event options read the same key from the same merged config view,
 * and neither has an alias that can disagree with the other.
 */
describe("binding eval options", () => {
  it("leaves compilation off by default", () => {
    expect(createBindingEvalOptions()).not.toHaveProperty("compileScripts");
    expect(createBindingEvalOptions({ xmluiConfig: {} } as any)).not.toHaveProperty(
      "compileScripts",
    );
    expect(
      createBindingEvalOptions({ xmluiConfig: { compileScripts: false } } as any),
    ).not.toHaveProperty("compileScripts");
  });

  it("carries compileScripts when enabled in xmluiConfig", () => {
    expect(
      createBindingEvalOptions({ xmluiConfig: { compileScripts: true } } as any),
    ).toMatchObject({ compileScripts: true });
  });

  it("carries the fallback report switch", () => {
    expect(
      createBindingEvalOptions({
        xmluiConfig: { compileScripts: true, reportCompileFallbacks: true },
      } as any),
    ).toMatchObject({ compileScripts: true, reportCompileFallbacks: true });
  });

  it("does not take source maps from configuration", () => {
    // --- Source maps follow the dev server, not a config key: an app asking for them
    // --- through the removed `compiledScriptSourceMaps` gets nothing.
    expect(
      createBindingEvalOptions({
        xmluiConfig: { compileScripts: true, compiledScriptSourceMaps: "inline" },
      } as any).sourceMaps,
    ).not.toBe("inline");
  });

  it("lets explicit eval option overrides win over xmluiConfig", () => {
    expect(
      createBindingEvalOptions({ xmluiConfig: { compileScripts: true } } as any, {
        compileScripts: false,
        strictUdcSandbox: true,
      }),
    ).toMatchObject({ compileScripts: false, strictUdcSandbox: true });
  });

  it("does not change binding evaluation results", () => {
    const appContext = { xmluiConfig: { compileScripts: true } } as any;

    expect(extractParam({ count: 2 }, "{count + 1}", appContext)).toBe(3);
    expect(extractParam({ count: 2 }, "{count + 1}")).toBe(3);
  });
});

describe("event eval options", () => {
  it("leaves compilation off by default", () => {
    expect(createEventEvalOptions()).not.toHaveProperty("compileScripts");
    expect(createEventEvalOptions({ xmluiConfig: {} } as any)).not.toHaveProperty(
      "compileScripts",
    );
    expect(
      createEventEvalOptions({ xmluiConfig: { compileScripts: false } } as any),
    ).not.toHaveProperty("compileScripts");
  });

  it("carries compileScripts when enabled in xmluiConfig", () => {
    expect(
      createEventEvalOptions({ xmluiConfig: { compileScripts: true } } as any),
    ).toMatchObject({ compileScripts: true });
  });

  it("reads the same switch as binding evaluation", () => {
    const appContext = { xmluiConfig: { compileScripts: true } } as any;

    expect(createEventEvalOptions(appContext).compileScripts).toBe(
      createBindingEvalOptions(appContext).compileScripts,
    );
  });

  it("preserves existing async event eval defaults", () => {
    expect(createEventEvalOptions()).toMatchObject({
      defaultToOptionalMemberAccess: true,
      strictDomSandbox: false,
      allowConsole: true,
    });
  });

  it("lets explicit eval option overrides win over xmluiConfig", () => {
    expect(
      createEventEvalOptions({ xmluiConfig: { compileScripts: true } } as any, {
        compileScripts: false,
        strictUdcSandbox: true,
      }),
    ).toMatchObject({ compileScripts: false, strictUdcSandbox: true });
  });

  it("does not change async statement evaluation results", async () => {
    const parser = new Parser("count = count + 1;");
    const statements = parser.parseStatements();
    const evalContext = {
      localContext: { count: 2 },
      appContext: { xmluiConfig: { compileScripts: true } },
      options: createEventEvalOptions({
        xmluiConfig: { compileScripts: true },
      } as any),
    };

    await processStatementQueueAsync(statements, evalContext as any);

    expect(evalContext.localContext.count).toBe(3);
  });
});

describe("script execution mode", () => {
  it("reports interpreted mode by default", () => {
    expect(getScriptExecutionMode()).toEqual({ mode: "interpreted" });
  });

  it("reports compiled mode when compileScripts is enabled", () => {
    expect(getScriptExecutionMode({ xmluiConfig: { compileScripts: true } } as any)).toEqual({
      mode: "compiled",
    });
  });

  it("ignores a removed per-path key", () => {
    expect(getScriptExecutionMode({ xmluiConfig: { compileEventHandlers: true } } as any)).toEqual({
      mode: "interpreted",
    });
  });
});

describe("compileScripts reaches every binding call site", () => {
  it("compiles a parsed attribute binding", () => {
    const parsed = parseAttributeValue("{count + 1}", {
      compileScripts: true,
      sourceId: "Main.xmlui",
    });

    expect(parsed.segments[0].compiled).toMatchObject({ target: "binding-sync" });
  });

  it("leaves a parsed attribute binding alone when compilation is off", () => {
    const parsed = parseAttributeValue("{count + 1}", { sourceId: "Main.xmlui" });

    expect(parsed.segments[0].compiled).toBeUndefined();
  });

  it("evaluates a binding through the compiled path", () => {
    const expr = new Parser("count + 1").parseExpr()!;
    const evalContext = {
      localContext: { count: 41 },
      options: { compileScripts: true, defaultToOptionalMemberAccess: true },
    } as any;

    expect(evalBinding(expr, evalContext)).toBe(42);
  });
});

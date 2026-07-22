import { describe, expect, it } from "vitest";

import {
  createBindingEvalOptions,
  createEventEvalOptions,
} from "../../../src/components-core/script-runner/eval-options";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { extractParam } from "../../../src/components-core/utils/extractParam";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";

describe("binding eval options", () => {
  it("leaves compileBindings disabled by default", () => {
    expect(createBindingEvalOptions()).not.toHaveProperty("compileBindings");
    expect(createBindingEvalOptions({ xmluiConfig: {} } as any)).not.toHaveProperty(
      "compileBindings",
    );
    expect(
      createBindingEvalOptions({ xmluiConfig: { compileBindings: false } } as any),
    ).not.toHaveProperty("compileBindings");
  });

  it("carries compileBindings when enabled in xmluiConfig", () => {
    expect(
      createBindingEvalOptions({ xmluiConfig: { compileBindings: true } } as any),
    ).toMatchObject({ compileBindings: true });
  });

  it("lets explicit eval option overrides win over xmluiConfig", () => {
    expect(
      createBindingEvalOptions(
        { xmluiConfig: { compileBindings: true } } as any,
        { compileBindings: false, strictUdcSandbox: true },
      ),
    ).toMatchObject({ compileBindings: false, strictUdcSandbox: true });
  });

  it("does not change binding evaluation while the compiler target is absent", () => {
    const appContext = { xmluiConfig: { compileBindings: true } } as any;

    expect(extractParam({ count: 2 }, "{count + 1}", appContext)).toBe(3);
    expect(extractParam({ count: 2 }, "{count + 1}")).toBe(3);
  });
});

describe("event eval options", () => {
  it("leaves compileEventHandlers disabled by default", () => {
    expect(createEventEvalOptions()).not.toHaveProperty("compileEventHandlers");
    expect(createEventEvalOptions({ xmluiConfig: {} } as any)).not.toHaveProperty(
      "compileEventHandlers",
    );
    expect(
      createEventEvalOptions({ xmluiConfig: { compileEventHandlers: false } } as any),
    ).not.toHaveProperty("compileEventHandlers");
  });

  it("carries compileEventHandlers when enabled in xmluiConfig", () => {
    expect(
      createEventEvalOptions({ xmluiConfig: { compileEventHandlers: true } } as any),
    ).toMatchObject({ compileEventHandlers: true });
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
      createEventEvalOptions(
        { xmluiConfig: { compileEventHandlers: true } } as any,
        { compileEventHandlers: false, strictUdcSandbox: true },
      ),
    ).toMatchObject({ compileEventHandlers: false, strictUdcSandbox: true });
  });

  it("does not change async statement evaluation while the compiler target is absent", async () => {
    const parser = new Parser("count = count + 1;");
    const statements = parser.parseStatements();
    const evalContext = {
      localContext: { count: 2 },
      appContext: { xmluiConfig: { compileEventHandlers: true } },
      options: createEventEvalOptions({
        xmluiConfig: { compileEventHandlers: true },
      } as any),
    };

    await processStatementQueueAsync(statements, evalContext as any);

    expect(evalContext.localContext.count).toBe(3);
  });
});

import { describe, expect, it } from "vitest";

import { createBindingEvalOptions } from "../../../src/components-core/script-runner/eval-options";
import { extractParam } from "../../../src/components-core/utils/extractParam";

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

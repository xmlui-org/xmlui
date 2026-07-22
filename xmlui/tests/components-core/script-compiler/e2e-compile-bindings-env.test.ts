import { describe, expect, it } from "vitest";

import {
  applyE2eCompileBindingsConfig,
  isE2eCompileBindingsEnabled,
} from "../../../src/testing/compile-bindings-env";

describe("E2E compileBindings environment helper", () => {
  it.each(["1", "true", "TRUE", "yes", "on"])("enables compiled bindings for %s", (value) => {
    expect(isE2eCompileBindingsEnabled({ XMLUI_COMPILE_BINDINGS: value })).toBe(true);
  });

  it.each([undefined, "", "0", "false", "no", "off"])(
    "leaves compiled bindings disabled for %s",
    (value) => {
      expect(isE2eCompileBindingsEnabled({ XMLUI_COMPILE_BINDINGS: value })).toBe(false);
    },
  );

  it("merges compileBindings into xmluiConfig when the env flag is enabled", () => {
    expect(
      applyE2eCompileBindingsConfig(
        { name: "test", xmluiConfig: { strictDomSandbox: true } },
        { XMLUI_COMPILE_BINDINGS: "true" },
      ),
    ).toEqual({
      name: "test",
      xmluiConfig: {
        compileBindings: true,
        strictDomSandbox: true,
      },
    });
  });

  it("lets an individual testbed explicitly override compileBindings", () => {
    expect(
      applyE2eCompileBindingsConfig(
        { xmluiConfig: { compileBindings: false } },
        { XMLUI_COMPILE_BINDINGS: "true" },
      ),
    ).toEqual({
      xmluiConfig: { compileBindings: false },
    });
  });

  it("returns the original description when the env flag is disabled", () => {
    const description = { xmluiConfig: { strictDomSandbox: true } };

    expect(applyE2eCompileBindingsConfig(description, {})).toBe(description);
  });
});


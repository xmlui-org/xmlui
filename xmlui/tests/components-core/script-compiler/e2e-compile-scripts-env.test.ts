import { describe, expect, it } from "vitest";

import {
  applyE2eCompileScriptsConfig,
  isE2eCompileScriptsEnabled,
} from "../../../src/testing/compile-scripts-env";
import {
  applyE2eCompileBindingsConfig,
  isE2eCompileBindingsEnabled,
} from "../../../src/testing/compile-bindings-env";
import {
  applyE2eCompileEventHandlersConfig,
  isE2eCompileEventHandlersEnabled,
} from "../../../src/testing/compile-event-handlers-env";

describe("E2E compileScripts environment helper", () => {
  it.each(["1", "true", "TRUE", "yes", "on"])("enables compiled scripts for %s", (value) => {
    expect(isE2eCompileScriptsEnabled({ XMLUI_COMPILE_SCRIPTS: value })).toBe(true);
  });

  it.each([undefined, "", "0", "false", "no", "off"])(
    "leaves compiled scripts disabled for %s",
    (value) => {
      expect(isE2eCompileScriptsEnabled({ XMLUI_COMPILE_SCRIPTS: value })).toBe(false);
    },
  );

  it("accepts the legacy compiled bindings env flag as an alias", () => {
    expect(isE2eCompileScriptsEnabled({ XMLUI_COMPILE_BINDINGS: "true" })).toBe(true);
    expect(isE2eCompileBindingsEnabled({ XMLUI_COMPILE_SCRIPTS: "true" })).toBe(true);
  });

  it("accepts the legacy compiled event handlers env flag as an alias", () => {
    expect(isE2eCompileScriptsEnabled({ XMLUI_COMPILE_EVENT_HANDLERS: "true" })).toBe(true);
    expect(isE2eCompileEventHandlersEnabled({ XMLUI_COMPILE_SCRIPTS: "true" })).toBe(true);
  });

  it("merges compileScripts into xmluiConfig when the env flag is enabled", () => {
    expect(
      applyE2eCompileScriptsConfig(
        { name: "test", xmluiConfig: { strictDomSandbox: true } },
        { XMLUI_COMPILE_SCRIPTS: "true" },
      ),
    ).toEqual({
      name: "test",
      xmluiConfig: {
        compileScripts: true,
        strictDomSandbox: true,
      },
    });
  });

  it("lets an individual testbed explicitly override compileScripts", () => {
    expect(
      applyE2eCompileScriptsConfig(
        { xmluiConfig: { compileScripts: false } },
        { XMLUI_COMPILE_SCRIPTS: "true" },
      ),
    ).toEqual({
      xmluiConfig: { compileScripts: false },
    });
  });

  it("keeps legacy apply helpers compatible", () => {
    expect(
      applyE2eCompileBindingsConfig({}, { XMLUI_COMPILE_BINDINGS: "true" }),
    ).toEqual({
      xmluiConfig: { compileScripts: true },
    });
    expect(
      applyE2eCompileEventHandlersConfig({}, { XMLUI_COMPILE_EVENT_HANDLERS: "true" }),
    ).toEqual({
      xmluiConfig: { compileScripts: true },
    });
  });

  it("returns the original description when the env flag is disabled", () => {
    const description = { xmluiConfig: { strictDomSandbox: true } };

    expect(applyE2eCompileScriptsConfig(description, {})).toBe(description);
  });
});

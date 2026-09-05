import { describe, expect, it } from "vitest";

import {
  applyE2eCompileScriptsConfig,
  isE2eCompileScriptsEnabled,
} from "../../../src/testing/compile-scripts-env";

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

  it("ignores the removed per-path env flags", () => {
    expect(isE2eCompileScriptsEnabled({ XMLUI_COMPILE_BINDINGS: "true" })).toBe(false);
    expect(isE2eCompileScriptsEnabled({ XMLUI_COMPILE_EVENT_HANDLERS: "true" })).toBe(false);
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

  it("returns the original description when the env flag is disabled", () => {
    const description = { xmluiConfig: { strictDomSandbox: true } };

    expect(applyE2eCompileScriptsConfig(description, {})).toBe(description);
  });
});

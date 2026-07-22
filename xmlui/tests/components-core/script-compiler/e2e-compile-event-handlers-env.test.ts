import { describe, expect, it } from "vitest";

import {
  applyE2eCompileEventHandlersConfig,
  isE2eCompileEventHandlersEnabled,
} from "../../../src/testing/compile-event-handlers-env";

describe("E2E compileEventHandlers environment helper", () => {
  it.each(["1", "true", "TRUE", "yes", "on"])(
    "enables compiled event handlers for %s",
    (value) => {
      expect(isE2eCompileEventHandlersEnabled({ XMLUI_COMPILE_EVENT_HANDLERS: value })).toBe(true);
    },
  );

  it.each([undefined, "", "0", "false", "no", "off"])(
    "leaves compiled event handlers disabled for %s",
    (value) => {
      expect(isE2eCompileEventHandlersEnabled({ XMLUI_COMPILE_EVENT_HANDLERS: value })).toBe(
        false,
      );
    },
  );

  it("merges compileEventHandlers into xmluiConfig when the env flag is enabled", () => {
    expect(
      applyE2eCompileEventHandlersConfig(
        { name: "test", xmluiConfig: { strictDomSandbox: true } },
        { XMLUI_COMPILE_EVENT_HANDLERS: "true" },
      ),
    ).toEqual({
      name: "test",
      xmluiConfig: {
        compileEventHandlers: true,
        strictDomSandbox: true,
      },
    });
  });

  it("lets an individual testbed explicitly override compileEventHandlers", () => {
    expect(
      applyE2eCompileEventHandlersConfig(
        { xmluiConfig: { compileEventHandlers: false } },
        { XMLUI_COMPILE_EVENT_HANDLERS: "true" },
      ),
    ).toEqual({
      xmluiConfig: { compileEventHandlers: false },
    });
  });

  it("returns the original description when the env flag is disabled", () => {
    const description = { xmluiConfig: { strictDomSandbox: true } };

    expect(applyE2eCompileEventHandlersConfig(description, {})).toBe(description);
  });
});

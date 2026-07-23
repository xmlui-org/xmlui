import { describe, expect, it } from "vitest";
import { normalizeXmluiPluginOptions } from "../../src/nodejs/bin/xmluiPluginOptions";

describe("XMLUI plugin options", () => {
  it("reads compiled event handler options from xmluiConfig", () => {
    expect(
      normalizeXmluiPluginOptions({
        xmluiConfig: {
          compileEventHandlers: true,
          logCompiledEventHandlerSource: true,
        },
      }),
    ).toMatchObject({
      compileEventHandlers: true,
      logCompiledEventHandlerSource: true,
    });
  });

  it("lets top-level compiled event handler options override xmluiConfig", () => {
    expect(
      normalizeXmluiPluginOptions({
        compileEventHandlers: false,
        logCompiledEventHandlerSource: false,
        xmluiConfig: {
          compileEventHandlers: true,
          logCompiledEventHandlerSource: true,
        },
      }),
    ).toMatchObject({
      compileEventHandlers: false,
      logCompiledEventHandlerSource: false,
    });
  });
});

import { describe, expect, it } from "vitest";
import { normalizeXmluiPluginOptions } from "../../src/nodejs/bin/xmluiPluginOptions";

describe("XMLUI plugin options", () => {
  it("reads common compiled script options from xmluiConfig", () => {
    expect(
      normalizeXmluiPluginOptions({
        xmluiConfig: {
          compileScripts: true,
          logCompiledEventHandlerSource: true,
        },
      }),
    ).toMatchObject({
      compileScripts: true,
      compileEventHandlers: true,
      logCompiledEventHandlerSource: true,
    });
  });

  it("reads compiled event handler options from xmluiConfig", () => {
    expect(
      normalizeXmluiPluginOptions({
        xmluiConfig: {
          compileEventHandlers: true,
          compiledScriptSourceMaps: "external",
          logCompiledEventHandlerSource: true,
        },
      }),
    ).toMatchObject({
      compileEventHandlers: true,
      compiledScriptSourceMaps: "external",
      logCompiledEventHandlerSource: true,
    });
  });

  it("lets top-level compiled event handler options override xmluiConfig", () => {
    expect(
      normalizeXmluiPluginOptions({
        compileEventHandlers: false,
        compiledScriptSourceMaps: "inline",
        logCompiledEventHandlerSource: false,
        xmluiConfig: {
          compileEventHandlers: true,
          compiledScriptSourceMaps: "external",
          logCompiledEventHandlerSource: true,
        },
      }),
    ).toMatchObject({
      compileEventHandlers: false,
      compiledScriptSourceMaps: "inline",
      logCompiledEventHandlerSource: false,
    });
  });

  it("enables external compiled script source maps by default for dev server compiled events", () => {
    expect(
      normalizeXmluiPluginOptions(
        {
          xmluiConfig: {
            compileEventHandlers: true,
          },
        },
        { devServer: true },
      ),
    ).toMatchObject({
      compileEventHandlers: true,
      compiledScriptSourceMaps: "external",
    });
  });

  it("enables external compiled script source maps by default for dev server compiled scripts", () => {
    expect(
      normalizeXmluiPluginOptions(
        {
          xmluiConfig: {
            compileScripts: true,
          },
        },
        { devServer: true },
      ),
    ).toMatchObject({
      compileScripts: true,
      compileEventHandlers: true,
      compiledScriptSourceMaps: "external",
    });
  });

  it("enables external compiled script source maps by default for dev server compiled bindings", () => {
    expect(
      normalizeXmluiPluginOptions(
        {
          xmluiConfig: {
            compileBindings: true,
          },
        },
        { devServer: true },
      ),
    ).toMatchObject({
      compileBindings: true,
      compiledScriptSourceMaps: "external",
    });
  });

  it("keeps compiled script source maps opt-in outside the dev server", () => {
    expect(
      normalizeXmluiPluginOptions({
        xmluiConfig: {
          compileEventHandlers: true,
        },
      }).compiledScriptSourceMaps,
    ).toBeUndefined();
  });

  it("lets config explicitly disable the dev server source map default", () => {
    expect(
      normalizeXmluiPluginOptions(
        {
          xmluiConfig: {
            compileEventHandlers: true,
            compiledScriptSourceMaps: false,
          },
        },
        { devServer: true },
      ),
    ).toMatchObject({
      compileEventHandlers: true,
      compiledScriptSourceMaps: false,
    });
  });
});

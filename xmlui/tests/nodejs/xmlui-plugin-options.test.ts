import { afterEach, describe, expect, it } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  loadXmluiPluginOptions,
  mergeXmluiConfigSources,
  normalizeXmluiPluginOptions,
} from "../../src/nodejs/bin/xmluiPluginOptions";

// --- Fixture projects live inside the repo: the dynamic import that reads an
// --- app description module must be resolvable by the test runner as well.
const FIXTURE_ROOT = join(__dirname, "__fixtures__");
const createdProjects: string[] = [];

afterEach(async () => {
  await Promise.all(
    createdProjects.splice(0).map((project) => rm(project, { recursive: true, force: true })),
  );
});

async function createProject(files: Record<string, string>) {
  await mkdir(FIXTURE_ROOT, { recursive: true });
  const root = await mkdtemp(join(FIXTURE_ROOT, "project-"));
  createdProjects.push(root);
  for (const [name, content] of Object.entries(files)) {
    const file = join(root, ...name.split("/"));
    await mkdir(join(file, ".."), { recursive: true });
    await writeFile(file, content, "utf-8");
  }
  return root;
}

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

describe("XMLUI plugin options from the app description", () => {
  it("reads compiled script options from appGlobals", () => {
    expect(
      normalizeXmluiPluginOptions({
        appGlobals: {
          compileScripts: true,
          logCompiledEventHandlerSource: true,
        },
      }),
    ).toMatchObject({
      compileScripts: true,
      compileBindings: true,
      compileEventHandlers: true,
      logCompiledEventHandlerSource: true,
    });
  });

  it("lets xmluiConfig override appGlobals", () => {
    expect(
      normalizeXmluiPluginOptions({
        appGlobals: { compileScripts: true },
        xmluiConfig: { compileEventHandlers: false },
      }),
    ).toMatchObject({
      compileScripts: true,
      compileEventHandlers: false,
    });
  });

  it("lets top-level options override appGlobals", () => {
    expect(
      normalizeXmluiPluginOptions({
        compileScripts: false,
        appGlobals: { compileScripts: true },
      }),
    ).toMatchObject({
      compileScripts: false,
      compileEventHandlers: false,
    });
  });

  it("enables external dev server source maps for appGlobals compiled scripts", () => {
    expect(
      normalizeXmluiPluginOptions(
        { appGlobals: { compileScripts: true } },
        { devServer: true },
      ),
    ).toMatchObject({
      compileEventHandlers: true,
      compiledScriptSourceMaps: "external",
    });
  });

  it("merges the app description under xmlui.config.json", () => {
    expect(
      mergeXmluiConfigSources(
        { appGlobals: { compileScripts: true }, xmluiConfig: { compileEventHandlers: true } },
        { analyze: "off", xmluiConfig: { compileEventHandlers: false } },
      ),
    ).toEqual({
      analyze: "off",
      appGlobals: { compileScripts: true },
      xmluiConfig: { compileEventHandlers: false },
    });
  });
});

describe("Loading XMLUI plugin options from project files", () => {
  it("enables script compilation from appGlobals in config.json", async () => {
    const cwd = await createProject({
      "config.json": JSON.stringify({ name: "app", appGlobals: { compileScripts: true } }),
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({
      compileScripts: true,
      compileEventHandlers: true,
    });
  });

  it("enables script compilation from xmluiConfig in an app description module", async () => {
    const cwd = await createProject({
      "src/config.mjs": "export default { xmluiConfig: { compileScripts: true } };\n",
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({
      compileScripts: true,
      compileEventHandlers: true,
    });
  });

  it("lets xmlui.config.json override the app description", async () => {
    const cwd = await createProject({
      "xmlui.config.json": JSON.stringify({ compileScripts: false }),
      "src/config.json": JSON.stringify({ appGlobals: { compileScripts: true } }),
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({
      compileScripts: false,
      compileEventHandlers: false,
    });
  });

  it("keeps script compilation off when no project file asks for it", async () => {
    const cwd = await createProject({
      "src/config.json": JSON.stringify({ name: "app" }),
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({
      compileScripts: undefined,
      compileEventHandlers: undefined,
    });
  });

  it("survives an app description that cannot be loaded", async () => {
    const cwd = await createProject({
      "xmlui.config.json": JSON.stringify({ compileScripts: true }),
      "src/config.js": "import './missing-module.scss';\nexport default {};\n",
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({
      compileScripts: true,
      compileEventHandlers: true,
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  loadXmluiPluginOptions,
  mergeXmluiConfigSources,
  normalizeXmluiPluginOptions,
  resetRemovedCompilationKeyNotices,
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
  it("reads both compilation switches from xmluiConfig", () => {
    expect(
      normalizeXmluiPluginOptions({
        xmluiConfig: { compileScripts: true, reportCompileFallbacks: true },
      }),
    ).toMatchObject({ compileScripts: true, reportCompileFallbacks: true });
  });

  it("reads both compilation switches from appGlobals", () => {
    expect(
      normalizeXmluiPluginOptions({
        appGlobals: { compileScripts: true, reportCompileFallbacks: true },
      }),
    ).toMatchObject({ compileScripts: true, reportCompileFallbacks: true });
  });

  it("lets xmluiConfig override appGlobals", () => {
    expect(
      normalizeXmluiPluginOptions({
        appGlobals: { compileScripts: true },
        xmluiConfig: { compileScripts: false },
      }),
    ).toMatchObject({ compileScripts: false });
  });

  it("lets a top-level key override both", () => {
    expect(
      normalizeXmluiPluginOptions({
        compileScripts: false,
        xmluiConfig: { compileScripts: true },
        appGlobals: { compileScripts: true },
      }),
    ).toMatchObject({ compileScripts: false });
  });

  it("keeps compilation off unless asked", () => {
    expect(normalizeXmluiPluginOptions({})).toMatchObject({
      compileScripts: false,
      reportCompileFallbacks: false,
    });
  });

  it("turns source maps on for the dev server only", () => {
    expect(
      normalizeXmluiPluginOptions({ xmluiConfig: { compileScripts: true } }, { devServer: true }),
    ).toMatchObject({ compileScripts: true, sourceMaps: "external" });

    expect(
      normalizeXmluiPluginOptions({ xmluiConfig: { compileScripts: true } }),
    ).not.toHaveProperty("sourceMaps");
  });

  it("does not emit source maps for a dev server that is not compiling", () => {
    expect(normalizeXmluiPluginOptions({}, { devServer: true })).not.toHaveProperty("sourceMaps");
  });

  it("names the replacement for a removed key instead of ignoring it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      resetRemovedCompilationKeyNotices();
      normalizeXmluiPluginOptions({
        appGlobals: { compileEventHandlers: true, compiledScriptSourceMaps: "external" },
      });

      const notices = warn.mock.calls.map((call) => String(call[0]));
      expect(notices.some((notice) => notice.includes('"compileEventHandlers"'))).toBe(true);
      expect(notices.some((notice) => notice.includes('"compileScripts"'))).toBe(true);
      expect(notices.some((notice) => notice.includes('"compiledScriptSourceMaps"'))).toBe(true);
    } finally {
      warn.mockRestore();
    }
  });

  it("does not let a removed key turn compilation on", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      resetRemovedCompilationKeyNotices();
      expect(
        normalizeXmluiPluginOptions({ xmluiConfig: { compileEventHandlers: true } }),
      ).toMatchObject({ compileScripts: false });
    } finally {
      warn.mockRestore();
    }
  });

  it("merges the app description under xmlui.config.json", () => {
    expect(
      mergeXmluiConfigSources(
        { appGlobals: { compileScripts: true }, xmluiConfig: { reportCompileFallbacks: true } },
        { analyze: "off", xmluiConfig: { reportCompileFallbacks: false } },
      ),
    ).toEqual({
      analyze: "off",
      appGlobals: { compileScripts: true },
      xmluiConfig: { reportCompileFallbacks: false },
    });
  });
});

describe("Loading XMLUI plugin options from project files", () => {
  it("enables script compilation from appGlobals in config.json", async () => {
    const cwd = await createProject({
      "config.json": JSON.stringify({ name: "app", appGlobals: { compileScripts: true } }),
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({ compileScripts: true });
  });

  it("enables script compilation from xmluiConfig in an app description module", async () => {
    const cwd = await createProject({
      "src/config.mjs": "export default { xmluiConfig: { compileScripts: true } };\n",
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({ compileScripts: true });
  });

  it("lets xmlui.config.json override the app description", async () => {
    const cwd = await createProject({
      "xmlui.config.json": JSON.stringify({ compileScripts: false }),
      "src/config.json": JSON.stringify({ appGlobals: { compileScripts: true } }),
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({ compileScripts: false });
  });

  it("keeps script compilation off when no project file asks for it", async () => {
    const cwd = await createProject({
      "src/config.json": JSON.stringify({ name: "app" }),
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({
      compileScripts: false,
      reportCompileFallbacks: false,
    });
  });

  it("reads an app description that only Vite can evaluate", async () => {
    // --- `import.meta.glob` is a Vite transform, so a plain Node import of this file
    // --- throws `import_meta.glob is not a function`. This is the shape the
    // --- `getLocalIcons()` pattern in our own app templates produces.
    const cwd = await createProject({
      "icons/star.svg": "<svg></svg>",
      "src/config.ts": [
        "function getLocalIcons() {",
        "  return import.meta.glob('/icons/**/*.svg', { import: 'default', eager: true, query: '?raw' });",
        "}",
        "const App = { name: 'app', icons: getLocalIcons(), appGlobals: { compileScripts: true } };",
        "export default App;",
        "",
      ].join("\n"),
    });

    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({ compileScripts: true });
  }, 30000);

  it("skips the Vite retry when xmlui.config.json already answers", async () => {
    // --- The description needs Vite to evaluate, but `xmlui.config.json` settles the
    // --- only key it mentions, so re-reading it could not change the outcome.
    const cwd = await createProject({
      "xmlui.config.json": JSON.stringify({ compileScripts: false }),
      "src/config.ts": [
        "const App = { appGlobals: { compileScripts: true, icons: import.meta.glob('/icons/*') } };",
        "export default App;",
        "",
      ].join("\n"),
    });

    const startedAt = Date.now();
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({ compileScripts: false });
    // --- A Vite module-runner import takes hundreds of milliseconds; skipping it is
    // --- the point of this case.
    expect(Date.now() - startedAt).toBeLessThan(250);
  });

  it("survives an app description that cannot be loaded", async () => {
    const cwd = await createProject({
      "xmlui.config.json": JSON.stringify({ compileScripts: true }),
      "src/config.js": "import './missing-module.scss';\nexport default {};\n",
    });
    expect(await loadXmluiPluginOptions({ cwd })).toMatchObject({ compileScripts: true });
  });
});

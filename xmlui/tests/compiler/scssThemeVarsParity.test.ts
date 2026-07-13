import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import * as sass from "sass";
import { describe, expect, test } from "vitest";

import { parseScssVar } from "../../src/components-core/theming/themeVars";

const oldComponentRoot = "/Users/dotneteer/source/xmlui/xmlui/src/components";
const oldPackageRoot = "/Users/dotneteer/source/xmlui/packages";
const oldThemingRoot = "/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming";
const rewriteComponentRoot = path.resolve("src/components");
const rewritePackageRoot = path.resolve("../packages");
const rewriteThemingRoot = path.resolve("src/components-core/theming");

const representativeModules = [
  "AppHeader/AppHeader.module.scss",
  "Badge/Badge.module.scss",
  "Icon/Icon.module.scss",
  "NavPanel/NavPanel.module.scss",
  "Splitter/Splitter.module.scss",
  "Table/Table.module.scss",
  "Text/Text.module.scss",
] as const;

const rewriteOnlyComponentModules = [
  "Checkbox/Checkbox.module.scss",
  "FileInput/FileInput.compat.module.scss",
  "FocusScope/FocusScope.module.scss",
  "FormSegment/FormSegment.module.scss",
  "StepperForm/StepperForm.module.scss",
  "Switch/Switch.module.scss",
  "TextArea/TextArea.compat.module.scss",
  "TimeInput/TimeInputCompat.module.scss",
] as const;

const oldOnlyComponentModules: string[] = [];
const rewriteOnlyPackageModules: string[] = [];
const oldOnlyPackageModules: string[] = [];

describe("SCSS theme variable collection parity", () => {
  const hasOldSource = existsSync(oldComponentRoot);
  const runWhenOldSourceExists = hasOldSource ? test : test.skip;

  runWhenOldSourceExists("matches old exported themeVars for representative modules", () => {
    for (const modulePath of representativeModules) {
      const oldVars = compileModuleThemeVars(path.join(oldComponentRoot, modulePath));
      const rewriteVars = compileModuleThemeVars(path.join(rewriteComponentRoot, modulePath));

      expect(rewriteVars, modulePath).toEqual(oldVars);
      expect(Object.values(rewriteVars), modulePath).not.toContainEqual(
        expect.stringContaining("var(var(--xmlui-"),
      );
    }
  });

  runWhenOldSourceExists("matches old core themeVars module exports", () => {
    const oldExports = compileModuleExports(path.join(oldThemingRoot, "themeVars.module.scss"));
    const rewriteExports = compileModuleExports(path.join(rewriteThemingRoot, "themeVars.module.scss"));

    expect(rewriteExports).toEqual(oldExports);
  });

  runWhenOldSourceExists("keeps component SCSS module inventory differences documented", () => {
    const oldModules = listScssModules(oldComponentRoot);
    const rewriteModules = listScssModules(rewriteComponentRoot);

    expect(difference(rewriteModules, oldModules)).toEqual([...rewriteOnlyComponentModules].sort());
    expect(difference(oldModules, rewriteModules)).toEqual([...oldOnlyComponentModules].sort());
    expectThemeExportPresenceParity(oldModules, oldComponentRoot, rewriteComponentRoot);
  });

  runWhenOldSourceExists("keeps package SCSS module inventory differences documented", () => {
    const oldModules = listScssModules(oldPackageRoot);
    const rewriteModules = listScssModules(rewritePackageRoot);

    expect(difference(rewriteModules, oldModules)).toEqual([...rewriteOnlyPackageModules].sort());
    expect(difference(oldModules, rewriteModules)).toEqual([...oldOnlyPackageModules].sort());
    expectThemeExportPresenceParity(oldModules, oldPackageRoot, rewritePackageRoot);
  });
});

function compileModuleThemeVars(filePath: string): Record<string, string> {
  const result = compileScssModule(filePath);
  const themeVars = readCssExport(result.css, "themeVars");
  const parsed = parseScssVar(themeVars);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  return parsed as Record<string, string>;
}

function compileModuleExports(filePath: string): Record<string, string> {
  const result = compileScssModule(filePath);
  return {
    keyPrefix: readCssExport(result.css, "keyPrefix"),
    themeVars: readCssExport(result.css, "themeVars"),
  };
}

function compileScssModule(filePath: string): sass.CompileResult {
  const source = readFileSync(filePath, "utf8").replace(
    /components-core\/theming\/themes(?=["'])/g,
    "components-core/theming/_themes.scss",
  );
  const result = sass.compileString(source, {
    url: pathToFileURL(filePath),
    style: "expanded",
    logger: {
      warn() {},
      debug() {},
    },
  });
  return result;
}

function readCssExport(css: string, name: string): string {
  if (!/:export\s*\{/.test(css)) {
    throw new Error("SCSS module did not emit a :export block.");
  }
  const exportValue = css.match(
    new RegExp(`${name}:\\s*(?<value>'(?:\\\\.|[^'])*'|"(?:\\\\.|[^"])*"|[^;]+);`),
  )?.groups?.value;
  if (!exportValue) {
    throw new Error(`SCSS module did not export ${name}.`);
  }
  return exportValue.trim();
}

function listScssModules(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }
  const files: string[] = [];
  collectScssModules(root, root, files);
  return files.sort();
}

function collectScssModules(root: string, current: string, files: string[]) {
  for (const entry of readdirSync(current)) {
    const fullPath = path.join(current, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectScssModules(root, fullPath, files);
      continue;
    }
    if (entry.endsWith(".module.scss")) {
      files.push(path.relative(root, fullPath));
    }
  }
}

function difference(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((entry) => !rightSet.has(entry)).sort();
}

function expectThemeExportPresenceParity(
  oldModules: string[],
  oldRoot: string,
  rewriteRoot: string,
) {
  for (const modulePath of oldModules) {
    const oldPath = path.join(oldRoot, modulePath);
    const rewritePath = path.join(rewriteRoot, modulePath);
    if (!existsSync(rewritePath)) {
      continue;
    }
    expect(hasThemeVarsExport(rewritePath), modulePath).toBe(hasThemeVarsExport(oldPath));
  }
}

function hasThemeVarsExport(filePath: string): boolean {
  return /:export\s*\{[^}]*\bthemeVars\s*:/s.test(readFileSync(filePath, "utf8"));
}

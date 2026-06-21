import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { compileXmluiModule } from "../../src/compiler/compileXmluiModule";

describe("compileXmluiModule", () => {
  it("compiles through the new parser pipeline and keeps source IDs stable", () => {
    const dir = path.join(tmpdir(), `xmlui-rs-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "IncrementButton.xmlui"), `<Component name="IncrementButton" />`);
    const id = path.join(dir, "Main.xmlui");

    const code = compileXmluiModule({
      id,
      source: `<App global.count="{0}"><Button onClick="count++">Count: {count}</Button></App>`,
    });

    expect(code).toContain(`import component0 from "./IncrementButton.xmlui";`);
    expect(code).toContain('"kind": "app"');
    expect(code).toContain('"sourceId": ' + JSON.stringify(id));
    expect(code).toContain('"source": "count++"');
    expect(code).toContain('const __xmluiCreateYieldState');
    expect(code).toContain('const __xmluiYieldIfNeeded');
    expect(code).toContain('"compiledSource": "const __xmluiYieldState = __xmluiCreateYieldState');
    expect(code).toContain('__xmluiResult = ctx.writeGlobal');
    expect(code).toContain('"evaluate": (ctx) => {');
    expect(code).toContain('"execute": async (ctx) => {');
    expect(code).toContain('"invalidates"');
  });

  it("uses private yield helper code for dedicatedYield handlers", () => {
    const code = compileXmluiModule({
      id: "/tmp/Main.xmlui",
      source: `<App var.count="{0}"><Button onClick='"dedicatedYield"; count++'>Count: {count}</Button></App>`,
    });

    expect(code).not.toContain('const __xmluiCreateYieldState');
    expect(code).toContain('"dedicatedYield"');
    expect(code).toContain('"compiledSource": "const __xmluiNow');
    expect(code).toContain('await __xmluiYieldIfNeeded();');
    expect(code).toContain('__xmluiResult = ctx.writeLocal');
  });

  it("emits the shared yield helper when any handler uses default async yield", () => {
    const code = compileXmluiModule({
      id: "/tmp/Main.xmlui",
      source: `
        <App var.count="{0}">
          <Button onClick='"dedicatedYield"; count++' />
          <Button onClick="count++" />
        </App>
      `,
    });

    expect(code).toContain('const __xmluiCreateYieldState');
    expect(code).toContain('"compiledSource": "const __xmluiYieldState = __xmluiCreateYieldState');
    expect(code).toContain('"compiledSource": "const __xmluiNow');
  });

  it("shares one yield helper across multiple default async handlers", () => {
    const code = compileXmluiModule({
      id: "/tmp/Main.xmlui",
      source: `
        <App var.count="{0}">
          <Button onClick="count++" />
          <Button onClick="count += 2" />
        </App>
      `,
    });

    expect(code.match(/const __xmluiCreateYieldState/g)).toHaveLength(1);
    expect(code.match(/const __xmluiYieldIfNeeded = async/g)).toHaveLength(1);
    expect(code.match(/"compiledSource": "const __xmluiYieldState = __xmluiCreateYieldState/g)).toHaveLength(2);
    expect(code).not.toContain('"compiledSource": "const __xmluiNow');
  });

  it("surfaces parser diagnostics during compilation", () => {
    expect(() =>
      compileXmluiModule({
        id: "/tmp/Main.xmlui",
        source: `<App><Button label /></App>`,
      }),
    ).toThrow("Expected '=' after attribute name.");
  });

  it("surfaces semantic diagnostics during compilation", () => {
    expect(() =>
      compileXmluiModule({
        id: "/tmp/Main.xmlui",
        source: `<App><Button>{missing}</Button></App>`,
      }),
    ).toThrow("Unresolved XMLUI script identifier 'missing'.");
  });

  it("surfaces IR diagnostics during compilation", () => {
    const dir = path.join(tmpdir(), `xmlui-rs-${Date.now()}-ir`);
    mkdirSync(dir, { recursive: true });

    expect(() =>
      compileXmluiModule({
        id: path.join(dir, "Main.xmlui"),
        source: `<App><MissingPanel /></App>`,
      }),
    ).toThrow("Unknown XMLUI component reference 'MissingPanel'.");
  });
});

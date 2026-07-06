import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  compileXmluiModule,
  compileXmluiModuleWithSourceMap,
} from "../../src/compiler/compileXmluiModule";

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
    expect(code).toContain('"evaluate": function expr_');
    expect(code).toContain('"execute": async function event_');
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

  it("returns a source map with original xmlui source content", () => {
    const id = "/tmp/Main.xmlui";
    const source = `<App var.count="{0}"><Button onClick="count++">Count: {count}</Button></App>`;

    const compiled = compileXmluiModuleWithSourceMap({
      id,
      source,
    });

    expect(compiled.code).toContain('"kind": "app"');
    expect(compiled.map).toEqual({
      version: 3,
      file: "Main.xmlui?xmlui-module",
      sources: [`xmlui-source://${id}`],
      sourcesContent: [source],
      names: [],
      mappings: expect.any(String),
    });
    expect(compiled.map.mappings).not.toBe("");
    expect(compiled.map.mappings.split(";").length).toBeGreaterThan(1);
  });

  it("maps generated event, expression, and text binding functions to xmlui source spans", () => {
    const id = "/tmp/Main.xmlui";
    const source = `<App var.count="{0}" var.label="{'Count'}"><Button onClick="let next = count + 1; count = next">{label}: {count}</Button></App>`;

    const compiled = compileXmluiModuleWithSourceMap({
      id,
      source,
    });

    expect(compiled.code).toContain(`let next = (ctx.readLocal("count") + 1);`);
    expect(compiled.code).toContain(`ctx.writeLocal("count", next)`);
    expect(compiled.code).toContain(`return ctx.readLocal("label");`);
    expect(compiled.code).toContain(`return ctx.readLocal("count");`);
    expect(compiled.map.sources).toEqual([`xmlui-source://${id}`]);
    expect(compiled.map.sourcesContent).toEqual([source]);
    expect(compiled.map.mappings).not.toMatch(/^AAAA(?:;AAAA)+$/);
  });

  it("maps event handlers to the attribute value column", () => {
    const id = "/tmp/IncrementButton.xmlui";
    const source = [
      `<Component name="IncrementButton">`,
      `  <Button onClick="count++">`,
      `    {$props.label || 'Click to increment (Global)'}: {count}`,
      `  </Button>`,
      `</Component>`,
    ].join("\n");

    const compiled = compileXmluiModuleWithSourceMap({
      id,
      source,
    });
    const decoded = decodeSourceMapMappings(compiled.map.mappings);
    const countOffset = source.indexOf("count++");
    const countPosition = positionAt(source, countOffset);

    expect(decoded).toContainEqual(
      expect.objectContaining({
        sourceLine: countPosition.line,
        sourceColumn: countPosition.column,
      }),
    );
  });

  it("accepts implicit boolean attributes during compilation", () => {
    expect(() =>
      compileXmluiModule({
        id: "/tmp/Main.xmlui",
        source: `<App><Button label /></App>`,
      }),
    ).not.toThrow();
  });

  it("surfaces semantic diagnostics during compilation", () => {
    expect(() =>
      compileXmluiModule({
        id: "/tmp/Main.xmlui",
        source: `<App><Button>{missing}</Button></App>`,
      }),
    ).toThrow("Unresolved XMLUI script identifier 'missing'.");
  });

  it("accepts AppContextObject global functions in event handlers", () => {
    const code = compileXmluiModule({
      id: "/tmp/Main.xmlui",
      source: `<App><Button label="Click me!" onClick="toast('Button clicked')" /></App>`,
    });

    expect(code).toContain(`ctx.readContext?.("toast")`);
    expect(code).toContain("Button clicked");
  });

  it("compiles AppState API calls from event handlers", () => {
    const code = compileXmluiModule({
      id: "/tmp/Main.xmlui",
      source: `
        <App>
          <AppState id="appState" initialValue="{{ enhancedMode: false }}"/>
          <Checkbox
            initialValue="{appState.value.enhancedMode}"
            onDidChange="v => appState.update({ enhancedMode: v})" />
        </App>
      `,
    });

    expect(code).toContain(`"type": "AppState"`);
    expect(code).toContain(`"update"`);
    expect(code).toContain(`ctx.call`);
  });

  it("binds static component ids as references inside component files", () => {
    const code = compileXmluiModule({
      id: "/tmp/Component2.xmlui",
      source: `
        <Component name="Component2">
          <AppState id="state" />
          <Button enabled="{state.value.enhancedMode}">Set enhanced options</Button>
        </Component>
      `,
    });

    expect(code).toContain(`ctx.readReference?.("state")`);
    expect(code).not.toContain(`ctx.readGlobal("state")`);
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

function decodeSourceMapMappings(mappings: string): Array<{
  generatedLine: number;
  generatedColumn: number;
  sourceLine: number;
  sourceColumn: number;
}> {
  const decoded: Array<{
    generatedLine: number;
    generatedColumn: number;
    sourceLine: number;
    sourceColumn: number;
  }> = [];
  let previousGeneratedColumn = 0;
  let previousSourceLine = 0;
  let previousSourceColumn = 0;

  for (const [generatedLine, line] of mappings.split(";").entries()) {
    previousGeneratedColumn = 0;
    if (!line) {
      continue;
    }
    for (const segment of line.split(",")) {
      const values = decodeVlqSegment(segment);
      previousGeneratedColumn += values[0] ?? 0;
      if (values.length >= 4) {
        previousSourceLine += values[2] ?? 0;
        previousSourceColumn += values[3] ?? 0;
        decoded.push({
          generatedLine,
          generatedColumn: previousGeneratedColumn,
          sourceLine: previousSourceLine,
          sourceColumn: previousSourceColumn,
        });
      }
    }
  }
  return decoded;
}

function decodeVlqSegment(segment: string): number[] {
  const values: number[] = [];
  let value = 0;
  let shift = 0;
  for (const char of segment) {
    const digit = BASE64_CHARS.indexOf(char);
    const continuation = (digit & 32) !== 0;
    value += (digit & 31) << shift;
    if (continuation) {
      shift += 5;
      continue;
    }
    const negative = (value & 1) === 1;
    values.push((negative ? -1 : 1) * (value >> 1));
    value = 0;
    shift = 0;
  }
  return values;
}

function positionAt(source: string, offset: number): { line: number; column: number } {
  const lines = source.slice(0, offset).split("\n");
  return {
    line: lines.length - 1,
    column: lines.at(-1)?.length ?? 0,
  };
}

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

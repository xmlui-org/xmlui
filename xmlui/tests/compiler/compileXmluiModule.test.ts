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
    expect(code).toContain('"compiledSource": "ctx.writeGlobal');
    expect(code).toContain('"invalidates"');
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
});

import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  compileBindingSyncExpressionSource,
  compileEventAsyncStatements,
  createCompiledScriptArtifact,
  createCompiledScriptMapping,
  createCompiledScriptSourceMap,
  createDebugSourceUrl,
} from "../../../src/components-core/script-compiler";
import { parseParameterString } from "../../../src/components-core/script-runner/ParameterParser";

describe("compiled script source maps", () => {
  it("maps compiled binding chunks back to an absolute XMLUI source range", () => {
    const fullSource = `<Fragment>
  <Text value="{count + 1}" />
</Fragment>`;
    const expressionOffset = fullSource.indexOf("count + 1");
    const artifact = compileBindingSyncExpressionSource("count + 1", "/src/Main.xmlui#expr-0", {
      sourceUrl: createDebugSourceUrl("/src/Main.xmlui"),
      displayName: "/src/Main.xmlui",
      sources: [
        {
          id: "/src/Main.xmlui#expr-0",
          url: createDebugSourceUrl("/src/Main.xmlui"),
          displayName: "/src/Main.xmlui",
          sourceText: fullSource,
        },
      ],
      sourceOrigin: {
        offset: expressionOffset,
        sourceText: fullSource,
      },
    });

    expect(artifact.sourceRange).toMatchObject({
      start: expressionOffset,
      end: expressionOffset + "count + 1".length,
      startLine: 2,
      startColumn: 16,
      endLine: 2,
      endColumn: 25,
    });
    expect(artifact.mappings[0].sourceRange).toMatchObject({
      start: expressionOffset,
      startLine: 2,
      startColumn: 16,
    });
    expect(artifact.js).toContain("runtime.start(evalContext);\nreturn ");

    const sourceMap = createCompiledScriptSourceMap(artifact);
    expect(sourceMap).toMatchObject({
      version: 3,
      sources: ["/@xmlui-source/src/Main.xmlui"],
      sourcesContent: [fullSource],
      names: [],
    });
    expect(sourceMap.mappings.length).toBeGreaterThan(0);
  });

  it("lets parsed attribute bindings carry full-file source positions", () => {
    const fullSource = `<Text label="hello{count + 1}world" />`;
    const attributeValue = "hello{count + 1}world";
    const valueOffset = fullSource.indexOf(attributeValue);
    const result = parseParameterString(attributeValue, {
      compileBindings: true,
      sourceId: "/src/Main.xmlui:label",
      sourceUrl: createDebugSourceUrl("/src/Main.xmlui"),
      displayName: "/src/Main.xmlui",
      sourceOrigin: {
        offset: valueOffset,
        sourceText: fullSource,
      },
    });

    expect(result[1].type).toBe("expression");
    if (result[1].type === "expression") {
      expect(result[1].compiled?.sourceRange).toMatchObject({
        start: fullSource.indexOf("count + 1"),
        startLine: 1,
        startColumn: 19,
      });
      expect(result[1].compiled?.sources[0]).toMatchObject({
        url: "/@xmlui-source/src/Main.xmlui",
        sourceText: fullSource,
      });
    }
  });

  it("maps multiline event handler statements to their original XMLUI lines", () => {
    const fullSource = `<Fragment>
  <Button onClick="count = count + 1;
testState = count" />
</Fragment>`;
    const handlerSource = `count = count + 1;
testState = count`;
    const parser = new Parser(handlerSource);
    const statements = parser.parseStatements();
    const artifact = compileEventAsyncStatements(statements, {
      sourceId: "/src/Main.xmlui#event-1",
      sourceText: handlerSource,
      sourceUrl: createDebugSourceUrl("/src/Main.xmlui"),
      displayName: "/src/Main.xmlui",
      sources: [
        {
          id: "/src/Main.xmlui#event-1",
          url: createDebugSourceUrl("/src/Main.xmlui"),
          displayName: "/src/Main.xmlui",
          sourceText: fullSource,
        },
      ],
      sourceOrigin: {
        offset: fullSource.indexOf(handlerSource),
        sourceText: fullSource,
      },
    });

    expect(artifact.sourceRange).toMatchObject({
      start: fullSource.indexOf(handlerSource),
      end: fullSource.indexOf(handlerSource) + handlerSource.length,
      startLine: 2,
      startColumn: 19,
      endLine: 3,
      endColumn: 17,
    });
    expect(artifact.js).toContain("return (async () => {\n");
    expect(artifact.js).toContain("\nawait runtime.flushPendingState(evalContext);");
  });

  it("deduplicates generated source map positions", () => {
    const artifact = createCompiledScriptArtifact({
      target: "event-async",
      sourceId: "/src/Main.xmlui#event-1",
      sourceUrl: "/@xmlui-source/src/Main.xmlui",
      sourceText: "one();\ntwo();",
      js: "one();\ntwo();",
      mappings: [
        createCompiledScriptMapping(0, 5, "/src/Main.xmlui#event-1", {
          start: 0,
          end: 5,
          startLine: 1,
          startColumn: 0,
          endLine: 1,
          endColumn: 5,
        }),
        createCompiledScriptMapping(0, 5, "/src/Main.xmlui#event-1", {
          start: 7,
          end: 12,
          startLine: 2,
          startColumn: 0,
          endLine: 2,
          endColumn: 5,
        }),
      ],
    });

    expect(createCompiledScriptSourceMap(artifact).mappings).toBe("AAAA");
  });
});

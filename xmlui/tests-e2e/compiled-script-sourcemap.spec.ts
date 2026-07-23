import { expect, test } from "@playwright/test";

import {
  createCompiledScriptArtifact,
  createCompiledScriptFunctionBody,
  createCompiledScriptGeneratedSourceUrl,
  createCompiledScriptMapping,
} from "../src/components-core/script-compiler";

test("compiled script sourcemap exposes a generated script URL that can be debugged", async ({
  page,
  context,
}) => {
  const sourceId = "/src/Main.xmlui#event-debug";
  const sourceUrl = "/@xmlui-source/src/Main.xmlui";
  const originalSource = `<Fragment>
  <Button onClick="testState = 1" />
</Fragment>`;
  const originalStart = originalSource.indexOf("testState = 1");
  const artifact = createCompiledScriptArtifact({
    target: "event-async",
    sourceId,
    sourceUrl,
    displayName: "/src/Main.xmlui",
    sourceText: "testState = 1",
    js: "window.__xmluiBreakpointHit = true;",
    mappings: [
      createCompiledScriptMapping(0, 34, sourceId, {
        start: originalStart,
        end: originalStart + "testState = 1".length,
        startLine: 2,
        startColumn: 19,
        endLine: 2,
        endColumn: 32,
      }),
    ],
    sources: [
      {
        id: sourceId,
        url: sourceUrl,
        displayName: "/src/Main.xmlui",
        sourceText: originalSource,
      },
    ],
  });
  const generatedUrl = createCompiledScriptGeneratedSourceUrl(artifact);
  const functionBody = createCompiledScriptFunctionBody(artifact, { sourceMapMode: "inline" });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Debugger.enable");

  await page.goto("about:blank");
  await page.evaluate((body) => {
    (window as any).__xmluiCompiledDebugBody = body;
  }, functionBody);

  const breakpoint = await cdp.send("Debugger.setBreakpointByUrl", {
    url: generatedUrl,
    lineNumber: 1,
    columnNumber: 0,
  });
  expect(breakpoint.breakpointId).toBeTruthy();

  const paused = new Promise<any>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out waiting for CDP pause")), 5000);
    cdp.once("Debugger.paused", (event) => {
      clearTimeout(timer);
      resolve(event);
    });
  });
  const evaluation = page.evaluate(() => {
    (window as any).__xmluiCompiledDebugFn = new Function(
      "runtime",
      "evalContext",
      "thread",
      (window as any).__xmluiCompiledDebugBody,
    );
    (window as any).__xmluiCompiledDebugFn({}, {}, undefined);
  });
  const pauseEvent = await paused;
  await cdp.send("Debugger.resume");
  await evaluation;

  expect(pauseEvent.hitBreakpoints).toContain(breakpoint.breakpointId);
  const inlineSourceMap = functionBody.match(
    /sourceMappingURL=data:application\/json[^,]*,([A-Za-z0-9+/=]+)/,
  );
  expect(inlineSourceMap?.[1]).toBeTruthy();
  const sourceMap = JSON.parse(Buffer.from(inlineSourceMap![1], "base64").toString("utf8"));
  expect(sourceMap.sources).toContain(sourceUrl);
  expect(sourceMap.sourcesContent).toContain(originalSource);
  expect(functionBody).toContain("sourceMappingURL=data:application/json");
  await expect.poll(() => page.evaluate(() => (window as any).__xmluiBreakpointHit)).toBe(true);
});

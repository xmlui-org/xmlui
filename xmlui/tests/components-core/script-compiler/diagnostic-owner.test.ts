import { describe, expect, it } from "vitest";

import { xmlUiMarkupToComponent } from "../../../src/components-core/xmlui-parser";

/**
 * Phase 2.3 of `.plan/strict-compilation-mode.md`.
 *
 * A source id is `<file>#event-<counter>`, where the counter is an internal parse ordinal.
 * It identifies the block for the compiler and tells an app author nothing: on a file with
 * forty handlers it narrows to forty. Code-behind declarations already carried their
 * function name (`#function-roleHint`); event handlers did not.
 */
function fallbackReasons(markup: string): string[] {
  const parsed: any = xmlUiMarkupToComponent(markup, "/src/List.xmlui", undefined, undefined, {
    compileScripts: true,
  } as any);
  const reasons: string[] = [];
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (node.compiledUnsupportedReason) reasons.push(String(node.compiledUnsupportedReason));
    Object.values(node).forEach(walk);
  };
  walk(parsed);
  return reasons;
}

describe("a fallback names the handler it belongs to", () => {
  it("an `onX` attribute reports the component and the event", () => {
    const [reason] = fallbackReasons(
      `<Fragment><Button onClick="const r = await load(); return r;" /></Fragment>`,
    );
    expect(reason).toContain("(Button onClick)");
    expect(reason).toContain("await expression");
  });

  it("distinguishes two handlers on the same component type", () => {
    const reasons = fallbackReasons(
      `<Fragment>
         <Button onClick="const a = await one(); return a;" />
         <Button onGotFocus="const b = await two(); return b;" />
       </Fragment>`,
    );
    // --- Reported as the author wrote it (`onClick`), not as the framework stores it
    // --- (`click`): someone grepping their markup for the name in the message should
    // --- find the line that produced it.
    expect(reasons.some((reason) => reason.includes("(Button onClick)"))).toBe(true);
    expect(reasons.some((reason) => reason.includes("(Button onGotFocus)"))).toBe(true);
  });

  it("travels in the reason recorded on the emitted block, not only the console", () => {
    // --- `compiledUnsupportedReason` is what ships in a built bundle, so the attribution
    // --- has to survive there: a console line is gone by the time anyone investigates.
    const [reason] = fallbackReasons(
      `<Fragment><Table onSelectionDidChange="const r = await load(); return r;" /></Fragment>`,
    );
    expect(reason).toContain("(Table onSelectionDidChange)");
  });
});

describe("what no longer falls back at all", () => {
  it("a regular expression in a handler compiles", () => {
    // --- End-to-end through the real markup pipeline, not the compiler in isolation:
    // --- this was a fallback before Phase 1.1.
    expect(fallbackReasons(`<Fragment><Stack onMount="x = /a+/.test(s);" /></Fragment>`)).toEqual(
      [],
    );
  });
});

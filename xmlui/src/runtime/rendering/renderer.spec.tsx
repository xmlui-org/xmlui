import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { XmluiNode } from "../../compiler/ir";
import { createRuntimeScope, createRuntimeStateStore } from "../state";
import { createRenderContext } from "./renderer";

describe("runtime renderer", () => {
  it("preserves collapsed boundary whitespace between an element and following text", () => {
    const children: XmluiNode[] = [
      {
        kind: "element",
        type: "H1",
        props: {},
        vars: {},
        globals: {},
        events: {},
        methods: {},
        children: [],
        range: { start: 0, end: 8 },
      },
      {
        kind: "text",
        value: "DriveDiag (Nav)",
        range: { start: 15, end: 30 },
      },
    ];
    const context = createRenderContext({}, {});
    const scope = createRuntimeScope({ store: createRuntimeStateStore() });

    const html = renderToStaticMarkup(<>{context.renderChildren(children, scope)}</>);

    expect(html).toContain("</h1> DriveDiag (Nav)");
  });

  it("preserves trailing boundary whitespace before a parent closing tag", () => {
    const children: XmluiNode[] = [
      {
        kind: "element",
        type: "H1",
        props: {},
        vars: {},
        globals: {},
        events: {},
        methods: {},
        children: [],
        range: { start: 0, end: 8 },
      },
      {
        kind: "text",
        value: "DriveDiag (Nav)",
        range: { start: 15, end: 30 },
      },
    ];
    const context = createRenderContext({}, {});
    const scope = createRuntimeScope({ store: createRuntimeStateStore() });

    const html = renderToStaticMarkup(<>{context.renderChildren(children, scope, 35)}</>);

    expect(html).toContain("</h1> DriveDiag (Nav) ");
  });

  it("does not add boundary whitespace for adjacent compact source", () => {
    const children: XmluiNode[] = [
      {
        kind: "element",
        type: "H1",
        props: {},
        vars: {},
        globals: {},
        events: {},
        methods: {},
        children: [],
        range: { start: 0, end: 8 },
      },
      {
        kind: "text",
        value: "DriveDiag (Nav)",
        range: { start: 8, end: 23 },
      },
    ];
    const context = createRenderContext({}, {});
    const scope = createRuntimeScope({ store: createRuntimeStateStore() });

    const html = renderToStaticMarkup(<>{context.renderChildren(children, scope)}</>);

    expect(html).toContain("</h1>DriveDiag (Nav)");
    expect(html).not.toContain("</h1> DriveDiag (Nav)");
  });
});

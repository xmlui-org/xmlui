import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { XmluiNode } from "../../compiler/ir";
import { StyleProvider } from "../../components-core/theming/StyleContext";
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

    const html = renderToStaticMarkup(
      <StyleProvider>
        {context.renderChildren(children, scope)}
      </StyleProvider>,
    );

    expect(html).toContain("</h1> DriveDiag (Nav)");
  });

  it("preserves collapsed boundary whitespace between text and a following element", () => {
    const children: XmluiNode[] = [
      {
        kind: "text",
        value: "This site is an",
        range: { start: 0, end: 15 },
      },
      {
        kind: "element",
        type: "strong",
        props: {},
        vars: {},
        globals: {},
        events: {},
        methods: {},
        children: [
          {
            kind: "text",
            value: "XMLUI",
            range: { start: 28, end: 33 },
          },
        ],
        range: { start: 22, end: 42 },
      },
    ];
    const context = createRenderContext({}, {});
    const scope = createRuntimeScope({ store: createRuntimeStateStore() });

    const html = renderToStaticMarkup(
      <StyleProvider>
        {context.renderChildren(children, scope)}
      </StyleProvider>,
    );

    expect(html).toContain("This site is an <strong");
    expect(html).toContain(">XMLUI</strong>");
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

    const html = renderToStaticMarkup(
      <StyleProvider>
        {context.renderChildren(children, scope, 35)}
      </StyleProvider>,
    );

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

    const html = renderToStaticMarkup(
      <StyleProvider>
        {context.renderChildren(children, scope)}
      </StyleProvider>,
    );

    expect(html).toContain("</h1>DriveDiag (Nav)");
    expect(html).not.toContain("</h1> DriveDiag (Nav)");
  });

  it("does not add following boundary whitespace for adjacent compact source", () => {
    const children: XmluiNode[] = [
      {
        kind: "text",
        value: "This site is an",
        range: { start: 0, end: 15 },
      },
      {
        kind: "element",
        type: "strong",
        props: {},
        vars: {},
        globals: {},
        events: {},
        methods: {},
        children: [
          {
            kind: "text",
            value: "XMLUI",
            range: { start: 23, end: 28 },
          },
        ],
        range: { start: 15, end: 37 },
      },
    ];
    const context = createRenderContext({}, {});
    const scope = createRuntimeScope({ store: createRuntimeStateStore() });

    const html = renderToStaticMarkup(
      <StyleProvider>
        {context.renderChildren(children, scope)}
      </StyleProvider>,
    );

    expect(html).toContain("This site is an<strong");
    expect(html).toContain(">XMLUI</strong>");
    expect(html).not.toContain("This site is an <strong");
  });
});

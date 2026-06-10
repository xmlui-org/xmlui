/**
 * Tests for analyzer Phase 2/3 expression-scope rules:
 *   - expr-unbound-identifier
 *   - expr-unused-var
 *   - id-undefined-component-ref
 *   - id-undefined-form-ref
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";
import type { ComponentDef } from "../../../../src/abstractions/ComponentDefs";

import "../../../../src/components-core/analyzer/rules/expr-unbound-identifier";
import "../../../../src/components-core/analyzer/rules/expr-unused-var";
import "../../../../src/components-core/analyzer/rules/id-undefined-component-ref";
import "../../../../src/components-core/analyzer/rules/id-undefined-form-ref";

function emptyRegistry() {
  return {
    hasComponent: () => false,
    getComponentNames: () => [],
    lookupComponentRenderer: () => undefined,
  } as any;
}

function runWithAst(root: ComponentDef, strict = false) {
  return analyze({
    files: [{ file: "T.xmlui", source: "<App/>", markupAst: root }],
    componentRegistry: emptyRegistry(),
    strict,
  });
}

function runWithSource(source: string, strict = false) {
  return analyze({
    files: [{ file: "T.xmlui", source }],
    componentRegistry: emptyRegistry(),
    strict,
  });
}

function expectNoDiagnostic(root: ComponentDef, code: string) {
  const results = runWithAst(root);
  expect(results.filter((d) => d.code === code)).toHaveLength(0);
}

// ---------------------------------------------------------------------------
// expr-unbound-identifier
// ---------------------------------------------------------------------------

describe("rule: expr-unbound-identifier", () => {
  it("flags a typo identifier that resolves to nothing", () => {
    const root: ComponentDef = {
      type: "App",
      vars: { counter: "{0}" },
      children: [
        { type: "Button", events: { onClick: "countr++" } },
      ],
    };
    const results = runWithAst(root);
    const diags = results.filter((d) => d.code === "expr-unbound-identifier");
    expect(diags.length).toBeGreaterThanOrEqual(1);
    expect(diags[0].message).toContain("countr");
    expect(diags[0].suggestions?.[0]?.replacement).toBe("counter");
  });

  it("does not flag a uid reference", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", uid: "myBtn" },
        { type: "Text", props: { value: "{myBtn.id}" } },
      ],
    };
    const results = runWithAst(root);
    expect(results.filter((d) => d.code === "expr-unbound-identifier")).toHaveLength(0);
  });

  it("does not flag a reserved framework identifier", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", events: { onClick: "App.navigate('/')" } },
      ],
    };
    const results = runWithAst(root);
    expect(results.filter((d) => d.code === "expr-unbound-identifier")).toHaveLength(0);
  });

  it("does not flag a body-local let declaration", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", events: { onClick: "let x = 1; x + 1" } },
      ],
    };
    expectNoDiagnostic(root, "expr-unbound-identifier");
  });

  it("does not flag a destructured body-local declaration", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Button",
          events: {
            onClick: "const { item } = { item: 1 }; item + 1",
          },
        },
      ],
    };
    expectNoDiagnostic(root, "expr-unbound-identifier");
  });

  it("does not flag a function parameter used in a local function body", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Button",
          events: {
            onClick: "function format(value) { return value + 1; } format(1)",
          },
        },
      ],
    };
    expectNoDiagnostic(root, "expr-unbound-identifier");
  });

  it("does not flag an arrow parameter used in a bound expression", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Text",
          props: { value: "{[1, 2, 3].map(item => item + 1).join(',')}" },
        },
      ],
    };
    expectNoDiagnostic(root, "expr-unbound-identifier");
  });

  it("does not flag a single-parameter event-handler arrow on parsed markup", () => {
    const results = runWithSource(`
      <Component name="EmuApp">
        <SharedAppState id="state" />
        <VStack
          var.initialKeyboardSplitterPosition="{state.value.globalSettings.emuViewOptions.keyboardSplitterPosition + ''}"
          var.liveKeyboardSplitterPosition="{initialKeyboardSplitterPosition}"
        >
          <VSplitter
            initialPrimarySize="{initialKeyboardSplitterPosition.indexOf('px') >= 0 ? initialKeyboardSplitterPosition : initialKeyboardSplitterPosition + 'px'}"
            onResize="primarySize => liveKeyboardSplitterPosition = primarySize + 'px'"
          />
        </VStack>
      </Component>
    `);
    expect(results.filter((d) => d.code === "expr-unbound-identifier")).toHaveLength(0);
  });

  it("does not flag a $-prefixed context variable", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", events: { onClick: "$event.preventDefault()" } },
      ],
    };
    expectNoDiagnostic(root, "expr-unbound-identifier");
  });
});

// ---------------------------------------------------------------------------
// expr-unused-var
// ---------------------------------------------------------------------------

describe("rule: expr-unused-var", () => {
  it("flags a var that is never referenced", () => {
    const root: ComponentDef = {
      type: "App",
      vars: { unusedVar: "{0}" },
    };
    const results = runWithAst(root);
    const diags = results.filter((d) => d.code === "expr-unused-var");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("info");
    expect(diags[0].message).toContain("unusedVar");
  });

  it("does not flag a var that is referenced in a child handler", () => {
    const root: ComponentDef = {
      type: "App",
      vars: { counter: "{0}" },
      children: [
        { type: "Button", events: { onClick: "counter++" } },
      ],
    };
    const results = runWithAst(root);
    expect(results.filter((d) => d.code === "expr-unused-var")).toHaveLength(0);
  });

  it("escalates to warn in strict mode", () => {
    const root: ComponentDef = {
      type: "App",
      vars: { unused: "{0}" },
    };
    const results = runWithAst(root, true);
    const diags = results.filter((d) => d.code === "expr-unused-var");
    expect(diags[0].severity).toBe("warn");
  });

  it("does not flag a var declared on a reusable <Component> definition", () => {
    const results = runWithSource(`
      <Component name="Demo" var.machineState="{state.value.machineState ?? 0}">
        <SharedAppState id="state" />
        <Text value="ready" />
      </Component>
    `);
    expect(results.filter((d) => d.code === "expr-unused-var")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// id-undefined-component-ref
// ---------------------------------------------------------------------------

describe("rule: id-undefined-component-ref", () => {
  it("flags a chain rooted at an undeclared identifier", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", uid: "myBtn" },
        { type: "Button", events: { onClick: "myBttn.flash()" } },
      ],
    };
    const results = runWithAst(root);
    const diags = results.filter((d) => d.code === "id-undefined-component-ref");
    expect(diags.length).toBeGreaterThanOrEqual(1);
    expect(diags[0].suggestions?.[0]?.replacement).toBe("myBtn");
  });

  it("does not flag a chain rooted at a known uid", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", uid: "myBtn" },
        { type: "Button", events: { onClick: "myBtn.flash()" } },
      ],
    };
    const results = runWithAst(root);
    expect(results.filter((d) => d.code === "id-undefined-component-ref")).toHaveLength(0);
  });

  it("does not flag reserved root identifiers", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", events: { onClick: "App.navigate('/')" } },
      ],
    };
    const results = runWithAst(root);
    expect(results.filter((d) => d.code === "id-undefined-component-ref")).toHaveLength(0);
  });

  it("does not flag chain rooted at an ancestor var", () => {
    const root: ComponentDef = {
      type: "App",
      vars: { state: "{ foo: 1 }" },
      children: [
        { type: "Text", props: { value: "{state.foo}" } },
      ],
    };
    expectNoDiagnostic(root, "id-undefined-component-ref");
  });

  it("does not flag chain rooted at a body-local declaration", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Button",
          events: {
            onClick: "const localState = { ready: true }; localState.ready",
          },
        },
      ],
    };
    expectNoDiagnostic(root, "id-undefined-component-ref");
  });

  it("does not flag chain rooted at a function parameter", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Button",
          events: {
            onClick: "function visit(item) { return item.value; } visit({ value: 1 })",
          },
        },
      ],
    };
    expectNoDiagnostic(root, "id-undefined-component-ref");
  });

  it("does not flag chain rooted at an arrow parameter", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Text",
          props: { value: "{[{ value: 1 }].map(item => item.value).join(',')}" },
        },
      ],
    };
    expectNoDiagnostic(root, "id-undefined-component-ref");
  });
});

// ---------------------------------------------------------------------------
// id-undefined-form-ref
// ---------------------------------------------------------------------------

describe("rule: id-undefined-form-ref", () => {
  it("flags a FormItem whose bindTo is missing from data shape", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Form",
          props: { data: "{ { phone: '' } }" },
          children: [{ type: "FormItem", props: { bindTo: "phon" } }],
        },
      ],
    };
    const results = runWithAst(root);
    const diags = results.filter((d) => d.code === "id-undefined-form-ref");
    expect(diags).toHaveLength(1);
    expect(diags[0].suggestions?.[0]?.replacement).toBe("phone");
  });

  it("does not flag a matching bindTo", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Form",
          props: { data: "{ { phone: '' } }" },
          children: [{ type: "FormItem", props: { bindTo: "phone" } }],
        },
      ],
    };
    const results = runWithAst(root);
    expect(results.filter((d) => d.code === "id-undefined-form-ref")).toHaveLength(0);
  });

  it("flags a FormItem outside any Form", () => {
    const root: ComponentDef = {
      type: "App",
      children: [{ type: "FormItem", props: { bindTo: "phone" } }],
    };
    const results = runWithAst(root);
    const diags = results.filter((d) => d.code === "id-undefined-form-ref");
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("not inside a <Form>");
  });

  it("skips validation when the data shape is dynamic", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Form",
          props: { data: "{ loadUser() }" },
          children: [{ type: "FormItem", props: { bindTo: "phone" } }],
        },
      ],
    };
    const results = runWithAst(root);
    expect(results.filter((d) => d.code === "id-undefined-form-ref")).toHaveLength(0);
  });

  it("escalates to error in strict mode", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Form",
          props: { data: "{ { phone: '' } }" },
          children: [{ type: "FormItem", props: { bindTo: "phon" } }],
        },
      ],
    };
    const results = runWithAst(root, true);
    const diags = results.filter((d) => d.code === "id-undefined-form-ref");
    expect(diags[0].severity).toBe("error");
  });
});

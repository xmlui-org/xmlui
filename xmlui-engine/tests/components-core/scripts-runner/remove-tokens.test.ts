import { describe, expect, it } from "vitest";

import {
  collectCodeBehindFromSource,
  removeCodeBehindTokensFromTree,
} from "@parsers/scripting/code-behind-collect";
import { createEvalContext } from "./test-helpers";
import { CollectedDeclarations, Expression } from "@abstractions/scripting/ScriptingSourceTree";

const ROOT_MODULE = "test";

describe("Remove tokens from source", () => {
  it("Single var #1", () => {
    // --- Arrange
    const source = `
      var a = 3
    `;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.vars).length).equal(1);
    const tree = collected.vars.a.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Single var #2", () => {
    // --- Arrange
    const source = `
      var a = 1 + 2;
    `;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.vars).length).equal(1);
    const tree = collected.vars.a.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Single var #3", () => {
    // --- Arrange
    const source = `
        var a = () => Math.floor(c/d);
      `;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.vars).length).equal(1);
    const tree = collected.vars.a.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Multiple var", () => {
    // --- Arrange
    const source = `
        var a = 3, b = () => Math.floor(c/d);
      `;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.vars).length).equal(2);
    let tree = collected.vars.a.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
    tree = collected.vars.b.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Single function #1", () => {
    // --- Arrange
    const source = `function a(b, c, d) { return Math.floor(c/d) }`;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(1);
    const tree = collected.functions.a.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Single function #2", () => {
    // --- Arrange
    const source = `function a() { let x = 3; return x * 2 }`;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(1);
    const tree = collected.functions.a.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Multiple function #1", () => {
    // --- Arrange
    const source = `
  function a() { let x = 3; return x * 2 }
  function b(c,d,e) { return c + d + e }`;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(2);
    let tree = collected.functions.a.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
    tree = collected.functions.b.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Single function argument", () => {
    const source = "function myButton_onClick(eventArgs){ console.log(allTasks.length) }";
    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(1);
    const tree = collected.functions.myButton_onClick.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Import function #1", () => {
    // --- Arrange
    const source = `
      import { square } from "math";
    `;

    const modules = {
      math: `export function square(x) { return x * x; }`,
    };

    // --- Act
    const collected = collect(source, modules);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(1);
    const tree = collected.functions.square.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Import function #2", () => {
    // --- Arrange
    const source = `
      import { square } from "math";
    `;

    const modules = {
      math: `
        export function square(x) { return x * x; }
      `,
    };

    // --- Act
    const collected = collect(source, modules);

    // --- Assert
    const tree = collected.functions.square.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });

  it("Import circular reference", () => {
    // --- Arrange
    const source = `
      import { square } from "math";
    `;

    const modules = {
      math: `
        import { other } from "helper";
        export function square(x) { return x * x; }
      `,
      helper: `
        import { square } from "math";
        export function other() {};
      `,
    };

    // --- Act
    const collected = collect(source, modules);

    // --- Assert
    const tree = collected.functions.square.tree as Expression
    expect(tree).toBeDefined();
    expect("startPosition" in tree).toBe(false);
    expect("endPosition" in tree).toBe(false);
    expect("startLine" in tree).toBe(false);
    expect("endLine" in tree).toBe(false);
    expect("startColumn" in tree).toBe(false);
    expect("endColumn" in tree).toBe(false);
    expect("startToken" in tree).toBe(false);
    expect("endToken" in tree).toBe(false);
  });
});

function collect(source: string, modules: Record<string, string> = {}): CollectedDeclarations {
  const evalContext = createEvalContext({
    timeout: 1000
  });
  
  const codeBehind = collectCodeBehindFromSource(
    ROOT_MODULE,
    source,
    (_: string, moduleName: string) => modules[moduleName] ?? null);
  removeCodeBehindTokensFromTree(codeBehind);
  return codeBehind;
}

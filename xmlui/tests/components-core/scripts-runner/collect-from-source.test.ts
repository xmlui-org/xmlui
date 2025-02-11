import { describe, expect, it, assert } from "vitest";

import {
  collectCodeBehindFromSource,
  PARSED_MARK_PROP,
} from "../../../src/parsers/scripting/code-behind-collect";
import { CollectedDeclarations, Expression } from "../../../src/abstractions/scripting/ScriptingSourceTree";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";

const ROOT_MODULE = "test";

describe("Parser - collect code-behind from source", () => {
  it("Single var #1", () => {
    // --- Arrange
    const source = `
      var a = 3
    `;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.vars).length).equal(1);
    expect(collected.vars.a.source).equal("3");
    expect((collected.vars.a.tree as Expression).type).equal("LitE");
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
    expect(collected.vars.a.source).equal("1 + 2");
    expect((collected.vars.a.tree as Expression).type).equal("BinaryE");
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
    expect(collected.vars.a.source).equal("() => Math.floor(c/d)");
    expect((collected.vars.a.tree as Expression).type).equal("ArrowE");
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
    expect(collected.vars.a.source).equal("3");
    expect((collected.vars.a.tree as Expression).type).equal("LitE");
    expect(collected.vars.b.source).equal("() => Math.floor(c/d)");
    expect((collected.vars.b.tree as Expression).type).equal("ArrowE");
  });

  it("Vars marked as parsed", () => {
    // --- Arrange
    const source = `
        var a = 3, b = () => Math.floor(c/d);
      `;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.vars).length).equal(2);
    expect(collected.vars.a.source).equal("3");
    expect((collected.vars.a.tree as Expression).type).equal("LitE");
    expect(collected.vars.a[PARSED_MARK_PROP]).equal(true);
    expect(collected.vars.b.source).equal("() => Math.floor(c/d)");
    expect((collected.vars.b.tree as Expression).type).equal("ArrowE");
    expect(collected.vars.b[PARSED_MARK_PROP]).equal(true);
  });

  it("Duplicated var fails", () => {
    // --- Arrange
    const source = `
        var a = 3, a = () => Math.floor(c/d);
      `;

    // --- Act
    try {
      collect(source);
    } catch (err: any) {
      expect(err.toString().includes("Duplicated")).equal(true);
      expect(err.toString().includes("var")).equal(true);
      expect(err.toString().includes("'a'")).equal(true);
      return;
    }
    assert.fail("Error expected");
  });

  it("Single function #1", () => {
    // --- Arrange
    const source = `function a(b, c, d) { return Math.floor(c/d) }`;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(1);
    expect(collected.functions.a.source).equal("(b, c, d) => { return Math.floor(c/d) }");
    expect((collected.functions.a.tree as Expression).type).equal("ArrowE");
  });

  it("Single function #2", () => {
    // --- Arrange
    const source = `function a() { let x = 3; return x * 2 }`;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(1);
    expect(collected.functions.a.source).equal("() => { let x = 3; return x * 2 }");
    expect((collected.functions.a.tree as Expression).type).equal("ArrowE");
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
    expect(collected.functions.a.source).equal("() => { let x = 3; return x * 2 }");
    expect((collected.functions.a.tree as Expression).type).equal("ArrowE");
    expect(collected.functions.b.source).equal("(c, d, e) => { return c + d + e }");
    expect((collected.functions.b.tree as Expression).type).equal("ArrowE");
  });

  it("Duplicated function fails", () => {
    // --- Arrange
    const source = `
        function a() {}
        function a() { return Math.floor(c/d); }`;

    // --- Act
    const result = collect(source);
    
    // --- Assert
    const errors = result.moduleErrors![ROOT_MODULE];
    expect(Object.keys(result.moduleErrors!).length).equal(1);
    expect(errors.length).equal(1);
    expect(errors[0].code).equal("W020");
    expect(errors[0].text.includes("'a'")).equal(true);
  });

  it("Single function argument", () => {
    const source = "function myButton_onClick(eventArgs){ console.log(allTasks.length) }";
    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(1);
    expect(collected.functions.myButton_onClick.source).equal("(eventArgs) => { console.log(allTasks.length) }");
    expect((collected.functions.myButton_onClick.tree as Expression).type).equal("ArrowE");
  });

  it("Functions marked as parsed", () => {
    // --- Arrange
    const source = `
  function a() { let x = 3; return x * 2 }
  function b(c,d,e) { return c + d + e }`;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(Object.keys(collected.functions).length).equal(2);
    expect(collected.functions.a.source).equal("() => { let x = 3; return x * 2 }");
    expect(collected.functions.a[PARSED_MARK_PROP]).equal(true);
    expect((collected.functions.a.tree as Expression).type).equal("ArrowE");
    expect(collected.functions.b.source).equal("(c, d, e) => { return c + d + e }");
    expect((collected.functions.b.tree as Expression).type).equal("ArrowE");
    expect(collected.functions.b[PARSED_MARK_PROP]).equal(true);
  });

  it("Var in function should fail", () => {
    // --- Arrange
    const source = `function a(b, c, d) { var dummy = 1; return Math.floor(c/d) }`;

    // --- Act
    const collected = collect(source);

    // --- Assert
    expect(collected.moduleErrors![ROOT_MODULE].length).equal(1);
    expect(collected.moduleErrors![ROOT_MODULE][0].code).equal("W027");
  });


  it("Infinite loop", () => {
    // --- Arrange
    const source = `
      import { square } from "math";
    `;

    const modules = {
      math: `export function square(x) { return x * x; } while(true) {}`,
    };

    // --- Act
    const parsed = collect(source, modules);
    expect(parsed.moduleErrors!["math"].length).equal(1);
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
    expect(collected.functions.square.source).equal("(x) => { return x * x; }");
    expect((collected.functions.square.tree as Expression).type).equal("ArrowE");
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
    expect(collected.functions.square.source).equal("(x) => { return x * x; }");
    expect((collected.functions.square.tree as Expression).type).equal("ArrowE");
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
    expect(collected.functions.square.source).equal("(x) => { return x * x; }");
    expect((collected.functions.square.tree as Expression).type).equal("ArrowE");
  });

  it("collect functions from imports cyclic", () => {
    const result = collect(`import { a } from "module1"`, {
      module1: `
        import { b } from "module2"

        export function a(){
            console.log("from a");
            return b();
        }

        export function a2(){
            console.log("from a2")
        }
      `,
      module2: `
        import {a2} from "module1"

        export function b(){
            console.log("from b");
            return "return from b";
        }
      `,
    });
    expect(Object.keys(result.functions).length).toBe(3);
  });

  it("collect functions from imports cycle including main module", () => {
    const result = collect(
      `
        import { b } from "module1"

        export function a(){
            console.log("from a");
            return b();
        }

        export function a2(){
            console.log("from a2")
        }
      `,
      {
        module1: `
        import {a2} from "${ROOT_MODULE}"

        export function b(){
            console.log("from b");
            return "return from b";
        }
      `,
      },
    );
    expect(Object.keys(result.functions).length).toBe(3);
  });

  it.skip("collect functions multiple times imported", () => {
    const result = collect(`import { a } from "module1"`, {
      module1: `
        import { b } from "module2"

        export function a(){
            console.log("from a");
            return b();
        }
      `,
      module2: `
        import {a} from "module1"

        export function b(){
            console.log("from b");
            return "return from b";
        }
      `,
    });
    expect(Object.keys(result.functions).length).toBe(2);
  });
});

function collect(source: string, modules: Record<string, string> = {}): CollectedDeclarations {
  const evalContext = createEvalContext({
    timeout: 1000
  });
  
  return collectCodeBehindFromSource(
    ROOT_MODULE,
    source,
    (parentModule: string, moduleName: string) => {
      if (moduleName === ROOT_MODULE) {
        return source;
      }
      return modules[moduleName] ?? null;
    },
    (a) => a);
}

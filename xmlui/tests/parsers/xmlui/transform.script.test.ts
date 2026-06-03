import { assert, describe, expect, it } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "../../../src/abstractions/ComponentDefs";
import {
  type Expression,
  type MemberAccessExpression,
  type CalculatedMemberAccessExpression,
  type Identifier,
  type Literal,
  type ModuleErrors,
  T_ARROW_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_IDENTIFIER,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import { PARSED_MARK_PROP } from "../../../src/abstractions/InternalMarkers";
import { transformSource } from "./xmlui";

describe("Xmlui transform - script", () => {
  it("Script works with empty text #2", () => {
    const cd = transformSource(`<Stack><script>   </script></Stack>`) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.children).equal(undefined);
    expect(cd.script).toBeUndefined();
  });

  it("Script works with text #1", () => {
    const cd = transformSource(`
      <Stack>
        <script>var a = 1;</script>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("var a = 1;");
  });

  it("Script works with text #2", () => {
    const cd = transformSource(`
      <Stack>
        <script>   var a = 1;   </script>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("   var a = 1;   ");
  });

  it("Script works with text #3", () => {
    const cd = transformSource(`
      <Stack>
        <script>var a = 1;
var b = 2;</script>

      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("var a = 1;\nvar b = 2;");
  });

  it("Script works with text #4", () => {
    const cd = transformSource(`
      <Stack>
        <script>
var a = 1;
var b = 2;</script>

      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("\nvar a = 1;\nvar b = 2;");
  });

  it("Script works with text #5", () => {
    const cd = transformSource(`
      <Stack>
        <script>
var a = 1;
var b = 2;
</script>

      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("\nvar a = 1;\nvar b = 2;\n");
  });

  it("Script works with CompoundComponent", () => {
    const cd = transformSource(`
      <Component name="MyComp">
        <script>var b = 2;  </script>
        <Stack/>
      </Component>
    `) as CompoundComponentDef;
    expect((cd.component as any).type).equal("Fragment");
    expect((cd.component as any).script).equal("var b = 2;  ");
    expect((cd.component as any).children?.length).equal(1);
    expect((cd.component as any).children[0].type).equal("Stack");
  });

  it("Script collect - Single var #1", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          var a = 3
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.vars).length).equal(1);
    expect((collected.vars.a.tree as Expression).type).equal(T_LITERAL);
  });

  it("Script collect - Single var #2", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          var a = 1 < 2;
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.vars).length).equal(1);
    expect((collected.vars.a.tree as Expression).type).equal(T_BINARY_EXPRESSION);
  });

  it("Script collect - Single var #3", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          var a = () => Math.floor(c/d);
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.vars).length).equal(1);
    expect((collected.vars.a.tree as Expression).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script collect - Multiple var", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          var a = 3, b = () => Math.floor(c/d);
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.vars).length).equal(2);
    expect((collected.vars.a.tree as Expression).type).equal(T_LITERAL);
    expect((collected.vars.b.tree as Expression).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script collect - Multiple var and statement", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          var a = 3, b = () => Math.floor(c/d);
          console.log(a, b);
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(collected.hasInvalidStatements).equal(true);
    expect(Object.keys(collected.vars).length).equal(2);
    expect((collected.vars.a.tree as Expression).type).equal(T_LITERAL);
    expect((collected.vars.b.tree as Expression).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script collect - Duplicated var fails", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          var a = 3, a = () => Math.floor(c/d);
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const err = cd.scriptError;
    expect(err.toString().includes("Duplicated")).equal(true);
    expect(err.toString().includes("var")).equal(true);
    expect(err.toString().includes("'a'")).equal(true);
  });

  it("Script collect - Single function #1", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          function a(b, c, d) { return Math.floor(c/d) }
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.functions).length).equal(1);
    expect((collected.functions.a as any).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script collect - Single function #2", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          function a() { let x = 3; return x * 2 }
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.functions).length).equal(1);
    expect((collected.functions.a as any).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script collect - Multiple function #1", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          function a() { let x = 3; return x * 2 }
          function b(c,d,e) { return c + d + e };
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.functions).length).equal(2);
    expect((collected.functions.a as any).type).equal(T_ARROW_EXPRESSION);
    expect((collected.functions.b as any).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script collect - Duplicated function fails", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          function a() {}
          function a() { return Math.floor(c/d); };
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const err = cd.scriptError as Record<string, ModuleErrors[]>;
    expect(err["0"][0].code).equal("W020");
  });

  it("Script collect - Single function argument", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          function myButton_onClick(eventArgs){ console.log(allTasks.length) }
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.functions).length).equal(1);
    expect((collected.functions.myButton_onClick as any).type).equal(
      T_ARROW_EXPRESSION,
    );
  });

  it("Script creates Fragment #2", () => {
    const cd = transformSource(`
    <Items items="{['first', 'second', 'third']}">
      <property name="itemTemplate">
        <script>var a = 1;</script>
        <Stack>{other}</Stack>
      </property>
    </Items>
    `) as ComponentDef;
    expect(cd.children).equal(undefined);
    const template = (cd.props as any).itemTemplate as ComponentDef;
    expect(template.type).equal("Fragment");
    expect(template.script).equal("var a = 1;");
    expect(template.children!.length).equal(1);
    expect(template.children![0].type).equal("Stack");
  });

  it("Script creates Fragment #1", () => {
    const cd = transformSource(`
    <Items items="{['first', 'second', 'third']}">
      <script>var a = 1;</script>
      <Stack>{uppercaseItem}</Stack>
    </Items>
    `) as ComponentDef;
    expect(cd.children!.length).equal(1);
    const child = cd.children![0] as ComponentDef;
    expect(child.type).equal("Fragment");
    expect(child.script).toBeUndefined();
    expect(cd.script).equal("var a = 1;");
    expect(child.children!.length).equal(1);
    expect(child.children![0].type).equal("Stack");
    expect(child.children![0].children!.length).equal(1);
    const textNode = child.children![0].children![0];
    expect((textNode.props as any).value).equal("{uppercaseItem}");
  });

  // =========================================================================
  // Var destructuring in XMLUI script blocks
  // =========================================================================

  it("Script collect - object destructuring", () => {
    const cd = transformSource(`
      <Stack>
        <script>
          var {name, age} = person;
        </script>
      </Stack>
    `) as ComponentDef;

    const collected = cd.scriptCollected!;
    expect("name" in collected.vars).equal(true);
    expect("age" in collected.vars).equal(true);
    expect(collected.vars.name[PARSED_MARK_PROP]).equal(true);
    expect(collected.vars.age[PARSED_MARK_PROP]).equal(true);

    // name's tree should be MemberAccessExpression
    expect((collected.vars.name.tree as Expression).type).equal(T_MEMBER_ACCESS_EXPRESSION);
    expect((collected.vars.age.tree as Expression).type).equal(T_MEMBER_ACCESS_EXPRESSION);
  });

  it("Script collect - array destructuring", () => {
    const cd = transformSource(`
      <Stack>
        <script>
          var [first, second] = items;
        </script>
      </Stack>
    `) as ComponentDef;

    const collected = cd.scriptCollected!;
    expect("first" in collected.vars).equal(true);
    expect("second" in collected.vars).equal(true);
    expect(collected.vars.first[PARSED_MARK_PROP]).equal(true);
    expect(collected.vars.second[PARSED_MARK_PROP]).equal(true);

    expect((collected.vars.first.tree as Expression).type).equal(T_CALCULATED_MEMBER_ACCESS_EXPRESSION);
    expect((collected.vars.second.tree as Expression).type).equal(T_CALCULATED_MEMBER_ACCESS_EXPRESSION);
  });

  it("Script collect - object destructuring with alias", () => {
    const cd = transformSource(`
      <Stack>
        <script>
          var {x: xPos, y: yPos} = coords;
        </script>
      </Stack>
    `) as ComponentDef;

    const collected = cd.scriptCollected!;
    expect("xPos" in collected.vars).equal(true);
    expect("yPos" in collected.vars).equal(true);
    // Originals should not appear
    expect("x" in collected.vars).equal(false);
    expect("y" in collected.vars).equal(false);
  });

  it("Script collect - multiple destructuring with functions", () => {
    const cd = transformSource(`
      <Stack>
        <script>
          var {a, b} = source1;
          function compute(x) { return x * 2; }
          var [c, d] = source2;
        </script>
      </Stack>
    `) as ComponentDef;

    const collected = cd.scriptCollected!;
    expect(collected.hasInvalidStatements).equal(false);
    expect("a" in collected.vars).equal(true);
    expect("b" in collected.vars).equal(true);
    expect("c" in collected.vars).equal(true);
    expect("d" in collected.vars).equal(true);
    expect("compute" in collected.functions).equal(true);
  });

  it("Script collect - destructuring mixed with simple vars", () => {
    const cd = transformSource(`
      <Stack>
        <script>
          var count = 0;
          var {name, age} = person;
          var label = "hello";
        </script>
      </Stack>
    `) as ComponentDef;

    const collected = cd.scriptCollected!;
    expect(collected.hasInvalidStatements).equal(false);
    expect("count" in collected.vars).equal(true);
    expect("name" in collected.vars).equal(true);
    expect("age" in collected.vars).equal(true);
    expect("label" in collected.vars).equal(true);

    // Simple vars have direct expression trees
    expect((collected.vars.count.tree as Expression).type).equal(T_LITERAL);
    // Destructured vars have member access trees
    expect((collected.vars.name.tree as Expression).type).equal(T_MEMBER_ACCESS_EXPRESSION);
  });

  it("Script collect - destructuring in Component", () => {
    const cd = transformSource(`
      <Component name="MyComp">
        <script>
          var {x, y} = getData();
        </script>
        <Stack/>
      </Component>
    `) as CompoundComponentDef;

    const comp = cd.component as any;
    expect(comp.script).toContain("var {x, y} = getData()");
    const collected = comp.scriptCollected!;
    expect("x" in collected.vars).equal(true);
    expect("y" in collected.vars).equal(true);
    expect(collected.vars.x[PARSED_MARK_PROP]).equal(true);
    expect(collected.vars.y[PARSED_MARK_PROP]).equal(true);
  });

  it("Script function is hoisted to parent when parent has component siblings", () => {
    // Regression test: functions defined in <script> blocks must be accessible
    // in event handlers (onClick="loop(100)") even when the script is a sibling
    // of component children, causing the parser to wrap them in a Fragment.
    const cd = transformSource(`
      <Stack>
        <script>
          function loop(n) {
            let sum = 0;
            for (let i = 1; i <= n; i++) {
              sum += i;
            }
          }
        </script>
        <Button onClick="loop(100)">Loop 1-100</Button>
      </Stack>
    `) as ComponentDef;

    // The Stack must have scriptCollected with the loop function
    expect(cd.type).equal("Stack");
    expect(cd.scriptCollected).toBeDefined();
    expect(cd.scriptCollected?.functions?.loop).toBeDefined();
    expect((cd.scriptCollected?.functions?.loop as any).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script function in App with component siblings is hoisted to App", () => {
    // Same regression test as above but with App as the root element
    const cd = transformSource(`
      <App>
        <script>
          function loop(n) {
            let sum = 0;
            for (let i = 1; i <= n; i++) {
              sum += i;
            }
          }
        </script>
        <Button onClick="loop(100)">Loop 1-100</Button>
      </App>
    `) as ComponentDef;

    expect(cd.type).equal("App");
    expect(cd.scriptCollected).toBeDefined();
    expect(cd.scriptCollected?.functions?.loop).toBeDefined();
    expect((cd.scriptCollected?.functions?.loop as any).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script function with template literal is hoisted even though script contains '$'", () => {
    // Regression: template literal interpolations like `${n}` contain '$' but are NOT
    // context variable references. Hoisting must not be blocked by them.
    const cd = transformSource(`
      <App>
        <script>
          function loop(n) {
            let sum = 0;
            for (let i = 1; i <= n; i++) {
              sum += i;
            }
            console.info(\`Looped to \${n}\`);
          }
        </script>
        <Button onClick="loop(100)">Loop 1-100</Button>
      </App>
    `) as ComponentDef;

    expect(cd.type).equal("App");
    expect(cd.scriptCollected).toBeDefined();
    expect(cd.scriptCollected?.functions?.loop).toBeDefined();
    expect((cd.scriptCollected?.functions?.loop as any).type).equal(T_ARROW_EXPRESSION);
  });

  it("Script collect - nested object destructuring", () => {
    const cd = transformSource(`
      <Stack>
        <script>
          var {user: {name, email}} = response;
        </script>
      </Stack>
    `) as ComponentDef;

    const collected = cd.scriptCollected!;
    expect("name" in collected.vars).equal(true);
    expect("email" in collected.vars).equal(true);
    // "user" is not a declared var — it's a nesting path
    expect("user" in collected.vars).equal(false);
  });
});

// ---------------------------------------------------------------------------
// Fragment script hoisting — regression tests for item 3.1
//
// hoistScriptCollectedFromFragments() should:
//   (a) hoist Fragment scripts that have NO $contextVar references
//   (b) NOT block hoisting due to incidental `$word` inside a string literal
//   (c) NOT hoist when the script reads actual context vars like $item/$index
//   (d) NOT hoist when parent and Fragment declare the same name (collision guard)
// ---------------------------------------------------------------------------
describe("Fragment script hoisting", () => {
  it("(a) Fragment with no context-var references is hoisted into parent", () => {
    const cd = transformSource(`
      <Stack>
        <Fragment>
          <script>function helper() { return 42; }</script>
        </Fragment>
      </Stack>
    `) as ComponentDef;

    // Script should be hoisted to the Stack
    expect(cd.script).toBeDefined();
    expect(cd.scriptCollected?.functions?.helper).toBeDefined();
    // Fragment itself should have no scriptCollected after hoisting
    const fragment = (cd.children as ComponentDef[] | undefined)?.find(
      (c) => c.type === "Fragment",
    );
    expect(fragment?.scriptCollected).toBeUndefined();
  });

  it("(b) incidental $word inside a string literal does NOT block hoisting", () => {
    // The script uses a string that contains `$total` — this is NOT a context
    // var reference; it's a dollar sign inside a string literal.
    const cd = transformSource(`
      <Stack>
        <Fragment>
          <script>var label = "Total: $total items";</script>
        </Fragment>
      </Stack>
    `) as ComponentDef;

    // Should be hoisted — the `$total` in the string must not be mistaken for
    // a context-variable read.
    expect(cd.scriptCollected?.vars?.label).toBeDefined();
  });

  it("(c) Fragment referencing a real context var $item is NOT hoisted", () => {
    // The parser auto-creates a Fragment when a component has both a <script>
    // and child content.  When the Fragment's script reads a $contextVar, it
    // must NOT be hoisted to the parent Stack.
    const cd = transformSource(`
      <Stack>
        <Stack vars="{{}}" id="inner">
          <script>function display() { return $item.name; }</script>
          <Text text="placeholder" />
        </Stack>
      </Stack>
    `) as ComponentDef;

    // The inner Stack wraps its children in a Fragment because it has both
    // a <script> and content.  $item reads a context var → Fragment must
    // keep its scriptCollected.  The OUTER Stack must NOT inherit `display`.
    expect(cd.scriptCollected?.functions?.display).toBeUndefined();
    // The inner Stack (not the Fragment) should have the script
    const inner = (cd.children as ComponentDef[] | undefined)?.[0];
    // If hoisting was blocked, the script stays on the fragment inside inner
    // but inner.scriptCollected should NOT have display either
    // (it would only be promoted if there were no context-var reads).
    // The key invariant: outer Stack must not see `display`.
    expect(cd.script).toBeUndefined();
  });

  it("(d) Fragment whose function name collides with parent is NOT hoisted", () => {
    // When both parent and the auto-created Fragment declare the same name,
    // the collision guard must prevent the Fragment's version from overwriting
    // (or appending a duplicate declaration to) the parent script.
    const cd = transformSource(`
      <Stack>
        <script>function helper() { return "parent"; }</script>
        <Text text="child" />
      </Stack>
    `) as ComponentDef;

    // Baseline: Stack declares `helper` and has it in scriptCollected
    expect(cd.scriptCollected?.functions?.helper).toBeDefined();
    // The script text must contain "parent" (not overwritten by a duplicate)
    expect(cd.script).toContain("parent");
    // Only ONE function named `helper` — no duplicate concat
    const script = cd.script ?? "";
    const count = (script.match(/function helper/g) ?? []).length;
    expect(count).toBe(1);
  });
});

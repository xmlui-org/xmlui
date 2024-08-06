import { describe, expect, it, assert } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { Expression, ModuleErrors } from "@abstractions/scripting/ScriptingSourceTree";
import { transformSource } from "./xmlui";

describe("Ueml transform - script", () => {

  it("Script works with empty text #2", () => {
    const cd = transformSource(`<Stack><script>   </script></Stack>`) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.children).equal(undefined);
    expect(cd.script).equal("   ");
  });

  it("Script works with text #1", () => {
    const cd = transformSource(`
      <Stack>
        <script>Hi!</script>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("Hi!");
  });

  it("Script works with text #2", () => {
    const cd = transformSource(`
      <Stack>
        <script>   Hi!   </script>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("   Hi!   ");
  });

  it("Script works with text #3", () => {
    const cd = transformSource(`
      <Stack>
        <script>Hi!
Hello!</script>
        
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("Hi!\nHello!");
  });

  it("Script works with text #4", () => {
    const cd = transformSource(`
      <Stack>
        <script>
Hi!
Hello!</script>
        
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("\nHi!\nHello!");
  });

  it("Script works with text #5", () => {
    const cd = transformSource(`
      <Stack>
        <script>
Hi!
Hello!
</script>
        
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("\nHi!\nHello!\n");
  });

  it("Multiple scripts merge #1", () => {
    const cd = transformSource(`
      <Stack>
        <script>Hi!</script>
        <script>Hello!</script>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("Hi!\nHello!");
  });

  it("Multiple scripts merge #2", () => {
    const cd = transformSource(`
      <Stack>
        <script>  Hi!  </script>
        <script>Hello!  </script>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.script).equal("  Hi!  \nHello!  ");
  });

  it("Script works with CompoundComponent", () => {
    const cd = transformSource(`
      <Component name="MyComp">
        <script>  Hi!  </script>
        <script>Hello!  </script>
        <Stack/>
      </Component>
    `) as CompoundComponentDef;
    expect((cd.component as any).type).equal("Fragment");
    expect((cd.component as any).script).equal("  Hi!  \nHello!  ");
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
    expect(collected.vars.a.source).equal("3");
    expect((collected.vars.a.tree as Expression).type).equal("LitE");
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
    expect(collected.vars.a.source).equal("1 < 2");
    expect((collected.vars.a.tree as Expression).type).equal("BinaryE");
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
    expect(collected.vars.a.source).equal("() => Math.floor(c/d)");
    expect((collected.vars.a.tree as Expression).type).equal("ArrowE");
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
    expect(collected.vars.a.source).equal("3");
    expect((collected.vars.a.tree as Expression).type).equal("LitE");
    expect(collected.vars.b.source).equal("() => Math.floor(c/d)");
    expect((collected.vars.b.tree as Expression).type).equal("ArrowE");
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
    expect(collected.functions.a.source).equal("(b, c, d) => { return Math.floor(c/d) }");
    expect((collected.functions.a.tree as Expression).type).equal("ArrowE");
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
    expect(collected.functions.a.source).equal("() => { let x = 3; return x * 2 }");
    expect((collected.functions.a.tree as Expression).type).equal("ArrowE");
  });

  it("Script collect - Multiple function #1", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          function a() { let x = 3; return x * 2 }
          function b(c,d,e) { return c + d + e }\`;
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(Object.keys(collected.functions).length).equal(2);
    expect(collected.functions.a.source).equal("() => { let x = 3; return x * 2 }");
    expect((collected.functions.a.tree as Expression).type).equal("ArrowE");
    expect(collected.functions.b.source).equal("(c, d, e) => { return c + d + e }");
    expect((collected.functions.b.tree as Expression).type).equal("ArrowE");
  });

  it("Script collect - Duplicated function fails", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          function a() {}
          function a() { return Math.floor(c/d); }\`;
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const err = cd.scriptError as Record<string, ModuleErrors[]>;
    expect(Object.keys(err).length).equal(1);
    console.log(JSON.stringify(err, null, 2))
    expect(err["Main"][0].code).equal("W020");
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
    expect(collected.functions.myButton_onClick.source).equal("(eventArgs) => { console.log(allTasks.length) }");
    expect((collected.functions.myButton_onClick.tree as Expression).type).equal("ArrowE");
  });

  it("Script creates Fragment #2", () => {
    const cd = transformSource(`
    <Items items="{['first', 'second', 'third']}">
      <prop name="itemTemplate">
        <script>something</script>
        <Stack>{other}</Stack>
      </prop>
    </Items>
    `) as ComponentDef;
    expect(cd.children).equal(undefined);
    const template = cd.props?.itemTemplate as ComponentDef;
    expect(template.type).equal("Fragment");
    expect(template.script).equal("something");
    expect(template.children!.length).equal(1);
    expect(template.children![0].type).equal("Stack");
  });

  it("Script creates Fragment #1", () => {
    const cd = transformSource(`
    <Items items="{['first', 'second', 'third']}">
      <script>somescript</script>
      <Stack>{uppercaseItem}</Stack>
    </Items>
    `) as ComponentDef;
    expect(cd.children!.length).equal(1);
    const child = cd.children![0] as ComponentDef;
    expect(child.type).equal("Fragment");
    expect(child.script).equal("somescript");
    expect(child.children!.length).equal(1);
    expect(child.children![0].type).equal("Stack");
    expect(child.children![0].children!.length).equal(1);
    const textNode = child.children![0].children![0];
    expect(textNode.props?.value).equal("{uppercaseItem}");  
  });
});

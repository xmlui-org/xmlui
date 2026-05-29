import { describe, expect, it } from "vitest";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import { transformSource } from "./xmlui";

describe("Xmlui transform - standalone imports", () => {
  it("Script with import sets hasUnresolvableImports in sync mode", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          import { foo } from "./bar.xs";
          var a = 1;
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(collected.hasUnresolvableImports).equal(true);
    expect(collected.hasInvalidStatements).equal(false);
    expect(cd.scriptError).toBeUndefined();
    expect(Object.keys(collected.vars).length).equal(1);
    expect(collected.vars.a).toBeDefined();
  });

  it("Script with import and invalid statements sets both flags", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          import { foo } from "./bar.xs";
          console.log("hello");
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(collected.hasUnresolvableImports).equal(true);
    expect(collected.hasInvalidStatements).equal(true);
    expect(cd.scriptError).toBeDefined();
  });

  it("Script with only valid statements has both flags false", () => {
    // --- Act
    const cd = transformSource(`
      <Stack>
        <script>
          var a = 1;
          function b() {}
        </script>
      </Stack>
    `) as ComponentDef;

    // --- Assert
    const collected = cd.scriptCollected!;
    expect(collected.hasUnresolvableImports).equal(false);
    expect(collected.hasInvalidStatements).equal(false);
  });
});

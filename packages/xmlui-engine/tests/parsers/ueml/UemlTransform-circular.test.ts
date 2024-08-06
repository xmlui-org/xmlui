import { describe, it } from "vitest";
import { UemlParser } from "@parsers/ueml/UemlParser";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";

describe("Ueml transform - child elements", () => {
  it("Invalid element name fails #1", () => {
    const source = `
    <App>
      <Stack>
        <script>
          function dummy(){}
        </script>
      </Stack>
      Hello
    </App>
    `;
    const comp = transformSource(source);

    // --- This should fail if there is any circular reference
    JSON.stringify(comp, null, 2);
  });
});

function transformSource(source: string): ComponentDef | CompoundComponentDef | null {
  const parser = new UemlParser(source);
  return parser.transformToComponentDef();
}

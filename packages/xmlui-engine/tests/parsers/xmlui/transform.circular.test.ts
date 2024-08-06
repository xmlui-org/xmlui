import { describe, it } from "vitest";
import { transformSource } from "./xmlui";

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

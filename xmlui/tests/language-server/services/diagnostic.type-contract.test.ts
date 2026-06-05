import { describe, expect, it } from "vitest";
import { Project } from "../../../src/language-server/base/project";
import { getDiagnostics } from "../../../src/language-server/services/diagnostic";
import { mockMetadataProvider } from "../mockData";

describe("language-server diagnostics - type contracts", () => {
  it("includes type-contract diagnostics from the verifier", () => {
    const uri = "Main.xmlui";
    const project = Project.fromFileContets(
      {
        [uri]: `<Button labe="Save" variant="vibrant" />`,
      },
      mockMetadataProvider,
    );

    const diagnostics = getDiagnostics(project, uri);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "xmlui-type-contract",
          code: "id-unknown-prop",
        }),
        expect.objectContaining({
          source: "xmlui-type-contract",
          code: "value-not-in-enum",
        }),
      ]),
    );
  });
});

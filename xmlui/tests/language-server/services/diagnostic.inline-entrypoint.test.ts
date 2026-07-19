import { describe, expect, it } from "vitest";
import { Project } from "../../../src/language-server/base/project";
import { getDiagnostics } from "../../../src/language-server/services/diagnostic";
import { mockMetadataProvider } from "../mockData";

describe("language-server diagnostics - inline entrypoint components", () => {
  it("allows top-level inline components in Main.xmlui", () => {
    const uri = "Main.xmlui";
    const project = Project.fromFileContets(
      {
        [uri]: `
          <Component name="InlinePart">
            <Text value="inline" />
          </Component>
          <App>
            <InlinePart />
          </App>
        `,
      },
      mockMetadataProvider,
    );

    const diagnostics = getDiagnostics(project, uri);

    expect(diagnostics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "U035" })]),
    );
  });

  it("allows top-level inline components in App.xmlui", () => {
    const uri = "App.xmlui";
    const project = Project.fromFileContets(
      {
        [uri]: `
          <Component name="InlinePart">
            <Text value="inline" />
          </Component>
          <App>
            <InlinePart />
          </App>
        `,
      },
      mockMetadataProvider,
    );

    const diagnostics = getDiagnostics(project, uri);

    expect(diagnostics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "U035" })]),
    );
  });

  it("rejects mixed roots in component files", () => {
    const uri = "components/InlinePart.xmlui";
    const project = Project.fromFileContets(
      {
        [uri]: `
          <Component name="InlinePart">
            <Text value="inline" />
          </Component>
          <App />
        `,
      },
      mockMetadataProvider,
    );

    const diagnostics = getDiagnostics(project, uri);

    expect(diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "U035" })]),
    );
  });

  it("reports multiple non-Component app roots in Main.xmlui", () => {
    const uri = "Main.xmlui";
    const project = Project.fromFileContets(
      {
        [uri]: `
          <Component name="InlinePart">
            <Text value="inline" />
          </Component>
          <Text value="first" />
          <Text value="second" />
        `,
      },
      mockMetadataProvider,
    );

    const diagnostics = getDiagnostics(project, uri);

    expect(diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "U035" })]),
    );
  });
});

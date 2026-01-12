import { LintDiagKind, lint } from "../../../src/parsers/xmlui-parser/lint";
import { describe, expect, it } from "vitest";
import type { ComponentDef, ComponentMetadata } from "../../../src";
import { transformSource } from "./xmlui";
import { MetadataProvider } from "../../../src/language-server/services/common/metadata-utils";

describe("lint", () => {
  describe("props", () => {
    const buttonWithPropX = new MetadataProvider({
      Button: {
        props: {
          x: null,
        },
        events: {
          click: {
            description: "event on click",
          },
        },
      },
    });

    it("detects unrecognised prop", () => {
      const component = transformSource(`<Button something="non-existant" />`) as ComponentDef;

      const diags = lint({ component, metadataProvider: buttonWithPropX });
      expect(diags[0].kind).toEqual(LintDiagKind.UnrecognisedProp);
    });

    it("detects unrecognised prop deeply nested", () => {
      const component = transformSource(
        `<A><Button something="non-existant" /></A>`,
      ) as ComponentDef;

      const diags = lint({ component, metadataProvider: buttonWithPropX });
      expect(diags[0].kind).toEqual(LintDiagKind.UnrecognisedProp);
    });

    it("detects unrecognised prop in My namespace", () => {
      const component = transformSource(
        `<A xmlns:My="app-ns"><Button something="non-existant" /></A>`,
      ) as ComponentDef;

      const diags = lint({ component, metadataProvider: buttonWithPropX });
      expect(diags[0].kind).toEqual(LintDiagKind.UnrecognisedProp);
    });

    it("detects unrecognised prop in Xmlui namespace", () => {
      const component = transformSource(
        `<A xmlns:Xmlui="core-ns"><Xmlui:Button something="non-existant" /></A>`,
      ) as ComponentDef;
      const diags = lint({ component, metadataProvider: buttonWithPropX });
      expect(diags[0].kind).toEqual(LintDiagKind.UnrecognisedProp);
    });

    it("recognises layout prop", () => {
      const component = transformSource(`<Button width="anything" />`) as ComponentDef;
      const diags = lint({ component, metadataProvider: buttonWithPropX });
      expect(diags).toHaveLength(0);
    });

    it("recognises layout prop with sm viewport size", () => {
      const component = transformSource(`<Button width-sm="anything" />`) as ComponentDef;
      const diags = lint({ component, metadataProvider: buttonWithPropX });
      expect(diags).toHaveLength(0);
    });

    it("recognises click event", () => {
      const component = transformSource(`<Button onClick="anything" />`) as ComponentDef;
      const diags = lint({ component, metadataProvider: buttonWithPropX });
      expect(diags).toHaveLength(0);
    });
  });
});

import { describe, expect, it } from "vitest";

import type { ComponentDef } from "../../src/abstractions/ComponentDefs";
import { checkXmlUiMarkup, type MetadataHandler } from "../../src/components-core/markup-check";

describe("markup-check", () => {
  const registeredComponents = new Set(["AppHeader", "HStack", "Text"]);
  const metadataHandler: MetadataHandler = {
    componentRegistered: (componentName) => registeredComponents.has(componentName),
    getComponentProps: (componentName) => {
      if (componentName === "AppHeader") {
        return {
          profileMenuTemplate: { valueType: "ComponentDef" },
          titleTemplate: { valueType: "ComponentDef" },
        };
      }
      return {};
    },
    getComponentEvents: () => ({}),
    acceptArbitraryProps: () => true,
    getComponentValidator: () => null,
  };

  it("visits components nested inside ComponentDef properties", () => {
    const root: ComponentDef = {
      type: "AppHeader",
      props: {
        profileMenuTemplate: {
          type: "HStack",
          children: [{ type: "InvoiceAvatar" }],
        },
      },
    };

    const errors = checkXmlUiMarkup(root, [], metadataHandler);

    expect(errors).toEqual([
      expect.objectContaining({
        name: "HStack",
        code: "M001",
        args: ["InvoiceAvatar"],
      }),
    ]);
  });

  it("visits components nested inside ComponentDef property arrays", () => {
    const root: ComponentDef = {
      type: "AppHeader",
      props: {
        titleTemplate: [{ type: "Text" }, { type: "InvoiceAvatar" }],
      },
    };

    const errors = checkXmlUiMarkup(root, [], metadataHandler);

    expect(errors).toEqual([
      expect.objectContaining({
        name: "AppHeader",
        code: "M001",
        args: ["InvoiceAvatar"],
      }),
    ]);
  });
});

import { describe, expect, it } from "vitest";

import {
  contractFromMetadata,
  contractRegistryToLspMetadata,
  createContractRegistry,
} from "../../src/compiler/contracts";
import {
  AppMd,
  ButtonMd,
  StackMd,
  TextMd,
  createMetadata,
  dComponent,
} from "../../src/component-core/metadata";

describe("component metadata compatibility shape", () => {
  it("preserves optimizer hints supplied through createMetadata", () => {
    const metadata = createMetadata({
      props: {},
      events: {},
      optimization: {
        isImplicitContainerByDefault: true,
        unstableChildInjectedVars: ["$item"],
      },
    });

    expect(metadata).toMatchObject({
      isImplicitContainerByDefault: true,
      unstableChildInjectedVars: ["$item"],
    });
    expect(metadata).not.toHaveProperty("optimization");
  });

  it("keeps representative old-shaped metadata for first migration components", () => {
    expect(AppMd).toMatchObject({
      status: "stable",
      excludeBehaviors: ["tooltip", "animation", "label"],
      unstableChildInjectedVars: ["$pathname", "$routeParams", "$queryParams", "$linkInfo"],
    });
    expect(AppMd.props).toHaveProperty("layout");
    expect(AppMd.props?.logoTemplate.valueType).toBe("ComponentDef");
    expect(AppMd.defaultThemeVars).toHaveProperty("backgroundColor-content-App");
    expect(AppMd.defaultThemeVars).toHaveProperty("maxWidth-content-App");
    expect(AppMd.defaultThemeVars).not.toHaveProperty("backgroundColor-App");

    expect(ButtonMd.props?.enabled).toMatchObject({
      valueType: "boolean",
      defaultValue: true,
    });
    expect(ButtonMd.parts).toHaveProperty("icon");
    expect(ButtonMd.events?.click.signature).toBe("click(event: MouseEvent): void");
    expect(ButtonMd.events).toHaveProperty("contextMenu");
    expect(ButtonMd.defaultThemeVars).toHaveProperty("padding-Button");

    expect(TextMd.props?.variant).toMatchObject({
      valueType: "string",
      isStrictEnum: true,
    });
    expect(TextMd.events).toHaveProperty("contextMenu");
    expect(TextMd.apis).toHaveProperty("hasOverflow");

    expect(StackMd.props?.orientation).toMatchObject({
      availableValues: ["horizontal", "vertical"],
      isStrictEnum: true,
    });
    expect(StackMd.props?.hoverContainer.isInternal).toBe(true);
    expect(StackMd.apis).toHaveProperty("scrollToTop");
    expect(StackMd.events).toHaveProperty("mounted");
  });
});

describe("compiler contract derivation from component metadata", () => {
  it("derives props, events, templates, context variables, and APIs", () => {
    const contract = contractFromMetadata(AppMd, {
      name: "App",
      declarations: { local: true, global: true },
      eventAttributes: {
        ready: "onReady",
      },
    });

    expect(contract).toMatchObject({
      name: "App",
      kind: "builtin",
      allowsChildren: true,
      declarations: { local: true, global: true },
    });
    expect(contract.props).toHaveProperty("layout");
    expect(contract.props).toHaveProperty("padding");
    expect(contract.events.ready).toEqual({ name: "ready", attributeName: "onReady" });
    expect(contract.events.messageReceived).toEqual({
      name: "messageReceived",
      attributeName: "onMessageReceived",
    });
    expect(contract.templates).toEqual({
      logoTemplate: { name: "logoTemplate" },
    });
    expect(contract.contextVariables).toHaveProperty("$routeParams");
  });

  it("uses old ComponentDef property metadata to derive template contracts", () => {
    const metadata = createMetadata({
      props: {
        itemTemplate: dComponent("Template for one item."),
      },
      events: {},
    });
    const contract = contractFromMetadata(metadata, { name: "Items" });

    expect(contract.props).toHaveProperty("itemTemplate");
    expect(contract.templates).toEqual({
      itemTemplate: { name: "itemTemplate" },
    });
  });

  it("feeds derived metadata contracts into the existing LSP metadata path", () => {
    const registry = createContractRegistry({
      extensionComponents: [
        contractFromMetadata(ButtonMd, {
          name: "CompatButton",
          eventAttributes: {
            click: "onClick",
          },
        }),
      ],
    });
    const metadata = contractRegistryToLspMetadata(registry);

    expect(metadata.components).toContainEqual(
      expect.objectContaining({
        name: "CompatButton",
        props: expect.arrayContaining(["enabled", "label", "padding"]),
        events: ["click", "contextMenu", "gotFocus", "lostFocus"],
        templates: [],
        contextVariables: [],
      }),
    );
  });
});

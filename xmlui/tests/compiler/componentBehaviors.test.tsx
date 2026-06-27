import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { contractFromMetadata } from "../../src/compiler/contracts";
import {
  ButtonMd,
  TextMd,
  attachBehaviors,
  canBehaviorAttachToComponent,
  collectedBehaviorMetadata,
  createMetadata,
  dEnabled,
} from "../../src/component-core";
import { PartMd } from "../../src/components/Part/Part";

describe("component behavior metadata compatibility", () => {
  it("evaluates old behavior conditions against component metadata", () => {
    expect(canBehaviorAttachToComponent(
      collectedBehaviorMetadata.tooltip,
      TextMd,
      "Text",
    )).toBe(true);
    expect(canBehaviorAttachToComponent(
      collectedBehaviorMetadata.tooltip,
      { nonVisual: true },
      "DataSource",
    )).toBe(false);
    expect(canBehaviorAttachToComponent(
      collectedBehaviorMetadata.label,
      ButtonMd,
      "Button",
    )).toBe(false);
    expect(canBehaviorAttachToComponent(
      collectedBehaviorMetadata.label,
      createMetadata({
        props: {
          enabled: dEnabled(),
        },
        events: {},
      }),
      "TextBox",
    )).toBe(true);
  });

  it("adds behavior props to migrated component contracts without renderer code", () => {
    const metadata = createMetadata({
      props: {
        value: {
          description: "Current value.",
          valueType: "string",
        },
      },
      events: {},
    });
    const contract = contractFromMetadata(metadata, {
      name: "CompatInput",
    });

    expect(contract.props).toHaveProperty("tooltip");
    expect(contract.props).toHaveProperty("tooltipMarkdown");
    expect(contract.props).toHaveProperty("label");
    expect(contract.props).toHaveProperty("variant");
  });

  it("honors excludeBehaviors when deriving behavior props", () => {
    const contract = contractFromMetadata(ButtonMd, {
      name: "Button",
    });
    const appContract = contractFromMetadata(
      { excludeBehaviors: ["tooltip"], props: {}, events: {} },
      { name: "App" },
    );

    expect(contract.props).toHaveProperty("tooltip");
    expect(contract.props).toHaveProperty("label");
    expect(contract.props).not.toHaveProperty("labelPosition");
    expect(appContract.props).not.toHaveProperty("tooltip");
  });

  it("keeps visual behavior props off non-visual component contracts", () => {
    const contract = contractFromMetadata(PartMd, {
      name: "Part",
    });

    expect(contract.props).toHaveProperty("when");
    expect(contract.props).not.toHaveProperty("tooltip");
    expect(contract.props).not.toHaveProperty("label");
    expect(contract.props).not.toHaveProperty("variant");
  });

  it("attaches only condition behaviors to non-visual metadata", () => {
    expect(canBehaviorAttachToComponent(
      collectedBehaviorMetadata.when,
      PartMd,
      "Part",
    )).toBe(true);
    expect(canBehaviorAttachToComponent(
      collectedBehaviorMetadata.tooltip,
      PartMd,
      "Part",
    )).toBe(false);
    expect(canBehaviorAttachToComponent(
      collectedBehaviorMetadata.animation,
      PartMd,
      "Part",
    )).toBe(false);
  });
});

describe("component behavior attachment", () => {
  it("wraps tooltip, label, and variant behavior after base rendering", () => {
    const metadata = createMetadata({
      props: {
        enabled: dEnabled(),
      },
      events: {},
    });
    const node = attachBehaviors(
      {
        componentName: "CompatInput",
        metadata,
        props: {
          label: "Name",
          tooltip: "Helpful text",
          variant: "quiet",
        },
      },
      <input data-base-renderer="yes" />,
    );

    expect(renderToStaticMarkup(<>{node}</>)).toContain('data-xmlui-behavior="tooltip"');
    expect(renderToStaticMarkup(<>{node}</>)).toContain('title="Helpful text"');
    expect(renderToStaticMarkup(<>{node}</>)).toContain('data-xmlui-behavior="label"');
    expect(renderToStaticMarkup(<>{node}</>)).toContain('data-xmlui-part="label"');
    expect(renderToStaticMarkup(<>{node}</>)).toContain('data-xmlui-variant="quiet"');
    expect(renderToStaticMarkup(<>{node}</>)).toContain('data-base-renderer="yes"');
  });

  it("does not attach behavior when metadata excludes it or no trigger prop is present", () => {
    const node = attachBehaviors(
      {
        componentName: "App",
        metadata: {
          excludeBehaviors: ["tooltip"],
          props: {},
          events: {},
        },
        props: {
          tooltip: "Hidden",
        },
      },
      <div data-base-renderer="yes" />,
    );
    const quietNode = attachBehaviors(
      {
        componentName: "Text",
        metadata: TextMd,
        props: {},
      },
      <span>Text</span>,
    );

    expect(renderToStaticMarkup(<>{node}</>)).not.toContain("tooltip");
    expect(renderToStaticMarkup(<>{quietNode}</>)).not.toContain("data-xmlui-behavior");
  });
});

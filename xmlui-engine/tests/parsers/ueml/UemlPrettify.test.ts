import { describe, expect, it } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { UemlHelper, UemlSerializationOptions } from "@parsers/ueml/UemlHelper";
import { UemlNode } from "@parsers/ueml/ueml-tree";

describe("Ueml - prettify", () => {
  it("simple component", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
    });

    // --- Assert
    expect(out).equal(`<Stack/>`);
  });

  it("multiple props #1", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "100%",
        height: "100%",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
    });

    // --- Assert
    expect(out).equal(`<Stack width="100%" height="100%"/>`);
  });
  
  it("multiple props #2", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "This is a very long width",
        height: "This is a very long height",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
      lineLength: 40,
    });

    // --- Assert
    expect(out).equal(`<Stack
  width="This is a very long width"
  height="This is a very long height"/>`);
  });

  it("multiple props #3", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "This is a very long width",
        height: "This is a very long height",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
      lineLength: 40,
      breakClosingTag: true
    });

    // --- Assert
    expect(out).equal(`<Stack
  width="This is a very long width"
  height="This is a very long height"
/>`);
  });

  it("multiple props #4", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "This is a very long width",
        height: "This is a very long height",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
      lineLength: 40,
      useSpaceBeforeClose: true
    });

    // --- Assert
    expect(out).equal(`<Stack
  width="This is a very long width"
  height="This is a very long height" />`);
  });

  it("multiple props #5", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "This is a very long width",
        height: "This is a very long height",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
      lineLength: 120,
      useSpaceBeforeClose: true
    });

    // --- Assert
    expect(out).equal(`<Stack width="This is a very long width" height="This is a very long height" />`);
  });

  it("multiple props #6", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "This is a very long width",
        height: "This is a very long height",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
      lineLength: 120,
      useSpaceBeforeClose: false
    });

    // --- Assert
    expect(out).equal(`<Stack width="This is a very long width" height="This is a very long height"/>`);
  });

  it("multiple props #7", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "This is a very long width",
        height: "This is a very long height",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
      lineLength: 120,
      breakClosingTag: true
    });

    // --- Assert
    expect(out).equal(`<Stack width="This is a very long width" height="This is a very long height"/>`);
  });

  it("force quotes #1", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "100%",
        height: "100%",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
      useQuotes: true
    });

    // --- Assert
    expect(out).equal(`<Stack width="100%" height="100%"/>`);
  });

  it("force quotes #2", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      props: {
        width: "100%",
        height: "100%",
      },
    };

    // --- Act
    const out = serialize(compDef, {
      useQuotes: true
    });

    // --- Assert
    expect(out).equal(`<Stack width="100%" height="100%"/>`);
  });

  it("nested components #1", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      children: [
        {
          type: "Button"
        },
        {
          type: "Text"
        },
        {
          type: "Button"
        },
      ]
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
    });

    // --- Assert
    expect(out).equal(`<Stack>
  <Button/>
  <Text/>
  <Button/>
</Stack>`);
  });

  it("nested components #2", () => {
    // --- Arrange
    const compDef: ComponentDef = {
      type: "Stack",
      children: [
        {
          type: "Button",
          children: [
            {
              type: "Icon",
              props: {
                iconName: "my-icon"
              },
              events: {
                click: `{This is a long event with multiple lines}
  {This is a long event with multiple lines}
    {This is a long event with multiple lines}
      {This is a long event with multiple lines}
        {This is a long event with multiple lines}`
              }
            }
          ]
        },
        {
          type: "Text"
        },
        {
          type: "Button"
        },
      ]
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
    });

    // --- Assert
    expect(out).equal(`<Stack>
  <Button>
    <Icon iconName="my-icon">
      <event
        name="click"
        value="{This is a long event with multiple lines}
  {This is a long event with multiple lines}
    {This is a long event with multiple lines}
      {This is a long event with multiple lines}
        {This is a long event with multiple lines}"/>
    </Icon>
  </Button>
  <Text/>
  <Button/>
</Stack>`);
  });

  it("text #1", () => {
    // --- Arrange
    const nodes: UemlNode = {
      type: "UemlElement",
      name: "Stack",
      text: "This is a short text"
    };
    const xh = new UemlHelper();

    // --- Act
    const out = xh.serialize(nodes, {
      prettify: true
    });

    // --- Assert
    expect(out).equal(`<Stack>This is a short text</Stack>`);
  });

  it("text #2", () => {
    // --- Arrange
    const nodes: UemlNode = {
      type: "UemlElement",
      name: "Stack",
      text: "This is a long text. This is a long text. This is a long text. This is a long text."
    };
    const xh = new UemlHelper();

    // --- Act
    const out = xh.serialize(nodes, {
      prettify: true,
      lineLength: 40
    });

    // --- Assert
    expect(out).equal(`<Stack>
  This is a long text. This is a long text. This is a long text. This is a long text.
</Stack>`);
  });

  it("compound components #1", () => {
    // --- Arrange
    const compDef: CompoundComponentDef = {
      name: "AddNewChannelRow",
      component: {
        type: "Button",
        props: {
          paddingLeft: "1.5rem",
          marginBottom: "0.5rem",
          icon: "plus",
          variant: "ghost",
        },
        children: [
          {
            type: "Text",
            props: {
              paddingLeft: "1rem",
              value: "{$props.label}",
            },
            children: "{$props.label}",
          },
        ] as unknown as ComponentDef[],
        events: {
          click: "$events.click()",
        },
      },
    };

    // --- Act
    const out = serialize(compDef, {
      prettify: true,
    });

    // --- Assert
    expect(out).equal(`<Component name="AddNewChannelRow">
  <Button
    paddingLeft="1.5rem"
    marginBottom="0.5rem"
    icon="plus"
    variant="ghost">
    <event name="click" value="$events.click()"/>
    <Text paddingLeft="1rem" value="{$props.label}" children="{$props.label}"/>
  </Button>
</Component>`);
  });


});

function serialize(component: ComponentDef | CompoundComponentDef, options?: UemlSerializationOptions): string {
  const xh = new UemlHelper();
  const node = xh.transformComponentDefinition(component) as UemlNode;
  return xh.serialize(node, options);
}

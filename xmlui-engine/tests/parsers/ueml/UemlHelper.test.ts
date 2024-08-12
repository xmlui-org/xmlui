import { describe, expect, it } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { UemlHelper } from "@parsers/ueml/UemlHelper";
import { UemlNode } from "@parsers/ueml/ueml-tree";

describe("UemlHelper", () => {
  it("serialize empty", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize([]);

    // --- Assert
    expect(res).equal("");
  });

  it("serialize comment", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlComment",
      text: "Comment",
    });

    // --- Assert
    expect(res).equal("<!--Comment-->");
  });

  it("serialize element #1", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
    });

    // --- Assert
    expect(res).equal("<Text/>");
  });

  it("serialize element #2", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      attributes: [
        {
          type: "UemlAttribute",
          value: "hi",
          name: "value",
        },
      ],
    });

    // --- Assert
    expect(res).equal(`<Text value="hi"/>`);
  });

  it("serialize element #3", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      attributes: [
        {
          type: "UemlAttribute",
          value: "hi",
          name: "value",
        },
      ],
    });

    // --- Assert
    expect(res).equal(`<Text value="hi"/>`);
  });

  it("serialize element #4", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      attributes: [
        {
          type: "UemlAttribute",
          value: "hi",
          name: "value",
          preserveQuotes: true,
        },
      ],
    });

    // --- Assert
    expect(res).equal(`<Text value="hi"/>`);
  });

  it("serialize element with namespace #1", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      namespace: "ns"
    });

    // --- Assert
    expect(res).equal("<ns:Text/>");
  });

  it("serialize element with namespace #2", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      namespace: "ns",
      attributes: [
        {
          type: "UemlAttribute",
          value: "hi",
          name: "value",
        },
      ],
    });

    // --- Assert
    expect(res).equal(`<ns:Text value="hi"/>`);
  });

  it("serialize element with namespace #3", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      namespace: "ns",
      attributes: [
        {
          type: "UemlAttribute",
          value: "hi",
          name: "value",
        },
      ],
    });

    // --- Assert
    expect(res).equal(`<ns:Text value="hi"/>`);
  });

  it("serialize element with namespace #4", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      namespace: "ns",
      attributes: [
        {
          type: "UemlAttribute",
          value: "hi",
          name: "value",
          preserveQuotes: true,
        },
      ],
    });

    // --- Assert
    expect(res).equal(`<ns:Text value="hi"/>`);
  });

  it("serialize element with namespace #5", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      namespace: "ns",
      attributes: [
        {
          type: "UemlAttribute",
          value: "hi",
          name: "value",
          namespace: "attrNs",
          preserveQuotes: true,
        },
      ],
    });

    // --- Assert
    expect(res).equal(`<ns:Text attrNs:value="hi"/>`);
  });

  it("serialize element with namespace #6", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      namespace: "ns",
      attributes: [
        {
          type: "UemlAttribute",
          value: "hi, there!",
          name: "value",
          namespace: "attrNs",
          preserveQuotes: true,
        },
      ],
    });

    // --- Assert
    expect(res).equal(`<ns:Text attrNs:value="hi, there!"/>`);
  });

  it("serialize text #1", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      text: "hi",
    });

    // --- Assert
    expect(res).equal(`<Text>hi</Text>`);
  });

  it("serialize text #1", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      text: "h&i",
    });

    // --- Assert
    expect(res).equal(`<Text>"h&i"</Text>`);
  });

  it("serialize text #2", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      text: "<>'\"",
    });

    // --- Assert
    expect(res).equal("<Text>`<>'\"`</Text>");
  });

  it("serialize text #3", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const res = xh.serialize({
      type: "UemlElement",
      name: "Text",
      text: "<>'\"",
      preserveSpaces: true,
    });

    // --- Assert
    expect(res).equal(`<Text>\`<>'"\`</Text>`);
  });

  it("serializeSimpleComponent #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal("<XButton/>");
  });

  it("serializeSimpleComponent #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        label: "Click me!",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton label="Click me!"/>`);
  });

  it("serializeSimpleComponent uid", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"/>`);
  });

  it("serializeSimpleComponent uid with id", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      props: {
        id: "myId",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><prop id="myId"/></XButton>`);
  });

  it("serializeSimpleComponent uid with id", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      props: {
        id: "myId",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><prop id="myId"/></XButton>`);
  });

  it("serializeSimpleComponent when", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      when: "{!isConnected}",
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton when="{!isConnected}"/>`);
  });

  it("serializeSimpleComponent when with prop when", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      when: "{!isConnected}",
      props: {
        when: "then"
      }
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton when="{!isConnected}"><prop when="then"/></XButton>`);
  });

  it("serializeSimpleComponent testId", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      testId: "myXButton",
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton testId="myXButton"/>`);
  });

  it("serializeSimpleComponent testId with prop testid", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      testId: "myXButton",
      props: {
        testId: "test"
      }
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton testId="myXButton"><prop testId="test"/></XButton>`);
  });

  it("serializeSimpleComponent string prop", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        label: "Click me!",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton label="Click me!"/>`);
  });

  it("serializeSimpleComponent bool prop (true)", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: true,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop" value="{true}"/></XButton>`);
  });

  it("serializeSimpleComponent bool prop (false)", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: false,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop" value="{false}"/></XButton>`);
  });

  it("serializeSimpleComponent number prop", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: 123,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop" value="{123}"/></XButton>`);
  });

  it("serializeSimpleComponent null prop", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: null,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop"/></XButton>`);
  });

  it("serializeSimpleComponent undefined prop", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: undefined,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton/>`);
  });

  it("serializeSimpleComponent list prop #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: ["Hi", "There"],
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop"><item value="Hi"/><item value="There"/></prop></XButton>`);
  });

  it("serializeSimpleComponent list prop #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: ["Hi", { a: "There", b: "!" }],
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop"><item value="Hi"/><item><field name="a" value="There"/><field name="b" value="!"/></item></prop></XButton>`);
  });

  it("serializeSimpleComponent list prop #3", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: ["Hi", "There  "],
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, {
      preferTextToValue: true
    }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop"><item>Hi</item><item>"There  "</item></prop></XButton>`);
  });

  it("serializeSimpleComponent list prop #4", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: ["  Hi", "There"],
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop"><item value="  Hi"/><item value="There"/></prop></XButton>`);
  });

  it("serializeSimpleComponent list prop #5", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: ["Hi", "The\rre"],
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal('<XButton><prop name="isTop"><item value="Hi"/><item value="The\r' + 're"/></prop></XButton>');
  });

  it("serializeSimpleComponent list with null", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: ["Hi", null, "There"],
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal('<XButton><prop name="isTop"><item value="Hi"/><item/><item value="There"/></prop></XButton>');
  });

  it("serializeSimpleComponent list with empty string item", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: ["Hi", "", "There"],
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal('<XButton><prop name="isTop"><item value="Hi"/><item value=""/><item value="There"/></prop></XButton>');
  });

  it("serializeSimpleComponent plain object prop #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: { a: "Hello", b: "World" },
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop"><field name="a" value="Hello"/><field name="b" value="World"/></prop></XButton>`);
  });

  it("serializeSimpleComponent plain object prop #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: { a: "Hello", b: 123 },
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><prop name="isTop"><field name="a" value="Hello"/><field name="b" value="{123}"/></prop></XButton>`);
  });

  it("serializeSimpleComponent nested object prop #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: { a: "Hello", b: { c: "world", d: "!" } },
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(
        `<XButton><prop name="isTop"><field name="a" value="Hello"/><field name="b"><field name="c" value="world"/><field name="d" value="!"/></field></prop></XButton>`);
  });

  it("serializeSimpleComponent nested object prop #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        isTop: { a: { a1: 123, a2: true }, b: { c: "world", d: "!" } },
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(
        `<XButton><prop name="isTop"><field name="a"><field name="a1" value="{123}"/><field name="a2" value="{true}"/></field><field name="b"><field name="c" value="world"/><field name="d" value="!"/></field></prop></XButton>`);
  });

  it("serializeSimpleComponent CData prop #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      props: {
        label: "Click\r\nme!",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal('<XButton id="myXButton" label="Click\r\nme!"/>');
  });

  it("serializeSimpleComponent CData prop #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      props: {
        label: "Click\r\nme!",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, { preserveLineBreaks: false }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal('<XButton id="myXButton" label="Click\r\nme!"/>');
  });

  it("serializeSimpleComponent CData prop #3", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      props: {
        label: "'<>&\"",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal('<XButton id="myXButton" label=`\'<>&"`/>');
  });

  it("serializeSimpleComponent CData prop #4", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      props: {
        label: "'\"<>&'",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, { preserveSpecialChars: false }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal('<XButton id="myXButton" label=`\'\"<>&\'`/>');
  });

  it("serializeSimpleComponent string event", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      events: {
        click: "doIt()",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><event name="click" value="doIt()"/></XButton>`);
  });

  it("serializeSimpleComponent text event", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      events: {
        click: "\rdoIt();\rnow()\r",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal('<XButton id="myXButton"><event name="click" value="\r' + "doIt();\r" + "now()\r" + '"/></XButton>');
  });

  it("serializeSimpleComponent bool var #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: true,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar" value="{true}"/></XButton>`);
  });

  it("serializeSimpleComponent bool var #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: false,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar" value="{false}"/></XButton>`);
  });

  it("serializeSimpleComponent bool var #3", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: true,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, {
      preferTextToValue: true
    }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar">{true}</var></XButton>`);
  });

  it("serializeSimpleComponent bool var #4", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: false,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, {
      preferTextToValue: true
    }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar">{false}</var></XButton>`);
  });

  it("serializeSimpleComponent number var #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: 123,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar" value="{123}"/></XButton>`);
  });

  it("serializeSimpleComponent number var #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: 123,
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, {
      preferTextToValue: true
    }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar">{123}</var></XButton>`);
  });

  it("serializeSimpleComponent string var #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: "abc",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar" value="abc"/></XButton>`);
  });

  it("serializeSimpleComponent string var #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: "abc",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, {
      preferTextToValue: true
    }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar">abc</var></XButton>`);
  });

  it("serializeSimpleComponent string var #3", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: "  abc def  ",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, {
      preferTextToValue: true
    }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar">"  abc def  "</var></XButton>`);
  });

  it("serializeSimpleComponent string var #4", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: "  abc def  ",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar" value="  abc def  "/></XButton>`);
  });

  it("serializeSimpleComponent object vars", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      vars: {
        myVar: { a: "Hi", b: "There" },
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><var name="myVar"><field name="a" value="Hi"/><field name="b" value="There"/></var></XButton>`);
  });

  it("serializeSimpleComponent string api", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      api: {
        myApi: "() => doIt()",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><api name="myApi" value="() => doIt()"/></XButton>`);
  });

  it("serializeSimpleComponent object api #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      api: {
        myApi: { a: "Hi", b: "There" },
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><api name="myApi"><field name="a" value="Hi"/><field name="b" value="There"/></api></XButton>`);
  });

  it("serializeSimpleComponent object api #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      api: {
        myApi: { a: "Hi", b: "There" },
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def, {
      preferTextToValue: true
    }) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><api name="myApi"><field name="a">Hi</field><field name="b">There</field></api></XButton>`);
  });

  it("serializeSimpleComponent loaders", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      loaders: [
        {
          type: "XLoader",
          uid: "ld1",
        },
        {
          type: "XLoader",
          uid: "ld2",
        },
      ],
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(
      `<XButton id="myXButton"><loaders><XLoader id="ld1"/><XLoader id="ld2"/></loaders></XButton>`
    );
  });

  it("serializeSimpleComponent uses", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      uid: "myXButton",
      uses: ["a", "b"],
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton id="myXButton"><uses>a</uses><uses>b</uses></XButton>`);
  });

  it("serializeSimpleComponent single child #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      children: [
        {
          type: "XText",
          uid: "myText",
        },
      ],
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton><XText id="myText"/></XButton>`);
  });

  it("serializeSimpleComponent single child #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        value: "hi",
      },
      children: [
        {
          type: "XText",
          uid: "myText",
        },
      ],
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(`<XButton value="hi"><XText id="myText"/></XButton>`);
  });

  it("serializeSimpleComponent single child #3", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        value: { a: "hi", b: "!" },
      },
      children: [
        {
          type: "XText",
          uid: "myText",
        },
      ],
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(
        `<XButton><prop name="value"><field name="a" value="hi"/><field name="b" value="!"/></prop><XText id="myText"/></XButton>`);
  });

  it("serializeSimpleComponent multiple children #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: ComponentDef = {
      type: "XButton",
      props: {
        value: { a: "hi", b: "!" },
      },
      children: [
        {
          type: "XText",
          uid: "myText",
        },
        {
          type: "XIcon",
          props: {
            name: "down",
          },
        },
      ],
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(
        `<XButton><prop name="value"><field name="a" value="hi"/><field name="b" value="!"/></prop><XText id="myText"/><XIcon name="down"/></XButton>`);
  });

  it("serializeCompoundComponent #1", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: CompoundComponentDef = {
      name: "MyCompound",
      component: {
        type: "XButton",
        props: {
          value: { a: "hi", b: "!" },
        },
        children: [
          {
            type: "XText",
            uid: "myText",
          },
          {
            type: "XIcon",
            props: {
              name: "down",
            },
          },
        ],
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(
      `<Component name="MyCompound"><XButton><prop name="value"><field name="a" value="hi"/><field name="b" value="!"/></prop><XText id="myText"/><XIcon name="down"/></XButton></Component>`
    );
  });

  it("serializeCompoundComponent #2", () => {
    // --- Arrange
    const xh = new UemlHelper();
    const def: CompoundComponentDef = {
      name: "MyCompound",
      component: {
        type: "XButton",
        props: {
          value: { a: "hi", b: "!" },
        },
      },
      api: {
        myApi: "hello",
      },
    };

    // --- Act
    const node = xh.transformComponentDefinition(def) as UemlNode;

    // --- Assert
    expect(node.type).equal("UemlElement");
    expect(xh.serialize(node)).equal(
      `<Component name="MyCompound"><XButton><prop name="value"><field name="a" value="hi"/><field name="b" value="!"/></prop></XButton><api name="myApi" value="hello"/></Component>`
    );
  });
});

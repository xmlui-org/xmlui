import { describe, expect, it } from "vitest";
import { UemlHelper } from "@parsers/ueml/UemlHelper";
import { UemlParser } from "@parsers/ueml/UemlParser";

describe("UemlHelper - Object transform", () => {
  it("transformObject #1", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const obj = {
      name: "Chat App",
      globals: {
        apiUrl: "/api",
        errorResponseTransform: {
          code: "{$response.reasonCode}",
          details: "{$response.message}",
        },
      },
    };
    const res = xh.transformObject(obj)!;
    const out = xh.serialize(res, {
      prettify: true,
    });

    // --- Assert
    expect(out).equal(`<field name="name" value="Chat App"/>
<field name="globals">
  <field name="apiUrl" value="/api"/>
  <field name="errorResponseTransform">
    <field name="code" value="{$response.reasonCode}"/>
    <field name="details" value="{$response.message}"/>
  </field>
</field>`);
  });

  it("transformObject #2", () => {
    // --- Arrange
    const xh = new UemlHelper();

    // --- Act
    const obj = {
      "name": "Simple Binding Expression",
      "logo": null,
      "globals": {},
      "resources": {},
      "themes": {}
    };
    const res = xh.transformObject(obj)!;
    const out = xh.serialize(res, {
      prettify: true,
    });

    // --- Assert
    expect(out).equal(`<field name="name" value="Simple Binding Expression"/>
<field name="logo"/>
<field name="globals" value="{{}}"/>
<field name="resources" value="{{}}"/>
<field name="themes" value="{{}}"/>`);
  });

  it("parseObject #1", () => {
    // --- Arrange
    const source = `
      <field name="name" value="Chat App"/><field name="globals">
      <field name="apiUrl" value="/api"/>
        <field name="errorResponseTransform">
          <field name="code" value="{$response.reasonCode}"/>
          <field name="details" value="{$response.message}"/>
        </field>
     </field>`;
    const parser = new UemlParser(source);

    // --- Act
    const obj = parser.transformToObject();

    // --- Assert
    expect(obj).deep.equal({
      name: "Chat App",
      globals: {
        apiUrl: "/api",
        errorResponseTransform: {
          code: "{$response.reasonCode}",
          details: "{$response.message}",
        },
      },
    });
  });
});

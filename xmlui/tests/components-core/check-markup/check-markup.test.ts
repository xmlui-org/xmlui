import { describe, expect, it } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { checkXmlUiMarkup } from "@components-core/markup-check";
import { createTestMetadataHandler } from "../test-metadata-handler";
import { layoutOptionKeys } from "@components-core/descriptorHelper";
import { xmlUiMarkupToComponent } from "@components-core/xmlui-parser";
import { metadataHash } from "./metadata-hash";
import { viewportSizeNames } from "@components/abstractions";

const metadataHandler = createTestMetadataHandler(metadataHash);

describe("Markup checks", () => {
  it("Registered component works", () => {
    // --- Arrange
    const source = "<Button />";
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Unregistered component fails", () => {
    // --- Arrange
    const source = "<Dummy />";
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Root");
    expect(error.code).equal("M001");
    expect(error.message).toContain("'Dummy'");
  });

  it("Valid component ID works", () => {
    // --- Arrange
    const source = `<Button id="myId" />`;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  const invalidIdCases = ["123ert", "-dashed", "{myId}"];
  invalidIdCases.forEach((id) => {
    it(`Invalid component ID fails: ${id}`, () => {
      // --- Arrange
      const source = `<Button id="${id}" />`;
      const def = transformSource(source) as ComponentDef;

      // --- Act
      const errors = checkXmlUiMarkup(def, [], metadataHandler);

      // --- Assert
      expect(errors.length).equal(1);
      const error = errors[0];
      expect(error.name).equal("Button");
      expect(error.code).equal("M002");
      expect(error.message).toContain("Button");
      expect(error.message).toContain(`'${id}'`);
    });
  });

  it("Duplicated component ID fails", () => {
    // --- Arrange
    const source = `
      <Stack id="myId">
        <Button id="myId" />
      </Stack>
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M003");
    expect(error.message).toContain("'myId'");
  });

  it("Component IDs are scoped", () => {
    // --- Arrange
    const source = `
      <Stack>
        <Button id="myId" />
      </Stack>
    `;
    const compoundCompSource = `
      <Component name="MyComp">
        <Button id="myId" />
      </Component>
    `;
    const def = transformSource(source) as ComponentDef;
    const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [compoundDef], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Unknown component property fails", () => {
    // --- Arrange
    const source = `
      <Button dummy="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M005");
    expect(error.message).toContain("'dummy'");
  });

  it("Registered component property works", () => {
    // --- Arrange
    const source = `
      <Button label="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Arbitrary property with Theme works", () => {
    // --- Arrange
    const source = `
      <Theme my-theme-var="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Property value parsing fails #1", () => {
    // --- Arrange
    const source = `
      <Button label="{some" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M006");
    expect(error.message).toContain("'label'");
    expect(error.message).toContain("Unclosed");
  });

  it("Property value parsing fails #2", () => {
    // --- Arrange
    const source = `
      <Button label="{/123}" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M006");
    expect(error.message).toContain("'label'");
    expect(error.message).toContain("Unexpected token");
  });

  layoutOptionKeys.forEach((key) => {
    it(`Layout property '${key}' works`, () => {
      // --- Arrange
      const source = `
        <Button ${key}="something" />
      `;
      const def = transformSource(source) as ComponentDef;

      // --- Act
      const errors = checkXmlUiMarkup(def, [], metadataHandler);

      // --- Assert
      expect(errors.length).equal(0);
    });
  });

  viewportSizeNames.forEach((bp) => {
    layoutOptionKeys.forEach((key) => {
      it(`Layout property '${key}-${bp}' works`, () => {
        // --- Arrange
        const source = `
        <Button ${key}-${bp}="something" />
      `;
        const def = transformSource(source) as ComponentDef;

        // --- Act
        const errors = checkXmlUiMarkup(def, [], metadataHandler);

        // --- Assert
        expect(errors.length).equal(0);
      });
    });
  });

  const invalidCompoundIdCases = ["C123:", "C-dashed", "C{myId}"];
  invalidCompoundIdCases.forEach((id) => {
    it(`Invalid reusable component name fails: ${id}`, () => {
      // --- Arrange
      const compoundCompSource = `
        <Component name="${id}">
          <Button />
        </Component>
      `;
      const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

      // --- Act
      const errors = checkXmlUiMarkup(null, [compoundDef], metadataHandler);

      // --- Assert
      expect(errors.length).equal(1);
      const error = errors[0];
      expect(error.name).equal("Component");
      expect(error.code).equal("M007");
      expect(error.message).toContain(`'${id}'`);
    });
  });

  it("Component name must not be: 'Component'", () => {
    // --- Arrange
    const compoundCompSource = `
      <Component name="Component">
        <Button />
      </Component>
    `;
    const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(null, [compoundDef], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Component");
    expect(error.code).equal("M008");
    expect(error.message).toContain(`'Component'`);
  });

  Object.keys(metadataHash).forEach((key) => {
    it(`Component name must not be: '${key}'`, () => {
      // --- Arrange
      const compoundCompSource = `
        <Component name="${key}">
          <Button />
        </Component>
      `;
      const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

      // --- Act
      const errors = checkXmlUiMarkup(null, [compoundDef], metadataHandler);

      // --- Assert
      expect(errors.length).equal(1);
      const error = errors[0];
      expect(error.name).equal("Component");
      expect(error.code).equal("M009");
      expect(error.message).toContain(`'${key}'`);
    });
  });

  it("Component name must be unique", () => {
    // --- Arrange
    const compoundCompSource = `
      <Component name="MyComp">
        <Button />
      </Component>
    `;
    const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(null, [compoundDef, compoundDef], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Component");
    expect(error.code).equal("M010");
    expect(error.message).toContain(`'MyComp'`);
  });

  it("Unknown component event fails", () => {
    // --- Arrange
    const source = `
      <Button onDummy="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M011");
    expect(error.message).toContain("'dummy'");
  });

  it("Registered component event works", () => {
    // --- Arrange
    const source = `
      <Button onClick="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Event value parsing fails #1", () => {
    // --- Arrange
    const source = `
      <Button onClick="some?" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M012");
    expect(error.message).toContain("'click'");
  });

  it("Event with APICall fails #2", () => {
    // --- Arrange
    const source = `
      <Button>
        <event name="click">
          <Dummy />
        </event>
      </Button>
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M001");
    expect(error.message).toContain("'Dummy'");
  });

  it("Custom validation fails in devMode", () => {
    // --- Arrange
    const source = `
      <Button label="q - should not start with q" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler, true);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M013");
    expect(error.message).toContain("q");
  });

  it("Custom validation does not trigget in prod mode", () => {
    // --- Arrange
    const source = `
      <Button label="q - should not start with q" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Visits List's itemTemplate", () => {
    // --- Arrange
    const source = `
    <List>
      <property name="itemTemplate">
        <Button some="dummy" />
      </property>
    </List>
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
  });

});

function transformSource(source: string): ComponentDef | CompoundComponentDef | null {
  return xmlUiMarkupToComponent(source).component;
}

import { describe, expect, it, assert } from "vitest";
import { UemlParser } from "@parsers/ueml/UemlParser";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { UemlElement } from "@parsers/ueml/source-tree";

describe("Ueml transform - errors", () => {
  it("Multiple definitions fail #1", () => {
    try {
      const nodes: UemlElement[] = [
        {
          type: "Element",
          id: "Stack",
        } as UemlElement,
        {
          type: "Element",
          id: "Stack",
        } as UemlElement,
      ];
      const parser = new UemlParser("");
      parser.transformToComponentDef(nodes);
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T001")).equal(true);
    }
  });

  it("Missing name in compound component", () => {
    try {
      transformSource("<Component />")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T003")).equal(true);
    }
  });

  it("Invalid name in compound component #1", () => {
    try {
      transformSource("<Component name=''/>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T004")).equal(true);
    }
  });

  it("Invalid name in compound component #2", () => {
    try {
      transformSource("<Component name='alma'/>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T004")).equal(true);
    }
  });

  it("Compound child in compound component", () => {
    try {
      transformSource("<Component name='MyComp'><Component /></Component>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T006")).equal(true);
    }
  });

  it("Invalid attribute in compound component", () => {
    try {
      transformSource("<Component name='MyComp' blabla='123'><Stack/></Component>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T021")).equal(true);
    }
  });

  it("Event attribute starts with 'on'", () => {
    try {
      transformSource("<Stack><event name='onClick' /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T008")).equal(true);
    }
  });

  it("Invalid child node name in a component", () => {
    try {
      transformSource("<Stack><blabla /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  it("'uses' is invalid in a compound component", () => {
    try {
      transformSource("<Component name='MyComp'><Stack/><uses /></Component>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  it("'loaders' is invalid in a compound component", () => {
    try {
      transformSource("<Component name='MyComp'><Stack/><loaders /></Component>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  it("'hints' is invalid in a simple component", () => {
    try {
      transformSource("<Stack><hints /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  it("Invalid attribute in prop", () => {
    try {
      transformSource("<Stack><prop name='my' blabal='123'/></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T011")).equal(true);
    }
  });

  it("Invalid attribute in event", () => {
    try {
      transformSource("<Stack><event name='my' blabal='123'/></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T011")).equal(true);
    }
  });

  it("Invalid attribute in var", () => {
    try {
      transformSource("<Stack><var name='my' blabal='123'/></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T011")).equal(true);
    }
  });

  it("Invalid attribute in api", () => {
    try {
      transformSource("<Stack><prop name='my' blabal='123'/></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T011")).equal(true);
    }
  });

  it("Name required in prop #1", () => {
    try {
      transformSource("<Stack><prop /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("Name required in prop #2", () => {
    try {
      transformSource("<Stack><prop name='' /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("Name required in event #1", () => {
    try {
      transformSource("<Stack><event /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("Name required in event #2", () => {
    try {
      transformSource("<Stack><event name='' /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("Name required in var #1", () => {
    try {
      transformSource("<Stack><var /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("Name required in var #2", () => {
    try {
      transformSource("<Stack><var name='' /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("Name required in api #1", () => {
    try {
      transformSource("<Stack><api /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("Name required in api #2", () => {
    try {
      transformSource("<Stack><api name='' /></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("A 'uses' must have value #1", () => {
    try {
      transformSource("<Stack><uses value=''/></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T015")).equal(true);
    }
  });

  it("A 'uses' must have value #2", () => {
    try {
      transformSource("<Stack><uses/></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T015")).equal(true);
    }
  });

  it("A 'value' can have 'field' and 'item' child", () => {
    try {
      transformSource("<Stack><prop name='my'><dummy /></prop></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T016")).equal(true);
    }
  });

  it("Cannot mix field and item children #1", () => {
    try {
      transformSource("<Stack><prop name='my'><field name='my' /><item value='3'/></prop></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T017")).equal(true);
    }
  });

  it("Cannot mix field and item children #2", () => {
    try {
      transformSource("<Stack><prop name='my'><item value='3'/><field name='my' /></prop></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T017")).equal(true);
    }
  });

  it("Item cannot have a 'name' attribute", () => {
    try {
      transformSource("<Stack><prop name='my'><item name='my' value='3'/></prop></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T018")).equal(true);
    }
  });

  it("Value attribute is required #1", () => {
    try {
      transformSource("<Stack><prop name='my' value/></Stack>")
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("U010")).equal(true);
    }
  });
});

function transformSource(source: string): ComponentDef | CompoundComponentDef | null {
  const parser = new UemlParser(source);
  return parser.transformToComponentDef();
}

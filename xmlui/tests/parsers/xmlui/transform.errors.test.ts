import { describe, expect, it, assert } from "vitest";
import { transformSource } from "./xmlui";

describe("Ueml transform - errors", () => {

  it("Missing name in compound component", () => {
    try {
      transformSource("<Component />");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T003");
    }
  });

  it("Invalid name in compound component #1", () => {
    try {
      transformSource("<Component name=''/>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T004");
    }
  });

  it("Invalid name in compound component #2", () => {
    try {
      transformSource("<Component name='alma'/>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T004");
    }
  });

  it("Compound child in compound component", () => {
    try {
      transformSource("<Component name='MyComp'><Component /></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T006");
    }
  });

  it("Invalid attribute in compound component", () => {
    try {
      transformSource("<Component name='MyComp' blabla='123'><Stack/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T021");
    }
  });

  it("Event attribute starts with 'on'", () => {
    try {
      transformSource("<Stack><event name='onClick' /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T008");
    }
  });

  it("'uses' is invalid in a compound component", () => {
    try {
      transformSource("<Component name='MyComp'><Stack/><uses /></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T009");
    }
  });

  it("'loaders' is invalid in a compound component", () => {
    try {
      transformSource("<Component name='MyComp'><Stack/><loaders /></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T009");
    }
  });

  it("Invalid attribute in prop", () => {
    try {
      transformSource("<Stack><property name='my' blabal='123'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T011");
    }
  });

  it("Invalid attribute in event", () => {
    try {
      transformSource("<Stack><event name='my' blabal='123'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T011");
    }
  });

  it("Invalid attribute in var", () => {
    try {
      transformSource("<Stack><variable name='my' blabal='123'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T011");
    }
  });

  it("Invalid attribute in api", () => {
    try {
      transformSource("<Stack><property name='my' blabal='123'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T011");
    }
  });

  it("Name required in prop #1", () => {
    try {
      transformSource("<Stack><property /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T012");
    }
  });

  it("Name required in prop #2", () => {
    try {
      transformSource("<Stack><property name='' /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T012");
    }
  });

  it("Name required in event #1", () => {
    try {
      transformSource("<Stack><event /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T012");
    }
  });

  it("Name required in event #2", () => {
    try {
      transformSource("<Stack><event name='' /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T012");
    }
  });

  it("Name required in var #1", () => {
    try {
      transformSource("<Stack><variable/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T012");
    }
  });

  it("Name required in var #2", () => {
    try {
      transformSource("<Stack><variable name='' /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T012");
    }
  });

  it("Name required in method #1", () => {
    try {
      transformSource("<Stack><method /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T012");
    }
  });

  it("Name required in api #2", () => {
    try {
      transformSource("<Stack><method name='' /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T012");
    }
  });

  it("A 'uses' must have value #1", () => {
    try {
      transformSource("<Stack><uses value=''/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T015");
    }
  });

  it("A 'uses' must have value #2", () => {
    try {
      transformSource("<Stack><uses/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T015");
    }
  });

  it("A 'value' can have 'field' and 'item' child", () => {
    try {
      transformSource("<Stack><property name='my'><dummy /></property></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T016");
    }
  });

  it("Cannot mix field and item children #1", () => {
    try {
      transformSource("<Stack><property name='my'><field name='my' /><item value='3'/></property></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T017");
    }
  });

  it("Cannot mix field and item children #2", () => {
    try {
      transformSource("<Stack><property name='my'><item value='3'/><field name='my' /></property></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T017");
    }
  });

  it("Item cannot have a 'name' attribute", () => {
    try {
      transformSource("<Stack><property name='my'><item name='my' value='3'/></property></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("T018");
    }
  });
});

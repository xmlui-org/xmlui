import { describe, expect, it, assert } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "../../../src/abstractions/ComponentDefs";
import { transformSource } from "./xmlui";

describe("Xmlui transform", () => {
  it("Empty code results in error", () => {
    try {
      transformSource("");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("U035");
    }
  });

  it("Empty component #1", () => {
    const cd = transformSource("<Stack />") as ComponentDef;
    expect(cd.type).equal("Stack");
  });

  it("Empty component #2", () => {
    const cd = transformSource("<!-- This is a stack --><Stack />") as ComponentDef;
    expect(cd.type).equal("Stack");
  });

  it("Compound component needs a name #1", () => {
    try {
      transformSource("<Component><Stack/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("U024");
    }
  });

  it("Compound component needs a name #2", () => {
    try {
      transformSource("<Component name='haho'><Stack/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("U025");
    }
  });

  it("Compound component needs a component child #1", () => {
    try {
      transformSource("<Component name='MyComp'><!-- comment--></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("U036");
    }
  });

  it("Compound component needs a component child #2", () => {
    try {
      transformSource("<Component name='MyComp'></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("U036");
    }
  });

  it("Compound component cannot nest another one", () => {
    try {
      transformSource("<Component name='MyComp'><Component name='Other'/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).includes("U021");
    }
  });
});

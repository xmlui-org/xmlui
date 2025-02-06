import { describe, expect, it, assert } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { transformSource } from "./xmlui";

describe("Ueml transform", () => {
  it("Empty code results in error", () => {
    try {
      transformSource("");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T001")).equal(true);
    }
  });

  it.todo("Unmatched tag names", () => {
    try {
      const cd = transformSource("<Stack></NotStack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T002")).equal(true);
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
      expect(err.toString().includes("T003")).equal(true);
    }
  });

  it("Compound component needs a name #2", () => {
    try {
      transformSource("<Component name='haho'><Stack/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T004")).equal(true);
    }
  });

  it("Compound component needs a component child #1", () => {
    const cd = transformSource("<Component name='MyComp'><!-- comment--></Component>") as CompoundComponentDef;
    expect((cd.component as ComponentDef).type).equal("TextNode");
    expect(((cd.component as ComponentDef).props as any).value).equal("");
  });

  it("Compound component needs a component child #2", () => {
    const cd = transformSource("<Component name='MyComp'></Component>") as CompoundComponentDef;
    expect((cd.component as ComponentDef).type).equal("TextNode");
    expect(((cd.component as ComponentDef).props as any).value).equal("");
  });

  it("Compound component cannot nest another one", () => {
    try {
      transformSource("<Component name='MyComp'><Component name='Other'/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T006")).equal(true);
    }
  });
});

import { describe, expect, it, assert } from "vitest";
import { UemlParser } from "@parsers/ueml/UemlParser";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";

describe("Ueml transform - attributes", () => {
  it("Invalid attribute name fails #1", () => {
    try {
      transformSource("<Stack prop.sub.sub='a' />");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("T007")).equal(true);
    }
  });

  it("Invalid attribute name fails #2", () => {
    try {
      transformSource("<Stack prop.='a' />");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("T007")).equal(true);
    }
  });

  it("Invalid attribute name fails #3", () => {
    try {
      transformSource("<Component name='MyStack' invaAttr='a'><Stack /></Component>");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("T021")).equal(true);
    }
  });

  it("Invalid attribute name fails #4", () => {
    try {
      transformSource("<Component invaAttr='a' name='MyStack'><Stack /></Component>");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("T021")).equal(true);
    }
  });

  it("uid works", () => {
    const cd = transformSource("<Stack id='myStack' />") as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.uid).equal("myStack");
  });

  it("testId works", () => {
    const cd = transformSource("<Stack testId='myStack' />") as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.testId).equal("myStack");
  });

  it("when works", () => {
    const cd = transformSource("<Stack when='isOpen' />") as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.when).equal("isOpen");
  });
});

function transformSource(source: string): ComponentDef | CompoundComponentDef | null {
  const parser = new UemlParser(source);
  return parser.transformToComponentDef();
}

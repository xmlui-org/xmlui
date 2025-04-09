import { describe, expect, it, assert } from "vitest";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import { ButtonMd } from "../../../src/components/Button/Button";
import { transformSource } from "./xmlui";
import { StackMd } from "../../../src/components/Stack/Stack";
import { ParsedPropertyValue } from "../../../src/abstractions/scripting/Compilation";

describe("Xmlui transform - attributes", () => {
  it("Invalid attribute name fails #1", () => {
    try {
      transformSource("<Stack prop.sub.sub='a' />");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T007")).equal(true);
    }
  });

  it("Invalid attribute name fails #2", () => {
    try {
      transformSource("<Stack prop.='a' />");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T007")).equal(true);
    }
  });

  it("Invalid attribute name fails #3", () => {
    try {
      transformSource(
        "<Component name='MyStack' invaAttr='a'><Stack /></Component>",
      );
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T021")).equal(true);
    }
  });

  it("Invalid attribute name fails #4", () => {
    try {
      transformSource(
        "<Component invaAttr='a' name='MyStack'><Stack /></Component>",
      );
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T021")).equal(true);
    }
  });

  it("key-only attr is true", () => {
    const cd = transformSource("<Button enabled />") as ComponentDef<typeof ButtonMd>;
    const value = (cd.props as any).enabled as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("true");
  });

  it("quoteless attr", () => {
    const cd = transformSource("<Stack orientation=horizontal/>") as ComponentDef<typeof StackMd>;
    const value = (cd.props as any).orientation as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("horizontal");
  });

  it("uid works", () => {
    const cd = transformSource("<Stack id='myStack' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.uid).equal("myStack");
  });

  it("testId works", () => {
    const cd = transformSource("<Stack testId='myStack' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.testId).equal("myStack");
  });

  it("when works", () => {
    const cd = transformSource("<Stack when='isOpen' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.when).equal("isOpen");
  });
});

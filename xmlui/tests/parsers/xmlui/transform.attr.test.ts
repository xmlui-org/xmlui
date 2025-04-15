import { describe, expect, it, assert } from "vitest";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import { ButtonMd } from "../../../src/components/Button/Button";
import { transformSource } from "./xmlui";
import { StackMd } from "../../../src/components/Stack/Stack";
import { ParsedPropertyValue } from "../../../src/abstractions/scripting/Compilation";
import { Identifier, T_IDENTIFIER } from "../../../src/abstractions/scripting/ScriptingSourceTree";

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

  it("uid works", () => {
    const cd = transformSource("<Stack id='myStack' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.uid).equal("myStack");
  });

  it("testId works", () => {
    const cd = transformSource("<Stack testId='myStack' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    const value = cd.testId as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("myStack");
  });

  it("when works #1", () => {
    const cd = transformSource("<Stack when='isOpen' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    const value = (cd.when) as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].literal).toEqual("isOpen");
  });

  it("when works #2", () => {
    const cd = transformSource("<Stack when='{isOpen}' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    const value = (cd.when) as ParsedPropertyValue;
    expect(value.__PARSED).toEqual(true);
    expect(value.parseId).toBeGreaterThan(0);
    expect(value.segments.length).toEqual(1);
    expect(value.segments[0].expr.type).toEqual(T_IDENTIFIER);
    expect((value.segments[0].expr as Identifier).name).toEqual("isOpen");
  });
});

import { describe, expect, it, assert } from "vitest";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import type { ButtonMd } from "../../../src/components/Button/Button";
import { transformSource } from "./xmlui";
import type { StackMd } from "../../../src/components/Stack/Stack";

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
      transformSource("<Component name='MyStack' invaAttr='a'><Stack /></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("U027")).equal(true);
    }
  });

  it("Invalid attribute name fails #4", () => {
    try {
      transformSource("<Component invaAttr='a' name='MyStack'><Stack /></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("U027")).equal(true);
    }
  });

  it("key-only attr is true", () => {
    const cd = transformSource("<Button enabled />") as ComponentDef<typeof ButtonMd>;
    expect(cd.props.enabled).equal("true");
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
    expect(cd.props ?? {}).not.toHaveProperty("when");
    expect(cd.when).equal("isOpen");
  });

  it("when-md responds attribute is parsed correctly", () => {
    const cd = transformSource("<Stack when-md='true' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.props ?? {}).not.toHaveProperty("when-md");
    expect(cd.responsiveWhen?.md).equal("true");
    expect(cd.responsiveWhen?.xs).equal(undefined);
  });

  it("multiple when-* attributes are parsed correctly", () => {
    const cd = transformSource('<Stack when-xs="true" when-lg="{isVisible}" />') as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.props ?? {}).not.toHaveProperty("when-xs");
    expect(cd.props ?? {}).not.toHaveProperty("when-lg");
    expect(cd.responsiveWhen?.xs).equal("true");
    expect(cd.responsiveWhen?.lg).equal("{isVisible}");
    expect(cd.responsiveWhen?.md).equal(undefined);
  });

  it("invalid when-* suffix lands in props", () => {
    const cd = transformSource("<Stack when-zz='false' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.responsiveWhen).equal(undefined);
    expect(cd.props?.["when-zz"]).equal("false");
  });

  it("when-* and when coexist", () => {
    const cd = transformSource('<Stack when="true" when-md="false" />') as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.when).equal("true");
    expect(cd.responsiveWhen?.md).equal("false");
    expect(cd.props ?? {}).not.toHaveProperty("when");
    expect(cd.props ?? {}).not.toHaveProperty("when-md");
  });

  it("uses works with 1 value", () => {
    const cd = transformSource("<Stack uses='isOpen' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.props ?? {}).not.toHaveProperty("uses");
    expect(cd.uses).deep.equal(["isOpen"]);
  });

  it("uses works with multiple values", () => {
    const cd = transformSource("<Stack uses='isOpen, isClosed' />") as ComponentDef<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.props ?? {}).not.toHaveProperty("uses");
    expect(cd.uses).deep.equal(["isOpen", "isClosed"]);
  });
});

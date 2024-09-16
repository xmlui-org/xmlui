import { describe, expect, it, assert } from "vitest";
import type { ComponentDefNew } from "@abstractions/ComponentDefs";
import { ButtonMd } from "@components/Button/Button";
import { transformSource } from "./xmlui";
import { StackMd } from "@components/Stack/Stack";

describe("Ueml transform - attributes", () => {
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
    const cd = transformSource("<Button enabled />") as ComponentDefNew<typeof ButtonMd>;
    expect(cd.props.enabled).equal("true");
  });

  it("quoteless attr", () => {
    const cd = transformSource("<Stack orientation=horizontal/>") as ComponentDefNew<typeof StackMd>;
    expect(cd.props.orientation).equal("horizontal");
  });

  it("uid works", () => {
    const cd = transformSource("<Stack id='myStack' />") as ComponentDefNew<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.uid).equal("myStack");
  });

  it("testId works", () => {
    const cd = transformSource("<Stack testId='myStack' />") as ComponentDefNew<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.testId).equal("myStack");
  });

  it("when works", () => {
    const cd = transformSource("<Stack when='isOpen' />") as ComponentDefNew<typeof StackMd>;
    expect(cd.type).equal("Stack");
    expect(cd.when).equal("isOpen");
  });
});

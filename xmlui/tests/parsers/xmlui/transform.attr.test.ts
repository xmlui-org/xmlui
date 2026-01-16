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
      expect(err.toString().includes("T021")).equal(true);
    }
  });

  it("Invalid attribute name fails #4", () => {
    try {
      transformSource("<Component invaAttr='a' name='MyStack'><Stack /></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T021")).equal(true);
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

  describe("attribute pre-parsing", () => {
    it("event is pre-parsed", () => {
      const cd = transformSource(`<Stack onClick="count++" />`) as ComponentDef<typeof StackMd>;
      expect(cd.events.click).toMatchObject({ __PARSED: true });
    });

    it("prop is pre-parsed", () => {
      const cd = transformSource(`<Stack a="hi {name}" />`) as ComponentDef;
      expect(cd.props.a).toMatchObject({
        __PARSED: true,
        parts: [{ type: "literal", value: "hi " }, { type: "expression" }],
      });
    });

    it("var is pre-parsed", () => {
      const cd = transformSource(`<Stack var.a="hi {name}" />`) as ComponentDef<typeof StackMd>;
      expect(cd.vars.a).toMatchObject({
        __PARSED: true,
        parts: [{ type: "literal", value: "hi " }, { type: "expression" }],
      });
    });

    it("when is pre-parsed", () => {
      const cd = transformSource(`<Stack when="{isOpen}" />`) as ComponentDef<typeof StackMd>;
      expect(cd.when).toMatchObject({
        __PARSED: true,
        parts: [{ type: "expression" }],
      });
    });

    it("content is pre-parsed", () => {
      const cd = transformSource(`<Stack>hello {a} there!</Stack>`) as ComponentDef<typeof StackMd>;
      const child = cd.children![0] as ComponentDef;
      expect(child.type).equal("TextNode");
      expect(child.props.value).toMatchObject({
        __PARSED: true,
        parts: [
          { type: "literal", value: "hello " },
          { type: "expression" },
          { type: "literal", value: " there!" },
        ],
      });
    });

    it("helper content (item) is pre-parsed", () => {
      const cd = transformSource(
        `<Stack><property name="foo"><item>hello {a}</item></property></Stack>`,
      ) as ComponentDef<typeof StackMd>;
      expect(cd.props.foo).toHaveLength(1);
      expect(cd.props.foo[0]).toMatchObject({
        __PARSED: true,
        parts: [{ type: "literal", value: "hello " }, { type: "expression" }],
      });
    });
  });
});

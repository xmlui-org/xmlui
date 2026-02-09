import { describe, expect, it, assert } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "../../../src/abstractions/ComponentDefs";
import { transformSource } from "./xmlui";

describe("Xmlui transform - <global> helper tag", () => {
  describe("Basic <global> element parsing in root", () => {
    it("global with name/value attr works in root #1", () => {
      const cd = transformSource(
        "<Stack><global name='myGlobal' value='123'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.myGlobal).equal("123");
    });

    it("global with name/value attr works in root #2", () => {
      const cd = transformSource(`
        <Stack>
          <global name='count' value='42'/>
          <global name='userName' value="'John'"/>
        </Stack>
      `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.count).equal("42");
      expect(cd.globalVars!.userName).equal("'John'");
    });

    it("global with name and text works", () => {
      const cd = transformSource(
        "<Stack><global name='myGlobal'>123</global></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.myGlobal).equal("123");
    });

    it("multiple globals with name and text", () => {
      const cd = transformSource(`
        <Stack>
          <global name='count'>42</global>
          <global name="userName">Alice</global>
        </Stack>
      `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.count).equal("42");
      expect(cd.globalVars!.userName).equal("Alice");
    });

    it("global with only name results null", () => {
      const cd = transformSource("<Stack><global name='myGlobal'/></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.myGlobal).equal(null);
    });

    it("global with complex expression", () => {
      const cd = transformSource(
        "<Stack><global name='computed' value='{6 * 7}'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.computed).equal("{6 * 7}");
    });

    it("global fails with missing name attribute", () => {
      try {
        transformSource("<Stack><global/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("global fails with empty name attribute", () => {
      try {
        transformSource("<Stack><global name=''/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });
  });

  describe("<global> in compound components", () => {
    it("global in compound component definition", () => {
      const cd = transformSource(
        "<Component name='Counter'><global name='totalClicks' value='{0}'/><Button/></Component>",
      ) as CompoundComponentDef;
      expect(cd.name).equal("Counter");
      // Fragment created because global + component
      expect(cd.component.type).equal("Fragment");
      expect(cd.component.globalVars!.totalClicks).equal("{0}");
    });

    it("multiple globals in compound component", () => {
      const cd = transformSource(`
        <Component name='SharedState'>
          <global name='value1' value='100'/>
          <global name='value2' value='200'/>
          <Stack/>
        </Component>
      `) as CompoundComponentDef;
      expect(cd.name).equal("SharedState");
      // Fragment created because globals + component
      expect(cd.component.type).equal("Fragment");
      expect(cd.component.globalVars!.value1).equal("100");
      expect(cd.component.globalVars!.value2).equal("200");
    });

    it("global with Fragment wrapper in compound component", () => {
      const cd = transformSource(`
        <Component name='Multi'>
          <global name='sharedCount' value='{0}'/>
          <Button/>
          <Text/>
        </Component>
      `) as CompoundComponentDef;
      expect(cd.name).equal("Multi");
      expect(cd.component.type).equal("Fragment");
      expect(cd.component.globalVars!.sharedCount).equal("{0}");
    });
  });

  describe("<global> with <variable> combination", () => {
    it("both global and var in same component", () => {
      const cd = transformSource(`
        <Stack>
          <global name='globalCount' value='{0}'/>
          <variable name='localCount' value='{0}'/>
        </Stack>
      `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.globalCount).equal("{0}");
      expect(cd.vars!.localCount).equal("{0}");
    });

    it("global and var in compound component", () => {
      const cd = transformSource(`
        <Component name='StatefulWidget'>
          <global name='widgetCount' value='{0}'/>
          <variable name='localState' value='{0}'/>
          <Button/>
        </Component>
      `) as CompoundComponentDef;
      expect(cd.name).equal("StatefulWidget");
      expect(cd.component.globalVars!.widgetCount).equal("{0}");
      expect(cd.component.vars!.localState).equal("{0}");
    });
  });

  describe("<global> with different value types", () => {
    it("global with string value", () => {
      const cd = transformSource(
        "<Stack><global name='name' value=\"'John'\"/></Stack>",
      ) as ComponentDef;
      expect(cd.globalVars!.name).equal("'John'");
    });

    it("global with number value", () => {
      const cd = transformSource(
        "<Stack><global name='age' value='{42}'/></Stack>",
      ) as ComponentDef;
      expect(cd.globalVars!.age).equal("{42}");
    });

    it("global with boolean value", () => {
      const cd = transformSource(
        "<Stack><global name='isActive' value='{true}'/></Stack>",
      ) as ComponentDef;
      expect(cd.globalVars!.isActive).equal("{true}");
    });

    it("global with object value", () => {
      const cd = transformSource(
        "<Stack><global name='config' value=\"{{theme: 'dark'}}\"/></Stack>",
      ) as ComponentDef;
      expect(cd.globalVars!.config).equal("{{theme: 'dark'}}");
    });

    it("global with array value", () => {
      const cd = transformSource(
        "<Stack><global name='items' value='{[1, 2, 3]}'/></Stack>",
      ) as ComponentDef;
      expect(cd.globalVars!.items).equal("{[1, 2, 3]}");
    });
  });

  describe("Multiple <global> declarations", () => {
    it("global becomes array when declared multiple times", () => {
      const cd = transformSource(
        "<Stack><global name='myGlobal' value='123'/><global name='myGlobal' value='456'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.myGlobal).deep.equal(["123", "456"]);
    });

    it("three globals with same name create array", () => {
      const cd = transformSource(`
        <Stack>
          <global name='items' value='1'/>
          <global name='items' value='2'/>
          <global name='items' value='3'/>
        </Stack>
      `) as ComponentDef;
      expect(cd.globalVars!.items).deep.equal(["1", "2", "3"]);
    });
  });

  describe("Edge cases", () => {
    it("global with whitespace in text value", () => {
      const cd = transformSource(
        "<Stack><global name='text'>  hello world  </global></Stack>",
      ) as ComponentDef;
      // Text is preserved as-is with whitespace
      expect(cd.globalVars!.text).equal(" hello world ");
    });

    it("empty global element", () => {
      const cd = transformSource(
        "<Stack><global name='empty'></global></Stack>",
      ) as ComponentDef;
      expect(cd.globalVars!.empty).equal(null);
    });

    it("global with CDATA value", () => {
      const cd = transformSource(
        "<Stack><global name='data'><![CDATA[some data]]></global></Stack>",
      ) as ComponentDef;
      expect(cd.globalVars!.data).equal("some data");
    });
  });
});

// NOTE: Tests below are for Step 2 (global.* attribute syntax) - not yet implemented
/*
describe("Xmlui transform - global.* attribute syntax", () => {
  describe("Basic global.* attribute parsing", () => {
    it("global.* attribute works in root", () => {
      const cd = transformSource("<Stack global.count='{42}'/>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.count).equal("{42}");
    });

    it("multiple global.* attributes in root", () => {
      const cd = transformSource(
        "<Stack global.count='{0}' global.userName=\"'John'\"/>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.globalVars!.count).equal("{0}");
      expect(cd.globalVars!.userName).equal("'John'");
    });

    it("global.* in compound component", () => {
      const cd = transformSource(
        "<Component name='Counter' global.totalClicks='{0}'><Button/></Component>",
      ) as CompoundComponentDef;
      expect(cd.name).equal("Counter");
      expect(cd.component.globalVars!.totalClicks).equal("{0}");
    });

    it("multiple global.* in compound component", () => {
      const cd = transformSource(
        "<Component name='State' global.x='{1}' global.y='{2}'><Stack/></Component>",
      ) as CompoundComponentDef;
      expect(cd.name).equal("State");
      expect(cd.component.globalVars!.x).equal("{1}");
      expect(cd.component.globalVars!.y).equal("{2}");
    });
  });

  describe("global.* with var.* combination", () => {
    it("both global.* and var.* in same component", () => {
      const cd = transformSource(
        "<Stack global.globalCount='{0}' var.localCount='{0}'/>",
      ) as ComponentDef;
      expect(cd.globalVars!.globalCount).equal("{0}");
      expect(cd.vars!.localCount).equal("{0}");
    });

    it("global.* and var.* in compound component", () => {
      const cd = transformSource(
        "<Component name='Widget' global.shared='{100}' var.local='{0}'><Button/></Component>",
      ) as CompoundComponentDef;
      expect(cd.component.globalVars!.shared).equal("{100}");
      expect(cd.component.vars!.local).equal("{0}");
    });
  });

  describe("Mixed <global> and global.* syntax", () => {
    it("mix element and attribute syntax", () => {
      const cd = transformSource(`
        <Stack global.attrGlobal='{1}'>
          <global name='elemGlobal' value='{2}'/>
        </Stack>
      `) as ComponentDef;
      expect(cd.globalVars!.attrGlobal).equal("{1}");
      expect(cd.globalVars!.elemGlobal).equal("{2}");
    });

    it("mix in compound component", () => {
      const cd = transformSource(`
        <Component name='Mixed' global.attr1='{10}'>
          <global name='elem1' value='{20}'/>
          <Button/>
        </Component>
      `) as CompoundComponentDef;
      expect(cd.component.globalVars!.attr1).equal("{10}");
      expect(cd.component.globalVars!.elem1).equal("{20}");
    });
  });
});
*/

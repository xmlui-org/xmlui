import { describe, expect, it, assert } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "../../../src/abstractions/ComponentDefs";
import { transformSource } from "./xmlui";
import type {
  ExpressionStatement,
  Identifier,
  Statement,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_EXPRESSION_STATEMENT,
  T_IDENTIFIER,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Xmlui transform - child elements", () => {
  it("Comments ignored, whitespace collapsed", () => {
    const cd = transformSource(
      "<H1>  <!-- comment -->  <!-- --><!-- -->     text here</H1>",
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect((cd.children![0].props! as any).value).equal(" text here");
  });

  it("Comments ignored ws between words collapsed", () => {
    const cd = transformSource("<H1>hi  <!-- comment -->  there</H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect((cd.children![0].props! as any).value).equal("hi there");
  });

  it("Comments ignored between words", () => {
    const cd = transformSource("<H1>hi<!-- comment -->there</H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect((cd.children![0].props! as any).value).equal("hithere");
  });

  it("string literal as child #1", () => {
    const cd = transformSource("<H1>'hi   '    </H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect((cd.children![0].props! as any).value).equal("hi ");
  });

  it("string literal as child #2", () => {
    const cd = transformSource("<H1>    'hi   '</H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect((cd.children![0].props! as any).value).equal("hi ");
  });

  it("string literal as child #3", () => {
    const cd = transformSource('<Stack> "123 ""abc"   </Stack>') as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect((cd.children![0].props! as any).value).equal(' "123 ""abc" ');
  });

  it("CData as child", () => {
    const cd = transformSource("<H1><![CDATA[hi]]></H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNodeCData");
    expect((cd.children![0].props! as any).value).equal("hi");
  });

  it("string literal then text as child", () => {
    const cd = transformSource("<H1>'hi     '     there</H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect((cd.children![0].props! as any).value).equal("'hi ' there");
  });

  it("string literal then CData as child", () => {
    const cd = transformSource("<H1>'hi     ' <![CDATA[there]]></H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNodeCData");
    expect((cd.children![0].props! as any).value).equal("hi there");
  });

  it("string literal #2 then CData as child", () => {
    const cd = transformSource("<H1>'hi'    <![CDATA[there]]></H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNodeCData");
    expect((cd.children![0].props! as any).value).equal("hithere");
  });

  it("string literal, text, CData as child", () => {
    const cd = transformSource(
      "<H1>hi   <![CDATA[there]]> 'all'  <![CDATA[people]]></H1>",
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNodeCData");
    expect((cd.children![0].props! as any).value).equal("hi thereallpeople");
  });

  it("text and element as child #1", () => {
    const cd = transformSource(`
      <Stack>
        hello
        <Button>hi</Button>
        bello
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect((cd.children![0].props! as any).value).equal(" hello ");
    expect(cd.children![1].type).equal("Button");
    expect((cd.children![2].props! as any).value).equal(" bello ");
  });

  it("text and element as child #2", () => {
    const cd = transformSource(`
      <Stack>
        This is a text segment before a Button component.
        <Button label="I'm a non-functional Button"/>
        This is a text segment after a Button and before an Icon
        <Icon name='user' />
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect((cd.children![0].props! as any).value).equal(
      " This is a text segment before a Button component. ",
    );
    expect(cd.children![1].type).equal("Button");
    expect((cd.children![2].props! as any).value).equal(
      " This is a text segment after a Button and before an Icon ",
    );
    expect(cd.children![3].type).equal("Icon");
  });

  describe("vars", () => {
    it("var fails with missing name attribute", () => {
      try {
        transformSource("<Stack><variable/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("var fails with empty name attribute", () => {
      try {
        transformSource("<Stack><variable name=''/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("dotted var works #1", () => {
      const cd = transformSource("<Stack var.myVar='123'></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.vars!.myVar).equal("123");
    });

    it("var with name/value attr works #1", () => {
      const cd = transformSource(
        "<Stack><variable name='myVar' value='123'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.vars!.myVar).equal("123");
    });

    it("var with name/value attr works #2", () => {
      const cd = transformSource(`
      <Stack>
        <variable name='myVar' value='123'/>
        <variable name='other' value='234'/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.vars!.myVar).equal("123");
      expect(cd.vars!.other).equal("234");
    });

    it("var with name and text works #1", () => {
      const cd = transformSource(
        "<Stack><variable name='myVar'>123</variable></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.vars!.myVar).equal("123");
    });

    it("var with name and text works #2", () => {
      const cd = transformSource(`
      <Stack>
        <variable name='myVar'>123</variable>
        <variable name="other">234</variable>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.vars!.myVar).equal("123");
      expect(cd.vars!.other).equal("234");
    });

    it("vars with name results null", () => {
      const cd = transformSource("<Stack><variable name='myVar'/></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.vars!.myVar).equal(null);
    });

    it("var becomes array #1", () => {
      const cd = transformSource(
        "<Stack><variable name='myVar' value='123'/><variable name='myVar' value='234'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.vars!.myVar).deep.equal(["123", "234"]);
    });
  });

  // --- Props
  describe("props", () => {
    it("prop fails with invalid attribute", () => {
      try {
        transformSource("<Stack><property blabla='123'/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T011");
      }
    });

    it("prop fails with missing name attribute", () => {
      try {
        transformSource("<Stack><property/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("prop fails with empty name attribute", () => {
      try {
        transformSource("<Stack><property name=''/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("implicit props with attr works #1", () => {
      const cd = transformSource("<Stack myProp='123'/>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal("123");
    });

    it("implicit props with attr works #2", () => {
      const cd = transformSource("<Stack myProp='123' other='234'/>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal("123");
      expect((cd.props! as any).other).equal("234");
    });

    it("implicit props namespace is ignored (yet)", () => {
      const cd = transformSource("<Stack ns1.ns:myProp='123'/>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.props.myProp).equal("123");
    });

    it("prop with name/value attr works #1", () => {
      const cd = transformSource(
        "<Stack><property name='myProp' value='123'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal("123");
    });

    it("prop with name/value attr works #2", () => {
      const cd = transformSource(`
      <Stack>
        <property name='myProp' value='123'/>
        <property name='other' value='234'/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal("123");
      expect((cd.props! as any).other).equal("234");
    });

    it("prop with name and text works #1", () => {
      const cd = transformSource(
        "<Stack><property name='myProp'>123</property></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      const prop = (cd.props! as any).myProp;
      expect(prop.type).equal("TextNode");
      expect(prop.props.value).equal("123");
    });

    it("prop with name and text works #2", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">123</property>
        <property name="other">234</property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      let prop = (cd.props! as any).myProp as ComponentDef;
      expect(prop.type).equal("TextNode");
      expect((prop.props as any).value).equal("123");
      prop = (cd.props! as any).other as ComponentDef;
      expect(prop.type).equal("TextNode");
      expect((prop.props as any).value).equal("234");
    });

    it("prop with name results null", () => {
      const cd = transformSource("<Stack><property name='myProp' /></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal(null);
    });

    it("prop becomes array #1", () => {
      const cd = transformSource(
        "<Stack><property name='myProp' value='123'/><property name='myProp' value='234'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).deep.equal(["123", "234"]);
    });

    it("prop with component #1", () => {
      const cd = transformSource(`
    <Stack>
      <property name='myProp'>
        <Button />
      </property>
    </Stack>`) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).toMatchObject({ type: "Button" });
    });

    it("prop with component #2", () => {
      const cd = transformSource(`
    <Stack>
      <property name='myProp'>
        <Button />
        <Text />
      </property>
    </Stack>`) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).toMatchObject([{ type: "Button" }, { type: "Text" }]);
    });
  });

  // --- Template (alias for property)
  describe("template", () => {
    it("template fails with invalid attribute", () => {
      try {
        transformSource("<Stack><template blabla='123'/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T011");
      }
    });

    it("template fails with missing name attribute", () => {
      try {
        transformSource("<Stack><template/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("template fails with empty name attribute", () => {
      try {
        transformSource("<Stack><template name=''/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("template with name/value attr works #1", () => {
      const cd = transformSource(
        "<Stack><template name='myProp' value='123'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal("123");
    });

    it("template with name/value attr works #2", () => {
      const cd = transformSource(`
      <Stack>
        <template name='myProp' value='123'/>
        <template name='other' value='234'/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal("123");
      expect((cd.props! as any).other).equal("234");
    });

    it("template with name and text works #1", () => {
      const cd = transformSource(
        "<Stack><template name='myProp'>123</template></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      const prop = (cd.props! as any).myProp;
      expect(prop.type).equal("TextNode");
      expect(prop.props.value).equal("123");
    });

    it("template with name and text works #2", () => {
      const cd = transformSource(`
      <Stack>
        <template name="myProp">123</template>
        <template name="other">234</template>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      let prop = (cd.props! as any).myProp as ComponentDef;
      expect(prop.type).equal("TextNode");
      expect((prop.props as any).value).equal("123");
      prop = (cd.props! as any).other as ComponentDef;
      expect(prop.type).equal("TextNode");
      expect((prop.props as any).value).equal("234");
    });

    it("template with name results null", () => {
      const cd = transformSource("<Stack><template name='myProp' /></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal(null);
    });

    it("template becomes array #1", () => {
      const cd = transformSource(
        "<Stack><template name='myProp' value='123'/><template name='myProp' value='234'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).deep.equal(["123", "234"]);
    });

    it("template with component #1", () => {
      const cd = transformSource(`
    <Stack>
      <template name='myProp'>
        <Button />
      </template>
    </Stack>`) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).toMatchObject({ type: "Button" });
    });

    it("template with component #2", () => {
      const cd = transformSource(`
    <Stack>
      <template name='myProp'>
        <Button />
        <Text />
      </template>
    </Stack>`) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).toMatchObject([{ type: "Button" }, { type: "Text" }]);
    });

    it("template and property can be mixed", () => {
      const cd = transformSource(`
      <Stack>
        <property name='prop1' value='123'/>
        <template name='prop2' value='456'/>
        <property name='prop3'>
          <Button />
        </property>
        <template name='prop4'>
          <Text />
        </template>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).prop1).equal("123");
      expect((cd.props! as any).prop2).equal("456");
      expect((cd.props! as any).prop3).toMatchObject({ type: "Button" });
      expect((cd.props! as any).prop4).toMatchObject({ type: "Text" });
    });

    it("template and property with same name become array", () => {
      const cd = transformSource(
        "<Stack><property name='myProp' value='123'/><template name='myProp' value='234'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).deep.equal(["123", "234"]);
    });
  });

  describe("event", () => {
    it("event fails with invalid attribute", () => {
      try {
        transformSource("<Stack><event blabla='123'/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T011");
      }
    });

    it("implicit events with attr works #1", () => {
      const cd = transformSource("<Stack onClick='doIt' />") as ComponentDef;
      expect(cd.type).equal("Stack");
      const event = (cd.events! as any).click;
      expect(event.__PARSED).toBe(true);
      const stmts = event.statements as Statement[];
      expect(stmts.length).equal(1);
      expect(stmts[0].type).equal(T_EXPRESSION_STATEMENT);
      expect((stmts[0] as ExpressionStatement).expr.type).equal(T_IDENTIFIER);
      const id = (stmts[0] as ExpressionStatement).expr as Identifier;
      expect(id.name).equal("doIt");
    });

    it("event fails with missing name attribute", () => {
      try {
        transformSource("<Stack><event/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("event fails with empty name attribute", () => {
      try {
        transformSource("<Stack><event name=''/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("event fail with 'on' prefix", () => {
      try {
        transformSource("<Stack><event name='onClick' value='doIt'/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T008");
      }
    });

    it("event with name/value attr works #1", () => {
      const cd = transformSource(
        "<Stack><event name='myEvent' value='doIt'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.events! as any).myEvent.source).equal("doIt");
    });

    it("event with name/value attr works #2", () => {
      const cd = transformSource(`
      <Stack>
        <event name="myEvent" value='doIt'/>
        <event name="other" value='move'/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.events! as any).myEvent.source).equal("doIt");
      expect((cd.events! as any).other.source).equal("move");
    });

    it("event with name and text works #1", () => {
      const cd = transformSource(
        "<Stack><event name='myEvent'>doIt</event></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.events! as any).myEvent.source).equal("doIt");
    });

    it("event with name and text works #2", () => {
      const cd = transformSource(`
      <Stack>
        <event name="myEvent">doIt</event>
        <event name="other">move</event>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.events! as any).myEvent.source).equal("doIt");
      expect((cd.events! as any).other.source).equal("move");
    });

    it("events with name results null", () => {
      const cd = transformSource("<Stack><event name='myEvent'/></Stack>") as ComponentDef;
      expect((cd.events! as any).myEvent).equal(null);
      expect(cd.type).equal("Stack");
    });
  });
  describe("method", () => {
    // --- Method
    it("method fails with invalid attribute", () => {
      try {
        transformSource("<Stack><method blabla='123'/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T011");
      }
    });

    it("method fails with missing name attribute", () => {
      try {
        transformSource("<Stack><method></method></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("method fails with empty name attribute", () => {
      try {
        transformSource("<Stack><method name=''/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T012");
      }
    });

    it("method with name/value attr works #1", () => {
      const cd = transformSource("<Stack><method name='set' value='do'/></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.api! as any).set).equal("do");
    });

    it("method with name/value attr works #2", () => {
      const cd = transformSource(`
      <Stack>
        <method name="set" value='do'/>
        <method name="other" value='get'/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.api! as any).set).equal("do");
      expect((cd.api! as any).other).equal("get");
    });

    it("method dotted attr works #1", () => {
      const cd = transformSource("<Stack method.myApi='getCount()'></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.api! as any).myApi).equal("getCount()");
    });

    it("method with name and text works #1", () => {
      const cd = transformSource("<Stack><method name='set'>do</method></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.api! as any).set).equal("do");
    });

    it("method with name and text works #1", () => {
      const cd = transformSource("<Stack><method name='set'>do</method></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.api! as any).set).equal("do");
    });

    it("method with name and text works #2", () => {
      const cd = transformSource(`
      <Stack>
        <method name='set'>do</method>
        <method name='other'>get</method>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.api! as any).set).equal("do");
      expect((cd.api! as any).other).equal("get");
    });

    it("method with name results null", () => {
      const cd = transformSource("<Stack><method name='set'/></Stack>") as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.api! as any).set).equal(null);
    });

    it("method becomes array #1", () => {
      const cd = transformSource(
        "<Stack><method name='myApi' value='123'/><method name='myApi' value='234'/></Stack>",
      ) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.api! as any).myApi).deep.equal(["123", "234"]);
    });
  });
  describe("uses", () => {
    // --- Uses
    it("uses must not have a value attribute #1", () => {
      try {
        transformSource("<Stack><uses x='a'/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T015");
      }
    });

    it("uses must not have a value attribute #2", () => {
      try {
        transformSource("<Stack><uses x='a' value='b'/></Stack>");
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T015");
      }
    });

    it("uses works with 2 values", () => {
      const cd = transformSource(`
      <Stack>
        <uses value="something, other"/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.uses).deep.equal(["something", "other"]);
    });

    it("uses tag works with uses attribute", () => {
      const cd = transformSource(`
      <Stack uses="one">
        <uses value="something, other"/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.uses).deep.equal(["one", "something", "other"]);
    });

    it("uses tags works with uses attribute", () => {
      const cd = transformSource(`
      <Stack uses="one">
        <uses value="something, other"/>
        <uses value="another"/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.uses).deep.equal(["one", "something", "other", "another"]);
    });
  });

  describe("objects", () => {
    it("props with text #2", () => {
      const cd = transformSource(`
      <Stack>
          <property name="myProp">
            hello
            <!-- separate -->
            bello
          </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.type).equal("TextNode");
      expect((cd.props! as any).myProp.props.value).equal(" hello bello ");
    });

    it("props with attr #1", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">
          <field name="x">
            <field name="p1" value="1" />
            <field name="p2" value="2" />
          </field>
        </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.x).deep.equal({ p1: "1", p2: "2" });
    });

    it("props with attr #2", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">
          <field name="x">
            <item>
              <field name="p1" value="1" />
              <field name="p2" value="2" />
            </item>
            <item>
              <field name="p1" value="3" />
              <field name="p2" value="4" />
            </item>
          </field>
        </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.x).deep.equal([
        { p1: "1", p2: "2" },
        { p1: "3", p2: "4" },
      ]);
    });

    it("props with attr #3", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">
          <field name="x">
            <field name="p1">1</field>
            <field name="p2">2</field>
          </field>
          <field name="y">
            <field name="p1">3</field>
            <field name="p2">4</field>
          </field>
        </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.x).deep.equal({ p1: "1", p2: "2" });
      expect((cd.props! as any).myProp.y).deep.equal({ p1: "3", p2: "4" });
    });

    it("props with attr #4", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">
          <field name="x">
            <item>
              <field name="p1">1</field>
              <field name="p2">2</field>
            </item>
            <item/>
            <item>
              <field name="p1">3</field>
              <field name="p2">4</field>
            </item>
          </field>
        </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.x).deep.equal([
        { p1: "1", p2: "2" },
        null,
        { p1: "3", p2: "4" },
      ]);
    });

    it("props with attr #5", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp" />
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp).equal(null);
    });

    it("props with nested attr #", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">
          <field name="x">
            <field name="p1" value="1" />
            <field name="p2">2</field>
            <field name="nx">
              <field name="a1" value="a" />
              <field name="b1">b</field>
            </field>
          </field>
        </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.x).deep.equal({
        p1: "1",
        p2: "2",
        nx: { a1: "a", b1: "b" },
      });
    });

    it("props with nested attr #2", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">
          <field name="x">
            <field name="p1" value="1" />
            <field name="p2">2</field>
            <field name="nx">
              <item>
                <field name="a1" value="a" />
                <field name="b1">b</field>
              </item>
              <item>
                <field name="a1" value="c" />
                <field name="b1">d</field>
              </item>
            </field>
          </field>
        </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.x).deep.equal({
        p1: "1",
        p2: "2",
        nx: [
          { a1: "a", b1: "b" },
          { a1: "c", b1: "d" },
        ],
      });
    });
  });

  describe("children", () => {
    it("direct child #1", () => {
      const cd = transformSource(`
      <Stack>Heading</Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.children!.length).equal(1);
      const textNode = cd.children![0] as ComponentDef;
      expect(textNode.type).equal("TextNode");
      expect((textNode.props! as any).value).equal("Heading");
    });

    it("direct child #2", () => {
      const cd = transformSource(`
      <Stack><Heading text="hello"/></Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.children!.length).equal(1);
      const child = cd.children![0] as ComponentDef;
      expect(child.type).equal("Heading");
      expect((child.props! as any).text).equal("hello");
    });

    it("direct child #3", () => {
      const cd = transformSource(`
      <Stack>
        <!--comment-->
        <Heading text="hello"/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.children!.length).equal(1);
      const child = cd.children![0] as ComponentDef;
      expect(child.type).equal("Heading");
      expect((child.props! as any).text).equal("hello");
    });

    it("direct child #4", () => {
      const cd = transformSource(`
      <Stack>
        <!--comment-->
        <Heading text="hello"/>
        <XButton text="bello"/>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.children!.length).equal(2);
      let child = cd.children![0] as ComponentDef;
      expect(child.type).equal("Heading");
      expect((child.props! as any).text).equal("hello");
      child = cd.children![1] as ComponentDef;
      expect(child.type).equal("XButton");
      expect((child.props! as any).text).equal("bello");
    });

    it("direct child #5", () => {
      const cd = transformSource(`
      <Stack><Heading>Hello</Heading></Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect(cd.children!.length).equal(1);
      const child = cd.children![0] as ComponentDef;
      expect(child.type).equal("Heading");
      const textNode = child.children![0] as ComponentDef;
      expect(textNode.type).equal("TextNode");
      expect((textNode.props! as any).value).equal("Hello");
    });
  });

  describe("comments", () => {
    it("comments in field and item #1", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">
          <!-- comment -->
          <field name="x">
            <field name="p1" value="1" />
            <field name="p2">2</field>
            <field name="nx">
              <item>
                <field name="a1" value="a" />
                <field name="b1">b</field>
              </item>
              <item>
                <field name="a1" value="c" />
                <field name="b1">d</field>
              </item>
            </field>
          </field>
        </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.x).deep.equal({
        p1: "1",
        p2: "2",
        nx: [
          { a1: "a", b1: "b" },
          { a1: "c", b1: "d" },
        ],
      });
    });

    it("comments in field and item #2", () => {
      const cd = transformSource(`
      <Stack>
        <property name="myProp">
          <!-- comment -->
          <field name="x">
            <!-- comment -->
            <field name="p1" value="1" />
            <!-- comment -->
            <field name="p2">2</field>
            <field name="nx">
              <!-- comment -->
              <item>
                <!-- comment -->
                <field name="a1" value="a" />
                <field name="b1">b</field>
              </item>
              <item>
                <field name="a1" value="c" />
                <field name="b1">d</field>
                <!-- comment -->
              </item>
            </field>
          </field>
        </property>
      </Stack>
    `) as ComponentDef;
      expect(cd.type).equal("Stack");
      expect((cd.props! as any).myProp.x).deep.equal({
        p1: "1",
        p2: "2",
        nx: [
          { a1: "a", b1: "b" },
          { a1: "c", b1: "d" },
        ],
      });
    });
  });

  describe("Compound components", () => {
    it("Compound component #1", () => {
      const cd = transformSource(`
      <Component name='MyComp'><Stack /><variable name="myVar" value="123" /></Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        component: {
          type: "Fragment",
          vars: {
            myVar: "123",
          },
          children: [
            {
              type: "Stack",
            },
          ],
        },
      });
    });

    it("Compound component #3", () => {
      const cd = transformSource(`
      <Component name='MyComp'>
        <Stack />
        <Text />
        <variable name="myVar" value="123" />
      </Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        component: {
          type: "Fragment",
          vars: {
            myVar: "123",
          },
          children: [
            {
              type: "Stack",
            },
            {
              type: "Text",
            },
          ],
        },
      });
    });

    it("Compound component #4", () => {
      const cd = transformSource(`
      <Component name='MyComp'>
        <Stack />
        <Text value="hello" />
      </Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        component: {
          type: "Fragment",
          children: [
            {
              type: "Stack",
            },
            {
              type: "Text",
              props: {
                value: "hello",
              },
            },
          ],
        },
      });
    });

    it("Compound component #5", () => {
      const cd = transformSource(`
      <Component name="AttachFileContainer">
        <Text value="hello"/>
        <method name="hello" value="console.log('hello')"/>
      </Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "AttachFileContainer",
        component: {
          type: "Text",
          props: {
            value: "hello",
          },
        },
        api: {
          hello: "console.log('hello')",
        },
      });
    });

    it("Compound component with dotted method #1", () => {
      const cd = transformSource(`
      <Component name='MyComp' method.getIt="getIt()"><Stack /></Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        api: {
          getIt: "getIt()",
        },
        component: {
          type: "Stack",
        },
      });
    });

    it("Compound component with dotted method #2", () => {
      const cd = transformSource(`
      <Component name='MyComp' method.getIt="getIt()" method.other="other()"><Stack /></Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        api: {
          getIt: "getIt()",
          other: "other()",
        },
        component: {
          type: "Stack",
        },
      });
    });

    it("Compound component with dotted method #3", () => {
      const cd = transformSource(`
      <Component name='MyComp' method.getIt="getIt()"><method name="other" value="other()"/><Stack /></Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        component: {
          type: "Stack",
        },
        api: {
          getIt: "getIt()",
          other: "other()",
        },
      });
    });

    it("Compound component with dotted vars #1", () => {
      const cd = transformSource(`
      <Component name='MyComp' var.myValue="123"><Stack /></Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        component: {
          type: "Stack",
          vars: {
            myValue: "123",
          },
        },
      });
    });

    it("Compound component with dotted vars #2", () => {
      const cd = transformSource(`
      <Component name='MyComp' var.myValue="123" var.other="{false}"><Stack /></Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        component: {
          type: "Stack",
          vars: {
            myValue: "123",
            other: "{false}",
          },
        },
      });
    });

    it("Compound component with vars #3", () => {
      const cd = transformSource(`
      <Component name='MyComp' var.myValue="123"><variable name="other" value="{false}" /><Stack /></Component>
    `) as ComponentDef;
      expect(cd).toMatchObject({
        name: "MyComp",
        component: {
          children: [
            {
              type: "Stack",
            },
          ],
          type: "Fragment",
          vars: {
            myValue: "123",
            other: "{false}",
          },
        },
      });
    });

    it("Compound component debug info", () => {
      const source = `<Component name='MyComp'><Stack /></Component>`;
      const cd = transformSource(source) as CompoundComponentDef;
      expect(cd.debug).toMatchObject({
        source: {
          start: 0,
          end: source.length,
          fileId: 0,
        },
      });
    });

    it("Compound component debug info nested", () => {
      const innerComp = `<Button label="hi"/>`;
      const source = `
      <Component name='MyComp'>
        <Stack>
          ${innerComp}
        </Stack>
      </Component>
    `;
      const cd = transformSource(source) as CompoundComponentDef;
      const comp = cd.component;
      expect(comp.children[0].debug).toMatchObject({
        source: {
          start: source.indexOf("<Stack>") + "<Stack>".length,
          end: source.indexOf(innerComp) + innerComp.length,
          fileId: 0,
        },
      });
    });

    it("Compound component debug info with vars", () => {
      const source = `<Component name='MyComp' var.myValue="123"><variable name="other" value="{false}" /><Stack /></Component>`;
      const cd = transformSource(source) as CompoundComponentDef;
      expect(cd.debug).toMatchObject({
        source: {
          start: 0,
          end: source.length,
          fileId: 0,
        },
      });
    });

    it("Compound component cannot nest another one", () => {
      try {
        const cd = transformSource(`
          <Component name="A">
            <Stack>
              <Component name="B">
                <Button />
              </Component>
            </Stack>
          </Component>
          `) as CompoundComponentDef;
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).include("T006");
      }
    });
  });
  describe("debug info", () => {
    it("Compound component debug info nested with vars", () => {
      const source = `<Component name='MyComp' var.myValue="123"><variable name="other" value="{false}" /><Stack var.myVar="hi" ><Button /></Stack></Component>`;
      const cd = transformSource(source) as CompoundComponentDef;

      expect(cd.debug).toMatchObject({
        source: {
          start: 0,
          end: source.length,
          fileId: 0,
        },
      });

      const fragmentComp = cd.component;
      expect(fragmentComp.debug).toMatchObject({
        source: {
          start: source.indexOf('<variable name="other"'),
          end: source.indexOf("</Component"),
          fileId: 0,
        },
      });

      const stackComp = fragmentComp.children[0] as ComponentDef;
      const beforeStack = '<variable name="other" value="{false}" />';
      expect(stackComp.debug).toMatchObject({
        source: {
          start: source.indexOf(beforeStack) + beforeStack.length,
          end: source.indexOf("</Component>"),
          fileId: 0,
        },
      });
    });

    it("Debug info #1", () => {
      const source = `<Stack><Button/></Stack>`;
      const cd = transformSource(source) as ComponentDef;
      expect(cd.debug).toMatchObject({
        source: {
          start: 0,
          end: source.length,
          fileId: 0,
        },
      });

      const btnComp = cd.children[0] as ComponentDef;
      expect(btnComp.debug).toMatchObject({
        source: {
          start: source.indexOf("<Stack>") + "<Stack>".length,
          end: source.indexOf("<Button/>") + "<Button/>".length,
          fileId: 0,
        },
      });
    });

    it("Debug info #2", () => {
      const source = `<Stack><Button/></Stack>`;
      const FILE_ID = 123;
      const cd = transformSource(source, FILE_ID) as ComponentDef;
      expect(cd.debug).toMatchObject({
        source: {
          start: 0,
          end: source.length,
          fileId: FILE_ID,
        },
      });

      const btnComp = cd.children[0] as ComponentDef;
      expect(btnComp.debug).toMatchObject({
        source: {
          start: source.indexOf("<Stack>") + "<Stack>".length,
          end: source.indexOf("<Button/>") + "<Button/>".length,
          fileId: FILE_ID,
        },
      });
    });
  });

  describe("namespaces and componet names", () => {
    it("namespace resolved in children", () => {
      const cd = transformSource(`
        <App xmlns:TestNamespace="Test.Components" >
            <TestNamespace:DataGrid />
        </App>
        `) as ComponentDef;
      expect(cd.children[0].type).toEqual("Test.Components.DataGrid");
    });

    it("overridden namespace resolved in children", () => {
      const cd = transformSource(`
        <App xmlns:TestNamespace="Test.Components" >
            <Stack xmlns:TestNamespace="Overridden.Namespace" >
            <TestNamespace:DataGrid />
            </Stack>
        </App>
        `) as ComponentDef;
      expect(cd.children[0].children[0].type).toEqual("Overridden.Namespace.DataGrid");
    });

    it("namespace value 'app-ns' resolves to a unique prefix", () => {
      const cd = transformSource(`<App xmlns:My="app-ns"><My:DataGrid /></App>`) as ComponentDef;
      expect(cd.children[0].type).equal("#app-ns.DataGrid");
    });

    it("namespace value 'core-ns' resolves to a unique prefix", () => {
      const cd = transformSource(`<App xmlns:My="core-ns"><My:DataGrid /></App>`) as ComponentDef;
      expect(cd.children[0].type).equal("#xmlui-core-ns.DataGrid");
    });

    it("namespace value 'componenet-ns' resolves to the namespace key", () => {
      const cd = transformSource(
        `<App xmlns:TestingNs="component-ns"><TestingNs:DataGrid /></App>`,
      ) as ComponentDef;
      expect(cd.children[0].type).equal("TestingNs.DataGrid");
    });

    it("namespace key with dot is unmodified", () => {
      const cd = transformSource(
        `<App xmlns:My.Ns="Test-value"><My.Ns:DataGrid /></App>`,
      ) as ComponentDef;
      expect(cd.children[0].type).equal("Test-value.DataGrid");
    });

    it("namespace resolves within in compound component", () => {
      const cd = transformSource(
        `<Component name="ABC" xmlns:Ns="Test-value"><Ns:DataGrid /></Component>`,
      ) as CompoundComponentDef;
      expect(cd.component.type).equal("Test-value.DataGrid");
    });

    it("namespace resolves deeper within in compound component", () => {
      const cd = transformSource(`
        <Component name="TestComponent" xmlns:XMLUIExtenions="component-ns:XMLUIExtensions">
          <Stack backgroundColor="lightgreen">
            <XMLUIExtenions:Pdf/>
          </Stack>
        </Component>
        `) as CompoundComponentDef;
      expect(cd.component.children[0].type).equal("XMLUIExtensions.Pdf");
    });

    it("accepts component name with '-' and '.'", () => {
      const cd = transformSource(`
        <A-b.c/>
        `) as ComponentDef;
      expect(cd.type).equal("A-b.c");
    });

    it("accepts lowercase namespace key", () => {
      const cd = transformSource(
        `<Stack xmlns:ns="Test-value"><ns:DataGrid /></Stack>`,
      ) as ComponentDef;
      expect(cd.children[0].type).eq("Test-value.DataGrid");
    });

    it("accepts lowercase namespace value", () => {
      const cd = transformSource(
        `<Stack xmlns:Ns="test-value"><Ns:DataGrid /></Stack>`,
      ) as ComponentDef;

      expect(cd.children[0].type).eq("test-value.DataGrid");
    });

    describe("handled errors", () => {
      it("errors on namespace value includeing '#'", () => {
        try {
          const cd = transformSource(`<App xmlns:TestNamespace="#something" />`) as ComponentDef;
          assert.fail("Exception expected");
        } catch (err) {
          expect(err.toString()).include("T028");
        }
      });

      it("errors on refering to unknown namespace", () => {
        try {
          const cd = transformSource(`
          <App xmlns:TestNamespace="Test.Components" >
              <NonExistant:DataGrid />
          </App>
          `) as ComponentDef;
          assert.fail("Exception expected");
        } catch (err) {
          expect(err.toString()).include("T027");
        }
      });

      it("multiple colons in namespace value errors", () => {
        try {
          const cd = transformSource(`
          <App xmlns:TestNamespace="component-ns:buttons-components:Test.Components" />
          `) as ComponentDef;
          assert.fail("Exception expected");
        } catch (err) {
          expect(err.toString()).include("T028");
        }
      });

      it("unrecognised namespace scheme errors", () => {
        try {
          const cd = transformSource(`
          <App xmlns:TestNamespace="NON-EXISTANT:Test.Components" />
          `) as ComponentDef;
          assert.fail("Exception expected");
        } catch (err) {
          expect(err.toString()).include("T029");
        }
      });

      it("duplicate namespace key errors", () => {
        try {
          const cd = transformSource(`
              <App xmlns:TestNamespace="first" xmlns:TestNamespace="second" />
              `) as ComponentDef;
          assert.fail("Exception expected");
        } catch (err) {
          expect(err.toString()).include("T025");
        }
      });

      it("namespace on top lvl component errors", () => {
        try {
          const cd = transformSource(`<NonExistantNs:App />`) as ComponentDef;
          assert.fail("Exception expected");
        } catch (err) {
          expect(err.toString()).include("T026");
        }
      });
    });
  });
});

import { describe, expect, it, assert } from "vitest";
import type {
  ComponentDef,
  CompoundComponentDef,
} from "@abstractions/ComponentDefs";
import { transformSource } from "./xmlui";

describe("Ueml transform - child elements", () => {
  it("Invalid element name fails #1", () => {
    try {
      transformSource("<Stack><blabla/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  it("Comments ignored, whitespace collapsed", () => {
    const cd = transformSource(
      "<H1>  <!-- comment -->  <!-- --><!-- -->     text here</H1>",
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect(cd.children![0].props!.value).equal(" text here");
  });

  it("Comments ignored ws between words collapsed", () => {
    const cd = transformSource(
      "<H1>hi  <!-- comment -->  there</H1>",
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect(cd.children![0].props!.value).equal("hi there");
  });

  it("Comments ignored between words", () => {
    const cd = transformSource(
      "<H1>hi<!-- comment -->there</H1>",
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect(cd.children![0].props!.value).equal("hithere");
  });

  it("string literal as child #1", () => {
    const cd = transformSource("<H1>'hi   '    </H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect(cd.children![0].props!.value).equal("hi ");
  });

  it("string literal as child #2", () => {
    const cd = transformSource("<H1>    'hi   '</H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect(cd.children![0].props!.value).equal("hi ");
  });

  it("string literal as child #3", () => {
    const cd = transformSource(
      '<Stack> "123 ""abc"   </Stack>',
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect(cd.children![0].props!.value).equal(' "123 ""abc" ');
  });

  it("CData as child", () => {
    const cd = transformSource("<H1><![CDATA[hi]]></H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNodeCData");
    expect(cd.children![0].props!.value).equal("hi");
  });

  it("string literal then text as child", () => {
    const cd = transformSource("<H1>'hi     '     there</H1>") as ComponentDef;
    expect(cd.children![0].type).equal("TextNode");
    expect(cd.children![0].props!.value).equal("'hi ' there");
  });

  it("string literal then CData as child", () => {
    const cd = transformSource(
      "<H1>'hi     ' <![CDATA[there]]></H1>",
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNodeCData");
    expect(cd.children![0].props!.value).equal("hi there");
  });

  it("string literal #2 then CData as child", () => {
    const cd = transformSource(
      "<H1>'hi'    <![CDATA[there]]></H1>",
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNodeCData");
    expect(cd.children![0].props!.value).equal("hithere");
  });

  it("string literal, text, CData as child", () => {
    const cd = transformSource(
      "<H1>hi   <![CDATA[there]]> 'all'  <![CDATA[people]]></H1>",
    ) as ComponentDef;
    expect(cd.children![0].type).equal("TextNodeCData");
    expect(cd.children![0].props!.value).equal("hi thereallpeople");
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
    expect(cd.children![0].props!.value).equal(" hello ");
    expect(cd.children![1].type).equal("Button");
    expect(cd.children![2].props!.value).equal(" bello ");
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
    expect(cd.children![0].props!.value).equal(
      " This is a text segment before a Button component. ",
    );
    expect(cd.children![1].type).equal("Button");
    expect(cd.children![2].props!.value).equal(
      " This is a text segment after a Button and before an Icon ",
    );
    expect(cd.children![3].type).equal("Icon");
  });

  // --- Namespaces
  it("namespaces fails with compound component", () => {
    try {
      transformSource("<Component myns:name='MyComp'><Stack/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("'='")).equal(true);
    }
  });

  // --- Vars
  it("vars fails with compound component", () => {
    try {
      transformSource("<Component name='MyComp'><Stack /><vars/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  it("var fails with missing name attribute", () => {
    try {
      transformSource("<Stack><var/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("var fails with empty name attribute", () => {
    try {
      transformSource("<Stack><var name=''/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("dotted var works #1", () => {
    const cd = transformSource(
      "<Stack var.myVar='123'></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.vars!.myVar).equal("123");
  });

  it("var with name/value attr works #1", () => {
    const cd = transformSource(
      "<Stack><var name='myVar' value='123'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.vars!.myVar).equal("123");
  });

  it("var with name/value attr works #2", () => {
    const cd = transformSource(`
      <Stack>
        <var name='myVar' value='123'/>
        <var name='other' value='234'/>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.vars!.myVar).equal("123");
    expect(cd.vars!.other).equal("234");
  });

  it("var with name and text works #1", () => {
    const cd = transformSource(
      "<Stack><var name='myVar'>123</var></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.vars!.myVar).equal("123");
  });

  it("var with name and text works #2", () => {
    const cd = transformSource(`
      <Stack>
        <var name='myVar'>123</var>
        <var name="other">234</var>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.vars!.myVar).equal("123");
    expect(cd.vars!.other).equal("234");
  });

  it("vars with name results null", () => {
    const cd = transformSource(
      "<Stack><var name='myVar'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.vars!.myVar).equal(null);
  });

  it("var becomes array #1", () => {
    const cd = transformSource(
      "<Stack><var name='myVar' value='123'/><var name='myVar' value='234'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.vars!.myVar).deep.equal(["123", "234"]);
  });

  // --- Props
  it("prop fails with compound component", () => {
    try {
      transformSource("<Component name='MyComp'><Stack /><props/></Component>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  it("prop fails with invalid attribute", () => {
    try {
      transformSource("<Stack><prop blabla='123'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T011")).equal(true);
    }
  });

  it("prop fails with missing name attribute", () => {
    try {
      transformSource("<Stack><prop/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("prop fails with empty name attribute", () => {
    try {
      transformSource("<Stack><prop name=''/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("implicit props with attr works #1", () => {
    const cd = transformSource("<Stack myProp='123'/>") as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).equal("123");
  });

  it("implicit props with attr works #2", () => {
    const cd = transformSource(
      "<Stack myProp='123' other='234'/>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).equal("123");
    expect(cd.props!.other).equal("234");
  });

  it("prop with name/value attr works #1", () => {
    const cd = transformSource(
      "<Stack><prop name='myProp' value='123'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).equal("123");
  });

  it("prop with name/value attr works #2", () => {
    const cd = transformSource(`
      <Stack>
        <prop name='myProp' value='123'/>
        <prop name='other' value='234'/>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).equal("123");
    expect(cd.props!.other).equal("234");
  });

  it("prop with name and text works #1", () => {
    const cd = transformSource(
      "<Stack><prop name='myProp'>123</prop></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    const prop = cd.props!.myProp as ComponentDef;
    expect(prop.type).equal("TextNode");
    expect(prop.props!.value).equal("123");
  });

  it("prop with name and text works #2", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp">123</prop>
        <prop name="other">234</prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    let prop = cd.props!.myProp as ComponentDef;
    expect(prop.type).equal("TextNode");
    expect(prop.props!.value).equal("123");
    prop = cd.props!.other as ComponentDef;
    expect(prop.type).equal("TextNode");
    expect(prop.props!.value).equal("234");
  });

  it("prop with name results null", () => {
    const cd = transformSource(
      "<Stack><prop name='myProp' /></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).equal(null);
  });

  it("prop becomes array #1", () => {
    const cd = transformSource(
      "<Stack><prop name='myProp' value='123'/><prop name='myProp' value='234'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).deep.equal(["123", "234"]);
  });

  it("prop with component #1", () => {
    const cd = transformSource(`
    <Stack>
      <prop name='myProp'>
        <Button />
      </prop>
    </Stack>`) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).toMatchObject({ type: "Button" });
  });

  it("prop with component #2", () => {
    const cd = transformSource(`
    <Stack>
      <prop name='myProp'>
        <Button />
        <Text />
      </prop>
    </Stack>`) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).toMatchObject([
      { type: "Button" },
      { type: "Text" },
    ]);
  });

  // --- Events
  it("events fails with compound component", () => {
    try {
      transformSource(
        "<Component name='MyComp'><Stack /><events/></Component>",
      );
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  it("event fails with invalid attribute", () => {
    try {
      transformSource("<Stack><event blabla='123'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T011")).equal(true);
    }
  });

  it("implicit events with attr works #1", () => {
    const cd = transformSource("<Stack onClick='doIt' />") as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.events!.click).equal("doIt");
  });

  it("event fails with missing name attribute", () => {
    try {
      transformSource("<Stack><event/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("event fails with empty name attribute", () => {
    try {
      transformSource("<Stack><event name=''/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("event fail with 'on' prefix", () => {
    try {
      transformSource("<Stack><event name='onClick' value='doIt'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T008")).equal(true);
    }
  });

  it("event with name/value attr works #1", () => {
    const cd = transformSource(
      "<Stack><event name='myEvent' value='doIt'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.events!.myEvent).equal("doIt");
  });

  it("event with name/value attr works #2", () => {
    const cd = transformSource(`
      <Stack>
        <event name="myEvent" value='doIt'/>
        <event name="other" value='move'/>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.events!.myEvent).equal("doIt");
    expect(cd.events!.other).equal("move");
  });

  it("event with name and text works #1", () => {
    const cd = transformSource(
      "<Stack><event name='myEvent'>doIt</event></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.events!.myEvent).equal("doIt");
  });

  it("event with name and text works #2", () => {
    const cd = transformSource(`
      <Stack>
        <event name="myEvent">doIt</event>
        <event name="other">move</event>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.events!.myEvent).equal("doIt");
    expect(cd.events!.other).equal("move");
  });

  it("events with name results null", () => {
    const cd = transformSource(
      "<Stack><event name='myEvent'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.events!.myEvent).equal(null);
  });

  // --- Api
  it("api fails with invalid attribute", () => {
    try {
      transformSource("<Stack><api blabla='123'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T011")).equal(true);
    }
  });

  it("api/method fails with missing name attribute", () => {
    try {
      transformSource("<Stack><api><method/></api></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("api/method fails with empty name attribute", () => {
    try {
      transformSource("<Stack><api><method name=''/></api></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T012")).equal(true);
    }
  });

  it("api with name/value attr works #1", () => {
    const cd = transformSource(
      "<Stack><api name='set' value='do'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.api!.set).equal("do");
  });

  it("api with name/value attr works #2", () => {
    const cd = transformSource(`
      <Stack>
        <api name="set" value='do'/>
        <api name="other" value='get'/>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.api!.set).equal("do");
    expect(cd.api!.other).equal("get");
  });

  it("api dotted attr works #1", () => {
    const cd = transformSource(
      "<Stack api.myApi='getCount()'></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.api!.myApi).equal("getCount()");
  });

  it("api with name and text works #1", () => {
    const cd = transformSource(
      "<Stack><api name='set'>do</api></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.api!.set).equal("do");
  });

  it("api with name and text works #2", () => {
    const cd = transformSource(`
      <Stack>
        <api name='set'>do</api>
        <api name='other'>get</api>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.api!.set).equal("do");
    expect(cd.api!.other).equal("get");
  });

  it("api with name results null", () => {
    const cd = transformSource(
      "<Stack><api name='set'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.api!.set).equal(null);
  });

  it("api becomes array #1", () => {
    const cd = transformSource(
      "<Stack><api name='myApi' value='123'/><api name='myApi' value='234'/></Stack>",
    ) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.api!.myApi).deep.equal(["123", "234"]);
  });

  // --- Uses
  it("uses must not have a value attribute #1", () => {
    try {
      transformSource("<Stack><uses x='a'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T015")).equal(true);
    }
  });

  it("uses must not have a value attribute #2", () => {
    try {
      transformSource("<Stack><uses x='a' value='b'/></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T015")).equal(true);
    }
  });

  it("uses works #1", () => {
    const cd = transformSource(`
      <Stack>
        <uses value="something, other"/>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.uses).deep.equal(["something", "other"]);
  });

  // --- Metadata
  it("Metadata not allowed in component", () => {
    try {
      transformSource("<Stack><metadata /></Stack>");
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString().includes("T009")).equal(true);
    }
  });

  // --- Objects
  it("props with text #2", () => {
    const cd = transformSource(`
      <Stack>
          <prop name="myProp">
            hello
            <!-- separate -->
            bello
          </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.type).equal("TextNode");
    expect(cd.props!.myProp.props.value).equal(" hello bello ");
  });

  it("props with attr #1", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp">
          <field name="x">
            <field name="p1" value="1" />
            <field name="p2" value="2" />
          </field>
        </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.x).deep.equal({ p1: "1", p2: "2" });
  });

  it("props with attr #2", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp">
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
        </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.x).deep.equal([
      { p1: "1", p2: "2" },
      { p1: "3", p2: "4" },
    ]);
  });

  it("props with attr #3", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp">
          <field name="x">
            <field name="p1">1</field>
            <field name="p2">2</field>
          </field>
          <field name="y">
            <field name="p1">3</field>
            <field name="p2">4</field>
          </field>
        </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.x).deep.equal({ p1: "1", p2: "2" });
    expect(cd.props!.myProp.y).deep.equal({ p1: "3", p2: "4" });
  });

  it("props with attr #4", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp">
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
        </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.x).deep.equal([
      { p1: "1", p2: "2" },
      null,
      { p1: "3", p2: "4" },
    ]);
  });

  it("props with attr #5", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp" />
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp).equal(null);
  });

  it("props with nested attr #", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp">
          <field name="x">
            <field name="p1" value="1" />
            <field name="p2">2</field>
            <field name="nx">
              <field name="a1" value="a" />
              <field name="b1">b</field>
            </field>
          </field>
        </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.x).deep.equal({
      p1: "1",
      p2: "2",
      nx: { a1: "a", b1: "b" },
    });
  });

  it("props with nested attr #2", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp">
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
        </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.x).deep.equal({
      p1: "1",
      p2: "2",
      nx: [
        { a1: "a", b1: "b" },
        { a1: "c", b1: "d" },
      ],
    });
  });

  // --- Children
  it("direct child #1", () => {
    const cd = transformSource(`
      <Stack>Heading</Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.children!.length).equal(1);
    const textNode = cd.children![0] as ComponentDef;
    expect(textNode.type).equal("TextNode");
    expect(textNode.props!.value).equal("Heading");
  });

  it("direct child #2", () => {
    const cd = transformSource(`
      <Stack><Heading text="hello"/></Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.children!.length).equal(1);
    const child = cd.children![0] as ComponentDef;
    expect(child.type).equal("Heading");
    expect(child.props!.text).equal("hello");
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
    expect(child.props!.text).equal("hello");
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
    expect(child.props!.text).equal("hello");
    child = cd.children![1] as ComponentDef;
    expect(child.type).equal("XButton");
    expect(child.props!.text).equal("bello");
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
    expect(textNode.props!.value).equal("Hello");
  });

  // --- Comments
  it("comments in field and item #1", () => {
    const cd = transformSource(`
      <Stack>
        <prop name="myProp">
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
        </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.x).deep.equal({
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
        <prop name="myProp">
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
        </prop>
      </Stack>
    `) as ComponentDef;
    expect(cd.type).equal("Stack");
    expect(cd.props!.myProp.x).deep.equal({
      p1: "1",
      p2: "2",
      nx: [
        { a1: "a", b1: "b" },
        { a1: "c", b1: "d" },
      ],
    });
  });

  // --- Compound components
  it("Compound component #1", () => {
    const cd = transformSource(`
      <Component name='MyComp'><Stack /><var name="myVar" value="123" /></Component>
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
        <var name="myVar" value="123" />
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
        <api name="hello" value="console.log('hello')"/>
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

  it("Compound component with dotted api #1", () => {
    const cd = transformSource(`
      <Component name='MyComp' api.getIt="getIt()"><Stack /></Component>
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

  it("Compound component with dotted api #2", () => {
    const cd = transformSource(`
      <Component name='MyComp' api.getIt="getIt()" api.other="other()"><Stack /></Component>
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

  it("Compound component with dotted api #3", () => {
    const cd = transformSource(`
      <Component name='MyComp' api.getIt="getIt()"><api name="other" value="other()"/><Stack /></Component>
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
      <Component name='MyComp' var.myValue="123"><var name="other" value="{false}" /><Stack /></Component>
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
    const comp = cd.component as ComponentDef;
    expect(comp.debug).toMatchObject({
      source: {
        start: 0,
        end: source.length,
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
    const comp = cd.component as ComponentDef;
    expect(comp.children[0].debug).toMatchObject({
      source: {
        start: source.indexOf("<Stack>") + "<Stack>".length,
        end: source.indexOf(innerComp) + innerComp.length,
      },
    });
  });

  it("Compound component debug info with vars", () => {
    const source = `<Component name='MyComp' var.myValue="123"><var name="other" value="{false}" /><Stack /></Component>`;
    const cd = transformSource(source) as CompoundComponentDef;
    const comp = cd.component as ComponentDef;
    expect(comp.debug).toMatchObject({
      source: {
        start: 0,
        end: source.length,
      },
    });
  });

  it("Compound component debug info nested with vars", () => {
    const source = `<Component name='MyComp' var.myValue="123"><var name="other" value="{false}" /><Stack var.myVar="hi" ><Button /></Stack></Component>`;
    const cd = transformSource(source) as CompoundComponentDef;
    const fragmentComp = cd.component as ComponentDef;
    expect(fragmentComp.debug).toMatchObject({
      source: {
        start: 0,
        end: source.length,
      },
    });

    const stackComp = fragmentComp.children[0] as ComponentDef;
    const beforeStack = '<var name="other" value="{false}" />';
    expect(stackComp.debug).toMatchObject({
      source: {
        start: source.indexOf(beforeStack) + beforeStack.length,
        end: source.indexOf("</Stack>") + "</Stack>".length,
      },
    });
  });

  it("Debug info", () => {
    const source = `<Stack><Button/></Stack>`;
    const cd = transformSource(source) as ComponentDef;
    expect(cd.debug).toMatchObject({
      source: {
        start: 0,
        end: source.length,
      },
    });

    const btnComp = cd.children[0] as ComponentDef;
    expect(btnComp.debug).toMatchObject({
      source: {
        start: source.indexOf("<Stack>") + "<Stack>".length,
        end: source.indexOf("<Button/>") + "<Button/>".length,
      },
    });
  });
});

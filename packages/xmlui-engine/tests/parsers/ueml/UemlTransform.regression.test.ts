import { describe, expect, it } from "vitest";
import { UemlHelper } from "@parsers/ueml/UemlHelper";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { UemlParser } from "@parsers/ueml/UemlParser";

describe("Ueml transform - regression", () => {
  it("string child #1", () => {
    const xh = new UemlHelper();
    const cd = xh.transformComponentDefinition({
      name: "EntryPoint",
      component: {
        type: "App",
        children: ["AppHeader"],
      } as unknown as ComponentDef,
    });
    expect(xh.serialize(cd)).equal('<Component name="EntryPoint"><App><AppHeader/></App></Component>');
  });

  it("string child #2", () => {
    const xh = new UemlHelper();
    const cd = xh.transformComponentDefinition({
      name: "EntryPoint",
      component: {
        type: "App",
        children: [
          "AppHeader",
          {
            type: "Stack",
          },
        ],
      } as unknown as ComponentDef,
    });
    expect(xh.serialize(cd)).equal('<Component name="EntryPoint"><App><AppHeader/><Stack/></App></Component>');
  });

  it("string child #3", () => {
    const xh = new UemlHelper();
    const cd = xh.transformComponentDefinition({
      name: "EntryPoint",
      component: {
        type: "App",
        children: [
          "AppHeader",
          {
            type: "Stack",
            props: {
              orientation: "horizontal",
            },
          },
        ],
      } as unknown as ComponentDef,
    });
    expect(xh.serialize(cd)).equal(
      '<Component name="EntryPoint"><App><AppHeader/><Stack orientation="horizontal"/></App></Component>'
    );
  });

  it("prop with multiple component #1", () => {
    const cd = transformSource(`
    <Table width="50%">
      <prop name="items">
        <Datasource url="https://api.spacexdata.com/v3/rockets"/>
      </prop>
      <TableColumnDef size="140">
          <prop name="template">
            <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
          </prop>
      </TableColumnDef>
      <TableColumnDef accessor="key" header="Header"/>
    </Table>
    `) as ComponentDef;
    expect(cd.type).equal("Table");
  });
  
  it("Element with attribute comment #1", () => {
    const cd = transformSource(`
    <Table width="50%" <!-- height="100%" --> >
      <prop name="items">
        <Datasource url="https://api.spacexdata.com/v3/rockets"/>
      </prop>
      <TableColumnDef size="140">
        <prop name="template">
          <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
        </prop>
      </TableColumnDef>
      <TableColumnDef accessor="key" header="Header"/>
    </Table>
    `) as ComponentDef;
    expect(cd.type).equal("Table");
  });

  it("Element with attribute comment #2", () => {
    const cd = transformSource(`
    <Table <!--width="50%"--> <!-- height="100%" --> >
      <prop name="items">
        <Datasource url="https://api.spacexdata.com/v3/rockets"/>
      </prop>
      <TableColumnDef size="140">
        <prop name="template">
          <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
        </prop>
      </TableColumnDef>
      <TableColumnDef accessor="key" header="Header"/>
    </Table>
    `) as ComponentDef;
    expect(cd.type).equal("Table");
  });

  it("Element with attribute comment #3", () => {
    const cd = transformSource(`
    <Table <!--width="50%"--> height="100%">
      <prop name="items">
        <Datasource url="https://api.spacexdata.com/v3/rockets"/>
      </prop>
      <TableColumnDef size="140">
        <prop name="template">
          <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
        </prop>
      </TableColumnDef>
      <TableColumnDef accessor="key" header="Header"/>
    </Table>
    `) as ComponentDef;
    expect(cd.type).equal("Table");
  });

  it("Text with nbsp #1", () => {
    const cd = transformSource(`
    <Text>hello\\Shello</Text>
    `) as ComponentDef;
    expect(cd.type).equal("Text");
    expect(cd.children![0].props!.value).equal("hello\\Shello");
  });
  
  it("Event keeps whitespaces", () => {
    const cd = transformSource(`
    <Text><event name="click">
const a = 1;

const b = 2;
</event>
    </Text>
    `) as ComponentDef;
    expect(cd.type).equal("Text");
    expect(cd.events!.click).toBe("\nconst a = 1;\n\nconst b = 2;\n")
  });

  it("Api keeps whitespaces", () => {
    const cd = transformSource(`
    <Text><api name="myMethod">
const a = 1;

const b = 2;
</api>
    </Text>
    `) as ComponentDef;
    expect(cd.type).equal("Text");
    expect(cd.api!.myMethod).toBe("\nconst a = 1;\n\nconst b = 2;\n")
  });

  it("Var removes whitespaces", () => {
    const cd = transformSource(`
    <Text><var name="myVar">
const a = 1;

const b = 2;
</var>
    </Text>
    `) as ComponentDef;
    expect(cd.type).equal("Text");
    expect(cd.vars!.myVar).toBe(" const a = 1; const b = 2; ")
  });

});

function transformSource(source: string): ComponentDef | CompoundComponentDef | null {
  const parser = new UemlParser(source);
  return parser.transformToComponentDef();
}

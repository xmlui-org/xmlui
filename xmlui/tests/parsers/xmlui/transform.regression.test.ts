import { describe, expect, it } from "vitest";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { transformSource } from "./xmlui";

describe("Ueml transform - regression", () => {
  it("prop with multiple component #1", () => {
    const cd = transformSource(`
    <Table width="50%">
      <prop name="items">
        <Datasource url="https://api.spacexdata.com/v3/rockets"/>
      </prop>
      <Column size="140">
          <prop name="template">
            <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
          </prop>
      </Column>
      <Column accessor="key" header="Header"/>
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
      <Column size="140">
        <prop name="template">
          <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
        </prop>
      </Column>
      <Column accessor="key" header="Header"/>
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
      <Column size="140">
        <prop name="template">
          <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
        </prop>
      </Column>
      <Column accessor="key" header="Header"/>
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
      <Column size="140">
        <prop name="template">
          <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
        </prop>
      </Column>
      <Column accessor="key" header="Header"/>
    </Table>
    `) as ComponentDef;
    expect(cd.type).equal("Table");
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
    expect((cd.events as any).click).toBe("\nconst a = 1;\n\nconst b = 2;\n")
  });

  it("method keeps whitespaces", () => {
    const cd = transformSource(`
    <Text><method name="myMethod">
const a = 1;

const b = 2;
</method>
    </Text>
    `) as ComponentDef;
    expect(cd.type).equal("Text");
    expect((cd.api as any).myMethod).toBe("\nconst a = 1;\n\nconst b = 2;\n")
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

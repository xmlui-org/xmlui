import { describe, expect, it, assert } from "vitest";
import { transformSource } from "./xmlui";
import { type GeneralDiag } from "../../../src/parsers/xmlui-parser";

describe("Xmlui transform - errors", () => {
  it("throws script errors in script tag", () => {
    try {
      transformSource(`
        <App>
          <script>
            var a =;
          </script>
          <Text>Hello World!</Text>
        </App>
      `);
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).include("W001");
    }
  });

  it("script error has correct pos", () => {
    const src = `<Form
onSubmit="
  console.log();
}"/>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
      expect((err as GeneralDiag).pos).toBe(34);
      expect((err as GeneralDiag).end).toBe(35);
    }
  });

  it("script error has correct pos number in single line script", () => {
    const src = `<A onSubmit="console.log(); }"/>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
      expect((err as GeneralDiag).pos).toBe(28);
      expect((err as GeneralDiag).end).toBe(29);
    }
  });

  it("script error in content text has correct pos", () => {
    const src = `<Form><event name="submit">console.log(); }</event></Form>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
    }
  });

  it("script error in script tag has correct pos", () => {
    const src = `<App><script>console.log(); }</script></App>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
    }
  });

  it("script error in multiline script tag has correct pos", () => {
    const src = `<App>
  <script>
    console.log(); }
  </script>
</App>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
    }
  });

  it("script error in CData content has correct pos", () => {
    const src = `<App><event name="click"><![CDATA[console.log(); }]]></event></App>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
    }
  });

  it("method parse error in inline attr value", () => {
    try {
      transformSource(`<Stack method.myApi="doIt; }" />`);
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).match(/W00[12]/);
    }
  });

  it("method parse error in method value attr", () => {
    try {
      transformSource(`<Stack><method name='myMethod' value='doIt; }'/></Stack>`);
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).match(/W00[12]/);
    }
  });

  it("method parse error in method text content", () => {
    try {
      transformSource(`<Stack><method name='myMethod'>doIt; }</method></Stack>`);
      assert.fail("Exception expected");
    } catch (err) {
      expect(err.toString()).match(/W00[12]/);
    }
  });

  it("method parse error in inline attr has correct pos", () => {
    const src = `<Stack method.myApi="doIt; }"/>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
    }
  });

  it("method parse error in content text has correct pos", () => {
    const src = `<Stack><method name="myApi">doIt; }</method></Stack>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
    }
  });

  it("method parse error in CData has correct pos", () => {
    const src = `<Stack><method name="myApi"><![CDATA[doIt; }]]></method></Stack>`;
    try {
      transformSource(src);
      assert.fail("Exception expected");
    } catch (err) {
      expect(src[(err as GeneralDiag).pos]).toBe("}");
    }
  });
});

describe("Xmlui transform - T032: variable names cannot start with '$'", () => {
  describe("var.* attribute syntax", () => {
    it("throws T032 for var.$name attribute", () => {
      try {
        transformSource(`<App var.$dummy="World" />`);
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T032");
      }
    });

    it("allows var.name without $ prefix", () => {
      const cd = transformSource(`<App var.dummy="World" />`) as any;
      expect(cd.vars!.dummy).equal("World");
    });
  });

  describe("<variable> element syntax", () => {
    it("throws T032 for <variable name='$name'>", () => {
      try {
        transformSource(`<App><variable name="$dummy" value="World" /></App>`);
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T032");
      }
    });

    it("allows <variable name='name'> without $ prefix", () => {
      const cd = transformSource(`<App><variable name="dummy" value="World" /></App>`) as any;
      expect(cd.vars!.dummy).equal("World");
    });
  });

  describe("global.* attribute syntax", () => {
    it("throws T032 for global.$name attribute", () => {
      try {
        transformSource(`<App global.$dummy="World" />`);
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T032");
      }
    });

    it("allows global.name without $ prefix", () => {
      const cd = transformSource(`<App global.dummy="World" />`) as any;
      expect(cd.globalVars!.dummy).equal("World");
    });
  });

  describe("<global> element syntax", () => {
    it("throws T032 for <global name='$name'>", () => {
      try {
        transformSource(`<App><global name="$dummy" value="World" /></App>`);
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("T032");
      }
    });

    it("allows <global name='name'> without $ prefix", () => {
      const cd = transformSource(`<App><global name="dummy" value="World" /></App>`) as any;
      expect(cd.globalVars!.dummy).equal("World");
    });
  });

  describe("<script> tag reactive var declaration", () => {
    it("throws W031 for reactive var $name in script tag", () => {
      try {
        transformSource(`<App><script>var $dummy = "World";</script></App>`);
        assert.fail("Exception expected");
      } catch (err) {
        expect(err.toString()).includes("W031");
      }
    });
  });
});

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

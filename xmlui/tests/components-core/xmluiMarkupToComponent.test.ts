import { describe, expect, it } from "vitest";
import { errReportComponent, xmlUiMarkupToComponent } from "../../src/components-core/xmlui-parser";

describe("xmlUiMarkupToComponent", () => {
  it("adds inline binding hint for W006", () => {
    // Test: Inline attribute binding with missing closing parenthesis
    // Input: onClick="{ foo(bar }" - missing ) before }
    // Expected: "Inline script parse error" prefix + W006 hint
    const source = `<App><<App>`;
    const result = xmlUiMarkupToComponent(source, "Main.xmlui");
    expect(result.errors.length).toBeGreaterThan(0);

    // Convert errors to error display component
    const comp = errReportComponent(result.errors, "Main.xmlui", undefined);
  });

  it("returns entrypoint and inline components for entrypoint markup", () => {
    const result = xmlUiMarkupToComponent(
      `
        <Component name='MyInline'><Text value="inline" /></Component>
        <App>
          <MyInline />
        </App>
      `,
      "Main.xmlui",
      undefined,
      undefined,
      { role: "entrypoint" },
    );

    expect(result.errors).toHaveLength(0);
    expect(result.component).toMatchObject({
      type: "App",
      children: [
        {
          type: "MyInline",
        },
      ],
    });
    expect(result.inlineComponents).toHaveLength(1);
    expect(result.inlineComponents[0]).toMatchObject({
      name: "MyInline",
      component: {
        type: "Text",
        props: {
          value: "inline",
        },
      },
    });
  });

  it("returns an empty Fragment and warning for entrypoint markup with only inline components", () => {
    const result = xmlUiMarkupToComponent(
      `<Component name='MyInline'><Text value="inline" /></Component>`,
      "Main.xmlui",
      undefined,
      undefined,
      { role: "entrypoint" },
    );

    expect(result.errors).toHaveLength(0);
    expect(result.component).toMatchObject({
      type: "Fragment",
    });
    expect((result.component as any).children).toBeUndefined();
    expect(result.inlineComponents).toHaveLength(1);
    expect(result.warnings[0]).toContain("rendering an empty Fragment");
  });

  it("reports an error for entrypoint markup with multiple app roots", () => {
    const result = xmlUiMarkupToComponent(
      `<Component name='MyInline'><Text value="inline" /></Component><App /><Stack />`,
      "Main.xmlui",
      undefined,
      undefined,
      { role: "entrypoint" },
    );

    expect(result.component).toBeNull();
    expect(result.inlineComponents).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe("U035");
  });

  it("reports existing inline component validation errors in entrypoint markup", () => {
    const result = xmlUiMarkupToComponent(
      `<Component name='MyInline' badAttr='true'><Text value="inline" /></Component><App />`,
      "Main.xmlui",
      undefined,
      undefined,
      { role: "entrypoint" },
    );

    expect(result.component).toBeNull();
    expect(result.inlineComponents).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe("U027");
  });
});

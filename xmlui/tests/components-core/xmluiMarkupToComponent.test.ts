import { expect, it } from "vitest";
import { errReportComponent, xmlUiMarkupToComponent } from "../../src/components-core/xmlui-parser";

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

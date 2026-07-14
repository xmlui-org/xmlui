import { describe, expect, it } from "vitest";

import {
  xmluiGrammar,
  xmluiTheme,
  xmluiThemeDark,
  xmluiThemeLight,
} from "../../src/syntax/textmate";

describe("TextMate syntax export", () => {
  it("exports the XMLUI grammar with docs code-fence aliases", () => {
    expect(xmluiGrammar.name).toBe("xmlui");
    expect(xmluiGrammar.scopeName).toBe("source.xmlui");
    expect(xmluiGrammar.aliases).toContain("xmlui-pg");
    expect(xmluiGrammar.patterns.length).toBeGreaterThan(0);
    expect(Object.keys(xmluiGrammar.repository ?? {}).length).toBeGreaterThan(0);
  });

  it("exports the XMLUI Shiki themes used by documentation code fences", () => {
    expect(xmluiTheme.name).toBe("xmlui");
    expect(xmluiThemeLight.name).toBe("xmlui-light");
    expect(xmluiThemeDark.name).toBe("xmlui-dark");
    expect(xmluiThemeLight.tokenColors.length).toBeGreaterThan(0);
    expect(xmluiThemeDark.tokenColors.length).toBeGreaterThan(0);
  });
});

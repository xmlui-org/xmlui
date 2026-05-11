import { test, expect } from "../../testing/fixtures";
import { getPaddings } from "../../testing/component-test-helpers";

// Helper – builds a markdown fenced-code-block string
function codefence(code: string, lang = "") {
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

// =============================================================================
// NOTE ON ARCHITECTURE
// CodeText is an internal React component (not a registered XMLUI component).
// It always renders as <pre class="codeText"> and is produced by the
// Markdown component for every fenced code block (```…```).
// All tests therefore drive CodeText through Markdown.
// =============================================================================
// The former two-class pattern (codeText + codefence) was collapsed into a
// single class because source-order differences between Vite dev (per-module
// <style> injection) and production (single bundled stylesheet) caused the
// textVariant("codefence") padding longhands to be overridden by the .codeText
// shorthand `padding: 0.75em` in prod but not in dev.  See CodeText.module.scss
// for the full explanation.

test.describe("CodeText", () => {
  // ===========================================================================
  // Basic Functionality
  // ===========================================================================
  test.describe("Basic Functionality", () => {
    test("code fence renders as a pre element", async ({ initTestBed, page }) => {
      const src = codefence("const x = 1;");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      await expect(page.locator("pre")).toBeVisible();
    });

    test("code fence content is readable", async ({ initTestBed, page }) => {
      const src = codefence("const answer = 42;");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      await expect(page.locator("pre")).toContainText("const answer = 42;");
    });

    test("code fence content is wrapped in a direct code child", async ({ initTestBed, page }) => {
      const src = codefence("let y = 2;");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      await expect(page.locator("pre > code")).toBeVisible();
    });

    test("code fence with a language identifier renders the code", async ({
      initTestBed,
      page,
    }) => {
      const src = codefence("function hello() {}", "javascript");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      await expect(page.locator("pre")).toContainText("function hello() {}");
    });

    test("multiple code fences render independently", async ({ initTestBed, page }) => {
      const src = codefence("first()") + "\n\n" + codefence("second()");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      await expect(page.locator("pre")).toHaveCount(2);
    });

    test("code fence preserves indentation", async ({ initTestBed, page }) => {
      const src = codefence("function f() {\n  return 1;\n}");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      await expect(page.locator("pre")).toContainText("return 1;");
    });

    test("inline code does not produce a pre element", async ({ initTestBed, page }) => {
      // Inline `code` in Markdown renders as a bare <code> inside a <p>, not via CodeText
      await initTestBed(`<Markdown><![CDATA[Use \`myVar\` here.]]></Markdown>`);
      await expect(page.locator("pre")).toHaveCount(0);
      await expect(page.locator("code")).toBeVisible();
    });
  });

  // ===========================================================================
  // pre element base styles  (.codeText)
  // ===========================================================================
  test.describe("pre element base styles", () => {
    test("has zero margin on all sides", async ({ initTestBed, page }) => {
      const src = codefence("x = 1");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      const pre = page.locator("pre");
      await expect(pre).toHaveCSS("margin-top", "0px");
      await expect(pre).toHaveCSS("margin-bottom", "0px");
      await expect(pre).toHaveCSS("margin-left", "0px");
      await expect(pre).toHaveCSS("margin-right", "0px");
    });

    test("has non-zero padding", async ({ initTestBed, page }) => {
      const src = codefence("x = 1");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      const pre = page.locator("pre");
      const paddings = await getPaddings(pre);
      expect(paddings.top.value).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // .codefence:has(> code) — styles applied when a direct <code> child exists
  // ===========================================================================
  test.describe("codefence with direct code child", () => {
    test("pre has overflow-x: auto", async ({ initTestBed, page }) => {
      // .codefence:has(> code) { overflow-x: auto; }
      const src = codefence("const x = 1;");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      await expect(page.locator("pre")).toHaveCSS("overflow-x", "auto");
    });

    test("code child has non-zero left padding", async ({ initTestBed, page }) => {
      const src = codefence("const x = 1;");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`);
      const paddingLeft = await page
        .locator("pre > code")
        .evaluate((el) => parseFloat(window.getComputedStyle(el).paddingLeft));
      expect(paddingLeft).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Theme Variables — styles controlled by CSS custom properties
  // ===========================================================================
  test.describe("Theme Variables", () => {
    test("code child text color respects textColor-Text-codefence", async ({ initTestBed, page }) => {
      const src = codefence("const x = 1;");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`, {
        testThemeVars: { "textColor-Text-codefence": "rgb(255, 0, 0)" },
      });
      await expect(page.locator("pre > code")).toHaveCSS("color", "rgb(255, 0, 0)");
    });

    test("code child font-family respects fontFamily-Text-codefence", async ({
      initTestBed,
      page,
    }) => {
      const src = codefence("const x = 1;");
      await initTestBed(`<Markdown><![CDATA[${src}]]></Markdown>`, {
        testThemeVars: { "fontFamily-Text-codefence": "monospace" },
      });
      const fontFamily = await page
        .locator("pre > code")
        .evaluate((el) => window.getComputedStyle(el).fontFamily);
      expect(fontFamily).toContain("monospace");
    });
  });

  // ===========================================================================
  // .codefence:has(> code > span) — syntax-highlighted content
  // Skeleton tests: require a syntax highlighter injected into the app context.
  // ===========================================================================
  test.describe("codefence with syntax-highlighted spans", () => {
    test.skip(
      "pre horizontal padding is removed when code contains direct span children",
      // .codefence:has(> code > span) { padding-left: 0; padding-right: 0; }
      async ({ initTestBed, page }) => {},
    );

    test.skip(
      "code > span elements have display: inline-block",
      // .codefence > code > span { display: inline-block; }
      async ({ initTestBed, page }) => {},
    );

    test.skip(
      "code > span elements fill the full width",
      // .codefence > code > span { width: 100%; }
      async ({ initTestBed, page }) => {},
    );

    test.skip(
      "non-numbered spans have left padding from space-3",
      // .codefence > code > span:not([class*='numbered']) { padding-left: 0.75rem; }
      async ({ initTestBed, page }) => {},
    );

    test.skip(
      "numbered spans carry a counter-increment for line numbering",
      // .codefence > code > span[class*='numbered'] { counter-increment: listing; }
      async ({ initTestBed, page }) => {},
    );

    test.skip(
      "numbered span ::before pseudo-element shows the line number",
      // .codefence > code > span[class*='numbered']::before { content: counter(listing); }
      async ({ initTestBed, page }) => {},
    );
  });
});

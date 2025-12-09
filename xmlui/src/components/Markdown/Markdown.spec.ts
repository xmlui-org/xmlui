import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import type { HeadingLevel } from "../Heading/abstractions";

// --- Testing

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("Markdown renders", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<Markdown />`);
    await expect((await createMarkdownDriver()).component).toBeAttached();
  });

  test("handles empty binding expression", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<Markdown><![CDATA[\@{}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("");
  });

  test("does not detect escaped empty expression #1", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(`<Markdown><![CDATA[\\@{}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("@{}");
  });

  test("does not detect escaped empty expression #2", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(`<Markdown><![CDATA[\@\\{}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("@{}");
  });

  test("does not detect escaped expression #1", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<Markdown><![CDATA[\\@{1}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("@{1}");
  });

  test("does not detect escaped expression #2", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<Markdown><![CDATA[\@\\{1}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("@{1}");
  });

  test("handles only spaces binding expression", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<Markdown><![CDATA[\@{   }]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("");
  });

  test("handles binding expression", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<Markdown><![CDATA[\@{1+1}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("2");
  });

  test("handles objects in binding expressions", async ({ initTestBed, createMarkdownDriver }) => {
    const expected = "{ a : 1, b: 'c' }";
    await initTestBed(`<Markdown><![CDATA[\@{${expected}}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText(`{"a":1,"b":"c"}`);
  });

  test("handles arrays in binding expressions", async ({ initTestBed, createMarkdownDriver }) => {
    const expected = "[ 1, 2, 3 ]";
    await initTestBed(`<Markdown><![CDATA[\@{${expected}}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText(`[1,2,3]`);
  });

  test("handles functions in binding expressions", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    const SOURCE = "() => { const x = 1; console.log(x); return null; }";
    const EXPECTED = "[xmlui function]";
    await initTestBed(`<Markdown><![CDATA[\@{${SOURCE}}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText(EXPECTED);
  });

  test("handles nested objects in binding expressions", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    const expected = "{ a : 1, b: { c: 1 } }";
    await initTestBed(`<Markdown><![CDATA[\@{${expected}}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText(`{"a":1,"b":{"c":1}}`);
  });

  test("handles functions nested in objects in binding expressions", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    const SOURCE = "{ a: () => { const x = 1; console.log(x); return null; } }";
    const EXPECTED = '{"a":"[xmlui function]"}';
    await initTestBed(`<Markdown><![CDATA[\@{${SOURCE}}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText(EXPECTED);
  });

  test("handles arrays nested in objects in binding expressions", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    const expected = "{ a: [1, 2, 3] }";
    await initTestBed(`<Markdown><![CDATA[\@{${expected}}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText(`{"a":[1,2,3]}`);
  });

  test("handles arrays nested in functions in binding expressions", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    const SOURCE = "() => { return [1, 2, 3]; }";
    const EXPECTED = "[xmlui function]";
    await initTestBed(`<Markdown><![CDATA[\@{${SOURCE}}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText(EXPECTED);
  });

  test("handles complex expressions", async ({ initTestBed, createMarkdownDriver }) => {
    const SOURCE =
      "Hello there @{ {a : () => {}, x: null, b: { c: 3, d: 'asdadsda', e: () => {return null;} } } } How are you @{true || undefined || []}";
    const EXPECTED =
      'Hello there {"a":"[xmlui function]","x":null,"b":{"c":3,"d":"asdadsda","e":"[xmlui function]"}} How are you true';
    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText(EXPECTED);
  });

  const headingLevelsWithMarkdown: Array<{ level: HeadingLevel; md: string }> = [
    { level: "h1", md: "# Heading" },
    { level: "h2", md: "## Heading" },
    { level: "h3", md: "### Heading" },
    { level: "h4", md: "#### Heading" },
    { level: "h5", md: "##### Heading" },
    { level: "h6", md: "###### Heading" },
  ];
  headingLevelsWithMarkdown.forEach(({ level, md }) => {
    test(`can render anchor link for '${level}'`, async ({ initTestBed, createMarkdownDriver }) => {
      const SOURCE = md;
      await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
      const driver = await createMarkdownDriver();
      expect(await driver.hasHtmlElement("a")).toBe(true);
    });
  });

  test("show implicit anchor links", async ({ initTestBed, createMarkdownDriver }) => {
    const SOURCE = "## Heading";
    await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
    const driver = await createMarkdownDriver();
    expect(await driver.hasHtmlElement("a")).toBe(true);
  });

  test("show explicit anchor links", async ({ initTestBed, createMarkdownDriver }) => {
    const SOURCE = "## Heading [#heading]";
    await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
    const driver = await createMarkdownDriver();
    expect(await driver.hasHtmlElement("a")).toBe(true);
  });

  test("don't render implicit anchor links", async ({ initTestBed, createMarkdownDriver }) => {
    const SOURCE = "## Heading";
    await initTestBed(`<Markdown showHeadingAnchors="false"><![CDATA[${SOURCE}]]></Markdown>`);
    const driver = await createMarkdownDriver();
    expect(await driver.hasHtmlElement("a")).toBe(false);
  });

  test("don't render explicit anchor links", async ({ initTestBed, createMarkdownDriver }) => {
    const SOURCE = "## Heading [#heading]";
    await initTestBed(`<Markdown showHeadingAnchors="false"><![CDATA[${SOURCE}]]></Markdown>`);
    const driver = await createMarkdownDriver();
    expect(await driver.hasHtmlElement("a")).toBe(false);
  });
});

test("only renders if children are strings", async ({ initTestBed, createMarkdownDriver }) => {
  await initTestBed(`
      <Markdown>
        <Button label="Hey!" />
      </Markdown>
    `);

  // Check if page is empty (no text)
  const driver = await createMarkdownDriver();
  await expect(driver.component).toHaveText("");
});

test("renders if children are provided through CDATA", async ({ initTestBed, createMarkdownDriver }) => {
  await initTestBed(`
    <Markdown>
      <![CDATA[Hello World!]]>
    </Markdown>
  `);

  // Check if page is empty (no text)
  const driver = await createMarkdownDriver();
  await expect(driver.component).toHaveText("Hello World!");
});

test("renders code block", async ({ initTestBed, createMarkdownDriver }) => {
  const code = "```\n" + "I did not expect this\n" + "```";
  await initTestBed(`<Markdown><![CDATA[${code}]]></Markdown>`);
  const driver = await createMarkdownDriver();
  await expect(driver.component).toHaveText("I did not expect this");
  expect(await driver.hasHtmlElement(["pre", "code"])).toBeTruthy();
});

test("4space/1 tab indent is not code block by default", async ({
  initTestBed,
  createMarkdownDriver,
}) => {
  // Note the formatting here: the line breaks and indentations are intentional
  const code = `
    _I did not expect this_
  `;
  await initTestBed(`<Markdown><![CDATA[${code}]]></Markdown>`);
  const driver = await createMarkdownDriver();
  await expect(driver.component).toHaveText("I did not expect this");
  expect(await driver.hasHtmlElement("em")).toBeTruthy();
});

test("removeIndents=false: 4space/1 tab indent is accounted for", async ({
  initTestBed,
  createMarkdownDriver,
}) => {
  // Note the formatting here: the lack of indentations is intentional
  const code = `
_I did not expect this_
  `;
  await initTestBed(`<Markdown removeIndents="false"><![CDATA[${code}]]></Markdown>`);
  const driver = await createMarkdownDriver();
  await expect(driver.component).toHaveText("I did not expect this");
  expect(await driver.hasHtmlElement("em")).toBeTruthy();
});

test("removeIndents=false: 4space/1 tab indent maps to a code block", async ({
  initTestBed,
  createMarkdownDriver,
}) => {
  // Note the formatting here: the indentations are intentional
  const code = `
    _I did not expect this_
  `;
  await initTestBed(`<Markdown removeIndents="false"><![CDATA[${code}]]></Markdown>`);
  const driver = await createMarkdownDriver();
  await expect(driver.component).toHaveText("_I did not expect this_");
  expect(await driver.hasHtmlElement(["pre", "code"])).toBeTruthy();
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

test.describe("Heading ID Generation Regression", () => {
  test("heading starting with number renders without querySelector error", async ({
    initTestBed,
    page,
  }) => {
    // This is the user-reported bug: headings starting with numbers cause querySelector errors
    const SOURCE = "## 1. Install the management tool";
    await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
    
    // Verify the component renders without errors
    const heading = page.getByRole("heading", { level: 2, name: /1\. Install the management tool/ });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("1. Install the management tool");
    
    // Check if anchor link renders
    await heading.hover();
    const anchorLink = heading.locator("a");
    await expect(anchorLink).toBeVisible();
  });

  test("heading ID generation creates valid ID with prefix for numbers", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = "## 1. Install the management tool";
    await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
    
    const heading = page.getByRole("heading", { level: 2 });
    await heading.hover();
    
    // Get the anchor link's href
    const anchorLink = heading.locator("a");
    const href = await anchorLink.getAttribute("href");
    
    // After fix: the href should be "#heading-1-install-the-management-tool"
    // which starts with a letter, making it valid for querySelector
    expect(href).toBe("#heading-1-install-the-management-tool");
    
    // The generated ID should start with a letter or underscore
    const generatedId = href?.substring(1); // Remove the #
    expect(generatedId).toMatch(/^[a-zA-Z_]/); // Now starts with valid character
  });

  test("querySelector works with valid ID", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = "## 1. Install the management tool";
    await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
    
    const heading = page.getByRole("heading", { level: 2 });
    await heading.hover();
    
    const anchorLink = heading.locator("a");
    const href = await anchorLink.getAttribute("href");
    const anchorId = href?.substring(1); // Remove the #
    
    // Verify that querySelector works without errors
    const querySelectorResult = await page.evaluate((id) => {
      try {
        const element = document.querySelector(`#${id}`);
        return element !== null ? "found" : "not-found";
      } catch (error) {
        return "error: " + (error as Error).message;
      }
    }, anchorId);
    
    // After fix: querySelector should work without errors
    expect(querySelectorResult).not.toContain("error");
  });

  test("heading with only numbers generates valid ID with prefix", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = "## 123";
    await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
    
    const heading = page.getByRole("heading", { level: 2, name: "123" });
    await expect(heading).toBeVisible();
    await heading.hover();
    
    const anchorLink = heading.locator("a");
    const href = await anchorLink.getAttribute("href");
    
    // After fix: generates "#heading-123" which is valid for querySelector
    expect(href).toBe("#heading-123");
    expect(href).toMatch(/^#[a-zA-Z_]/);
  });

  test("multiple headings starting with numbers all have valid IDs", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = `
## 1. First step
## 2. Second step  
## 3. Third step
    `;
    await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
    
    // All headings should render
    const headings = page.getByRole("heading", { level: 2 });
    await expect(headings).toHaveCount(3);
    
    // Check each anchor link has valid ID format
    const expectedHrefs = [
      "#heading-1-first-step",
      "#heading-2-second-step",
      "#heading-3-third-step"
    ];
    
    for (let i = 0; i < 3; i++) {
      const heading = headings.nth(i);
      await heading.hover();
      const anchorLink = heading.locator("a");
      const href = await anchorLink.getAttribute("href");
      
      // After fix: all start with "heading-" prefix
      expect(href).toBe(expectedHrefs[i]);
      expect(href).toMatch(/^#heading-[1-3]-/);
    }
  });

  test("heading starting with special character that resolves to digit gets valid ID", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = "## $100 Budget Planning";
    await initTestBed(`<Markdown showHeadingAnchors="true"><![CDATA[${SOURCE}]]></Markdown>`);
    
    const heading = page.getByRole("heading", { level: 2, name: /\$100 Budget Planning/ });
    await expect(heading).toBeVisible();
    await heading.hover();
    
    const anchorLink = heading.locator("a");
    const href = await anchorLink.getAttribute("href");
    
    // After fix: the $ gets stripped, leaving "100-budget-planning" which gets prefixed
    expect(href).toBe("#heading-100-budget-planning");
    expect(href?.substring(1)).toMatch(/^[a-zA-Z_]/);
  });

  test("renders <br/> as line break by default", async ({ initTestBed, page }) => {
    const SOURCE = `First line<br/>Second line`;
    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);
    
    const brElement = page.locator("br");
    await expect(brElement).toBeAttached();
  });

  test("renders <br/> as line break when removeBr is false", async ({ initTestBed, page }) => {
    const SOURCE = `First line<br/>Second line`;
    await initTestBed(`<Markdown removeBr="false"><![CDATA[${SOURCE}]]></Markdown>`);
    
    const brElement = page.locator("br");
    await expect(brElement).toBeAttached();
  });

  test("omits <br/> when removeBr is true", async ({ initTestBed, page }) => {
    const SOURCE = `First line<br/>Second line`;
    await initTestBed(`<Markdown removeBr="true"><![CDATA[${SOURCE}]]></Markdown>`);
    
    const brElement = page.locator("br");
    await expect(brElement).not.toBeAttached();
  });

  test("omits multiple <br/> elements when removeBr is true", async ({ initTestBed, page }) => {
    const SOURCE = `First<br/>Second<br/>Third<br/>Fourth`;
    await initTestBed(`<Markdown removeBr="true"><![CDATA[${SOURCE}]]></Markdown>`);
    
    const brElements = page.locator("br");
    await expect(brElements).toHaveCount(0);
  });
});

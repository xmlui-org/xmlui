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

  test("comment-only binding expression does not crash surrounding content (#3774)", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    // --- A braced binding whose body is only a comment parses to no
    // expression at all. Before the fix, evaluating that segment threw
    // (`Cannot read properties of null (reading 'type')`); the surrounding
    // "before " / " after" text must still render, proving the crash does
    // not take down the render tree.
    await initTestBed(`<Markdown><![CDATA[before \@{ /* note */ } after]]></Markdown>`);
    const { component } = await createMarkdownDriver();
    await expect(component).toBeAttached();
    await expect(component).toContainText("before");
    await expect(component).toContainText("after");
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

test("rendered text-bearing content can be selected by default", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Markdown>
      <![CDATA[
## Selectable heading

Try to select this paragraph.

- Selectable list item

\`Selectable inline code\`

| Header |
| --- |
| Selectable table cell |

\`\`\`
Selectable code fence
\`\`\`
      ]]>
    </Markdown>
  `);

  await expect(page.getByRole("heading", { name: "Selectable heading" })).toHaveCSS(
    "user-select",
    "text",
  );
  await expect(page.getByText("Try to select this paragraph.")).toHaveCSS("user-select", "text");
  await expect(page.getByText("Selectable list item")).toHaveCSS("user-select", "text");
  await expect(page.getByText("Selectable inline code")).toHaveCSS("user-select", "text");
  await expect(page.getByRole("cell", { name: "Selectable table cell" })).toHaveCSS(
    "user-select",
    "text",
  );
  await expect(page.locator("pre").filter({ hasText: "Selectable code fence" })).toHaveCSS(
    "user-select",
    "text",
  );
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
// FILE DOWNLOAD ATTRIBUTE TESTS
// =============================================================================

test.describe("File Download Attribute", () => {
  test("handles download attribute detection across file types and edge cases", async ({
    initTestBed,
    page,
  }) => {
    // common downloadable file extensions get download attribute
    await initTestBed(`<Markdown><![CDATA[
[PDF File](/resources/files/sample.pdf)
[CSV File](/resources/files/sample-products.csv)
[ZIP Archive](/downloads/package.zip)
[JSON Data](/api/data.json)
[Excel File](/reports/data.xlsx)
[Text File](/docs/readme.txt)
    ]]></Markdown>`);
    await expect(page.getByRole("link", { name: "PDF File" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "CSV File" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "ZIP Archive" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "JSON Data" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "Excel File" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "Text File" })).toHaveAttribute("download");

    // web page extensions do not get download attribute
    await initTestBed(`<Markdown><![CDATA[
[HTML Page](/docs/index.html)
[HTM Page](/docs/page.htm)
[PHP Script](/api/endpoint.php)
[ASP Page](/legacy/page.asp)
[ASPX Page](/app/default.aspx)
[JSP Page](/java/app.jsp)
    ]]></Markdown>`);
    await expect(page.getByRole("link", { name: "HTML Page" })).not.toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "HTM Page" })).not.toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "PHP Script" })).not.toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "ASP Page" })).not.toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "ASPX Page" })).not.toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "JSP Page" })).not.toHaveAttribute("download");

    // file links with query parameters and hash fragments still get download attribute
    await initTestBed(`<Markdown><![CDATA[
[CSV with Query](/api/export.csv?format=standard&date=2024)
[PDF with Hash](/docs/report.pdf#page=5)
[File with Both](/data/file.json?v=1#section)
    ]]></Markdown>`);
    await expect(page.getByRole("link", { name: "CSV with Query" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "PDF with Hash" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "File with Both" })).toHaveAttribute("download");

    // links without file extensions do not get download attribute
    await initTestBed(`<Markdown><![CDATA[
[No Extension](/docs/readme)
[Directory](/resources/)
[Root](/api)
    ]]></Markdown>`);
    await expect(page.getByRole("link", { name: "No Extension" })).not.toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "Directory" })).not.toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "Root" })).not.toHaveAttribute("download");

    // various document and archive formats get download attribute
    await initTestBed(`<Markdown><![CDATA[
[Word Doc](/files/document.doc)
[Word DocX](/files/document.docx)
[PowerPoint](/slides/presentation.ppt)
[PowerPoint X](/slides/presentation.pptx)
[RAR Archive](/downloads/archive.rar)
[7z Archive](/downloads/data.7z)
    ]]></Markdown>`);
    await expect(page.getByRole("link", { name: "Word Doc", exact: true })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "Word DocX" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "PowerPoint", exact: true })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "PowerPoint X" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "RAR Archive" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "7z Archive" })).toHaveAttribute("download");

    // file extension detection is case-insensitive
    await initTestBed(`<Markdown><![CDATA[
[Uppercase PDF](/files/DOCUMENT.PDF)
[Mixed Case CSV](/data/Products.CsV)
[Lowercase Zip](/archives/data.zip)
    ]]></Markdown>`);
    await expect(page.getByRole("link", { name: "Uppercase PDF" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "Mixed Case CSV" })).toHaveAttribute("download");
    await expect(page.getByRole("link", { name: "Lowercase Zip" })).toHaveAttribute("download");

    // explicit download attribute from HTML is preserved
    await initTestBed(`<Markdown><![CDATA[<a href="/resources/files/sample-products.csv" download>Click to Download</a>]]></Markdown>`);
    await expect(page.getByRole("link", { name: "Click to Download" })).toHaveAttribute("download");
  });
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
    await expect(heading).toHaveText("1. Install the management tool#");
    
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

// =============================================================================
// REGRESSION: binding expressions not replaced inside code fences
// =============================================================================

test.describe("Binding expression code-fence exclusion regression", () => {
  test("does not replace @{} binding inside a triple-backtick code fence", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    const SOURCE = "```\n@{someValue}\n```";
    await initTestBed(
      `<App var.someValue="{42}"><Markdown><![CDATA[${SOURCE}]]></Markdown></App>`,
    );
    const driver = await createMarkdownDriver();
    // The expression inside the code fence must remain literal
    await expect(driver.component).toHaveText("@{someValue}");
  });

  test("replaces @{} binding outside a code fence but not inside", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    const SOURCE = "Value: @{someValue}\n\n```\n@{someValue}\n```";
    await initTestBed(
      `<App var.someValue="{42}"><Markdown><![CDATA[${SOURCE}]]></Markdown></App>`,
    );
    const driver = await createMarkdownDriver();
    // Outside the fence: replaced; inside: literal
    const text = await driver.component.textContent();
    expect(text).toContain("Value: 42");
    expect(text).toContain("@{someValue}");
  });

  test("replaces @{} binding in text after a closing code fence", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    const SOURCE = "```\n@{someValue}\n```\n\nOutside: @{someValue}";
    await initTestBed(
      `<App var.someValue="{42}"><Markdown><![CDATA[${SOURCE}]]></Markdown></App>`,
    );
    const driver = await createMarkdownDriver();
    const text = await driver.component.textContent();
    // Code fence content is literal; text after the fence is replaced
    expect(text).toContain("@{someValue}");
    expect(text).toContain("Outside: 42");
  });
});

// =============================================================================
// xmlui-pg: nested code fences with four backticks
// =============================================================================

test.describe("xmlui-pg nested code fences (four-backtick delimiter)", () => {
  test("renders a basic xmlui-pg playground", async ({ initTestBed, page }) => {
    const SOURCE = "```xmlui-pg\n<Button>Hello</Button>\n```";
    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);
    // The NestedApp renders the Button component from the playground source
    await expect(page.getByRole("button", { name: "Hello" })).toBeVisible();
  });

  test("four-backtick fence inside xmlui-pg does not close the outer fence", async ({
    initTestBed,
    page,
  }) => {
    // The ````bash...```` block must be treated as nested content, not as the closing ```.
    // After unescaping, <Markdown> receives a bash code block and renders it.
    const SOURCE = [
      "```xmlui-pg",
      "<Markdown>",
      "````bash",
      "npm start",
      "````",
      "</Markdown>",
      "```",
    ].join("\n");
    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);
    // The nested app renders Markdown which renders "npm start" inside a code element
    await expect(page.locator("code").filter({ hasText: "npm start" })).toBeVisible();
  });

  test("display segment with nested four-backtick fence emits a visible code block", async ({
    initTestBed,
    page,
  }) => {
    // display mode causes the segment source to appear as a <pre> code block above the playground
    const SOURCE = [
      "```xmlui-pg",
      "---app display",
      "<Markdown>",
      "````bash",
      "echo hello",
      "````",
      "</Markdown>",
      "```",
    ].join("\n");
    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);
    // A <pre> display code block must be rendered (the emitted wrapper uses ```` when content has ```)
    // Two <pre> elements exist: display block + rendered bash block inside NestedApp — use .first()
    await expect(page.locator("pre").first()).toBeVisible();
    // The source code shown in the display block must include "echo hello"
    await expect(page.locator("pre").first()).toContainText("echo hello");
  });

  test("multiple four-backtick nested fences are all parsed into app content", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      "```xmlui-pg",
      "<Markdown>",
      "````bash",
      "first command",
      "````",
      "",
      "````js",
      "second command",
      "````",
      "</Markdown>",
      "```",
    ].join("\n");
    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);
    // Both unescaped code blocks must appear in the rendered Markdown output
    await expect(page.locator("code").filter({ hasText: "first command" })).toBeVisible();
    await expect(page.locator("code").filter({ hasText: "second command" })).toBeVisible();
  });

  test("four-backtick fence inside explicit ---app segment renders correctly", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      "```xmlui-pg display",
      "---app display",
      "<Markdown>",
      "````bash",
      "echo hello",
      "````",
      "</Markdown>",
      "```",
    ].join("\n");
    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);
    // The display code block is rendered as <pre>;
    // Two <pre> elements exist: display block + rendered bash block inside NestedApp — use .first()
    await expect(page.locator("pre").first()).toBeVisible();
    // The nested app renders the Markdown which shows "echo hello" in a code element
    await expect(page.locator("code").filter({ hasText: "echo hello" }).first()).toBeVisible();
  });
});

test.describe("xmlui-pg inline components", () => {
  test("renders an inline component declared in the app segment", async ({ initTestBed, page }) => {
    const SOURCE = [
      "```xmlui-pg",
      '<Component name="HelloButton">',
      '  <Button label="Hello inline" />',
      "</Component>",
      "<App>",
      "  <HelloButton />",
      "</App>",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(page.getByRole("button", { name: "Hello inline" })).toBeVisible();
  });

  test("renders multiple inline components and the main app from one app block", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      "```xmlui-pg",
      '<Component name="StatusPill">',
      '  <Badge value="{$props.value}" variant="pill" />',
      "</Component>",
      '<Component name="ToolbarAction">',
      '  <Button label="{$props.label}" />',
      "</Component>",
      "<App>",
      "  <VStack>",
      '    <StatusPill value="Ready" />',
      '    <StatusPill value="Synced" />',
      '    <ToolbarAction label="Refresh" />',
      "  </VStack>",
      "</App>",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(page.getByText("Ready")).toBeVisible();
    await expect(page.getByText("Synced")).toBeVisible();
    await expect(page.getByRole("button", { name: "Refresh" })).toBeVisible();
  });

  test("still renders playgrounds without inline components", async ({ initTestBed, page }) => {
    const SOURCE = "```xmlui-pg\n<Button label=\"Plain playground\" />\n```";

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(page.getByRole("button", { name: "Plain playground" })).toBeVisible();
  });

  test("keeps an interacted lazy playground mounted after it scrolls away", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 420 });
    const SOURCE = [
      "```xmlui-pg height=\"240px\" name=\"First lazy playground\"",
      '<Button label="First lazy playground" />',
      "```",
      '<div style="height: 1400px"></div>',
      "```xmlui-pg height=\"240px\" name=\"Second lazy playground\"",
      '<Button label="Second lazy playground" />',
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    const firstButton = page.getByRole("button", { name: "First lazy playground" });
    await expect(firstButton).toBeVisible();
    await firstButton.click();

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1000);

    await expect(firstButton).toBeAttached();
    await expect(page.getByRole("button", { name: "Second lazy playground" })).toBeVisible();
    await expect(page.locator('[data-nested-app-lazy-state="mounted"]')).toHaveCount(2);
  });

  test("skips bulk theme CSS for host-theme inherited playgrounds", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      '```xmlui-pg immediate height="240px" name="Inherited theme playground"',
      '<Button label="Inherited theme playground" />',
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(page.getByRole("button", { name: "Inherited theme playground" })).toBeVisible();
    const themeCssCounts = await page.evaluate(() => {
      const host = Array.from(document.querySelectorAll("*")).find((element) => element.shadowRoot);
      const styleText = Array.from(host?.shadowRoot?.querySelectorAll("style") || [])
        .map((style) => style.textContent || "")
        .join("\n");
      return {
        resetVarCount: (styleText.match(/--xmlui-[^:]+:\s*initial/g) || []).length,
        rootThemeVarCount: (styleText.match(/--xmlui-space-base\s*:/g) || []).length,
      };
    });

    expect(themeCssCounts.resetVarCount).toBeLessThan(10);
    expect(themeCssCounts.rootThemeVarCount).toBe(0);
  });

  test("keeps root theme CSS for inherited playgrounds with local tone switchers", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      '```xmlui-pg immediate height="240px" name="Inherited tone switcher playground"',
      "<App>",
      '  <Footer testId="footer">',
      "    Built with XMLUI",
      "    <SpaceFiller />",
      "    <ToneSwitch />",
      "  </Footer>",
      "</App>",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    const toneSwitch = page.getByRole("switch");
    await expect(toneSwitch).toBeVisible();
    await toneSwitch.click({ force: true });
    await expect(toneSwitch).toBeChecked();

    const themeCssCounts = await page.evaluate(() => {
      const host = Array.from(document.querySelectorAll("*")).find((element) => element.shadowRoot);
      const styleText = Array.from(host?.shadowRoot?.querySelectorAll("style") || [])
        .map((style) => style.textContent || "")
        .join("\n");
      const footer = host?.shadowRoot?.querySelector('[class*="footerWrapper"]');
      const hostRect = host?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();
      return {
        resetVarCount: (styleText.match(/--xmlui-[^:]+:\s*initial/g) || []).length,
        rootThemeVarCount: (styleText.match(/--xmlui-space-base\s*:/g) || []).length,
        hostHeight: hostRect?.height,
        footerBottomGap:
          hostRect && footerRect ? Math.round(hostRect.bottom - footerRect.bottom) : undefined,
      };
    });

    expect(themeCssCounts.resetVarCount).toBeGreaterThan(100);
    expect(themeCssCounts.rootThemeVarCount).toBeGreaterThan(0);
    expect(themeCssCounts.hostHeight).toBeGreaterThan(180);
    expect(themeCssCounts.footerBottomGap).toBeLessThan(4);
  });

  test("keeps parent theme reset for explicitly themed playgrounds", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      '```xmlui-pg immediate height="240px" name="Explicit theme playground"',
      '<App defaultTheme="test">',
      '  <Button label="Explicit theme playground" />',
      "</App>",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(page.getByRole("button", { name: "Explicit theme playground" })).toBeVisible();
    const themeCssCounts = await page.evaluate(() => {
      const host = Array.from(document.querySelectorAll("*")).find((element) => element.shadowRoot);
      const styleText = Array.from(host?.shadowRoot?.querySelectorAll("style") || [])
        .map((style) => style.textContent || "")
        .join("\n");
      return {
        resetVarCount: (styleText.match(/--xmlui-[^:]+:\s*initial/g) || []).length,
        rootThemeVarCount: (styleText.match(/--xmlui-space-base\s*:/g) || []).length,
      };
    });

    expect(themeCssCounts.resetVarCount).toBeGreaterThan(100);
    expect(themeCssCounts.rootThemeVarCount).toBeGreaterThan(0);
  });

  test("renders an empty app and warns when the app segment has only inline components", async ({
    initTestBed,
    page,
  }) => {
    const warningPromise = page.waitForEvent("console", (message) => {
      return (
        message.type() === "warning" &&
        message.text().includes("contains only inline component definitions")
      );
    });
    const SOURCE = [
      "```xmlui-pg",
      '<Component name="OnlyInline">',
      '  <Text value="not rendered" />',
      "</Component>",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await warningPromise;
    await expect(page.getByText("not rendered")).toHaveCount(0);
  });

  test("renders a parse error when the app segment has multiple app roots", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      "```xmlui-pg",
      '<Component name="InlineOk">',
      '  <Text value="inline" />',
      "</Component>",
      '<Text value="first root" />',
      '<Text value="second root" />',
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(
      page.getByText("A component definition must have exactly one XMLUI element.").first(),
    ).toBeVisible();
  });

  test("renders both inline components and ---comp segment components", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      "```xmlui-pg",
      "---app",
      '<Component name="InlinePart">',
      '  <Text value="inline part" />',
      "</Component>",
      "<App>",
      "  <InlinePart />",
      "  <SegmentPart />",
      "</App>",
      "---comp",
      '<Component name="SegmentPart">',
      '  <Text value="segment part" />',
      "</Component>",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(page.getByText("inline part")).toBeVisible();
    await expect(page.getByText("segment part")).toBeVisible();
  });

  test("---comp segment wins over a same-name inline component", async ({ initTestBed, page }) => {
    const SOURCE = [
      "```xmlui-pg",
      "---app",
      '<Component name="Dupe">',
      '  <Text value="inline dupe" />',
      "</Component>",
      "<App>",
      "  <Dupe />",
      "</App>",
      "---comp",
      '<Component name="Dupe">',
      '  <Text value="segment dupe" />',
      "</Component>",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(page.getByText("segment dupe")).toBeVisible();
    await expect(page.getByText("inline dupe")).toHaveCount(0);
  });

  test("renders reusable-component errors for invalid inline component declarations", async ({
    initTestBed,
    page,
  }) => {
    const SOURCE = [
      "```xmlui-pg",
      "<Component>",
      '  <Text value="invalid inline" />',
      "</Component>",
      "<App />",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${SOURCE}]]></Markdown>`);

    await expect(page.getByText("A reusable component must have a non-empty name.")).toBeVisible();
  });
});

test.describe("highlightText", () => {
  // Text ordering of terms: pty(0) ticker(1) pty(2) ticker(3)
  const MULTI = `The pty layer and the ticker both matter. Another pty here, and a ticker there.`;

  test("string highlights only the literal phrase", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Markdown highlightText="pty ticker"><![CDATA[The pty layer, the ticker, and the phrase pty ticker once.]]></Markdown>`,
    );
    await expect(page.locator("mark")).toHaveCount(1);
    await expect(page.locator("mark")).toHaveText("pty ticker");
  });

  test("array marks every occurrence of each term", async ({ initTestBed, page }) => {
    await initTestBed(`<Markdown highlightText="{['pty', 'ticker']}"><![CDATA[${MULTI}]]></Markdown>`);
    await expect(page.locator("mark")).toHaveCount(4);
    await expect(page.locator("mark").filter({ hasText: "pty" })).toHaveCount(2);
    await expect(page.locator("mark").filter({ hasText: "ticker" })).toHaveCount(2);
  });

  test("highlightActiveIndex walks marks in document order across terms", async ({
    initTestBed,
    page,
  }) => {
    // Index 1 is the first ticker (document order), NOT the second pty (per-term order).
    await initTestBed(
      `<Markdown highlightText="{['pty', 'ticker']}" highlightActiveIndex="{1}"><![CDATA[${MULTI}]]></Markdown>`,
    );
    await expect(page.locator('mark[data-active="true"]')).toHaveCount(1);
    await expect(page.locator('mark[data-active="true"]')).toHaveText("ticker");
  });

  test("active index 2 selects a pty, not a ticker — counting is interleaved, not per-term", async ({
    initTestBed,
    page,
  }) => {
    // Per-term counting would put both ptys at indexes 0,1 and ticker at 2;
    // interleaved document order puts pty at 0, ticker at 1, pty at 2.
    await initTestBed(
      `<Markdown highlightText="{['pty', 'ticker']}" highlightActiveIndex="{2}"><![CDATA[${MULTI}]]></Markdown>`,
    );
    await expect(page.locator('mark[data-active="true"]')).toHaveText("pty");
  });

  test("longest overlapping term wins (no nested marks)", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Markdown highlightText="{['cat', 'category']}"><![CDATA[Pick a category for the cat.]]></Markdown>`,
    );
    // "category" matched as one mark (longest-first), plus the standalone "cat" = 2 marks, none nested.
    await expect(page.locator("mark")).toHaveCount(2);
    await expect(page.locator("mark mark")).toHaveCount(0);
    await expect(page.locator("mark").filter({ hasText: "category" })).toHaveCount(1);
  });

  test("terms shorter than 2 chars and empty array are no-ops", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Markdown highlightText="{['a', '']}"><![CDATA[a apple banana]]></Markdown>`,
    );
    await expect(page.locator("mark")).toHaveCount(0);
  });
});

test.describe("interpolateBindings", () => {
  test("default (true) evaluates @{...} bindings", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<Markdown><![CDATA[sum is @{1 + 1}]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("sum is 2");
  });

  test("interpolateBindings=false renders @{...} literally", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(
      `<Markdown interpolateBindings="false"><![CDATA[sum is @{1 + 1}]]></Markdown>`,
    );
    await expect((await createMarkdownDriver()).component).toHaveText("sum is @{1 + 1}");
  });

  test("interpolateBindings=false leaves colliding PowerShell syntax intact", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(
      `<Markdown interpolateBindings="false"><![CDATA[Get-WinEvent -FilterHashtable @{ LogName = 3077 }]]></Markdown>`,
    );
    await expect((await createMarkdownDriver()).component).toHaveText(
      "Get-WinEvent -FilterHashtable @{ LogName = 3077 }",
    );
  });

  test("default (true) removes an empty @{} expression", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    // Same syntax as a LaTeX inter-column spec `@{}`; the default path strips it.
    await initTestBed(`<Markdown><![CDATA[col@{}spec]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("colspec");
  });

  test("interpolateBindings=false preserves an empty @{} expression", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    // The LaTeX `@{}` column-spec case: with interpolation off it must render
    // literally rather than being silently deleted.
    await initTestBed(`<Markdown interpolateBindings="false"><![CDATA[col@{}spec]]></Markdown>`);
    await expect((await createMarkdownDriver()).component).toHaveText("col@{}spec");
  });

  test("a binding that throws during evaluation fails soft (renders literally, no crash)", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    // `LogName = 22` assigns to an identifier not in scope, which throws in the
    // script engine. With fail-soft, the expression renders as its literal text
    // instead of propagating and crashing the whole Markdown surface.
    await initTestBed(`<Markdown><![CDATA[cmd @{ LogName = 22 }]]></Markdown>`);
    const driver = await createMarkdownDriver();
    await expect(driver.component).toBeAttached();
    await expect(driver.component).toContainText("@{ LogName = 22 }");
  });

  test("interpolateBindings=false does not rewrite a quoted xmlui-pg fence into a playground", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    // Content that merely *quotes* a playground fence (transcripts do this) must
    // render as an ordinary code block, not be rewritten into a live playground.
    await initTestBed(
      "<Markdown interpolateBindings=\"false\"><![CDATA[```xmlui-pg\n<App><Text>hello</Text></App>\n```]]></Markdown>",
    );
    const driver = await createMarkdownDriver();
    await expect(driver.component).toBeAttached();
    // The raw fence source survives as text; no NestedApp playground is mounted.
    await expect(driver.component).toContainText("<App><Text>hello</Text></App>");
  });

  test("interpolateBindings=false preserves a quoted four-backtick xmlui-pg fence (no 4->3 rewrite)", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    // A four-backtick `xmlui-pg` fence displayed literally inside a five-backtick
    // display fence. The ungated engine's playground observer rewrites the inner
    // fence 4->3 even here; with interpolation off the observer is skipped, so the
    // four backticks survive and no playground UI is mounted.
    const md =
      "`````\n" +
      "````xmlui-pg\n" +
      '<App>\n  <Text value="quoted example, not a live playground" />\n</App>\n' +
      "````\n" +
      "`````";
    await initTestBed(`<Markdown interpolateBindings="false"><![CDATA[${md}]]></Markdown>`);
    const driver = await createMarkdownDriver();
    await expect(driver.component).toBeAttached();
    // The inner fence keeps all four backticks (would be three if the observer ran).
    await expect(driver.component).toContainText("````xmlui-pg");
    await expect(driver.component).toContainText('quoted example, not a live playground');
  });
});

// Pins the raw-inline-HTML behavior for downstream consumers of data-fed content.
// `Markdown` renders a subset of raw HTML via rehype-raw; `interpolateBindings`
// gates only the XMLUI authoring transforms (bindings, playground, tree display),
// NOT the HTML pass-through. So quoted markup in data content still renders as
// real elements — consumers that must show HTML literally have to escape it first.
test.describe("raw HTML in content", () => {
  test("raw inline HTML renders as a real element (default)", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(`<Markdown><![CDATA[Say <mark>flagged</mark> here]]></Markdown>`);
    const driver = await createMarkdownDriver();
    await expect(driver.component.locator("mark")).toHaveText("flagged");
  });

  test("raw inline HTML still renders as an element with interpolateBindings=false", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(
      `<Markdown interpolateBindings="false"><![CDATA[Say <mark>flagged</mark> here]]></Markdown>`,
    );
    const driver = await createMarkdownDriver();
    await expect(driver.component.locator("mark")).toHaveText("flagged");
  });
});

test.describe("allowHtml", () => {
  test("default (true) renders raw inline HTML as an element", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(`<Markdown><![CDATA[Say <mark>flagged</mark> here]]></Markdown>`);
    const driver = await createMarkdownDriver();
    await expect(driver.component.locator("mark")).toHaveText("flagged");
  });

  test("allowHtml=false renders raw inline HTML as literal text", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(
      `<Markdown allowHtml="false"><![CDATA[Say <mark>flagged</mark> here]]></Markdown>`,
    );
    const driver = await createMarkdownDriver();
    // No element is produced; the raw tags render as literal characters.
    await expect(driver.component.locator("mark")).toHaveCount(0);
    await expect(driver.component).toContainText("Say <mark>flagged</mark> here");
  });

  test("allowHtml=false preserves a lone unterminated tag as literal text (no data loss)", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    // Dropping rehype-raw / skipHtml would delete this tag entirely; the remark
    // text-conversion keeps it verbatim.
    await initTestBed(`<Markdown allowHtml="false"><![CDATA[trailing <notclosed]]></Markdown>`);
    const driver = await createMarkdownDriver();
    await expect(driver.component).toContainText("trailing <notclosed");
  });

  test("allowHtml=false does not disturb a fenced code block", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    // Content inside a code fence is already literal (rehype-raw never touched it),
    // so neutralization must not double-escape it.
    await initTestBed(
      "<Markdown allowHtml=\"false\"><![CDATA[```\n<div>in a fence</div>\n```]]></Markdown>",
    );
    const driver = await createMarkdownDriver();
    await expect(driver.component.locator("code")).toContainText("<div>in a fence</div>");
    await expect(driver.component).not.toContainText("&lt;div&gt;");
  });

  test("interpolateBindings=false + allowHtml=false is fully data-safe on a mixed payload", async ({
    initTestBed,
    createMarkdownDriver,
  }) => {
    await initTestBed(
      `<Markdown interpolateBindings="false" allowHtml="false"><![CDATA[cmd @{ LogName = 22 } then <b>bold?</b>]]></Markdown>`,
    );
    const driver = await createMarkdownDriver();
    await expect(driver.component.locator("b")).toHaveCount(0);
    await expect(driver.component).toContainText("cmd @{ LogName = 22 } then <b>bold?</b>");
  });
});

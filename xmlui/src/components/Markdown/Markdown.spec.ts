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

test.skip(
  "only renders if children are strings",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "renders if children are provided through CDATA",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip("renders body text", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders strong text", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders emphasis text", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders heading", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders link", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders image", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders unordered list", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders ordered list", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders inline code", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders table", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip("renders blockquote", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

test.skip(
  "renders horizontal rule",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test("renders code block", async ({ initTestBed, createMarkdownDriver }) => {
  const code = "```\n" + "I did not expect this\n" + "```";
  await initTestBed(`<Markdown><![CDATA[${code}]]></Markdown>`);
  const driver = await createMarkdownDriver();
  await expect(driver.component).toHaveText("I did not expect this");
  expect(await driver.hasHtmlElement(["pre", "code"])).toBeTruthy();
});

test.skip(
  "renders code block with mock highlighter",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

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

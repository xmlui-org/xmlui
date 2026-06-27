import { expect, test } from "../../testing/fixtures";

test.describe("Markdown foundation", () => {
  test("Markdown renders", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<App><Markdown># Hello</Markdown></App>`);

    await expect((await createMarkdownDriver()).component.locator("h1")).toHaveText("Hello");
  });

  test("handles legacy binding expressions", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`
      <App var.value="{2}">
        <Markdown>One: @{1 + 1}; Two: @{value}; Object: @{{ a: 1, b: () => null }}; Empty: @{}.</Markdown>
      </App>
    `);

    await expect((await createMarkdownDriver()).component).toContainText(
      'One: 2; Two: 2; Object: {"a":1,"b":"[xmlui function]"}; Empty: .',
    );
  });

  test("does not detect escaped expressions", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`<App><Markdown>\\@{1} and @\\{2}</Markdown></App>`);

    await expect((await createMarkdownDriver()).component).toHaveText("@{1} and @{2}");
  });

  test("does not replace binding expressions inside fenced code", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.value="{42}">
        <Markdown>
          Before @{value}

          \`\`\`xmlui
          &lt;Text&gt;@{value}&lt;/Text&gt;
          \`\`\`

          After @{value}
        </Markdown>
      </App>
    `);

    await expect(page.locator('[data-xmlui-component="Markdown"]')).toContainText("Before 42");
    await expect(page.locator("pre > code")).toContainText("@{value}");
    await expect(page.locator('[data-xmlui-component="Markdown"]')).toContainText("After 42");
  });

  for (const level of ["#", "##", "###", "####", "#####", "######"]) {
    test(`can render anchor link for '${level}'`, async ({ initTestBed, page }) => {
      await initTestBed(`<App><Markdown showHeadingAnchors="true">${level} Heading</Markdown></App>`);

      await expect(page.locator(`${"h" + level.length} a`)).toHaveAttribute("href", "#heading");
    });
  }

  test("uses explicit heading anchor id when present", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown showHeadingAnchors="true">## Heading [#explicit-anchor]</Markdown></App>`);

    await expect(page.locator("h2")).toContainText("Heading");
    await expect(page.locator("h2 a")).toHaveAttribute("href", "#explicit-anchor");
  });

  test("only renders if children are strings", async ({ initTestBed, createMarkdownDriver }) => {
    await initTestBed(`
      <App>
        <Markdown>
          # Heading
          <Button>Button</Button>
        </Markdown>
      </App>
    `);

    await expect((await createMarkdownDriver()).component).toHaveText("");
  });

  test("rendered text-bearing content can be selected by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Markdown>
          # Heading

          Paragraph with \`inline\`.

          - Item

          | Header |
          | --- |
          | Cell |

          \`\`\`
          code
          \`\`\`
        </Markdown>
      </App>
    `);

    for (const selector of ["h1", "p", "li", "code", "td", "pre"]) {
      await expect(page.locator(selector).first()).toHaveCSS("user-select", "text");
    }
  });

  test("4space/1 tab indent is not code block by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Markdown>
            # Heading
            _emphasis_
        </Markdown>
      </App>
    `);

    await expect(page.locator("pre")).toHaveCount(0);
    await expect(page.locator("h1")).toHaveText("Heading");
    await expect(page.locator("em")).toHaveText("emphasis");
  });

  test("removeBr controls br rendering", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown removeBr="true">one&lt;br/&gt;two</Markdown></App>`);
    await expect(page.locator("br")).toHaveCount(0);

    await initTestBed(`<App><Markdown removeBr="false">one&lt;br/&gt;two</Markdown></App>`);
    await expect(page.locator("br")).toHaveCount(1);
  });

  test("renders a basic xmlui-pg playground", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Markdown>
          \`\`\`xmlui-pg height="120px"
          &lt;App var.count="{0}"&gt;
            &lt;Text testId="pg-count"&gt;Count: {count}&lt;/Text&gt;
            &lt;Button testId="pg-button" onClick="count++"&gt;Increment&lt;/Button&gt;
          &lt;/App&gt;
          \`\`\`
        </Markdown>
      </App>
    `);

    await expect(page.getByTestId("pg-count")).toHaveText("Count: 0");
    await page.getByTestId("pg-button").click();
    await expect(page.getByTestId("pg-count")).toHaveText("Count: 1");
  });

  test("xmlui-pg playground extracts only the app section", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Markdown>
          \`\`\`xmlui-pg height="120px"
          ---config
          {
            "defaultTheme": "xmlui-hero-theme"
          }
          ---app display
          &lt;App&gt;
            &lt;Text testId="pg-section"&gt;Section app&lt;/Text&gt;
          &lt;/App&gt;
          ---api
          {
            "apiUrl": "/api"
          }
          \`\`\`
        </Markdown>
      </App>
    `);

    await expect(page.getByTestId("pg-section")).toHaveText("Section app");
    await expect(page.getByText("---api")).toHaveCount(0);
  });
});

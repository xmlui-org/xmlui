import { getBounds } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("htmlTable is rendered", async ({ initTestBed, createHtmlTagDriver }) => {
    await initTestBed(`<table />`);
    const driver = await createHtmlTagDriver();

    await expect(driver.component).toBeAttached();
  });
});

const tableCode = `
<table>
  <thead>
    <tr>
      <th scope="col">Person</th>
      <th scope="col">Most interest in</th>
      <th scope="col">Age</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Chris</th>
      <td>HTML tables</td>
      <td>22</td>
    </tr>
    <tr>
      <th scope="row">Dennis</th>
      <td>Web accessibility</td>
      <td>45</td>
    </tr>
    <tr>
      <th scope="row">Sarah</th>
      <td>JavaScript frameworks</td>
      <td>29</td>
    </tr>
    <tr>
      <th scope="row">Karen</th>
      <td>Web performance</td>
      <td>36</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row" colSpan="2">Average age</th>
      <td>33</td>
    </tr>
  </tfoot>
</table>
`;

test("htmlTable width using themes", async ({ initTestBed, createHtmlTagDriver }) => {
  const { width } = await initTestBed(tableCode, {
    testThemeVars: {
      "width-HtmlTable": "100%",
    },
  });
  const driver = await createHtmlTagDriver();
  const compWidth = (await getBounds(driver.component)).width;

  expect(compWidth).toEqual(width);
});

test("htmlTable width is supplied by component CSS instead of inline theme variables", async ({
  initTestBed,
  createHtmlTagDriver,
}) => {
  await initTestBed(`<table />`, {
    testThemeVars: {
      "width-HtmlTable": "321px",
    },
  });
  const driver = await createHtmlTagDriver();

  await expect(driver.component).toHaveCSS("width", "321px");
  await expect(driver.component).not.toHaveAttribute("style", /xmlui-current-width-HtmlTag/);
});

test("text-like html tags use XMLUI Text variants", async ({ initTestBed, page }) => {
  await initTestBed(`<abbr testId="abbr">html</abbr>`);

  await expect(page.getByTestId("abbr")).toHaveClass(/xmlui-abbr/);
  await expect(page.getByTestId("abbr")).toHaveCSS("text-transform", "uppercase");
});

test("anchor html tag uses XMLUI Link behavior", async ({ initTestBed, page }) => {
  await initTestBed(`<a testId="link" href="/accounts" disabled>Accounts</a>`);
  const link = page.getByTestId("link");

  await expect(link).toHaveAttribute("href", "/accounts");
  await expect(link).toHaveClass(/linkDisabled/);
});

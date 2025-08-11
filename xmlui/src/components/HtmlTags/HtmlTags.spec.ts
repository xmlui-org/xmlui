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
  const compWidth = (await getBounds(driver)).width;

  expect(compWidth).toEqual(width);
});

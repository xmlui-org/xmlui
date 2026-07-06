import { expect, test } from "../../testing/fixtures";

test.describe("Logo compatibility", () => {
  test("renders the manifest resource logo", async ({ page, initTestBed }) => {
    await initTestBed(`<Logo testId="logo" />`);

    const logo = page.getByTestId("logo");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", "/resources/xmlui-logo.svg");
    await expect(logo).toHaveAttribute("alt", "Logo");
  });

  test("supports alt text, inline display, and bound updates", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <variable name="logoAlt" value="Initial logo" />
        <Logo testId="logo" alt="{logoAlt}" inline="true" />
        <Button testId="update" onClick="logoAlt = 'Updated logo'">Update</Button>
      </Fragment>
    `);

    const logo = page.getByTestId("logo");
    await expect(logo).toHaveAttribute("alt", "Initial logo");
    await expect(logo).toHaveCSS("display", "inline");

    await page.getByTestId("update").click();

    await expect(logo).toHaveAttribute("alt", "Updated logo");
  });
});

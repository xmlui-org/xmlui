import { expect, test } from "../../testing/fixtures";

test.describe("Basic Functionality", () => {
  test("renders the default resource logo without an explicit source", async ({ page, initTestBed }) => {
    await initTestBed(`<Logo testId="logo" />`);

    const logo = page.getByTestId("logo");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", "/resources/xmlui-logo.svg");
  });

  test("renders explicit logo source as an image", async ({ page, initTestBed }) => {
    await initTestBed(`<Logo testId="logo" src="/resources/test-image-100x100.jpg" />`);

    const logo = page.getByTestId("logo");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", "/resources/test-image-100x100.jpg");
    await expect(logo).toHaveAttribute("alt", "Logo");
  });

  test("uses custom alt text", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Logo
        testId="logo"
        src="/resources/test-image-100x100.jpg"
        alt="Company mark"
      />
    `);

    await expect(page.getByTestId("logo")).toHaveAttribute("alt", "Company mark");
  });

  test("supports inline display", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Logo testId="logo" src="/resources/test-image-100x100.jpg" inline="true" />
    `);

    await expect(page.getByTestId("logo")).toHaveCSS("display", "inline");
  });
});

test.describe("State Updates", () => {
  test("updates rendered alt text when bound state changes", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <variable name="logoAlt" value="Initial logo" />
        <Logo
          testId="logo"
          src="/resources/test-image-100x100.jpg"
          alt="{logoAlt}"
        />
        <Button testId="update" onClick="logoAlt = 'Updated logo'">Update</Button>
      </Fragment>
    `);

    await expect(page.getByTestId("logo")).toHaveAttribute("alt", "Initial logo");

    await page.getByTestId("update").click();

    await expect(page.getByTestId("logo")).toHaveAttribute("alt", "Updated logo");
  });
});

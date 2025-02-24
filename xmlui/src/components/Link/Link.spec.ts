import { expect, test } from "../../testing/fixtures";

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createLinkDriver }) => {
    await initTestBed(`<Link />`);
    const driver = await createLinkDriver();

    await expect(driver.component).toBeAttached();
    await expect(driver.component).toBeEmpty();
  });

  test("HtmlTag link is rendered", async ({ initTestBed, createLinkDriver }) => {
    await initTestBed(`<a />`);
    const driver = await createLinkDriver();

    await expect(driver.component).toBeAttached();
  });
});

test("HtmlTag 'a' accepts custom props not immediately used", async ({ initTestBed, createLinkDriver }) => {
  await initTestBed(`<a custom="test" boolean>Test Heading</a>`);
  const driver = await createLinkDriver();
  
  await expect(driver.component).toHaveAttribute("custom", "test");
  await expect(driver.component).toHaveAttribute("boolean", "true");
});
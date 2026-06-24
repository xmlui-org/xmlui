import { expect, test } from "../../testing/fixtures";

test.describe("ResponsiveBar foundation", () => {
  test("renders children horizontally and supports state updates", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ResponsiveBar testId="bar" gap="{8}" var.count="{0}">
        <Button testId="one" onClick="count++">One {count}</Button>
        <Button testId="two">Two</Button>
      </ResponsiveBar>
    `);

    await expect(page.getByTestId("bar")).toBeVisible();
    await expect(page.getByTestId("one")).toHaveText("One 0");
    await page.getByTestId("one").click();
    await expect(page.getByTestId("one")).toHaveText("One 1");
  });

  test("supports vertical and reverse layout flags", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ResponsiveBar testId="bar" orientation="vertical" reverse="{true}" height="180px">
        <Button testId="one">One</Button>
        <Button testId="two">Two</Button>
      </ResponsiveBar>
    `);

    const first = await page.getByTestId("one").boundingBox();
    const second = await page.getByTestId("two").boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(first!.y).toBeGreaterThan(second!.y);
  });
});

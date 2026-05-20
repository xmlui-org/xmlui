import { expect, test } from "../../testing/fixtures";

test.describe("FocusScope", () => {
  test("traps Tab navigation inside the scope", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <FocusScope>
          <Button label="First" />
          <Button label="Second" />
        </FocusScope>
        <Button label="Outside" />
      </Fragment>
    `);

    const first = page.getByRole("button", { name: "First" });
    const second = page.getByRole("button", { name: "Second" });

    await first.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(second).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
  });

  test("does not trap when trap is false", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <FocusScope trap="false">
          <Button label="First" />
          <Button label="Second" />
        </FocusScope>
        <Button label="Outside" />
      </Fragment>
    `);

    await page.getByRole("button", { name: "Second" }).focus();
    await page.keyboard.press("Tab");

    await expect(page.getByRole("button", { name: "Outside" })).toBeFocused();
  });

  test("restores focus when the scope unmounts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.open="{false}">
        <Button label="Open" onClick="open = true" />
        <FocusScope when="{open}" restore="true">
          <Button label="Close" onClick="open = false" />
        </FocusScope>
      </Fragment>
    `);

    const open = page.getByRole("button", { name: "Open" });
    await open.click();
    await page.getByRole("button", { name: "Close" }).click();

    await expect(open).toBeFocused();
  });
});

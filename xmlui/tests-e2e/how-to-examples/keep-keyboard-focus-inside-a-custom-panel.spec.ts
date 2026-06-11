import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/keep-keyboard-focus-inside-a-custom-panel.md"),
);

test.describe("Restore focus after editing", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "restore-focus-after-editing");

  test("initial state shows the opener buttons and hides the editor", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("button", { name: "Edit profile" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Archive" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Name" })).not.toBeVisible();
  });

  test("opening the editor traps tab navigation inside it", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Edit profile" }).click();

    const name = page.getByRole("textbox", { name: "Name" });
    const cancel = page.getByRole("button", { name: "Cancel" });
    const save = page.getByRole("button", { name: "Save" });

    await expect(name).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(cancel).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(save).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(name).toBeFocused();
  });

  test("closing the editor restores focus to the opener", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const editProfile = page.getByRole("button", { name: "Edit profile" });
    await editProfile.click();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(editProfile).toBeFocused();
  });
});

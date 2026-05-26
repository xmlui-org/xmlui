import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/modal-dialogs.md"),
);

test.describe("modal-dialogs-b6ec", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "modal-dialogs-b6ec");

  test("renders the card with a Details button and no dialog initially", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Details" })).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking Details opens the modal dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Details" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByText("Leslie is always number one to the coffee machine."),
    ).toBeVisible();
  });
});

test.describe("modal-dialogs-b758", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "modal-dialogs-b758");

  test("renders the card with a Details button and no dialog initially", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Details" })).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking Details opens the dialog with title and a Close button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Details" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Leslie Peters");
    // The dialog has a built-in X close button and an explicit Close button
    await expect(dialog.getByText("Close", { exact: true })).toBeVisible();
  });

  test("clicking Close button closes the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Details" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Click the explicit Close button (not the X button in the title bar)
    await dialog.getByText("Close", { exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

test.describe("modal-dialogs-b7dc", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "modal-dialogs-b7dc");

  test("renders the card with a Details button and no dialog initially", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Details" })).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking Details opens the dialog with a form and passes the ID parameter", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Details" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("ID: 123");
    await expect(dialog).toContainText("User Name");
    await expect(dialog).toContainText("Age");
  });
});

test.describe("when-to-use-declarative-vs-imperative-modals-b851", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "when-to-use-declarative-vs-imperative-modals-b851",
  );

  test("renders the Open Dialog button with no dialog initially visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Open Dialog" })).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking Open Dialog shows the dialog with a Close Dialog button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Dialog" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Close Dialog" })).toBeVisible();
  });

  test("clicking Close Dialog closes the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Dialog" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close Dialog" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

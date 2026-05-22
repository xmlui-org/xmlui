import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-03.md"),
);

// The Dashboard and Invoices components in tutorial-03.md contain raw text nodes which
// the XMLUI test harness rejects with U036 (no nested component definition).
// We use the app markup from extractXmluiExample but hardcode fixed component definitions
// that wrap the text in <Text> elements.
const fixedComponents = [
  `<Component name="Dashboard"><Text>This is Dashboard.</Text></Component>`,
  `<Component name="Invoices"><Text>This is Invoices.</Text></Component>`,
];

test.describe("vertical layout", { tag: "@website" }, () => {
  const { app, apiInterceptor } = extractXmluiExample(markdown, "vertical layout");

  test("renders app with vertical navigation containing Dashboard and Invoices", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components: fixedComponents, apiInterceptor });
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Invoices" })).toBeVisible();
  });

  test("clicking Invoices navigates to the Invoices page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components: fixedComponents, apiInterceptor });
    await page.getByRole("link", { name: "Invoices" }).click();
    await expect(page.getByText("This is Invoices.")).toBeVisible();
  });

  test("clicking Dashboard navigates back to the Dashboard page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components: fixedComponents, apiInterceptor });
    await page.getByRole("link", { name: "Invoices" }).click();
    await expect(page.getByText("This is Invoices.")).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByText("This is Dashboard.")).toBeVisible();
  });

  test("ToneSwitch toggles between light and dark tone", async ({ initTestBed, page }) => {
    await initTestBed(app, { components: fixedComponents, apiInterceptor });
    const toneSwitch = page.getByRole("switch");
    await expect(toneSwitch).not.toBeChecked();
    await toneSwitch.click({ force: true });
    await expect(toneSwitch).toBeChecked();
    await toneSwitch.click({ force: true });
    await expect(toneSwitch).not.toBeChecked();
  });
});

test.describe("horizontal layout", { tag: "@website" }, () => {
  const { app, apiInterceptor } = extractXmluiExample(markdown, "horizontal layout");

  test("renders app with horizontal navigation containing Dashboard and Invoices", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components: fixedComponents, apiInterceptor });
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Invoices" })).toBeVisible();
  });

  test("clicking Invoices navigates to the Invoices page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components: fixedComponents, apiInterceptor });
    await page.getByRole("link", { name: "Invoices" }).click();
    await expect(page.getByText("This is Invoices.")).toBeVisible();
  });

  test("clicking Dashboard navigates back to the Dashboard page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components: fixedComponents, apiInterceptor });
    await page.getByRole("link", { name: "Invoices" }).click();
    await expect(page.getByText("This is Invoices.")).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByText("This is Dashboard.")).toBeVisible();
  });

  test("ToneSwitch toggles between light and dark tone", async ({ initTestBed, page }) => {
    await initTestBed(app, { components: fixedComponents, apiInterceptor });
    const toneSwitch = page.getByRole("switch");
    await expect(toneSwitch).not.toBeChecked();
    await toneSwitch.click({ force: true });
    await expect(toneSwitch).toBeChecked();
    await toneSwitch.click({ force: true });
    await expect(toneSwitch).not.toBeChecked();
  });
});

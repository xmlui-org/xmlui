import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/center-content-on-the-page.md",
  ),
);

test.describe("Centred login card", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Centred login card");

  test("initial state renders the sign-in card with all fields and button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("typing in the Email field updates its value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const emailBox = page.getByRole("textbox", { name: "Email" });
    await emailBox.fill("user@example.com");
    await expect(emailBox).toHaveValue("user@example.com");
  });

  test("typing in the Password field updates its value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const passwordBox = page.getByRole("textbox", { name: "Password" });
    await passwordBox.fill("secret123");
    await expect(passwordBox).toHaveValue("secret123");
  });
});

test.describe("Centered vertically in a filled region", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Centered vertically in a filled region",
  );

  test("initial state renders the vertically centered content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Vertically centered" })).toBeVisible();
    await expect(page.getByText("This sits in the vertical middle")).toBeVisible();
    await expect(page.getByText("Drop the height and it snaps to the top")).toBeVisible();
  });
});

test.describe("Centred with marginHorizontal", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Centred with marginHorizontal",
  );

  test("initial state renders the centered column heading and body text", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Centered Column" })).toBeVisible();
    await expect(
      page.getByText('This article column is centred using marginHorizontal="auto".'),
    ).toBeVisible();
  });
});

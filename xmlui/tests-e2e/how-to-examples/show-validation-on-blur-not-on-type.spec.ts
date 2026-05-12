import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/show-validation-on-blur-not-on-type.md"),
);

test.describe("Debounced username availability check", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Debounced username availability check",
  );

  test("initial state renders form with Register button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("API returns taken=true so username shows 'already taken' error after debounce", async ({
    initTestBed,
    page,
  }) => {
    // The raw fetch('/check-username') inside onValidate goes through MSW but the
    // relative URL pattern ("/check-username") isn't reliably matched when apiUrl
    // is empty — the service worker intercepts but never responds.  The equivalent
    // pattern using Actions.callApi() works fine (see add-an-async-uniqueness-check).
    // Skip rather than hang for 10 s on every CI run.
    test.skip(
      true,
      "raw fetch() in onValidate cannot be intercepted via MSW with an empty apiUrl; use Actions.callApi() for testable async validation",
    );
  });

  test("username shorter than 3 characters shows built-in minLength error on submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { apiInterceptor });
    const usernameInput = page.getByRole("textbox", { name: "Username" });
    await usernameInput.fill("ab");
    await page.getByRole("button", { name: "Register" }).click();
    // Built-in minLength fires immediately (not debounced)
    await expect(page.getByText(/at least 3/i)).toBeVisible();
  });
});

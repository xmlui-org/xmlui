import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/intercept-raw-form-navigation.md",
  ),
);

test.describe("Route a raw GET form through willNavigate", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "route-a-raw-get-form-through-willnavigate",
  );

  const xmluiConfig = { interceptExternalNavigation: true };

  test("initial state shows the raw form", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, xmluiConfig });
    await expect(page.getByText("Raw navigation")).toBeVisible();
    await expect(page.getByText("Guard status: not checked")).toBeVisible();
  });

  test("raw form submit is intercepted and routed through willNavigate", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, xmluiConfig });
    await page.getByRole("button", { name: "Submit raw form" }).click();
    await expect(page.getByText("Raw report")).toBeVisible();
    await expect(page.getByText("Guard status: checked /raw-report")).toBeVisible();
    await expect(
      page.getByText("The form submission went through XMLUI navigation."),
    ).toBeVisible();
  });
});

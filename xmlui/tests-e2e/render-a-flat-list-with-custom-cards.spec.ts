import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/render-a-flat-list-with-custom-cards.md"),
);

test.describe("Team directory with custom card rows", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Team directory with custom card rows",
  );

  test("initial state renders all five team members with name and role", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice Chen")).toBeVisible();
    await expect(page.getByText("Bob Martinez")).toBeVisible();
    await expect(page.getByText("Carol Kim")).toBeVisible();
    await expect(page.getByText("Dave Lee")).toBeVisible();
    await expect(page.getByText("Eve Torres")).toBeVisible();
  });

  test("each card shows the member's role and department", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Senior Developer")).toBeVisible();
    await expect(page.getByText("UI Designer")).toBeVisible();
    await expect(page.getByText("Product Manager")).toBeVisible();
    await expect(page.getByText("DevOps Engineer")).toBeVisible();
    await expect(page.getByText("UX Researcher")).toBeVisible();

    await expect(page.getByText("Engineering").first()).toBeVisible();
    await expect(page.getByText("Design").first()).toBeVisible();
    await expect(page.getByText("Product", { exact: true })).toBeVisible();
  });

  test("active members show an 'active' badge and Carol shows an 'on-leave' badge", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const activeBadges = page.getByText("active");
    await expect(activeBadges).toHaveCount(4);
    await expect(page.getByText("on-leave")).toBeVisible();
  });
});

import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/drive-a-slider-with-a-runtime-domain.md",
  ),
);

test.describe("Switch the dataset to move the domain", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Switch the dataset to move the domain",
  );

  test("the slider seeds to the initial domain", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("domain: 12 – 44")).toBeVisible();
    const thumbs = page.getByRole("slider");
    await expect(thumbs).toHaveCount(2);
    await expect(thumbs.first()).toHaveAttribute("aria-valuenow", "12");
    await expect(thumbs.last()).toHaveAttribute("aria-valuenow", "44");

  });

  test("changing the domain re-seeds the thumbs onto the new scale", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("domain: 12 – 44")).toBeVisible();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Q2 (140 – 270)" }).click();

    // The whole point of the pattern: no listener, no setValue call — the thumbs
    // land on the new domain because initialValue re-applies with min/max.
    await expect(page.getByText("domain: 140 – 270")).toBeVisible();
    const thumbs = page.getByRole("slider");
    await expect(thumbs.first()).toHaveAttribute("aria-valuenow", "140");
    await expect(thumbs.last()).toHaveAttribute("aria-valuenow", "270");
  });

  test("the re-seed does not fire didCommit", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    // Establish a selection, then move the domain. If re-seeding fired didCommit,
    // the handler would overwrite `selection` with the new full range instead of
    // the app's own reset — the silent-reset guarantee the how-to rests on.
    const thumbs = page.getByRole("slider");
    await thumbs.first().focus();
    await thumbs.first().press("ArrowRight");
    await expect(page.getByText(/^Selected /)).toBeVisible();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Q2 (140 – 270)" }).click();

    await expect(page.getByText("No selection — the whole domain is in play.")).toBeVisible();
  });
});

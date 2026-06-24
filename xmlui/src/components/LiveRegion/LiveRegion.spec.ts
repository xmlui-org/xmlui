import { expect, test } from "../../testing/fixtures";

test.describe("LiveRegion foundation", () => {
  test("renders a polite live region with the provided message", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LiveRegion testId="region" message="Saved" />
    `);

    const region = page.getByTestId("region");
    await expect(region).toHaveAttribute("role", "status");
    await expect(region).toHaveAttribute("aria-live", "polite");
    await expect(region).toHaveText("Saved");
  });

  test("uses alert semantics for assertive politeness", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LiveRegion testId="region" message="Failed" politeness="assertive" />
    `);

    const region = page.getByTestId("region");
    await expect(region).toHaveAttribute("role", "alert");
    await expect(region).toHaveAttribute("aria-live", "assertive");
  });
});

test.describe("LiveRegion old-suite transfer debt", () => {
  test("copy literal announcement-helper and accessibility edge cases", async () => {
    test.fixme(true, "Global live-region announcement service is deferred");
  });
});

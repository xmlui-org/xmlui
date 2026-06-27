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

  test("updates message from parent state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.statusMessage="Waiting">
        <Button testId="save" onClick="statusMessage = 'Settings saved'">Save</Button>
        <Text testId="status">{statusMessage}</Text>
        <LiveRegion message="{statusMessage}" />
      </App>
    `);

    await expect(page.getByTestId("status")).toHaveText("Waiting");
    await expect(page.getByRole("status")).toHaveText("Waiting");

    await page.getByTestId("save").click();

    await expect(page.getByTestId("status")).toHaveText("Settings saved");
    await expect(page.getByRole("status")).toHaveText("Settings saved");
  });

  test("toast announcements use the global live region without duplicating visible text", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Toast id="notify" />
        <Button testId="toast" onClick="notify.show('Saved')">Show toast</Button>
      </App>
    `);

    await page.getByTestId("toast").click();

    await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
    await expect(page.getByText("Saved")).toHaveCount(1);
    await expect(page.locator("[aria-live='polite'][aria-label='Saved']")).toBeAttached();
  });

  test("withLiveRegion announces value, label, and explicit messages", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.count="{2}" var.emptyMessage="No matches">
        <Button testId="update" onClick="count = 3; emptyMessage = 'Still no matches'">Update</Button>
        <Badge value="{count}" withLiveRegion="{true}" liveRegionMessage="There are {count} approvals" />
        <NoResult label="{emptyMessage}" withLiveRegion="{true}" />
      </App>
    `);

    await expect(page.getByRole("status").filter({ hasText: "There are 2 approvals" })).toBeAttached();
    await expect(page.getByRole("status").filter({ hasText: "No matches" })).toBeAttached();

    await page.getByTestId("update").click();

    await expect(page.getByRole("status").filter({ hasText: "There are 3 approvals" })).toBeAttached();
    await expect(page.getByRole("status").filter({ hasText: "Still no matches" })).toBeAttached();
  });
});

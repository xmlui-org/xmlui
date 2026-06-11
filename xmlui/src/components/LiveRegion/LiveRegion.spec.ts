import { expect, test } from "../../testing/fixtures";

test.describe("LiveRegion", () => {
  test("renders polite status announcements by default", async ({ page, initTestBed }) => {
    await initTestBed(`<LiveRegion message="Saved" />`);

    const region = page.getByRole("status");

    await expect(region).toHaveAttribute("aria-live", "polite");
    await expect(region).toHaveAttribute("aria-atomic", "true");
    await expect(region).toHaveText("Saved");
  });

  test("renders assertive announcements as alerts", async ({ page, initTestBed }) => {
    await initTestBed(`<LiveRegion message="Could not save" politeness="assertive" />`);

    const region = page.getByRole("alert");

    await expect(region).toHaveAttribute("aria-live", "assertive");
    await expect(region).toHaveText("Could not save");
  });

  test("toast announcements do not duplicate visible toast text", async ({ page, initTestBed }) => {
    await initTestBed(`<Button label="Show toast" onClick="toast('Saved')" />`);

    await page.getByRole("button", { name: "Show toast" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
    await expect(page.getByText("Saved")).toHaveCount(1);
    await expect(page.locator("[aria-live][aria-label='Saved']")).toBeAttached();
  });

  test("updates message from a variable declared on a parent Fragment", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <App>
        <Fragment var.statusMessage="Waiting for an update">
          <VStack>
            <Button
              label="Save"
              onClick="statusMessage = 'Settings saved'"
            />
            <Text testId="status-text">{statusMessage}</Text>
            <LiveRegion message="{statusMessage}" politeness="polite" />
          </VStack>
        </Fragment>
      </App>
    `, { noFragmentWrapper: true });

    await expect(page.getByTestId("status-text")).toHaveText("Waiting for an update");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("status-text")).toHaveText("Settings saved");
    await expect(page.getByRole("status")).toHaveText("Settings saved");
  });

  test("updates message from a variable declared on a themed Fragment in App", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <App>
        <Theme>
          <Fragment var.statusMessage="Waiting for an update">
            <VStack>
              <Button
                label="Save"
                onClick="statusMessage = 'Settings saved'"
              />
              <Text testId="status-text">{statusMessage}</Text>
              <LiveRegion message="{statusMessage}" politeness="polite" />
            </VStack>
          </Fragment>
        </Theme>
      </App>
    `, { noFragmentWrapper: true });

    await expect(page.getByTestId("status-text")).toHaveText("Waiting for an update");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("status-text")).toHaveText("Settings saved");
    await expect(page.getByRole("status")).toHaveText("Settings saved");
  });

  test("withLiveRegion announces Text child updates", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.statusMessage="Waiting">
        <Button label="Save" onClick="statusMessage = 'Saved'" />
        <Text testId="status-text" withLiveRegion>{statusMessage}</Text>
      </Fragment>
    `);

    await expect(page.getByTestId("status-text")).toHaveText("Waiting");
    await expect(page.getByRole("status")).toHaveText("Waiting");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByTestId("status-text")).toHaveText("Saved");
    await expect(page.getByRole("status")).toHaveText("Saved");
  });

  test("withLiveRegion uses explicit liveRegionMessage on supported components", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Fragment var.count="{2}">
        <Button label="Add" onClick="count = 3" />
        <Badge
          value="{count}"
          withLiveRegion
          liveRegionMessage="There are {count} pending approvals"
        />
      </Fragment>
    `);

    await expect(page.getByRole("status")).toHaveText("There are 2 pending approvals");

    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByRole("status")).toHaveText("There are 3 pending approvals");
  });

  test("withLiveRegion announces heading value updates assertively", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Fragment var.headingMessage="Draft">
        <Button label="Publish" onClick="headingMessage = 'Published'" />
        <H1
          value="{headingMessage}"
          withLiveRegion
          liveRegionPoliteness="assertive"
        />
      </Fragment>
    `);

    await expect(page.getByRole("heading", { name: "Draft" })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveText("Draft");

    await page.getByRole("button", { name: "Publish" }).click();

    await expect(page.getByRole("heading", { name: "Published" })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveText("Published");
  });

  test("withLiveRegion announces Badge and NoResult text", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.badgeStatus="Queued" var.emptyMessage="No matches">
        <Button
          label="Update"
          onClick="badgeStatus = 'Done'; emptyMessage = 'Still no matches'"
        />
        <Badge value="{badgeStatus}" withLiveRegion />
        <NoResult label="{emptyMessage}" withLiveRegion />
      </Fragment>
    `);

    await expect(page.getByRole("status").filter({ hasText: "Queued" })).toBeAttached();
    await expect(page.getByRole("status").filter({ hasText: "No matches" })).toBeAttached();

    await page.getByRole("button", { name: "Update" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Done" })).toBeAttached();
    await expect(page.getByRole("status").filter({ hasText: "Still no matches" })).toBeAttached();
  });

  test("withLiveRegion announces ProgressBar percentages", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.progress="{0.25}">
        <Button label="Advance" onClick="progress = 0.75" />
        <ProgressBar value="{progress}" withLiveRegion />
      </Fragment>
    `);

    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
    await expect(page.getByRole("status")).toHaveText("25%");

    await page.getByRole("button", { name: "Advance" }).click();

    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
    await expect(page.getByRole("status")).toHaveText("75%");
  });
});

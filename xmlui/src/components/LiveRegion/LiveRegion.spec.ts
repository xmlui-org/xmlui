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
});

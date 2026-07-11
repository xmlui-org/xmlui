import { expect } from "@playwright/test";
import { test } from "../../../xmlui/src/testing";

const EXT = { extensionIds: "xmlui-calendar" };

test.describe("BigCalendar", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(`<BigCalendar testId="calendar" />`, EXT);
    await expect(page.locator(".rbc-calendar")).toHaveCount(1);
  });

  test("renders month events from an array", async ({ initTestBed, page }) => {
    await initTestBed(
      `<BigCalendar
        testId="calendar"
        height="420px"
        view="month"
        date="2026-03-01T00:00:00"
        events="{[
          {
            title: 'Package Review',
            start: '2026-03-09T09:00:00',
            end: '2026-03-09T09:30:00'
          }
        ]}"
      />`,
      EXT,
    );

    await expect(page.locator(".rbc-calendar")).toBeAttached();
    await expect(page.getByText("Package Review")).toBeVisible();
  });

  test("applies custom width and height", async ({ initTestBed, page }) => {
    await initTestBed(
      `<BigCalendar
        testId="calendar"
        width="360px"
        height="300px"
        view="month"
        date="2026-03-01T00:00:00"
      />`,
      EXT,
    );

    const calendar = page.locator(".rbc-calendar").locator("xpath=..");
    await expect(calendar).toHaveCSS("width", "360px");
    await expect(calendar).toHaveCSS("height", "300px");
  });

  test("state updates rerender event titles", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <Button testId="advance" label="Advance" onClick="eventTitle = 'Updated Event'" />
        <BigCalendar
          testId="calendar"
          height="420px"
          view="month"
          date="2026-03-01T00:00:00"
          events="{[
            {
              title: eventTitle,
              start: '2026-03-09T09:00:00',
              end: '2026-03-09T09:30:00'
            }
          ]}"
        />
      </VStack>`,
      { ...EXT, mainXs: `var eventTitle = 'Initial Event';` },
    );

    await expect(page.getByText("Initial Event")).toBeVisible();
    await page.getByTestId("advance").click();
    await expect(page.getByText("Updated Event")).toBeVisible();
  });
});

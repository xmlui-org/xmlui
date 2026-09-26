import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

// Wiring only: the sample media is never fetched, media events are dispatched
// synthetically, and Date.now() is pinned so wall-clock arithmetic is exact.

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/log-a-media-players-playhead-path.md",
  ),
);

const T0 = new Date("2026-09-24T12:00:00Z").getTime();

// Dispatching before the example has rendered can lose the first event
async function waitForExample(page: any) {
  await expect(page.locator("video")).toBeAttached();
  await expect(page.getByRole("row")).toHaveCount(1);
}

async function mediaEvent(page: any, type: string, position: number, wallOffsetMs: number) {
  await page.clock.setFixedTime(T0 + wallOffsetMs);
  await page.locator("video").evaluate(
    (el: HTMLMediaElement, [t, eventType]: [number, string]) => {
      el.currentTime = t;
      el.dispatchEvent(new Event(eventType));
    },
    [position, type],
  );
}

test.beforeEach(async ({ page }) => {
  await page.route("**/cc0-videos/**", (route) => route.abort());
});

test.describe("Record a sequence of media player events", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "record-a-sequence-of-media-player-events",
  );

  test("each event adds a row with position and elapsed seconds", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await waitForExample(page);

    await mediaEvent(page, "play", 1.5, 0);
    await mediaEvent(page, "pause", 3.25, 1750);
    await mediaEvent(page, "seeked", 8, 4000);

    const rows = page.getByRole("row");
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(1)).toContainText("play");
    await expect(rows.nth(1)).toContainText("1.50");
    await expect(rows.nth(1)).toContainText("0.00");
    await expect(rows.nth(2)).toContainText("pause");
    await expect(rows.nth(2)).toContainText("3.25");
    await expect(rows.nth(2)).toContainText("1.75");
    await expect(rows.nth(3)).toContainText("seeked");
    await expect(rows.nth(3)).toContainText("8.00");
    await expect(rows.nth(3)).toContainText("4.00");
  });

  test("Clear empties the log", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await waitForExample(page);

    await mediaEvent(page, "play", 0, 0);
    await expect(page.getByRole("row")).toHaveCount(2);
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByRole("row").filter({ hasText: "play" })).toHaveCount(0);
  });
});

test.describe("Stitch together a sequence of clips", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "stitch-together-a-sequence-of-clips",
  );

  // No media loads, so stand in for play() and count pause() calls
  async function setUp(initTestBed: any, page: any) {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("video")).toBeAttached();
    await expect(page.getByText("Stopped")).toBeVisible();
    await page.locator("video").evaluate((el: HTMLMediaElement) => {
      (window as any).__pauses = 0;
      el.play = () => Promise.resolve();
      el.pause = () => {
        (window as any).__pauses++;
      };
    });
  }

  const position = (page: any) =>
    page.locator("video").evaluate((el: HTMLMediaElement) => el.currentTime);

  const clipRow = (page: any, id: string) =>
    page.getByRole("row").filter({ has: page.getByRole("cell", { name: id, exact: true }) });

  // Only the playing clip's row is selected (the whole row is highlighted)
  async function expectHighlighted(page: any, id: string | null) {
    for (const clip of ["A", "B", "C"]) {
      if (clip === id) {
        await expect(clipRow(page, clip)).toHaveClass(/_selected_/);
      } else {
        await expect(clipRow(page, clip)).not.toHaveClass(/_selected_/);
      }
    }
  }

  test("plays the clips in list order, then pauses", async ({ initTestBed, page }) => {
    await setUp(initTestBed, page);
    await expectHighlighted(page, null);

    await page.getByRole("button", { name: "Play the clips" }).click();
    await expect(page.getByText("Playing clip A")).toBeVisible();
    expect(await position(page)).toBe(0.5);
    await expectHighlighted(page, "A");

    await mediaEvent(page, "timeupdate", 1.0, 0);
    await expect(page.getByText("Playing clip A")).toBeVisible();

    await mediaEvent(page, "timeupdate", 1.5, 0);
    await expect(page.getByText("Playing clip B")).toBeVisible();
    await expect.poll(() => position(page)).toBe(3.5);
    await expectHighlighted(page, "B");

    await mediaEvent(page, "timeupdate", 4.5, 0);
    await expect(page.getByText("Playing clip C")).toBeVisible();
    await expect.poll(() => position(page)).toBe(2);
    await expectHighlighted(page, "C");

    await mediaEvent(page, "timeupdate", 3.0, 0);
    await expect(page.getByText("Stopped")).toBeVisible();
    expect(await page.evaluate(() => (window as any).__pauses)).toBe(1);
    await expectHighlighted(page, null);
  });

  test("clicking a row plays the list from that clip", async ({ initTestBed, page }) => {
    await setUp(initTestBed, page);

    await clipRow(page, "B").click();
    await expect(page.getByText("Playing clip B")).toBeVisible();
    await expect.poll(() => position(page)).toBe(3.5);
    await expectHighlighted(page, "B");

    await mediaEvent(page, "timeupdate", 4.5, 0);
    await expect(page.getByText("Playing clip C")).toBeVisible();
    await expectHighlighted(page, "C");
  });
});

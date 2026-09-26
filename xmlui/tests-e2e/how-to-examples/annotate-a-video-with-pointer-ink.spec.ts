import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

// Wiring only: the sample media is never fetched, the video's position is set
// directly, and ink is drawn with a real Command-held drag over the video.

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/annotate-a-video-with-pointer-ink.md",
  ),
);

test.beforeEach(async ({ page }) => {
  await page.route("**/cc0-videos/**", (route) => route.abort());
});

async function setPosition(page: any, seconds: number) {
  await page.locator("video").evaluate((el: HTMLMediaElement, t: number) => {
    el.currentTime = t;
  }, seconds);
}

// A Command-held drag across the middle of the video
async function drawOverVideo(page: any) {
  const b = await page.locator("video").boundingBox();
  if (!b) throw new Error("video has no box");
  await page.keyboard.down("Meta");
  await page.mouse.move(b.x + b.width * 0.3, b.y + b.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5);
  await page.mouse.move(b.x + b.width * 0.6, b.y + b.height * 0.6);
  await page.mouse.up();
  await page.keyboard.up("Meta");
}

async function waitForExample(page: any) {
  await expect(page.locator("video")).toBeAttached();
  await expect(page.getByRole("row")).toHaveCount(1);
}

test.describe("Draw over a video and log each annotation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "draw-over-a-video-and-log-each-annotation",
  );

  test("each annotation is logged with its tool and video position", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await waitForExample(page);

    await setPosition(page, 2.5);
    await drawOverVideo(page);
    const rows = page.getByRole("row");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(1)).toContainText("arrow");
    await expect(rows.nth(1)).toContainText("2.50");

    await page.getByRole("button", { name: "freehand" }).click();
    await setPosition(page, 4);
    await drawOverVideo(page);
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(2)).toContainText("freehand");
    await expect(rows.nth(2)).toContainText("4.00");
  });

  test("dragging without Command draws nothing", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await waitForExample(page);
    const b = await page.locator("video").boundingBox();
    await page.mouse.move(b!.x + 100, b!.y + 100);
    await page.mouse.down();
    await page.mouse.move(b!.x + 200, b!.y + 150);
    await page.mouse.up();
    await page.waitForTimeout(200);
    await expect(page.getByRole("row")).toHaveCount(1);
  });
});

test.describe("Jump back to an annotation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "jump-back-to-an-annotation",
  );

  test("clicking a row seeks to the annotation and highlights it", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await waitForExample(page);
    await page.locator("video").evaluate((el: HTMLMediaElement) => {
      el.play = () => Promise.resolve();
      el.pause = () => {};
    });

    await setPosition(page, 1);
    await drawOverVideo(page);
    await setPosition(page, 3);
    await drawOverVideo(page);
    const rows = page.getByRole("row");
    await expect(rows).toHaveCount(3);

    await rows.nth(1).click();
    await expect
      .poll(() => page.locator("video").evaluate((el: HTMLMediaElement) => el.currentTime))
      .toBe(1);
    await expect(rows.nth(1)).toHaveClass(/_selected_/);
    await expect(rows.nth(2)).not.toHaveClass(/_selected_/);

    await rows.nth(2).click();
    await expect
      .poll(() => page.locator("video").evaluate((el: HTMLMediaElement) => el.currentTime))
      .toBe(3);
    await expect(rows.nth(2)).toHaveClass(/_selected_/);
  });
});

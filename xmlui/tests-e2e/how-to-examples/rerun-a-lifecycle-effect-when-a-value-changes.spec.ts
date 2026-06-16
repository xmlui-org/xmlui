import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/rerun-a-lifecycle-effect-when-a-value-changes.md",
  ),
);

test.describe("Re-arm a side effect when the active room changes", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "re-arm-a-side-effect-when-the-active-room-changes",
  );

  test("initial state starts the lifecycle once for the default room", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Active room: Support")).toBeVisible();
    await expect(page.getByText("Status: Listening to Support")).toBeVisible();
    await expect(page.getByText("Mounts: 1")).toBeVisible();
    await expect(page.getByText("Unmounts: 0")).toBeVisible();
  });

  test("changing the room unmounts the old cycle and mounts the new one", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Sales" }).click();
    await expect(page.getByText("Active room: Sales")).toBeVisible();
    await expect(page.getByText("Status: Listening to Sales")).toBeVisible();
    await expect(page.getByText("Mounts: 2")).toBeVisible();
    await expect(page.getByText("Unmounts: 1")).toBeVisible();
  });

  test("changing back re-arms the lifecycle again", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Sales" }).click();
    await page.getByRole("button", { name: "Support" }).click();
    await expect(page.getByText("Active room: Support")).toBeVisible();
    await expect(page.getByText("Status: Listening to Support")).toBeVisible();
    await expect(page.getByText("Mounts: 3")).toBeVisible();
    await expect(page.getByText("Unmounts: 2")).toBeVisible();
  });
});

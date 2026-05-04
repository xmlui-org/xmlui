import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/create-a-resizable-split-view.md"),
);

test.describe("Resizable notes split view", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Resizable notes split view",
  );

  test("initial state renders the note list and selected note side by side", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const notesHeading = page.getByRole("heading", { name: "Notes" });
    const detailHeading = page.getByRole("heading", { name: "Sprint planning" }).last();

    await expect(notesHeading).toBeVisible();
    await expect(detailHeading).toBeVisible();
    await expect(page.getByText("API design")).toBeVisible();
    await expect(page.getByText("Retrospective")).toBeVisible();
    await expect(page.getByText("Onboarding docs")).toBeVisible();
    await expect(
      page.getByText("Define the work items for this sprint. Review the backlog", {
        exact: false,
      }),
    ).toBeVisible();

    const notesBox = await notesHeading.boundingBox();
    const detailBox = await detailHeading.boundingBox();

    expect(notesBox).not.toBeNull();
    expect(detailBox).not.toBeNull();
    expect(notesBox!.x + notesBox!.width).toBeLessThan(detailBox!.x);
  });

  test("dragging the divider resizes the note list and detail panels", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const detailHeading = page.getByRole("heading", { name: "Sprint planning" }).last();
    await expect(detailHeading).toBeVisible();

    const initialDetailBox = await detailHeading.boundingBox();
    expect(initialDetailBox).not.toBeNull();

    const dividerX = initialDetailBox!.x - 18;
    const dividerY = initialDetailBox!.y + initialDetailBox!.height + 30;

    await page.mouse.move(dividerX, dividerY);
    await page.mouse.down();
    await page.mouse.move(dividerX + 80, dividerY);
    await page.mouse.up();

    await expect.poll(async () => (await detailHeading.boundingBox())!.x).toBeGreaterThan(
      initialDetailBox!.x + 40,
    );
  });
});

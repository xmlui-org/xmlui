import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/dock-elements-to-panel-edges.md"),
);

test.describe("Scrollable panel with bottom actions", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Scrollable panel with bottom actions",
  );

  test("header docks at top and action buttons dock at bottom", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const header = await page.getByText("Preview events").boundingBox();
    const firstItem = await page.getByText("Community forum at the library").boundingBox();
    const back = await page.getByRole("button", { name: "Back" }).boundingBox();
    const addFeed = await page.getByRole("button", { name: "Add Feed" }).boundingBox();

    expect(header).not.toBeNull();
    expect(firstItem).not.toBeNull();
    expect(back).not.toBeNull();
    expect(addFeed).not.toBeNull();

    // Top dock is above the scrollable middle region
    expect(header!.y).toBeLessThan(firstItem!.y);
    // Bottom-docked buttons are below the first item of the scrollable region
    expect(back!.y).toBeGreaterThan(firstItem!.y);
    expect(addFeed!.y).toBeGreaterThan(firstItem!.y);
    // The two action buttons share a row (same y, within sub-pixel tolerance)
    expect(Math.abs(back!.y - addFeed!.y)).toBeLessThan(2);
  });

  test("scrolling the inner list does not move the docked action buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const backBefore = await page.getByRole("button", { name: "Back" }).boundingBox();
    const addFeedBefore = await page.getByRole("button", { name: "Add Feed" }).boundingBox();
    expect(backBefore).not.toBeNull();
    expect(addFeedBefore).not.toBeNull();

    // Scroll the last list item into view inside the ScrollViewer
    await page.getByText("Community bike ride kickoff").scrollIntoViewIfNeeded();

    const backAfter = await page.getByRole("button", { name: "Back" }).boundingBox();
    const addFeedAfter = await page.getByRole("button", { name: "Add Feed" }).boundingBox();
    expect(backAfter).not.toBeNull();
    expect(addFeedAfter).not.toBeNull();

    // The action bar is a sibling of the ScrollViewer in the parent Stack,
    // so scrolling the inner list must not displace it
    expect(Math.abs(backAfter!.y - backBefore!.y)).toBeLessThan(2);
    expect(Math.abs(addFeedAfter!.y - addFeedBefore!.y)).toBeLessThan(2);
  });
});

test.describe("All four dock edges", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "All four dock edges");

  test("toolbar docks at top and status bar docks at bottom of the panel", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const toolbar = await page.getByText("Editor", { exact: true }).boundingBox();
    const editorContent = await page.getByText("…editor content…").boundingBox();
    const statusLeft = await page.getByText("Ln 12, Col 4").boundingBox();
    const statusRight = await page.getByText("UTF-8").boundingBox();

    expect(toolbar).not.toBeNull();
    expect(editorContent).not.toBeNull();
    expect(statusLeft).not.toBeNull();
    expect(statusRight).not.toBeNull();

    // Toolbar (dock="top") is above the stretch region
    expect(toolbar!.y).toBeLessThan(editorContent!.y);
    // Status bar (dock="bottom") is below the stretch region
    expect(statusLeft!.y).toBeGreaterThan(editorContent!.y);
    expect(statusRight!.y).toBeGreaterThan(editorContent!.y);
    // SpaceFiller inside the bottom dock pushes UTF-8 to the right of "Ln 12, Col 4"
    expect(statusRight!.x).toBeGreaterThan(statusLeft!.x);
    // Status bar items share a row
    expect(Math.abs(statusRight!.y - statusLeft!.y)).toBeLessThan(2);
  });

  test("Files panel docks at left and Properties panel docks at right of the stretch region", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const files = await page.getByText("Files").boundingBox();
    const editorContent = await page.getByText("…editor content…").boundingBox();
    const props = await page.getByText("Properties").boundingBox();

    expect(files).not.toBeNull();
    expect(editorContent).not.toBeNull();
    expect(props).not.toBeNull();

    // Files (dock="left") sits to the left of the stretch region
    expect(files!.x).toBeLessThan(editorContent!.x);
    // Properties (dock="right") sits to the right of it
    expect(props!.x).toBeGreaterThan(editorContent!.x);
    // The stretch region is horizontally between the two side panels
    expect(editorContent!.x).toBeGreaterThan(files!.x);
    expect(editorContent!.x).toBeLessThan(props!.x);
  });
});

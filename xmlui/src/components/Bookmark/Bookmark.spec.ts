import { expect, test } from "../../testing/fixtures";

test.describe("Bookmark foundation", () => {
  test("renders an anchor with children and bookmark metadata", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="section-a" testId="bookmark" title="Section A" level="{2}">
        <Text>Section body</Text>
      </Bookmark>
    `);

    const bookmark = page.getByTestId("bookmark");
    await expect(bookmark).toHaveAttribute("id", "section-a");
    await expect(bookmark).toHaveAttribute("data-anchor", "true");
    await expect(bookmark).toHaveAttribute("data-bookmark-level", "2");
    await expect(bookmark).toHaveText("Section body");
  });

  test("exposes scrollIntoView through the component id", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.result="waiting">
        <Bookmark id="target" testId="bookmark">Target</Bookmark>
        <Button testId="scroll" onClick="target.scrollIntoView(); result = 'scrolled'">Scroll</Button>
        <Text testId="result">{result}</Text>
      </App>
    `);

    await page.getByTestId("scroll").click();
    await expect(page.getByTestId("result")).toHaveText("scrolled");
  });
});

test.describe("Bookmark old-suite transfer debt", () => {
  test("copy literal table-of-contents registration and scroll-container tests", async () => {
    test.fixme(true, "Full Bookmark suite depends on the reopened TableOfContents compatibility harness");
  });
});

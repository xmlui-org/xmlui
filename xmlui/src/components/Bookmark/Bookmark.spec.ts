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

  test("marks omitted bookmarks and preserves empty titles for TableOfContents discovery", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Bookmark id="hidden" testId="bookmark" title="" level="{3}" omitFromToc="{true}">
        <Text>Hidden section</Text>
      </Bookmark>
    `);

    const bookmark = page.getByTestId("bookmark");
    await expect(bookmark).toHaveAttribute("id", "hidden");
    await expect(bookmark).toHaveAttribute("data-bookmark-level", "3");
    await expect(bookmark).not.toHaveAttribute("data-bookmark-title");
    await expect(bookmark).toHaveAttribute("data-bookmark-omit-from-toc", "true");
  });

  test("scrollIntoView accepts options and calls the DOM target", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.result="waiting">
        <Bookmark id="target" testId="bookmark">Target</Bookmark>
        <Button
          testId="scroll"
          onClick="target.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' }); result = 'scrolled'">
          Scroll
        </Button>
        <Text testId="result">{result}</Text>
      </App>
    `);

    await page.getByTestId("bookmark").evaluate((element) => {
      (element as HTMLElement).scrollIntoView = (options?: boolean | ScrollIntoViewOptions) => {
        (window as any).__bookmarkScrollOptions = options;
      };
    });

    await page.getByTestId("scroll").click();

    await expect(page.getByTestId("result")).toHaveText("scrolled");
    await expect.poll(() => page.evaluate(() => (window as any).__bookmarkScrollOptions)).toEqual({
      behavior: "instant",
      block: "center",
      inline: "nearest",
    });
  });
});

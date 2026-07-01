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

  test("scrollIntoView accepts options and falls back to the DOM target", async ({ initTestBed, page }) => {
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
      block: "start",
    });
  });

  test("exposes scrollIntoView through the old ref alias", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.result="waiting">
        <Bookmark id="target" ref="bookmarkRef" testId="bookmark">Target</Bookmark>
        <Button testId="scroll" onClick="bookmarkRef.scrollIntoView(); result = 'scrolled'">Scroll</Button>
        <Text testId="result">{result}</Text>
      </App>
    `);

    await page.getByTestId("scroll").click();
    await expect(page.getByTestId("result")).toHaveText("scrolled");
  });

  test("scrollIntoView scrolls nearest scrollable ancestor like the original source", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <div testId="container" height="160px" overflow="auto">
        <Button testId="scroll" onClick="target.scrollIntoView({ behavior: 'instant' })">Scroll</Button>
        <div testId="spacer" height="500px">Top spacer</div>
        <Bookmark id="target" testId="bookmark">Target content</Bookmark>
      </div>
    `);

    await page.getByTestId("container").evaluate((element) => {
      const container = element as HTMLElement & { scrollTo: (options?: ScrollToOptions) => void };
      container.style.height = "160px";
      container.style.overflowY = "auto";
      container.scrollTo = (options?: ScrollToOptions) => {
        (window as any).__bookmarkParentScrollOptions = options;
      };
    });
    await page.getByTestId("spacer").evaluate((element) => {
      const spacer = element as HTMLElement;
      spacer.style.display = "block";
      spacer.style.height = "500px";
    });

    await page.getByTestId("scroll").click();

    await expect.poll(() => page.evaluate(() => (window as any).__bookmarkParentScrollOptions))
      .toMatchObject({ behavior: "instant" });
    const top = await page.evaluate(() => (window as any).__bookmarkParentScrollOptions?.top ?? 0);
    expect(top).toBeGreaterThan(0);
  });

  test("does not repeatedly register APIs and scrolls anchors in routed App layouts", async ({
    initTestBed,
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await initTestBed(`
      <App layout="vertical-full-header" scrollWholePage="false">
        <NavPanel>
          <Link to="/#red">Jump to red</Link>
          <Link to="/#green">Jump to green</Link>
          <Link to="/#blue">Jump to blue</Link>
        </NavPanel>
        <Pages>
          <Page url="/">
            <Bookmark id="red">
              <VStack height="800px" backgroundColor="red" />
            </Bookmark>
            <Bookmark id="green">
              <VStack height="800px" backgroundColor="green" />
            </Bookmark>
            <Bookmark id="blue">
              <VStack height="800px" backgroundColor="blue" />
            </Bookmark>
          </Page>
        </Pages>
      </App>
    `);

    await expect(page.locator("#red")).toBeAttached();
    await expect(page.locator("#green")).toBeAttached();
    await expect(page.locator("#blue")).toBeAttached();
    await page.waitForTimeout(250);

    expect(pageErrors).toEqual([]);

    const initialMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-xmlui-component='App'][data-xmlui-part='root']") as HTMLElement;
      const content = document.querySelector("[data-xmlui-component='App'][data-xmlui-part='content']") as HTMLElement;
      const nav = document.querySelector("[data-xmlui-component='App'][data-xmlui-part='navPanel']") as HTMLElement;
      return {
        appOverflow: getComputedStyle(app).overflow,
        contentOverflow: getComputedStyle(content).overflowY,
        contentCanScroll: content.scrollHeight > content.clientHeight,
        navTop: Math.round(nav.getBoundingClientRect().top),
        contentTop: Math.round(content.getBoundingClientRect().top),
        windowScrollY: window.scrollY,
      };
    });

    expect(initialMetrics).toMatchObject({
      appOverflow: "clip",
      contentOverflow: "auto",
      contentCanScroll: true,
      windowScrollY: 0,
    });
    expect(Math.abs(initialMetrics.navTop - initialMetrics.contentTop)).toBeLessThanOrEqual(1);

    await page.getByText("Jump to green").click();
    await expect.poll(() =>
      page.evaluate(() => {
        const content = document.querySelector("[data-xmlui-component='App'][data-xmlui-part='content']") as HTMLElement;
        return content.scrollTop;
      })
    ).toBeGreaterThan(500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await page.getByText("Jump to blue").click();
    await expect.poll(() =>
      page.evaluate(() => {
        const content = document.querySelector("[data-xmlui-component='App'][data-xmlui-part='content']") as HTMLElement;
        return content.scrollTop;
      })
    ).toBeGreaterThan(1200);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
});

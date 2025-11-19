import { expect, test } from "../../testing/fixtures";
import type { Page } from "@playwright/test";

// =============================================================================
// TEST HELPERS
// =============================================================================

function createLayoutMarkup(
  layout: string,
  noScrollbarGutters: boolean,
  scrollWholePage: boolean,
  contentHeight: string
) {
  return `
    <App2
      layout="${layout}"
      noScrollbarGutters="${noScrollbarGutters}"
      scrollWholePage="${scrollWholePage}"
    >
      <AppHeader testId="appHeader">
        Header
      </AppHeader>
      <NavPanel testId="navPanel">
        <NavLink label="Link 1" to="/page1" />
        <NavLink label="Link 2" to="/page2" />
      </NavPanel>
      <Pages fallbackPath="/">
        <Page url="/">
          <Stack testId="mainContent" height="${contentHeight}" backgroundColor="lightblue">
            <Text>
              Main Content
            </Text>
          </Stack>
        </Page>
      </Pages>
      <Footer testId="footer">
        Footer
      </Footer>
    </App2>
  `;
}

async function verifyAllBlocksVisible(page: Page) {
  const header = page.getByTestId("appHeader");
  const navPanel = page.getByTestId("navPanel");
  const mainContent = page.getByTestId("mainContent");
  const footer = page.getByTestId("footer");

  await expect(header).toBeVisible();
  await expect(navPanel).toBeVisible();
  await expect(mainContent).toBeVisible();
  await expect(footer).toBeVisible();
}

async function verifyBlocksInViewport(page: Page, blockIds: string[]) {
  for (const id of blockIds) {
    const block = page.getByTestId(id);
    const box = await block.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(1080);
  }
}

async function verifyBlocksAboveViewport(page: Page, blockIds: string[]) {
  for (const id of blockIds) {
    const block = page.getByTestId(id);
    const box = await block.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThan(0);
  }
}

async function verifyBlocksBelowViewport(page: Page, blockIds: string[]) {
  for (const id of blockIds) {
    const block = page.getByTestId(id);
    const box = await block.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(1080);
  }
}

async function verifyAppContainerScrollable(page: Page, shouldBeScrollable: boolean) {
  const info = await page.evaluate(() => {
    const appWrapper = document.querySelector('[class*="wrapper"]');
    if (!appWrapper) return { found: false, isScrollable: false };

    const styles = window.getComputedStyle(appWrapper);
    const scrollHeight = (appWrapper as HTMLElement).scrollHeight;
    const clientHeight = (appWrapper as HTMLElement).clientHeight;
    const isScrollable = scrollHeight > clientHeight;

    const hasOverflow =
      styles.overflow === "auto" ||
      styles.overflow === "scroll" ||
      styles.overflowY === "auto" ||
      styles.overflowY === "scroll";

    return { found: true, isScrollable, hasOverflow };
  });

  expect(info.found).toBe(true);
  expect(info.isScrollable).toBe(shouldBeScrollable);
  if (shouldBeScrollable) {
    expect(info.hasOverflow).toBe(true);
  }
}

async function verifyScrollbarGutters(page: Page, shouldHaveGutters: boolean) {
  const info = await page.evaluate(() => {
    const appWrapper = document.querySelector('[class*="wrapper"]');
    if (!appWrapper) return { found: false };

    const styles = window.getComputedStyle(appWrapper);
    return {
      found: true,
      scrollbarGutter: styles.scrollbarGutter,
    };
  });

  expect(info.found).toBe(true);
  if (shouldHaveGutters) {
    expect(info.scrollbarGutter).toBe("stable both-edges");
  } else {
    expect(info.scrollbarGutter).not.toBe("stable both-edges");
  }
}

async function verifyMainContentIsScrollContainer(page: Page) {
  const info = await page.evaluate(() => {
    const mainContent = document.querySelector('[data-testid="mainContent"]');
    if (!mainContent) return { found: false };

    let scrollContainer = mainContent.parentElement;
    while (scrollContainer) {
      const styles = window.getComputedStyle(scrollContainer);
      const hasOverflow =
        styles.overflow === "auto" ||
        styles.overflow === "scroll" ||
        styles.overflowY === "auto" ||
        styles.overflowY === "scroll";

      if (hasOverflow) {
        const className = scrollContainer.className || "";
        const isPagesWrapper =
          className.includes("PagesWrapper") || className.includes("pagesWrapper");

        return {
          found: true,
          isPagesWrapper,
          isScrollable: scrollContainer.scrollHeight > scrollContainer.clientHeight,
          scrollbarGutter: styles.scrollbarGutter,
        };
      }
      scrollContainer = scrollContainer.parentElement;
    }

    return { found: false };
  });

  expect(info.found).toBe(true);
  expect(info.isPagesWrapper).toBe(true);
  return info;
}

async function verifyAppContainerNotScrollable(page: Page) {
  const info = await page.evaluate(() => {
    const appWrapper = document.querySelector('[class*="wrapper"]');
    if (!appWrapper) return { found: false };

    const styles = window.getComputedStyle(appWrapper);
    return {
      found: true,
      overflow: styles.overflow,
      overflowY: styles.overflowY,
    };
  });

  expect(info.found).toBe(true);
  expect(["hidden", "visible", ""]).toContain(info.overflow);
}

async function scrollAppContainerTo(page: Page, position: "top" | "mid" | "bottom") {
  const appWrapper = page.locator('[class*="wrapper"]').first();
  await appWrapper.evaluate((el, pos) => {
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (pos === "top") {
      el.scrollTop = 0;
    } else if (pos === "mid") {
      el.scrollTop = maxScroll * 0.33;
    } else {
      el.scrollTop = maxScroll;
    }
  }, position);

  await page.waitForTimeout(100);
}

async function scrollMainContentTo(page: Page, position: "top" | "mid" | "bottom") {
  await page.evaluate((pos) => {
    const mainContent = document.querySelector('[data-testid="mainContent"]');
    if (!mainContent) return;

    let scrollContainer = mainContent.parentElement;
    while (scrollContainer) {
      const styles = window.getComputedStyle(scrollContainer);
      const hasOverflow =
        styles.overflow === "auto" ||
        styles.overflow === "scroll" ||
        styles.overflowY === "auto" ||
        styles.overflowY === "scroll";

      if (hasOverflow) {
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        if (pos === "top") {
          scrollContainer.scrollTop = 0;
        } else if (pos === "mid") {
          scrollContainer.scrollTop = maxScroll * 0.5;
        } else {
          scrollContainer.scrollTop = maxScroll;
        }
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }
  }, position);

  await page.waitForTimeout(100);
}

async function verifyMainContentScrollbarGutters(page: Page, shouldHaveGutters: boolean) {
  const info = await page.evaluate(() => {
    const mainContent = document.querySelector('[data-testid="mainContent"]');
    if (!mainContent) return { found: false };

    let scrollContainer = mainContent.parentElement;
    while (scrollContainer) {
      const styles = window.getComputedStyle(scrollContainer);
      const hasOverflow =
        styles.overflow === "auto" ||
        styles.overflow === "scroll" ||
        styles.overflowY === "auto" ||
        styles.overflowY === "scroll";

      if (hasOverflow) {
        return {
          found: true,
          scrollbarGutter: styles.scrollbarGutter,
        };
      }
      scrollContainer = scrollContainer.parentElement;
    }

    return { found: false };
  });

  expect(info.found).toBe(true);
  if (shouldHaveGutters) {
    expect(info.scrollbarGutter).toBe("stable both-edges");
  } else {
    expect(info.scrollbarGutter).not.toBe("stable both-edges");
  }
}

// =============================================================================
// LAYOUT TESTS
// =============================================================================
// These tests verify that the App2 component correctly positions and displays
// its layout blocks (Header, NavPanel, Main Content, Footer) according to the
// layout configuration specified in app-next.md.
//
// Viewport: 1280 x 1080 for all tests
//
// Test Matrix:
// - scrollWholePage: true/false (determines scroll container: App Container vs Main Content)
// - noScrollbarGutters: true/false (determines scrollbar gutter reservation)
// - Content height: 200px (fits in viewport) vs 2000px (overflows viewport)
// - Scroll position: top, mid (33%), bottom (for overflow cases)

test.describe("Horizontal Layout - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders header, nav panel, main content, and footer in correct positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "200px"));

    await verifyAllBlocksVisible(page);

    // Get bounding boxes to verify layout structure
    const header = page.getByTestId("appHeader");
    const navPanel = page.getByTestId("navPanel");
    const mainContent = page.getByTestId("mainContent");
    const footer = page.getByTestId("footer");

    const headerBox = await header.boundingBox();
    const navPanelBox = await navPanel.boundingBox();
    const mainContentBox = await mainContent.boundingBox();
    const footerBox = await footer.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(navPanelBox).not.toBeNull();
    expect(mainContentBox).not.toBeNull();
    expect(footerBox).not.toBeNull();

    // Verify vertical stacking order
    expect(headerBox!.y).toBeLessThan(navPanelBox!.y);
    expect(navPanelBox!.y).toBeGreaterThan(headerBox!.y);
    expect(mainContentBox!.y).toBeGreaterThan(navPanelBox!.y + navPanelBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    // Verify full width blocks
    expect(headerBox!.width).toBeGreaterThan(1200);
    expect(navPanelBox!.width).toBeGreaterThan(1200);
    expect(footerBox!.width).toBeGreaterThan(1200);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, false);
  });

  test("tall content at top: header and nav visible, footer outside viewport, app container scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "2000px"));

    await expect(page.getByTestId("mainContent")).toBeVisible();

    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    await verifyAppContainerScrollable(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at mid-scroll: header and nav scrolled out, footer still below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "2000px"));

    await scrollAppContainerTo(page, "mid");

    await verifyBlocksAboveViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at bottom: header and nav scrolled out, footer visible in viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "2000px"));

    await scrollAppContainerTo(page, "bottom");

    await verifyBlocksAboveViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksInViewport(page, ["footer"]);
  });
});

test.describe("Horizontal Layout - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, true, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, true, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at mid-scroll: header and nav scrolled out, footer still below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, true, "2000px"));
    await scrollAppContainerTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksAboveViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at bottom: header and nav scrolled out, footer visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, true, "2000px"));
    await scrollAppContainerTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksAboveViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksInViewport(page, ["footer"]);
    await verifyScrollbarGutters(page, true);
  });
});

test.describe("Horizontal Layout - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyMainContentIsScrollContainer(page);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/footer static, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Horizontal Layout - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, true);
  });

  test("tall content: main content scrolls with reserved gutters, header/footer static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, true);
  });

  test("tall content at mid-scroll: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, true);
  });

  test("tall content at bottom: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, true);
  });
});

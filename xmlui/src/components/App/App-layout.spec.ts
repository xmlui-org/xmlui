import { expect, test } from "../../testing/fixtures";
import type { Page } from "@playwright/test";
import { F } from "../../testing/infrastructure/dist/internal/chunks/index.D2XAzRrx";

// =============================================================================
// TEST HELPERS
// =============================================================================

function createLayoutMarkup(
  layout: string,
  noScrollbarGutters: boolean,
  scrollWholePage: boolean,
  contentHeight: string,
) {
  return `
    <App
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
    </App>
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
    const appWrapper = document.querySelector('[class*="appContainer"]');
    if (!appWrapper || appWrapper.className.includes("pagesContainer")) {
      return { found: false, isScrollable: false };
    }

    // For vertical-full-header layout, check if appWrapper itself has verticalFullHeader class
    const isVerticalFullHeader = appWrapper.className.includes("verticalFullHeader");

    // Check if there's a mainContentArea inside (vertical layout)
    const mainContentArea = appWrapper.querySelector('[class*="mainContentArea"]');

    // Priority: appWrapper with verticalFullHeader > mainContentArea > appWrapper
    const scrollContainer = (
      isVerticalFullHeader ? appWrapper : mainContentArea || appWrapper
    ) as HTMLElement;

    const styles = window.getComputedStyle(scrollContainer);
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
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
    const appWrapper = document.querySelector('[class*="appContainer"]');
    if (!appWrapper || appWrapper.className.includes("pagesContainer")) {
      return { found: false };
    }

    // For vertical-full-header layout, check if appWrapper itself has verticalFullHeader class
    const isVerticalFullHeader = appWrapper.className.includes("verticalFullHeader");

    // Check if there's a mainContentArea inside (vertical layout)
    const mainContentArea = appWrapper.querySelector('[class*="mainContentArea"]');

    // Priority: appWrapper with verticalFullHeader > mainContentArea > appWrapper
    const scrollContainer = isVerticalFullHeader ? appWrapper : mainContentArea || appWrapper;

    const styles = window.getComputedStyle(scrollContainer);
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

async function verifyMainContentIsScrollContainer(page: Page, check = true) {
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
          className.includes("pagesContainer") || className.includes("pageContentContainer");

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

  expect(info.found).toBe(check);
  if (check) {
    expect(info.isPagesWrapper).toBe(true);
  }
  return info;
}

async function verifyAppContainerNotScrollable(page: Page) {
  const info = await page.evaluate(() => {
    const appWrapper = document.querySelector('[class*="appContainer"]');
    if (!appWrapper || appWrapper.className.includes("pagesContainer")) {
      return { found: false };
    }

    // Check if there's a mainContentArea inside (vertical layout)
    const mainContentArea = appWrapper.querySelector('[class*="mainContentArea"]');
    const scrollContainer = mainContentArea || appWrapper;

    const styles = window.getComputedStyle(scrollContainer);
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
  await page.evaluate((pos) => {
    const appWrapper = document.querySelector('[class*="appContainer"]') as HTMLElement;
    if (!appWrapper || appWrapper.className.includes("pagesContainer")) return;

    // For vertical-full-header layout, check if appWrapper itself has verticalFullHeader class
    const isVerticalFullHeader = appWrapper.className.includes("verticalFullHeader");

    // Check if there's a mainContentArea inside (vertical layout)
    const mainContentArea = appWrapper.querySelector('[class*="mainContentArea"]') as HTMLElement;

    // Priority: appWrapper with verticalFullHeader > mainContentArea > appWrapper
    const scrollContainer = isVerticalFullHeader ? appWrapper : mainContentArea || appWrapper;

    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    if (pos === "top") {
      scrollContainer.scrollTop = 0;
    } else if (pos === "mid") {
      scrollContainer.scrollTop = maxScroll * 0.33;
    } else {
      scrollContainer.scrollTop = maxScroll;
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

  expect(info.found).toBe(shouldHaveGutters);
  if (shouldHaveGutters) {
    expect(info.scrollbarGutter).toBe("stable both-edges");
  }
}

// =============================================================================
// LAYOUT TESTS
// =============================================================================
// These tests verify that the App component correctly positions and displays
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
    await verifyMainContentIsScrollContainer(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/footer static, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
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
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content: main content scrolls with reserved gutters, header/footer static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at bottom: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });
});

test.describe("Horizontal-Sticky Layout - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders header, nav panel, main content, and footer in correct positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, true, "200px"));

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

  test("tall content at top: header and nav sticky at top, footer outside viewport, app container scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, true, "2000px"));

    await expect(page.getByTestId("mainContent")).toBeVisible();

    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    await verifyAppContainerScrollable(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at mid-scroll: header and nav remain sticky at top, footer sticky at bottom", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, true, "2000px"));

    await scrollAppContainerTo(page, "mid");

    // Header, nav, and footer should all remain sticky and visible
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: header and nav remain sticky at top, footer visible in viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, true, "2000px"));

    await scrollAppContainerTo(page, "bottom");

    // Header and nav should remain sticky at top
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Horizontal-Sticky Layout - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, true, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, true, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at mid-scroll: header and nav remain sticky, footer sticky at bottom", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, true, "2000px"));
    await scrollAppContainerTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at bottom: header and nav remain sticky, footer visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, true, "2000px"));
    await scrollAppContainerTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });
});

test.describe("Horizontal-Sticky Layout - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, false, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/nav/footer sticky, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at mid-scroll: only main content scrolls, header/nav/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/nav/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Horizontal-Sticky Layout - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, false, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls with reserved gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: only main content scrolls, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Condensed Layout - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders header with embedded nav panel, main content, and footer in correct positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, true, "200px"));

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

    // Verify NavPanel is within header boundary (condensed layout characteristic)
    expect(navPanelBox!.y).toBeGreaterThanOrEqual(headerBox!.y);
    expect(navPanelBox!.y + navPanelBox!.height).toBeLessThanOrEqual(
      headerBox!.y + headerBox!.height,
    );

    // Verify vertical stacking order
    expect(mainContentBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    // Verify full width blocks
    expect(headerBox!.width).toBeGreaterThan(1200);
    expect(footerBox!.width).toBeGreaterThan(1200);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, false);
  });

  test("tall content at top: header with nav visible, footer outside viewport, app container scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, true, "2000px"));

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
    await initTestBed(createLayoutMarkup("condensed", true, true, "2000px"));

    await scrollAppContainerTo(page, "mid");

    await verifyBlocksAboveViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at bottom: header and nav scrolled out, footer visible in viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, true, "2000px"));

    await scrollAppContainerTo(page, "bottom");

    await verifyBlocksAboveViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksInViewport(page, ["footer"]);
  });
});

test.describe("Condensed Layout - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, true, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, true, "2000px"));
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
    await initTestBed(createLayoutMarkup("condensed", false, true, "2000px"));
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
    await initTestBed(createLayoutMarkup("condensed", false, true, "2000px"));
    await scrollAppContainerTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksAboveViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksInViewport(page, ["footer"]);
    await verifyScrollbarGutters(page, true);
  });
});

test.describe("Condensed Layout - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, false, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/footer static, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Condensed Layout - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, false, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content: main content scrolls with reserved gutters, header/footer static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at bottom: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });
});

test.describe("Condensed-Sticky Layout - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders header with embedded nav panel, main content, and footer in correct positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, true, "200px"));

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

    // Verify NavPanel is within header boundary (condensed layout characteristic)
    expect(navPanelBox!.y).toBeGreaterThanOrEqual(headerBox!.y);
    expect(navPanelBox!.y + navPanelBox!.height).toBeLessThanOrEqual(
      headerBox!.y + headerBox!.height,
    );

    // Verify vertical stacking order
    expect(mainContentBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    // Verify full width blocks
    expect(headerBox!.width).toBeGreaterThan(1200);
    expect(footerBox!.width).toBeGreaterThan(1200);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, false);
  });

  test("tall content at top: header/nav sticky at top, footer sticky at bottom, app container scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, true, "2000px"));

    await expect(page.getByTestId("mainContent")).toBeVisible();

    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    await verifyAppContainerScrollable(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at mid-scroll: header/nav remain sticky at top, footer sticky at bottom", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, true, "2000px"));

    await scrollAppContainerTo(page, "mid");

    // Header, nav, and footer should all remain sticky and visible
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: header/nav remain sticky at top, footer visible in viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, true, "2000px"));

    await scrollAppContainerTo(page, "bottom");

    // Header, nav, and footer should all remain sticky and visible
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Condensed-Sticky Layout - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, true, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, true, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at mid-scroll: header/nav remain sticky, footer sticky at bottom", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, true, "2000px"));
    await scrollAppContainerTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at bottom: header/nav remain sticky, footer visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, true, "2000px"));
    await scrollAppContainerTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });
});

test.describe("Condensed-Sticky Layout - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, false, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/nav/footer sticky, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at mid-scroll: only main content scrolls, header/nav/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/nav/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Condensed-Sticky Layout - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, false, "200px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "mainContent", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls with reserved gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: only main content scrolls, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Vertical Layout - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders header, nav panel on left, main content, and footer in correct positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, true, "200px"));

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

    // Verify vertical layout: NavPanel on left, content on right
    expect(navPanelBox!.x).toBeLessThan(mainContentBox!.x);
    expect(navPanelBox!.x).toBeLessThan(headerBox!.x);

    // Verify header is above the nav/content row
    expect(headerBox!.y).toBe(navPanelBox!.y);
    expect(headerBox!.y).toBeLessThan(mainContentBox!.y);

    // Verify footer is below the nav/content row
    expect(footerBox!.y).toBe(navPanelBox!.y + navPanelBox!.height - footerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, false);
  });

  test("tall content at top: header and nav visible, footer outside viewport, app container scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, true, "2000px"));

    await expect(page.getByTestId("mainContent")).toBeVisible();

    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    await verifyAppContainerScrollable(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at mid-scroll: header scrolled out, nav visible (full height), footer below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, true, "2000px"));

    await scrollAppContainerTo(page, "mid");

    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
    // NavPanel remains visible - it spans full viewport height on the left
    await verifyBlocksInViewport(page, ["navPanel"]);
  });

  test("tall content at bottom: header scrolled out, nav visible (full height), footer visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, true, "2000px"));

    await scrollAppContainerTo(page, "bottom");

    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["navPanel", "footer"]);
  });
});

test.describe("Vertical Layout - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, true, "200px"));

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

    // Verify vertical layout: NavPanel on left, content on right
    expect(navPanelBox!.x).toBeLessThan(mainContentBox!.x);
    expect(navPanelBox!.x).toBeLessThan(headerBox!.x);

    // Verify header is above the nav/content row
    expect(headerBox!.y).toBe(navPanelBox!.y);
    expect(headerBox!.y).toBeLessThan(mainContentBox!.y);

    // Verify footer is below the nav/content row
    expect(footerBox!.y).toBe(navPanelBox!.y + navPanelBox!.height - footerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, true, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at mid-scroll: header scrolled out, nav visible (full height), footer below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, true, "2000px"));
    await scrollAppContainerTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
    await verifyScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["navPanel"]);
  });

  test("tall content at bottom: header scrolled out, nav visible (full height), footer visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, true, "2000px"));
    await scrollAppContainerTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });
});

test.describe("Vertical Layout - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, false, "200px"));

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

    // Verify vertical layout: NavPanel on left, content on right
    expect(navPanelBox!.x).toBeLessThan(mainContentBox!.x);
    expect(navPanelBox!.x).toBeLessThan(headerBox!.x);

    // Verify header is above the nav/content row
    expect(headerBox!.y).toBe(navPanelBox!.y);
    expect(headerBox!.y).toBeLessThan(mainContentBox!.y);

    // Verify footer is below the nav/content row
    expect(footerBox!.y).toBe(navPanelBox!.y + navPanelBox!.height - footerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/nav/footer static, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at mid-scroll: only main content scrolls, header/nav/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/nav/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Vertical Layout - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, false, "200px"));

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

    // Verify vertical layout: NavPanel on left, content on right
    expect(navPanelBox!.x).toBeLessThan(mainContentBox!.x);
    expect(navPanelBox!.x).toBeLessThan(headerBox!.x);

    // Verify header is above the nav/content row
    expect(headerBox!.y).toBe(navPanelBox!.y);
    expect(headerBox!.y).toBeLessThan(mainContentBox!.y);

    // Verify footer is below the nav/content row
    expect(footerBox!.y).toBe(navPanelBox!.y + navPanelBox!.height - footerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content: main content scrolls with reserved gutters, header/nav/footer static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: main content scrolls with gutters, header/nav/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at bottom: main content scrolls with gutters, header/nav/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });
});

test.describe("Vertical-Sticky Layout - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders header, nav panel on left, main content, and footer in correct positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, true, "200px"));

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

    // Verify vertical layout: NavPanel on left, content on right
    expect(navPanelBox!.x).toBeLessThan(mainContentBox!.x);
    expect(navPanelBox!.x).toBeLessThan(headerBox!.x);

    // Verify header is above the nav/content row
    expect(headerBox!.y).toBe(navPanelBox!.y);
    expect(headerBox!.y).toBeLessThan(mainContentBox!.y);

    // Verify footer is below the nav/content row
    expect(footerBox!.y).toBe(navPanelBox!.y + navPanelBox!.height - footerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, false);
  });

  test("tall content at top: header/footer sticky, nav visible (full height), app container scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, true, "2000px"));

    await expect(page.getByTestId("mainContent")).toBeVisible();

    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    await verifyAppContainerScrollable(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at mid-scroll: header/footer sticky, nav visible (full height)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, true, "2000px"));

    await scrollAppContainerTo(page, "mid");

    // Header, nav, and footer should all remain sticky and visible
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: header/footer sticky, nav visible (full height)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, true, "2000px"));

    await scrollAppContainerTo(page, "bottom");

    // Header, nav, and footer should all remain sticky and visible
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Vertical-Sticky Layout - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, true, "200px"));

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

    // Verify vertical layout: NavPanel on left, content on right
    expect(navPanelBox!.x).toBeLessThan(mainContentBox!.x);
    expect(navPanelBox!.x).toBeLessThan(headerBox!.x);

    // Verify header is above the nav/content row
    expect(headerBox!.y).toBe(navPanelBox!.y);
    expect(headerBox!.y).toBeLessThan(mainContentBox!.y);

    // Verify footer is below the nav/content row
    expect(footerBox!.y).toBe(navPanelBox!.y + navPanelBox!.height - footerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, true, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at mid-scroll: header/footer sticky, nav visible (full height)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, true, "2000px"));
    await scrollAppContainerTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at bottom: header/footer sticky, nav visible (full height)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, true, "2000px"));
    await scrollAppContainerTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });
});

test.describe("Vertical-Sticky Layout - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, false, "200px"));

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

    // Verify vertical layout: NavPanel on left, content on right
    expect(navPanelBox!.x).toBeLessThan(mainContentBox!.x);
    expect(navPanelBox!.x).toBeLessThan(headerBox!.x);

    // Verify header is above the nav/content row
    expect(headerBox!.y).toBe(navPanelBox!.y);
    expect(headerBox!.y).toBeLessThan(mainContentBox!.y);

    // Verify footer is below the nav/content row
    expect(footerBox!.y).toBe(navPanelBox!.y + navPanelBox!.height - footerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/nav/footer sticky, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at mid-scroll: only main content scrolls, header/nav/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/nav/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
  });
});

test.describe("Vertical-Sticky Layout - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, false, "200px"));

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

    // Verify vertical layout: NavPanel on left, content on right
    expect(navPanelBox!.x).toBeLessThan(mainContentBox!.x);
    expect(navPanelBox!.x).toBeLessThan(headerBox!.x);

    // Verify header is above the nav/content row
    expect(headerBox!.y).toBe(navPanelBox!.y);
    expect(headerBox!.y).toBeLessThan(mainContentBox!.y);

    // Verify footer is below the nav/content row
    expect(footerBox!.y).toBe(navPanelBox!.y + navPanelBox!.height - footerBox!.height);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y + mainContentBox!.height);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content: main content scrolls with reserved gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: main content scrolls with gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at bottom: main content scrolls with gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });
});

// =============================================================================
// VERTICAL-FULL-HEADER LAYOUT TESTS
// =============================================================================
// Layout: Row 1: [H spanning full width], Row 2 columns: [N] [M], Row 3: [F spanning full width]
// - H: sticky to viewport top, spans entire width
// - N: fixed width, sticky to top (below H), height = viewport - H - F
// - M: fills remaining width, scrollable
// - F: sticky to viewport bottom, spans entire width
// - Scroll container: entire viewport (scrollWholePage is always treated as true)
// =============================================================================

test.describe("Vertical-Full-Header Layout - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders header spanning full width at top, nav panel and main content in row, footer spanning full width at bottom", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", true, true, "200px"));

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

    // Verify header spans full width at top
    expect(headerBox!.x).toBe(0);
    expect(headerBox!.width).toBe(1280);
    expect(headerBox!.y).toBe(0);

    // Verify nav panel and main content are in a row below header
    expect(navPanelBox!.y).toBe(headerBox!.y + headerBox!.height);
    expect(mainContentBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);

    // Verify nav panel is on left, main content on right
    expect(navPanelBox!.x).toBe(0);
    expect(mainContentBox!.x).toBeGreaterThanOrEqual(navPanelBox!.x + navPanelBox!.width);

    // Verify footer spans full width at bottom
    expect(footerBox!.x).toBe(0);
    expect(footerBox!.width).toBe(1280);
    expect(footerBox!.y).toBeGreaterThan(mainContentBox!.y);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, false);
  });

  test("tall content at top: header/footer sticky, nav sticky (full height available), app container scrolls without gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", true, true, "2000px"));

    await expect(page.getByTestId("mainContent")).toBeVisible();

    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBe(0);

    await verifyAppContainerScrollable(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: header/footer sticky, nav sticky, content partially visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", true, true, "2000px"));

    await scrollAppContainerTo(page, "mid");

    // Header, nav, and footer should all remain sticky and visible
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);

    // Verify header still spans full width
    const header = page.getByTestId("appHeader");
    const headerBox = await header.boundingBox();
    expect(headerBox!.x).toBe(0);
    expect(headerBox!.width).toBe(1280);
  });

  test("tall content at bottom: header/footer sticky, nav sticky, bottom of content visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", true, true, "2000px"));

    await scrollAppContainerTo(page, "bottom");

    // Header, nav, and footer should all remain sticky and visible
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);

    // Verify footer still spans full width
    const footer = page.getByTestId("footer");
    const footerBox = await footer.boundingBox();
    expect(footerBox!.x).toBe(0);
    expect(footerBox!.width).toBe(1280);
  });
});

test.describe("Vertical-Full-Header Layout - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", false, true, "200px"));

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

    // Verify header spans full width at top
    expect(headerBox!.x).toBeGreaterThanOrEqual(0);
    expect(headerBox!.width).toBeGreaterThanOrEqual(1250);

    // Verify nav panel and main content are in a row
    expect(navPanelBox!.y).toBe(headerBox!.y + headerBox!.height);
    expect(mainContentBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
    expect(navPanelBox!.x).toBeGreaterThanOrEqual(0);
    expect(mainContentBox!.x).toBeGreaterThanOrEqual(navPanelBox!.x + navPanelBox!.width);

    // Verify footer spans full width
    expect(footerBox!.x).toBeGreaterThanOrEqual(0);
    expect(footerBox!.width).toBeGreaterThanOrEqual(1250);

    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyAppContainerScrollable(page, false);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with gutters, all blocks sticky and visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", false, true, "2000px"));

    await verifyAppContainerScrollable(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at mid-scroll: app container scrolls with gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", false, true, "2000px"));
    await scrollAppContainerTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at bottom: app container scrolls with gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", false, true, "2000px"));
    await scrollAppContainerTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "navPanel", "footer"]);
    await verifyScrollbarGutters(page, true);
  });
});

test.describe("Vertical-Full-Header Layout - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, main content does not need scrolling", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", true, false, "200px"));

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

    // Verify header spans full width
    expect(headerBox!.x).toBeGreaterThanOrEqual(0);
    expect(headerBox!.width).toBeGreaterThanOrEqual(1250);

    // Verify nav and content row
    expect(navPanelBox!.y).toBe(headerBox!.y + headerBox!.height);
    expect(mainContentBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);

    // Verify footer spans full width
    expect(footerBox!.x).toBeGreaterThanOrEqual(0);
    expect(footerBox!.width).toBeGreaterThanOrEqual(1250);

    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content is scroll container without gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", true, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: main content scrolls without gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", true, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at bottom: main content scrolls without gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", true, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });
});

test.describe("Vertical-Full-Header Layout - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("short content: all blocks visible, main content does not need scrolling, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", false, false, "200px"));

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

    // Verify header spans full width
    expect(headerBox!.x).toBeGreaterThanOrEqual(0);
    expect(headerBox!.width).toBeGreaterThanOrEqual(1250);

    // Verify nav and content row
    expect(navPanelBox!.y).toBe(headerBox!.y + headerBox!.height);
    expect(mainContentBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);

    // Verify footer spans full width
    expect(footerBox!.x).toBeGreaterThanOrEqual(0);
    expect(footerBox!.width).toBeGreaterThanOrEqual(1250);

    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content is scroll container with gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", false, false, "2000px"));
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
    await verifyMainContentIsScrollContainer(page, false);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at mid-scroll: main content scrolls with gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", false, false, "2000px"));
    await scrollMainContentTo(page, "mid");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });

  test("tall content at bottom: main content scrolls with gutters, header/nav/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-full-header", false, false, "2000px"));
    await scrollMainContentTo(page, "bottom");
    await verifyAllBlocksVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
    await verifyMainContentScrollbarGutters(page, false);
  });
});

// =============================================================================
// DESKTOP LAYOUT TESTS
// =============================================================================

test.describe("Desktop Layout - with Header and Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders full viewport layout with header, main content, and footer", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App layout="desktop">
        <AppHeader testId="appHeader">
          Desktop Header
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="200px" backgroundColor="lightblue">
              <Text>Desktop Main Content</Text>
            </Stack>
          </Page>
        </Pages>
        <Footer testId="footer">
          Desktop Footer
        </Footer>
      </App>
    `);

    // Verify header and footer are visible, NavPanel should not exist
    const header = page.getByTestId("appHeader");
    const mainContent = page.getByTestId("mainContent");
    const footer = page.getByTestId("footer");
    const navPanel = page.getByTestId("navPanel");

    await expect(header).toBeVisible();
    await expect(mainContent).toBeVisible();
    await expect(footer).toBeVisible();
    await expect(navPanel).not.toBeVisible();

    // Verify layout structure
    const headerBox = await header.boundingBox();
    const mainContentBox = await mainContent.boundingBox();
    const footerBox = await footer.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(mainContentBox).not.toBeNull();
    expect(footerBox).not.toBeNull();

    // Header should be at top
    expect(headerBox!.y).toBeLessThan(50);

    // Footer should be at bottom
    expect(footerBox!.y + footerBox!.height).toBeGreaterThan(1000);

    // Main content should be between header and footer
    expect(mainContentBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height);
    expect(mainContentBox!.y).toBeLessThan(footerBox!.y);
  });

  test("header and footer are sticky when content is tall", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <AppHeader testId="appHeader">
          Desktop Header
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="2000px" backgroundColor="lightblue">
              <Text>Tall Desktop Content</Text>
            </Stack>
          </Page>
        </Pages>
        <Footer testId="footer">
          Desktop Footer
        </Footer>
      </App>
    `);

    const header = page.getByTestId("appHeader");
    const footer = page.getByTestId("footer");
    const mainContent = page.getByTestId("mainContent");

    // Before scrolling - header and footer should be in viewport
    await expect(header).toBeVisible();
    await expect(footer).toBeVisible();
    await expect(mainContent).toBeVisible();

    const headerBoxBefore = await header.boundingBox();
    const footerBoxBefore = await footer.boundingBox();

    // Scroll main content
    await scrollMainContentTo(page, "mid");

    const headerBoxAfter = await header.boundingBox();
    const footerBoxAfter = await footer.boundingBox();

    // Header and footer should remain in same position (sticky)
    expect(headerBoxAfter!.y).toBeCloseTo(headerBoxBefore!.y, 0);
    expect(footerBoxAfter!.y).toBeCloseTo(footerBoxBefore!.y, 0);
  });

  test("main content is the scroll container", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <AppHeader testId="appHeader">
          Desktop Header
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="2000px" backgroundColor="lightblue">
              <Text>Tall Desktop Content</Text>
            </Stack>
          </Page>
        </Pages>
        <Footer testId="footer">
          Desktop Footer
        </Footer>
      </App>
    `);

    // Verify main content is scrollable
    await verifyMainContentIsScrollContainer(page);

    // App container should not be scrollable
    await verifyAppContainerNotScrollable(page);
  });

  test("no scrollbar gutters in desktop layout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <AppHeader testId="appHeader">
          Desktop Header
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="2000px" backgroundColor="lightblue">
              <Text>Tall Desktop Content</Text>
            </Stack>
          </Page>
        </Pages>
        <Footer testId="footer">
          Desktop Footer
        </Footer>
      </App>
    `);

    // Desktop layout should not have scrollbar gutters
    const info = await page.evaluate(() => {
      const appWrapper = document.querySelector('[class*="appContainer"]');
      if (!appWrapper) return { found: false };

      const styles = window.getComputedStyle(appWrapper);
      return {
        found: true,
        scrollbarGutter: styles.scrollbarGutter,
      };
    });

    expect(info.found).toBe(true);
    expect(info.scrollbarGutter).not.toBe("stable both-edges");
  });

  test("container stretches to full viewport (100vw × 100vh)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <AppHeader testId="appHeader">
          Desktop Header
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="200px" backgroundColor="lightblue">
              <Text>Desktop Content</Text>
            </Stack>
          </Page>
        </Pages>
        <Footer testId="footer">
          Desktop Footer
        </Footer>
      </App>
    `);

    const containerInfo = await page.evaluate(() => {
      const appWrapper = document.querySelector('[class*="appContainer"]') as HTMLElement;
      if (!appWrapper) return { found: false };

      const rect = appWrapper.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      return {
        found: true,
        width: rect.width,
        height: rect.height,
        viewportWidth,
        viewportHeight,
      };
    });

    expect(containerInfo.found).toBe(true);

    // Container should fill viewport (allow small tolerance for scrollbars)
    expect(containerInfo.width).toBeGreaterThanOrEqual(containerInfo.viewportWidth - 20);
    expect(containerInfo.height).toBeGreaterThanOrEqual(containerInfo.viewportHeight - 20);
  });
});

test.describe("Desktop Layout - without Header and Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("renders only main content when header and footer are omitted", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App layout="desktop">
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="200px" backgroundColor="lightblue">
              <Text>Desktop Main Content Only</Text>
            </Stack>
          </Page>
        </Pages>
      </App>
    `);

    // Only main content should be visible
    const mainContent = page.getByTestId("mainContent");
    const header = page.getByTestId("appHeader");
    const footer = page.getByTestId("footer");
    const navPanel = page.getByTestId("navPanel");

    await expect(mainContent).toBeVisible();
    await expect(header).not.toBeVisible();
    await expect(footer).not.toBeVisible();
    await expect(navPanel).not.toBeVisible();
  });

  test("main content fills entire viewport", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="200px" backgroundColor="lightblue">
              <Text>Desktop Content</Text>
            </Stack>
          </Page>
        </Pages>
      </App>
    `);

    const mainContent = page.getByTestId("mainContent");
    const mainContentBox = await mainContent.boundingBox();

    expect(mainContentBox).not.toBeNull();

    // Main content should start near top of viewport
    expect(mainContentBox!.y).toBeLessThan(50);
  });

  test("tall content scrolls within main content area", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="2000px" backgroundColor="lightblue">
              <Text>Tall Desktop Content</Text>
            </Stack>
          </Page>
        </Pages>
      </App>
    `);

    // Verify main content is scrollable
    await verifyMainContentIsScrollContainer(page);

    // App container should not be scrollable
    await verifyAppContainerNotScrollable(page);
  });
});

test.describe("Desktop Layout - scrollWholePage and noScrollbarGutters props", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("scrollWholePage prop is ignored in desktop layout", async ({ initTestBed, page }) => {
    // Test with scrollWholePage=true
    await initTestBed(`
      <App layout="desktop" scrollWholePage="true">
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="2000px" backgroundColor="lightblue">
              <Text>Tall Content</Text>
            </Stack>
          </Page>
        </Pages>
      </App>
    `);

    // Main content should still be the scroll container (desktop always uses content-only scroll)
    await verifyMainContentIsScrollContainer(page);
    await verifyAppContainerNotScrollable(page);
  });

  test("noScrollbarGutters prop is ignored in desktop layout", async ({ initTestBed, page }) => {
    // Test with noScrollbarGutters=false (should still not have gutters)
    await initTestBed(`
      <App layout="desktop" noScrollbarGutters="false">
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="2000px" backgroundColor="lightblue">
              <Text>Tall Content</Text>
            </Stack>
          </Page>
        </Pages>
      </App>
    `);

    // Desktop layout never uses scrollbar gutters
    const info = await page.evaluate(() => {
      const appWrapper = document.querySelector('[class*="appContainer"]');
      if (!appWrapper) return { found: false };

      const styles = window.getComputedStyle(appWrapper);
      return {
        found: true,
        scrollbarGutter: styles.scrollbarGutter,
      };
    });

    expect(info.found).toBe(true);
    expect(info.scrollbarGutter).not.toBe("stable both-edges");
  });
});

test.describe("Desktop Layout - NavPanel behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1080 });
  });

  test("NavPanel is not rendered even when provided", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <AppHeader testId="appHeader">
          Desktop Header
        </AppHeader>
        <NavPanel testId="navPanel">
          <NavLink label="Link 1" to="/page1" />
          <NavLink label="Link 2" to="/page2" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="200px" backgroundColor="lightblue">
              <Text>Desktop Content</Text>
            </Stack>
          </Page>
        </Pages>
        <Footer testId="footer">
          Desktop Footer
        </Footer>
      </App>
    `);

    // NavPanel should not be visible in desktop layout
    const navPanel = page.getByTestId("navPanel");
    await expect(navPanel).not.toBeVisible();

    // Header, main content, and footer should still be visible
    await expect(page.getByTestId("appHeader")).toBeVisible();
    await expect(page.getByTestId("mainContent")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
  });

  test("no drawer/hamburger menu in desktop layout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <AppHeader testId="appHeader">
          Desktop Header
        </AppHeader>
        <NavPanel testId="navPanel">
          <NavLink label="Link 1" to="/page1" />
          <NavLink label="Link 2" to="/page2" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <Stack testId="mainContent" height="200px" backgroundColor="lightblue">
              <Text>Desktop Content</Text>
            </Stack>
          </Page>
        </Pages>
      </App>
    `);

    // No hamburger menu button should exist
    const hamburgerButton = page.locator('[data-part-id="hamburger-button"]');
    await expect(hamburgerButton).not.toBeVisible();
  });
});

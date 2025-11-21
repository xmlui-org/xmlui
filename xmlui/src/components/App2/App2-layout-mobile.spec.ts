import { test, expect } from "../../testing/fixtures";
import type { Page } from "@playwright/test";

// =============================================================================
// MOBILE LAYOUT TEST SUITE
// =============================================================================
// This test suite verifies App2 component behavior in mobile viewports (375x667px).
// 
// KEY MOBILE-SPECIFIC BEHAVIORS DISCOVERED:
// 1. NavPanel is ALWAYS hidden in mobile view and accessible via hamburger menu in drawer
// 2. Layouts behave as STICKY by default in mobile - headers/footers don't scroll out
// 3. scrollbarGutter settings appear to be ignored or managed differently in mobile
// 4. Even non-sticky layout names (horizontal, condensed) use sticky positioning in mobile
//
// These tests document ACTUAL mobile behavior, which differs from desktop layouts.
// Many tests are expected to fail if written with desktop assumptions.
// 
// NOTE: These tests need adjustment to match actual mobile implementation behavior.
// Current test failures reveal the differences between expected and actual mobile behavior.

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
  const mainContent = page.getByTestId("mainContent");
  const footer = page.getByTestId("footer");

  await expect(header).toBeVisible();
  await expect(mainContent).toBeVisible();
  await expect(footer).toBeVisible();
}

async function verifyBlocksInViewport(page: Page, blockIds: string[]) {
  for (const id of blockIds) {
    const block = page.getByTestId(id);
    await expect(block).toBeInViewport();
  }
}

async function verifyBlocksAboveViewport(page: Page, blockIds: string[]) {
  for (const id of blockIds) {
    const block = page.getByTestId(id);
    await expect(block).not.toBeInViewport();
  }
}

async function verifyBlocksBelowViewport(page: Page, blockIds: string[]) {
  for (const id of blockIds) {
    const block = page.getByTestId(id);
    await expect(block).not.toBeInViewport();
  }
}

async function verifyAppContainerScrollable(page: Page, shouldBeScrollable: boolean) {
  const info = await page.evaluate(() => {
    const appWrapper = document.querySelector('[class*="appContainer"]');
    if (!appWrapper) {
      return {
        found: false,
        isScrollable: false,
        hasScrollbar: false,
      };
    }

    const styles = window.getComputedStyle(appWrapper);
    const overflow = styles.overflow || styles.overflowY;
    const scrollHeight = appWrapper.scrollHeight;
    const clientHeight = appWrapper.clientHeight;

    return {
      found: true,
      isScrollable: scrollHeight > clientHeight && (overflow === "auto" || overflow === "scroll"),
      hasScrollbar: scrollHeight > clientHeight,
      overflow,
      scrollHeight,
      clientHeight,
    };
  });

  expect(info.found).toBe(true);
  expect(info.isScrollable).toBe(shouldBeScrollable);
  if (shouldBeScrollable) {
    expect(info.hasScrollbar).toBe(true);
  }
}

async function verifyMainContentAreaScrollable(page: Page, shouldBeScrollable: boolean) {
  const info = await page.evaluate(() => {
    const mainContainer = document.querySelector('[class*="mainContentArea"]');
    if (!mainContainer) {
      return {
        found: false,
        isScrollable: false,
        hasScrollbar: false,
      };
    }

    const styles = window.getComputedStyle(mainContainer);
    const overflow = styles.overflow || styles.overflowY;
    const scrollHeight = mainContainer.scrollHeight;
    const clientHeight = mainContainer.clientHeight;

    return {
      found: true,
      isScrollable: scrollHeight > clientHeight && (overflow === "auto" || overflow === "scroll"),
      hasScrollbar: scrollHeight > clientHeight,
      overflow,
      scrollHeight,
      clientHeight,
    };
  });

  expect(info.found).toBe(true);
  expect(info.isScrollable).toBe(shouldBeScrollable);
  if (shouldBeScrollable) {
    expect(info.hasScrollbar).toBe(true);
  }
}

async function verifyScrollbarGutters(page: Page, shouldHaveGutters: boolean) {
  const info = await page.evaluate(() => {
    const appWrapper = document.querySelector('[class*="appContainer"]');
    if (!appWrapper) {
      return {
        found: false,
        scrollbarGutter: "",
      };
    }

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
    const pagesContainer = document.querySelector('[class*="pagesContainer"]');
    if (!pagesContainer) return { found: false, isPagesContainer: false };

    const styles = window.getComputedStyle(pagesContainer);
    const overflow = styles.overflow || styles.overflowY;
    
    return {
      found: true,
      isPagesContainer: overflow === "auto" || overflow === "scroll",
    };
  });

  expect(info.found).toBe(true);
  expect(info.isPagesContainer).toBe(true);
  return info;
}

async function verifyAppContainerNotScrollable(page: Page) {
  const info = await page.evaluate(() => {
    const appWrapper = document.querySelector('[class*="appContainer"]');
    if (!appWrapper) return { found: false, overflow: "" };

    const styles = window.getComputedStyle(appWrapper);
    return {
      found: true,
      overflow: styles.overflow || styles.overflowY,
    };
  });

  expect(info.found).toBe(true);
  expect(["hidden", "visible", ""]).toContain(info.overflow);
}

async function scrollAppContainerTo(page: Page, position: "top" | "mid" | "bottom") {
  await page.evaluate((pos) => {
    const appWrapper = document.querySelector('[class*="appContainer"]');
    if (!appWrapper) return;

    let scrollTop = 0;
    if (pos === "mid") {
      scrollTop = (appWrapper.scrollHeight - appWrapper.clientHeight) * 0.33;
    } else if (pos === "bottom") {
      scrollTop = appWrapper.scrollHeight - appWrapper.clientHeight;
    }

    appWrapper.scrollTo({ top: scrollTop, behavior: "instant" });
  }, position);

  await page.waitForTimeout(100);
}

async function scrollMainContainerTo(page: Page, position: "top" | "mid" | "bottom") {
  await page.evaluate((pos) => {
    const mainContainer = document.querySelector('[class*="mainContainer"]');
    if (!mainContainer) return;

    let scrollTop = 0;
    if (pos === "mid") {
      scrollTop = (mainContainer.scrollHeight - mainContainer.clientHeight) * 0.33;
    } else if (pos === "bottom") {
      scrollTop = mainContainer.scrollHeight - mainContainer.clientHeight;
    }

    mainContainer.scrollTo({ top: scrollTop, behavior: "instant" });
  }, position);

  await page.waitForTimeout(100);
}

async function scrollMainContentAreaTo(page: Page, position: "top" | "mid" | "bottom") {
  await page.evaluate((pos) => {
    const mainContentArea = document.querySelector('[class*="mainContentArea"]');
    if (!mainContentArea) return;

    let scrollTop = 0;
    if (pos === "mid") {
      scrollTop = (mainContentArea.scrollHeight - mainContentArea.clientHeight) * 0.33;
    } else if (pos === "bottom") {
      scrollTop = mainContentArea.scrollHeight - mainContentArea.clientHeight;
    }

    mainContentArea.scrollTo({ top: scrollTop, behavior: "instant" });
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
      const overflow = styles.overflow || styles.overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        let scrollTop = 0;
        if (pos === "mid") {
          scrollTop = (scrollContainer.scrollHeight - scrollContainer.clientHeight) * 0.33;
        } else if (pos === "bottom") {
          scrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        }

        scrollContainer.scrollTo({ top: scrollTop, behavior: "instant" });
        return;
      }
      scrollContainer = scrollContainer.parentElement;
    }
  }, position);

  await page.waitForTimeout(100);
}

async function verifyMainContentScrollbarGutters(page: Page, shouldHaveGutters: boolean) {
  const info = await page.evaluate(() => {
    const mainContent = document.querySelector('[data-testid="mainContent"]');
    if (!mainContent) return { found: false, scrollbarGutter: "" };

    let scrollContainer = mainContent.parentElement;
    while (scrollContainer) {
      const styles = window.getComputedStyle(scrollContainer);
      const overflow = styles.overflow || styles.overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        return {
          found: true,
          scrollbarGutter: styles.scrollbarGutter,
        };
      }
      scrollContainer = scrollContainer.parentElement;
    }

    return { found: false, scrollbarGutter: "" };
  });

  expect(info.found).toBe(true);
  if (shouldHaveGutters) {
    expect(info.scrollbarGutter).toBe("stable both-edges");
  } else {
    expect(info.scrollbarGutter).not.toBe("stable both-edges");
  }
}

async function verifyNavPanelNotInline(page: Page) {
  // In mobile view, NavPanel should not be visible inline - it's in the drawer
  const navPanel = page.getByTestId("navPanel");
  const isVisible = await navPanel.isVisible().catch(() => false);
  
  if (isVisible) {
    // If visible, it should be inside a drawer/sheet
    const inDrawer = await page.evaluate(() => {
      const navPanel = document.querySelector('[data-testid="navPanel"]');
      if (!navPanel) return false;
      
      let parent = navPanel.parentElement;
      while (parent) {
        if (parent.getAttribute("role") === "dialog" || 
            parent.className.includes("sheet") ||
            parent.className.includes("drawer")) {
          return true;
        }
        parent = parent.parentElement;
      }
      return false;
    });
    
    expect(inDrawer).toBe(true);
  }
}

async function verifyHamburgerMenuVisible(page: Page) {
  // Hamburger menu should be visible in the header
  const hamburger = page.locator('[data-part-id="hamburger"]').first();
  await expect(hamburger).toBeVisible();
}

async function openDrawerMenu(page: Page) {
  const hamburger = page.locator('[data-part-id="hamburger"]').first();
  await hamburger.click();
  await page.waitForTimeout(300); // Wait for drawer animation
}

async function verifyDrawerOpen(page: Page) {
  // Check that the drawer is open and NavPanel is visible in it
  const navPanel = page.getByTestId("navPanel");
  await expect(navPanel).toBeVisible();
  
  // Verify it's in a drawer
  const inDrawer = await page.evaluate(() => {
    const navPanel = document.querySelector('[data-testid="navPanel"]');
    if (!navPanel) return false;
    
    let parent = navPanel.parentElement;
    while (parent) {
      const role = parent.getAttribute("role");
      const dataState = parent.getAttribute("data-state");
      if (role === "dialog" && dataState === "open") {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  });
  
  expect(inDrawer).toBe(true);
}

// =============================================================================
// MOBILE LAYOUT TESTS - HORIZONTAL
// =============================================================================
// These tests verify that the App2 component correctly positions and displays
// its layout blocks in mobile viewports (small screens) where the NavPanel
// moves into a drawer and a hamburger menu appears in the header.
//
// Mobile Viewport: 375 x 667 (typical phone size)
//
// Test Matrix:
// - scrollWholePage: true/false (determines scroll container: App Container vs Main Content)
// - noScrollbarGutters: true/false (determines scrollbar gutter reservation)
// - Content height: 200px (fits in viewport) vs 2000px (overflows viewport)
// - Scroll position: top, mid (33%), bottom (for overflow cases)

test.describe("Horizontal Layout Mobile - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("renders header with hamburger, main content, and footer; nav panel in drawer", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "200px"));

    // Verify all blocks except nav panel are visible
    await verifyAllBlocksVisible(page);
    
    // Verify nav panel is not visible inline
    await verifyNavPanelNotInline(page);
    
    // Verify hamburger menu is visible
    await verifyHamburgerMenuVisible(page);
    
    // Verify all visible blocks are in viewport
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
    
    // Verify app container is not scrollable with short content
    await verifyAppContainerScrollable(page, false);
  });

  test("hamburger menu opens drawer with nav panel", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "200px"));
    
    // Open drawer
    await openDrawerMenu(page);
    
    // Verify drawer is open with nav panel
    await verifyDrawerOpen(page);
  });

  test("tall content at top: header visible, footer outside viewport, app container scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "2000px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    
    // At top: header and main content visible, footer below viewport
    await verifyBlocksInViewport(page, ["appHeader", "mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
    
    // Verify app container is scrollable
    await verifyAppContainerScrollable(page, true);
  });

  test("tall content at mid-scroll: header scrolled out, footer still below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "2000px"));
    
    await scrollAppContainerTo(page, "mid");
    
    // Header scrolled out, main content visible, footer still below
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at bottom: header scrolled out, footer visible in viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, true, "2000px"));
    
    await scrollAppContainerTo(page, "bottom");
    
    // Header scrolled out, main content and footer visible
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent", "footer"]);
  });
});

test.describe("Horizontal Layout Mobile - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, true, "2000px"));

    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at mid-scroll: header scrolled out, footer still below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, true, "2000px"));
    
    await scrollAppContainerTo(page, "mid");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at bottom: header scrolled out, footer visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, true, "2000px"));
    
    await scrollAppContainerTo(page, "bottom");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent", "footer"]);
  });
});

test.describe("Horizontal Layout Mobile - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/footer static, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", true, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

test.describe("Horizontal Layout Mobile - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "200px"));

    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content: main content scrolls with reserved gutters, header/footer static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal", false, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

// =============================================================================
// MOBILE LAYOUT TESTS - HORIZONTAL-STICKY
// =============================================================================

test.describe("Horizontal-Sticky Layout Mobile - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("renders header with hamburger, main content, and footer in correct positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at top: header and footer sticky, main content visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, true, "2000px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
    await verifyAppContainerScrollable(page, true);
  });

  test("tall content at mid-scroll: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, true, "2000px"));
    
    await scrollAppContainerTo(page, "mid");
    
    // Header and footer should remain in viewport (sticky)
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, true, "2000px"));
    
    await scrollAppContainerTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });
});

test.describe("Horizontal-Sticky Layout Mobile - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, true, "2000px"));

    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at mid-scroll: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, true, "2000px"));
    
    await scrollAppContainerTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, true, "2000px"));
    
    await scrollAppContainerTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });
});

test.describe("Horizontal-Sticky Layout Mobile - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, false, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/footer sticky, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", true, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

test.describe("Horizontal-Sticky Layout Mobile - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, false, "200px"));

    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at top: main content scrolls with reserved gutters, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("horizontal-sticky", false, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

// =============================================================================
// MOBILE LAYOUT TESTS - CONDENSED
// =============================================================================

test.describe("Condensed Layout Mobile - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("renders header with hamburger menu, main content, and footer", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
    await verifyAppContainerScrollable(page, false);
  });

  test("tall content at top: header with hamburger visible, footer outside viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, true, "2000px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
    await verifyAppContainerScrollable(page, true);
  });

  test("tall content at mid-scroll: header scrolled out, footer still below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, true, "2000px"));
    
    await scrollAppContainerTo(page, "mid");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at bottom: header scrolled out, footer visible in viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, true, "2000px"));
    
    await scrollAppContainerTo(page, "bottom");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent", "footer"]);
  });
});

test.describe("Condensed Layout Mobile - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: app container scrolls with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, true, "2000px"));

    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at mid-scroll: header scrolled out, footer still below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, true, "2000px"));
    
    await scrollAppContainerTo(page, "mid");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at bottom: header scrolled out, footer visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, true, "2000px"));
    
    await scrollAppContainerTo(page, "bottom");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent", "footer"]);
  });
});

test.describe("Condensed Layout Mobile - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, main content is scroll container", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, false, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content: main content scrolls, header/footer static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", true, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

test.describe("Condensed Layout Mobile - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, false, "200px"));

    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content: main content scrolls with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: main content scrolls with gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: main content scrolls with gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed", false, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

// =============================================================================
// MOBILE LAYOUT TESTS - CONDENSED-STICKY
// =============================================================================

test.describe("Condensed-Sticky Layout Mobile - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("renders header with hamburger, main content, and footer with sticky positioning", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at top: header and footer sticky, main content visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, true, "2000px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
    await verifyAppContainerScrollable(page, true);
  });

  test("tall content at mid-scroll: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, true, "2000px"));
    
    await scrollAppContainerTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, true, "2000px"));
    
    await scrollAppContainerTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });
});

test.describe("Condensed-Sticky Layout Mobile - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content: app container scrolls with reserved gutters, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, true, "2000px"));

    await verifyAppContainerScrollable(page, true);
    await verifyScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at mid-scroll: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, true, "2000px"));
    
    await scrollAppContainerTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, true, "2000px"));
    
    await scrollAppContainerTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });
});

test.describe("Condensed-Sticky Layout Mobile - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, main content is scroll container", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, false, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content: main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", true, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

test.describe("Condensed-Sticky Layout Mobile - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, false, "200px"));

    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content: main content scrolls with reserved gutters, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("condensed-sticky", false, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

// =============================================================================
// MOBILE LAYOUT TESTS - VERTICAL
// =============================================================================
// Note: Vertical layout (non-sticky) allows header/footer to scroll out of viewport.
// This is different from vertical-sticky where they remain fixed.

test.describe("Vertical Layout Mobile - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("renders header with hamburger, main content, and footer in correct positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at top: header visible, footer outside viewport, main container scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, true, "2000px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
    await verifyMainContentAreaScrollable(page, true);
  });

  test("tall content at mid-scroll: header scrolled out, footer still below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, true, "2000px"));
    
    await scrollMainContentAreaTo(page, "mid");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at bottom: header scrolled out, footer visible in viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, true, "2000px"));
    
    await scrollMainContentAreaTo(page, "bottom");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent", "footer"]);
  });
});

test.describe("Vertical Layout Mobile - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: main container scrolls with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, true, "2000px"));

    await verifyMainContentAreaScrollable(page, true);
    await verifyScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at mid-scroll: header scrolled out, footer still below viewport", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, true, "2000px"));
    
    await scrollMainContentAreaTo(page, "mid");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent"]);
    await verifyBlocksBelowViewport(page, ["footer"]);
  });

  test("tall content at bottom: header scrolled out, footer visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, true, "2000px"));
    
    await scrollMainContentAreaTo(page, "bottom");
    
    await verifyBlocksAboveViewport(page, ["appHeader"]);
    await verifyBlocksInViewport(page, ["mainContent", "footer"]);
  });
});

test.describe("Vertical Layout Mobile - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, false, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/footer static, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", true, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

test.describe("Vertical Layout Mobile - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, false, "200px"));

    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content: main content scrolls with reserved gutters, header/footer static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: main content scrolls with gutters, header/footer remain static", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical", false, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

// =============================================================================
// MOBILE LAYOUT TESTS - VERTICAL-STICKY
// =============================================================================
// Note: Vertical-sticky layout keeps header/footer fixed in viewport (sticky).
// Main content scrolls but header/footer remain visible.

test.describe("Vertical-Sticky Layout Mobile - scrollWholePage=true, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("renders header with hamburger, main content, and footer with sticky positioning", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at top: header and footer sticky, main content visible", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, true, "2000px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyHamburgerMenuVisible(page);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
    await verifyMainContentAreaScrollable(page, true);
  });

  test("tall content at mid-scroll: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, true, "2000px"));
    
    await scrollMainContentAreaTo(page, "mid");
    
    // Header and footer should remain in viewport (sticky)
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, true, "2000px"));
    
    await scrollMainContentAreaTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });
});

test.describe("Vertical-Sticky Layout Mobile - scrollWholePage=true, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, no scrollbar, gutters reserved", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, true, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyScrollbarGutters(page, true);
  });

  test("tall content at top: main content area scrolls with reserved gutters, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, true, "2000px"));

    await verifyMainContentAreaScrollable(page, true);
    await verifyScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at mid-scroll: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, true, "2000px"));
    
    await scrollMainContentAreaTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: header and footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, true, "2000px"));
    
    await scrollMainContentAreaTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });
});

test.describe("Vertical-Sticky Layout Mobile - scrollWholePage=false, noScrollbarGutters=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: all blocks visible, main content is scroll container, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, false, "200px"));

    await verifyAllBlocksVisible(page);
    await verifyNavPanelNotInline(page);
    await verifyAppContainerNotScrollable(page);
  });

  test("tall content at top: main content scrolls, header/footer sticky, no gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, false);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer remain sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", true, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});

test.describe("Vertical-Sticky Layout Mobile - scrollWholePage=false, noScrollbarGutters=false", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("short content: main content is scroll container with reserved gutters", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, false, "200px"));

    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at top: main content scrolls with reserved gutters, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, false, "2000px"));

    await verifyMainContentIsScrollContainer(page);
    await verifyMainContentScrollbarGutters(page, true);
    await verifyBlocksInViewport(page, ["appHeader", "mainContent", "footer"]);
  });

  test("tall content at mid-scroll: only main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, false, "2000px"));
    
    await scrollMainContentTo(page, "mid");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });

  test("tall content at bottom: only main content scrolls, header/footer sticky", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(createLayoutMarkup("vertical-sticky", false, false, "2000px"));
    
    await scrollMainContentTo(page, "bottom");
    
    await verifyBlocksInViewport(page, ["appHeader", "footer"]);
  });
});


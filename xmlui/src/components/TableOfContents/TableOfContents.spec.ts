import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders table of contents links with headings", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Heading value="First Heading" />
            <Heading value="Second Heading" />
            <Heading value="Third Heading" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>`);

    const tocLinks = page.getByRole("link", { name: /Heading/ });
    await expect(tocLinks).toHaveCount(3);
    await expect(page.getByRole("link", { name: "First Heading" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Second Heading" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Third Heading" })).toBeVisible();
  });

  test("renders table of contents with bookmarks", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Bookmark id="section1" title="Section One" level="{2}">
              section one content
            </Bookmark>
            <Bookmark id="section2" title="Section Two" level="{3}">
              section two content
            </Bookmark>
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const tocLinks = page.getByRole("link");
    await expect(tocLinks).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Section One" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Section Two" })).toBeVisible();
  });

  test("renders table of contents with mixed headings and bookmarks", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Heading level="h1" value="Main Title" />
            <Bookmark id="intro" title="Introduction" level="{2}">
              introduction content
            </Bookmark>
            <Heading level="h2" value="Chapter One" />
            <Bookmark id="summary" title="Summary" level="{3}">
              summary content
            </Bookmark>
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const tocLinks = page.getByRole("link");
    await expect(tocLinks).toHaveCount(4);
    await expect(page.getByRole("link", { name: "Main Title" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Introduction" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chapter One" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Summary" })).toBeVisible();
  });

  // =============================================================================
  // DOCUMENTATION USAGE PATTERNS
  // =============================================================================

  test.describe("Documentation Usage Patterns", () => {
    test("navigates to headings when clicked", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h2" value="Section A" />
              <Heading level="h2" value="Section B" />
              <Heading level="h2" value="Section C" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents />
            </StickyBox>
          </HStack>
        </Page>
      `);

      const sectionA = page.getByRole("heading", { name: "Section A" });
      const sectionB = page.getByRole("heading", { name: "Section B" });
      const sectionC = page.getByRole("heading", { name: "Section C" });

      // Initially, Section A should be visible
      await expect(sectionA).toBeInViewport();
      await expect(sectionB).not.toBeInViewport();
      await expect(sectionC).not.toBeInViewport();

      // Click on Section B in TOC
      const sectionBLink = page.getByRole("link", { name: "Section B" });
      await sectionBLink.click();
      await expect(sectionB).toBeInViewport();

      // Click on Section C in TOC
      const sectionCLink = page.getByRole("link", { name: "Section C" });
      await sectionCLink.click();
      await expect(sectionB).not.toBeInViewport();
      await expect(sectionC).toBeInViewport();
    });

    test("navigates to bookmarks when clicked", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Bookmark id="bookmark-a" title="Bookmark A" level="{2}">
                bookmark a content
              </Bookmark>
              <Bookmark id="bookmark-b" title="Bookmark B" level="{2}">
                bookmark b content
              </Bookmark>
              <Bookmark id="bookmark-c" title="Bookmark C" level="{2}">
                bookmark c content
              </Bookmark>
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents />
            </StickyBox>
          </HStack>
        </Page>
      `);

      const contentA = page.getByText("bookmark a content");
      const contentB = page.getByText("bookmark b content");
      const contentC = page.getByText("bookmark c content");

      // Initially, Bookmark A should be visible
      await expect(contentA).toBeInViewport();
      await expect(contentB).not.toBeInViewport();
      await expect(contentC).not.toBeInViewport();

      // Click on Bookmark B in TOC
      const bookmarkBLink = page.getByRole("link", { name: "Bookmark B" });
      await bookmarkBLink.click();
      await expect(contentB).toBeInViewport();

      // Click on Bookmark C in TOC
      const bookmarkCLink = page.getByRole("link", { name: "Bookmark C" });
      await bookmarkCLink.click();
      await expect(contentC).toBeInViewport();
    });

    test("shows active item in table of contents", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h2" value="First Section" />
              <Heading level="h2" value="Second Section" />
              <Heading level="h2" value="Thirsd Section" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents />
            </StickyBox>
          </HStack>
        </Page>
      `);

      const secondHeading = page.getByRole("heading", { name: "Second Section" });

      // Click on second section
      const secondLink = page.getByRole("link", { name: "Second Section" });
      await secondLink.click();
      await expect(secondHeading).toBeInViewport();

      // Check if the active item has the correct class or styling
      const activeItem = page.locator("[aria-current='page']");
      await expect(activeItem).toHaveText("Second Section");
    });
  });

  // =============================================================================
  // PROPERTY TESTS
  // =============================================================================

  test.describe("maxHeadingLevel property", () => {
    test("limits headings to specified level", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h1" value="H1 Title" />
              <Heading level="h2" value="H2 Title" />
              <Heading level="h3" value="H3 Title" />
              <Heading level="h4" value="H4 Title" />
              <Heading level="h5" value="H5 Title" />
              <Heading level="h6" value="H6 Title" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents maxHeadingLevel="{3}" />
            </StickyBox>
          </HStack>
        </Page>
      `);

      // Should show H1, H2, H3 but not H4, H5, H6
      await expect(page.getByRole("link", { name: "H1 Title" })).toBeVisible();
      await expect(page.getByRole("link", { name: "H2 Title" })).toBeVisible();
      await expect(page.getByRole("link", { name: "H3 Title" })).toBeVisible();
      await expect(page.getByRole("link", { name: "H4 Title" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "H5 Title" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "H6 Title" })).not.toBeVisible();
    });

    test("shows only H1 when maxHeadingLevel is 1", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h1" value="Only H1" />
              <Heading level="h2" value="Hidden H2" />
              <Heading level="h3" value="Hidden H3" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents maxHeadingLevel="{1}" />
            </StickyBox>
          </HStack>
        </Page>
      `);

      await expect(page.getByRole("link", { name: "Only H1" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Hidden H2" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Hidden H3" })).not.toBeVisible();
    });

    test("limits bookmarks to specified level", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Bookmark id="levelNone" title="Bookmark level none">
                content no level
              </Bookmark>
              <Bookmark id="level1" title="Level 1 Bookmark" level="{1}">
                level 1 content
              </Bookmark>
              <Bookmark id="level2" title="Level 2 Bookmark" level="{2}">
                level 2 content
              </Bookmark>
              <Bookmark id="level3" title="Level 3 Bookmark" level="{3}">
                level 3 content
              </Bookmark>
              <Bookmark id="level4" title="Level 4 Bookmark" level="{4}">
                level 4 content
              </Bookmark>
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents maxHeadingLevel="{2}" />
            </StickyBox>
          </HStack>
        </Page>
      `);

      await expect(page.getByRole("link", { name: "Bookmark level none" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Level 1 Bookmark" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Level 2 Bookmark" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Level 3 Bookmark" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Level 4 Bookmark" })).not.toBeVisible();
    });
  });

  test.describe("omitH1 property", () => {
    test("excludes H1 headings when omitH1 is true", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h1" value="H1 Title" />
              <Heading level="h2" value="H2 Title" />
              <Heading level="h3" value="H3 Title" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents omitH1="{true}" />
            </StickyBox>
          </HStack>
        </Page>
      `);

      await expect(page.getByRole("link", { name: "H1 Title" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "H2 Title" })).toBeVisible();
      await expect(page.getByRole("link", { name: "H3 Title" })).toBeVisible();
    });

    test("includes H1 headings when omitH1 is false", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h1" value="Page Title" />
              <Heading level="h2" value="Section Title" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents omitH1="{false}" />
            </StickyBox>
          </HStack>
        </Page>
      `);

      await expect(page.getByRole("link", { name: "Page Title" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Section Title" })).toBeVisible();
    });

    test("excludes level 1 bookmarks when omitH1 is true", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Bookmark id="no-lvl" title="No level section">
                no level section content
              </Bookmark>
              <Bookmark id="main" title="Main Section" level="{1}">
                main section content
              </Bookmark>
              <Bookmark id="sub" title="Subsection" level="{2}">
                subsection content
              </Bookmark>
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents omitH1="{true}" />
            </StickyBox>
          </HStack>
        </Page>
      `);

      await expect(page.getByRole("link", { name: "No level section" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Main Section" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Subsection" })).toBeVisible();
    });
  });

  test.describe("smoothScrolling property", () => {
    test("applies smooth scrolling when enabled", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h2" value="Smooth Section" />
              <Heading level="h2" value="Another Section" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents smoothScrolling="{true}" />
            </StickyBox>
          </HStack>
        </Page>
      `);

      const secondHeading = page.getByRole("heading", { name: "Another Section" });
      const link = page.getByRole("link", { name: "Another Section" });

      await link.click();
      await expect(secondHeading).toBeInViewport();
    });

    test("works without smooth scrolling when disabled", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h2" value="Regular Section" />
              <Heading level="h2" value="Another Section" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents smoothScrolling="{false}" />
            </StickyBox>
          </HStack>
        </Page>
      `);

      const secondHeading = page.getByRole("heading", { name: "Another Section" });
      const link = page.getByRole("link", { name: "Another Section" });

      await link.click();
      await expect(secondHeading).toBeInViewport();
    });
  });

  // =============================================================================
  // ID PROPERTY TESTS
  // =============================================================================
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("supports keyboard navigation", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Heading level="h2" value="First Section" />
            <Heading level="h2" value="Second Section" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const nav = page.getByRole("navigation");
    await nav.focus();

    // Tab to first link
    await page.keyboard.press("Tab");
    const firstLink = page.getByRole("link", { name: "First Section" });
    await expect(firstLink).toBeFocused();

    // Tab to second link
    await page.keyboard.press("Tab");
    const secondLink = page.getByRole("link", { name: "Second Section" });
    await expect(secondLink).toBeFocused();

    // Enter should activate the link
    const secondHeading = page.getByRole("heading", { name: "Second Section" });
    await page.keyboard.press("Enter");
    await expect(secondHeading).toBeInViewport();
  });
});

// =============================================================================
// THEME VARIABLES TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies container theme variables", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(
      `
      <Page>
        <HStack>
          <VStack>
            <Heading level="h1" value="Test Heading" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `,
      {
        testThemeVars: {
          "backgroundColor-TableOfContents": "rgb(255, 0, 0)",
          "width-TableOfContents": "300px",
          "height-TableOfContents": "400px",
          "padding-TableOfContents": "20px",
          "borderWidth-TableOfContents": "2px",
          "borderColor-TableOfContents": "rgb(0, 255, 0)",
          "borderStyle-TableOfContents": "solid",
        },
      },
    );

    const tocContainer = page.getByRole("navigation");

    await Promise.all([
      expect(tocContainer).toHaveCSS("background-color", "rgb(255, 0, 0)"),
      expect(tocContainer).toHaveCSS("width", "300px"),
      expect(tocContainer).toHaveCSS("height", "400px"),
      expect(tocContainer).toHaveCSS("padding", "20px"),
      expect(tocContainer).toHaveCSS("border-width", "2px"),
      expect(tocContainer).toHaveCSS("border-color", "rgb(0, 255, 0)"),
      expect(tocContainer).toHaveCSS("border-style", "solid"),
    ]);
  });

  test("applies item base theme variables", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(
      `
      <Page>
        <HStack>
          <VStack>
            <Heading level="h2" value="Test Heading" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `,
      {
        testThemeVars: {
          "textColor-TableOfContentsItem": "rgb(255, 0, 0)",
          "fontSize-TableOfContentsItem": "18px",
          "fontWeight-TableOfContentsItem": "700",
          "padding-TableOfContentsItem": "25px",
        },
      },
    );

    const tocLink = page.getByRole("link", { name: "Test Heading" });

    await Promise.all([
      expect(tocLink).toHaveCSS("color", "rgb(255, 0, 0)"),
      expect(tocLink).toHaveCSS("font-size", "18px"),
      expect(tocLink).toHaveCSS("font-weight", "700"),
      expect(tocLink).toHaveCSS("padding", "25px 25px 25px 12px"),
    ]);
  });

  test("applies level-specific theme variables for H1", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Page>
        <HStack>
          <VStack>
            <Heading level="h1" value="Level 1 Heading" />
            <Heading level="h1" value="Active Heading " />
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `,
      {
        testThemeVars: {
          "padding-TableOfContentsItem-level-1": "25px",
          "fontSize-TableOfContentsItem-level-1": "22px",
          "fontWeight-TableOfContentsItem-level-1": "800",
          "textColor-TableOfContentsItem-level-1": "rgb(0, 0, 255)",
        },
      },
    );

    const h1Link = page.getByRole("link", { name: "Level 1 Heading" });

    await Promise.all([
      expect(h1Link).toHaveCSS("padding", "25px"),
      expect(h1Link).toHaveCSS("font-size", "22px"),
      expect(h1Link).toHaveCSS("font-weight", "800"),
      expect(h1Link).toHaveCSS("color", "rgb(0, 0, 255)"),
    ]);
  });

  test("applies level-specific theme variables for H2", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Page>
        <HStack>
          <VStack>
            <Heading level="h2" value="Level 2 Heading" />
            <Heading level="h2" value="Active heading" />
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `,
      {
        testThemeVars: {
          "padding-TableOfContentsItem-level-2": "20px",
          "fontSize-TableOfContentsItem-level-2": "20px",
          "fontWeight-TableOfContentsItem-level-2": "600",
          "textColor-TableOfContentsItem-level-2": "rgb(255, 255, 0)",
        },
      },
    );

    const h2Link = page.getByRole("link", { name: "Level 2 Heading" });

    await Promise.all([
      expect(h2Link).toHaveCSS("padding", "20px"),
      expect(h2Link).toHaveCSS("font-size", "20px"),
      expect(h2Link).toHaveCSS("font-weight", "600"),
      expect(h2Link).toHaveCSS("color", "rgb(255, 255, 0)"),
    ]);
  });

  test("applies level-specific theme variables for H6", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Page>
        <HStack>
          <VStack>
            <Heading level="h6" value="Level 6 Heading" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `,
      {
        testThemeVars: {
          "padding-TableOfContentsItem-level-6": "8px",
          "fontSize-TableOfContentsItem-level-6": "12px",
          "fontWeight-TableOfContentsItem-level-6": "400",
          "fontStyle-TableOfContentsItem-level-6": "italic",
        },
      },
    );

    const h6Link = page.getByRole("link", { name: "Level 6 Heading" });

    await Promise.all([
      expect(h6Link).toHaveCSS("padding", "8px"),
      expect(h6Link).toHaveCSS("font-size", "12px"),
      expect(h6Link).toHaveCSS("font-weight", "400"),
      expect(h6Link).toHaveCSS("font-style", "italic"),
    ]);
  });

  test("applies hover state theme variables", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(
      `
      <Page>
        <HStack>
          <VStack>
            <Heading level="h2" value="First Heading" />
            <Heading level="h2" value="Hover Test" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `,
      {
        testThemeVars: {
          "backgroundColor-TableOfContentsItem--hover": "rgb(200, 200, 200)",
          "textColor-TableOfContentsItem--hover": "rgb(100, 100, 100)",
          "fontWeight-TableOfContentsItem--hover": "900",
        },
      },
    );

    // First click on the second heading to make it active
    const secondHeading = page.getByRole("link", { name: "Hover Test" });
    await secondHeading.click();

    // Now hover over the first heading (which should not be active)
    const firstHeading = page.getByRole("link", { name: "First Heading" });
    const listItem = firstHeading.locator("..");

    await firstHeading.hover();

    await Promise.all([
      expect(listItem).toHaveCSS("background-color", "rgb(200, 200, 200)"),
      expect(firstHeading).toHaveCSS("color", "rgb(100, 100, 100)"),
      expect(firstHeading).toHaveCSS("font-weight", "900"),
    ]);
  });

  test("applies active state theme variables", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(
      `
      <Page>
        <HStack>
          <VStack>
            <Heading level="h2" value="Active Test" />
            <Heading level="h3" value="Another Section" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `,
      {
        testThemeVars: {
          "backgroundColor-TableOfContentsItem--active": "rgb(150, 150, 255)",
          "textColor-TableOfContentsItem--active": "rgb(50, 50, 150)",
          "fontWeight-TableOfContentsItem--active": "bold",
        },
      },
    );

    const activeLink = page.getByRole("link", { name: "Another Section" });
    await activeLink.click();

    const activeListItem = page.locator("[class*='active']").first();
    const activeLinkElement = activeListItem.locator("a");

    await Promise.all([
      expect(activeListItem).toHaveCSS("background-color", "rgb(150, 150, 255)"),
      expect(activeLinkElement).toHaveCSS("color", "rgb(50, 50, 150)"),
      expect(activeLinkElement).toHaveCSS("font-weight", "700"), // 'bold' maps to 700
    ]);
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test.describe("id property handling", () => {
    test("handles unicode characters in heading titles", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              top of the page text
              <Heading level="h2" value="测试标题-émojis🚀" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents />
            </StickyBox>
          </HStack>
        </Page>
      `);

      const unicodeHeading = page.getByRole("heading", { name: "测试标题-émojis🚀" });
      const unicodeLink = page.getByRole("link", { name: "测试标题-émojis🚀" });

      await expect(unicodeLink).toBeVisible();
      await unicodeLink.click();
      await expect(unicodeHeading).toBeInViewport();
    });

    test("handles bookmarks with special characters", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              top of the page text
              <Bookmark id="special-bookmark_test section" title="Special Bookmark" level="{2}">
                special bookmark content
              </Bookmark>
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents />
            </StickyBox>
          </HStack>
        </Page>
      `);

      const bookmarkContent = page.getByText("special bookmark content");
      const bookmarkLink = page.getByRole("link", { name: "Special Bookmark" });

      await expect(bookmarkLink).toBeVisible();
      await bookmarkLink.click();
      await expect(bookmarkContent).toBeInViewport();
      await page.waitForURL(/#special-bookmark_test(%20| )section$/);
    });
  });

  test("handles no headings or bookmarks gracefully", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Text>Just some text content</Text>
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const tocContainer = page.getByRole("link");
    await expect(tocContainer).not.toBeVisible();
  });

  test("handles null props gracefully", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            top of the page text
            <Heading level="h2" value="Test Heading" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents maxHeadingLevel="{null}" omitH1="{null}" smoothScrolling="{null}" />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const testHeading = page.getByRole("heading", { name: "Test Heading" });
    const testLink = page.getByRole("link", { name: "Test Heading" });

    await expect(testLink).toBeVisible();
    await testLink.click();
    await expect(testHeading).toBeInViewport();
  });

  test("handles undefined props gracefully", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Heading level="h1" value="Test H1" />
            <Heading level="h2" value="Test H2" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents maxHeadingLevel="{undefined}" omitH1="{undefined}" smoothScrolling="{undefined}" />
          </StickyBox>
        </HStack>
      </Page>
    `);

    await expect(page.getByRole("link", { name: "Test H1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Test H2" })).toBeVisible();
  });
});

test.describe("Interactions with Bookmark props", () => {
  // TODO
});

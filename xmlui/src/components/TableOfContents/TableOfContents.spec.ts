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

      const smoothHeading = page.getByRole("heading", { name: "Another Section" });
      const smoothLink = page.getByRole("link", { name: "Another Section" });

      await smoothLink.click();
      await expect(smoothHeading).toBeInViewport();
      await page.waitForURL(/#.*$/);
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

      const regularHeading = page.getByRole("heading", { name: "Another Section" });
      const regularLink = page.getByRole("link", { name: "Another Section" });

      await regularLink.click();
      await expect(regularHeading).toBeInViewport();
      await page.waitForURL(/#.*$/);
    });
  });

  // =============================================================================
  // ID PROPERTY TESTS
  // =============================================================================

  test.describe("id property handling", () => {
    test("handles special characters in heading ids", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Heading level="h2" value="Special-chars_test.heading" />
              bottom of the page text
            </VStack>
            <StickyBox to="top">
              <TableOfContents />
            </StickyBox>
          </HStack>
        </Page>
      `);

      const specialHeading = page.getByRole("heading", { name: "Special-chars_test.heading" });
      const specialLink = page.getByRole("link", { name: "Special-chars_test.heading" });

      await expect(specialLink).toBeVisible();
      await specialLink.click();
      await expect(specialHeading).toBeInViewport();
      await page.waitForURL(/#.*$/);
    });

    test("handles unicode characters in heading titles", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
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
      await page.waitForURL(/#.*$/);
    });

    test("handles bookmarks with special characters", async ({ initTestBed, page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await initTestBed(`
        <Page>
          <HStack>
            <VStack gap="800px">
              <Bookmark id="special-bookmark_test.section" title="Special Bookmark" level="{2}">
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
      await page.waitForURL(/#special-bookmark_test\.section$/);
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct navigation semantics", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Heading level="h1" value="Main Title" />
            <Heading level="h2" value="Section 1" />
            <Heading level="h3" value="Subsection 1.1" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const nav = page.locator('nav, [role="navigation"]').or(page.locator(".nav")).first();
    await expect(nav).toBeVisible();

    const list = nav.locator("ul");
    await expect(list).toBeVisible();

    const listItems = list.locator("li");
    await expect(listItems).toHaveCount(3);
  });

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
    await page.waitForURL(/#.*$/);
  });

  test("has accessible link text", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Heading level="h2" value="Accessible Section Title" />
            <Bookmark id="bookmark-section" title="Accessible Bookmark Title" level="{3}">
              accessible bookmark content
            </Bookmark>
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const headingLink = page.getByRole("link", { name: "Accessible Section Title" });
    const bookmarkLink = page.getByRole("link", { name: "Accessible Bookmark Title" });

    await expect(headingLink).toBeVisible();
    await expect(bookmarkLink).toBeVisible();

    // Links should have proper href attributes
    await expect(headingLink).toHaveAttribute("href", /#.+/);
    await expect(bookmarkLink).toHaveAttribute("href", "#bookmark-section");
  });
});

// =============================================================================
// THEME VARIABLES TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies theme variables", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Heading level="h1" value="Styled Title" />
            <Heading level="h2" value="Styled Section" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const tocContainer = page.locator(".nav").first();
    await expect(tocContainer).toBeVisible();

    // Check that theme classes are applied
    const links = page.getByRole("link");
    const firstLink = links.first();
    await expect(firstLink).toHaveClass(/head_1/);

    const secondLink = links.nth(1);
    await expect(secondLink).toHaveClass(/head_2/);
  });

  test("applies level-specific styling", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
            <Heading level="h1" value="Level 1" />
            <Heading level="h2" value="Level 2" />
            <Heading level="h3" value="Level 3" />
            <Heading level="h4" value="Level 4" />
            <Heading level="h5" value="Level 5" />
            <Heading level="h6" value="Level 6" />
            bottom of the page text
          </VStack>
          <StickyBox to="top">
            <TableOfContents />
          </StickyBox>
        </HStack>
      </Page>
    `);

    const h1Link = page.getByRole("link", { name: "Level 1" });
    const h2Link = page.getByRole("link", { name: "Level 2" });
    const h3Link = page.getByRole("link", { name: "Level 3" });
    const h6Link = page.getByRole("link", { name: "Level 6" });

    await expect(h1Link).toHaveClass(/head_1/);
    await expect(h2Link).toHaveClass(/head_2/);
    await expect(h3Link).toHaveClass(/head_3/);
    await expect(h6Link).toHaveClass(/head_6/);
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
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

    const tocContainer = page.locator(".nav").first();
    await expect(tocContainer).toBeVisible();

    const list = tocContainer.locator("ul");
    await expect(list).toBeVisible();
    await expect(list.locator("li")).toHaveCount(0);
  });

  test("handles null props gracefully", async ({ initTestBed, page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await initTestBed(`
      <Page>
        <HStack>
          <VStack gap="800px">
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
    await page.waitForURL(/#.*$/);
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

    // Should use default values
    await expect(page.getByRole("link", { name: "Test H1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Test H2" })).toBeVisible();
  });
});

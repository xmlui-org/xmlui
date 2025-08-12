import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders empty table of contents with no headings", async ({ initTestBed, page }) => {
    await initTestBed(`<TableOfContents />`);
    const toc = page.locator('[data-testid="table-of-contents"]').or(page.locator(".nav")).first();
    await expect(toc).toBeVisible();
    const list = toc.locator("ul");
    await expect(list).toBeVisible();
    await expect(list.locator("li")).toHaveCount(0);
  });

  test("renders table of contents with headings", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Heading level="h1" value="First Heading" />
        <Heading level="h2" value="Second Heading" />
        <Heading level="h3" value="Third Heading" />
        <TableOfContents />
      </VStack>
    `);

    const tocLinks = page.getByRole("link", { name: /heading/i });
    await expect(tocLinks).toHaveCount(3);
    await expect(page.getByRole("link", { name: "First Heading" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Second Heading" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Third Heading" })).toBeVisible();
  });

  test("renders table of contents with bookmarks", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Bookmark id="section1" title="Section One" level="{2}" />
        <Text>Content for section one</Text>
        <Bookmark id="section2" title="Section Two" level="{3}" />
        <Text>Content for section two</Text>
        <TableOfContents />
      </VStack>
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
    await initTestBed(`
      <VStack>
        <Heading level="h1" value="Main Title" />
        <Bookmark id="intro" title="Introduction" level="{2}" />
        <Text>Introduction content</Text>
        <Heading level="h2" value="Chapter One" />
        <Bookmark id="summary" title="Summary" level="{3}" />
        <Text>Summary content</Text>
        <TableOfContents />
      </VStack>
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
      await initTestBed(`
        <VStack height="800px" gap="200px">
          <TableOfContents />
          <Heading level="h2" value="Section A" />
          <VStack height="400px" backgroundColor="lightblue">Content A</VStack>
          <Heading level="h2" value="Section B" />
          <VStack height="400px" backgroundColor="lightgreen">Content B</VStack>
        </VStack>
      `);

      const contentA = page.getByText("Content A");
      const contentB = page.getByText("Content B");

      // Initially, Section A should be visible
      await expect(contentA).toBeInViewport();
      await expect(contentB).not.toBeInViewport();

      // Click on Section B in TOC
      const sectionBLink = page.getByRole("link", { name: "Section B" });
      await sectionBLink.click();

      // Section B should now be in viewport
      await expect(contentB).toBeInViewport();
    });

    test("navigates to bookmarks when clicked", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack height="800px" gap="200px">
          <TableOfContents />
          <Bookmark id="bookmark-a" title="Bookmark A" level="{2}" />
          <VStack height="400px" backgroundColor="lightblue">Content A</VStack>
          <Bookmark id="bookmark-b" title="Bookmark B" level="{2}" />
          <VStack height="400px" backgroundColor="lightgreen">Content B</VStack>
        </VStack>
      `);

      const contentA = page.getByText("Content A");
      const contentB = page.getByText("Content B");

      // Initially, Bookmark A should be visible
      await expect(contentA).toBeInViewport();
      await expect(contentB).not.toBeInViewport();

      // Click on Bookmark B in TOC
      const bookmarkBLink = page.getByRole("link", { name: "Bookmark B" });
      await bookmarkBLink.click();

      // Content B should now be in viewport
      await expect(contentB).toBeInViewport();
    });

    test("shows active item in table of contents", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack height="600px">
          <TableOfContents />
          <Heading level="h2" value="First Section" />
          <VStack height="400px" backgroundColor="red">First Content</VStack>
          <Heading level="h2" value="Second Section" />
          <VStack height="400px" backgroundColor="blue">Second Content</VStack>
        </VStack>
      `);

      // Click on second section
      const secondLink = page.getByRole("link", { name: "Second Section" });
      await secondLink.click();

      // Check if the active item has the correct class or styling
      const activeItem = page.locator(".active").or(page.locator('[aria-current="page"]')).first();
      await expect(activeItem).toBeVisible();
    });
  });

  // =============================================================================
  // PROPERTY TESTS
  // =============================================================================

  test.describe("maxHeadingLevel property", () => {
    test("limits headings to specified level", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Heading level="h1" value="H1 Title" />
          <Heading level="h2" value="H2 Title" />
          <Heading level="h3" value="H3 Title" />
          <Heading level="h4" value="H4 Title" />
          <Heading level="h5" value="H5 Title" />
          <Heading level="h6" value="H6 Title" />
          <TableOfContents maxHeadingLevel="{3}" />
        </VStack>
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
      await initTestBed(`
        <VStack>
          <Heading level="h1" value="Only H1" />
          <Heading level="h2" value="Hidden H2" />
          <Heading level="h3" value="Hidden H3" />
          <TableOfContents maxHeadingLevel="{1}" />
        </VStack>
      `);

      await expect(page.getByRole("link", { name: "Only H1" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Hidden H2" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Hidden H3" })).not.toBeVisible();
    });

    test("limits bookmarks to specified level", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Bookmark id="level1" title="Level 1 Bookmark" level="{1}" />
          <Bookmark id="level2" title="Level 2 Bookmark" level="{2}" />
          <Bookmark id="level3" title="Level 3 Bookmark" level="{3}" />
          <Bookmark id="level4" title="Level 4 Bookmark" level="{4}" />
          <TableOfContents maxHeadingLevel="{2}" />
        </VStack>
      `);

      await expect(page.getByRole("link", { name: "Level 1 Bookmark" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Level 2 Bookmark" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Level 3 Bookmark" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Level 4 Bookmark" })).not.toBeVisible();
    });
  });

  test.describe("omitH1 property", () => {
    test("excludes H1 headings when omitH1 is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Heading level="h1" value="Page Title" />
          <Heading level="h2" value="Section Title" />
          <Heading level="h3" value="Subsection Title" />
          <TableOfContents omitH1="{true}" />
        </VStack>
      `);

      await expect(page.getByRole("link", { name: "Page Title" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Section Title" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Subsection Title" })).toBeVisible();
    });

    test("includes H1 headings when omitH1 is false", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Heading level="h1" value="Page Title" />
          <Heading level="h2" value="Section Title" />
          <TableOfContents omitH1="{false}" />
        </VStack>
      `);

      await expect(page.getByRole("link", { name: "Page Title" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Section Title" })).toBeVisible();
    });

    test("excludes level 1 bookmarks when omitH1 is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Bookmark id="main" title="Main Section" level="{1}" />
          <Bookmark id="sub" title="Subsection" level="{2}" />
          <TableOfContents omitH1="{true}" />
        </VStack>
      `);

      await expect(page.getByRole("link", { name: "Main Section" })).not.toBeVisible();
      await expect(page.getByRole("link", { name: "Subsection" })).toBeVisible();
    });
  });

  test.describe("smoothScrolling property", () => {
    test("applies smooth scrolling when enabled", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack height="800px">
          <TableOfContents smoothScrolling="{true}" />
          <Heading level="h2" value="Smooth Section" />
          <VStack height="600px" backgroundColor="lightgray">Content</VStack>
        </VStack>
      `);

      const smoothLink = page.getByRole("link", { name: "Smooth Section" });
      await expect(smoothLink).toBeVisible();

      // Click and verify navigation works (smooth scrolling is hard to test directly)
      await smoothLink.click();
      await page.waitForURL(/#.*$/);
    });

    test("works without smooth scrolling when disabled", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack height="800px">
          <TableOfContents smoothScrolling="{false}" />
          <Heading level="h2" value="Regular Section" />
          <VStack height="600px" backgroundColor="lightgray">Content</VStack>
        </VStack>
      `);

      const regularLink = page.getByRole("link", { name: "Regular Section" });
      await expect(regularLink).toBeVisible();

      await regularLink.click();
      await page.waitForURL(/#.*$/);
    });
  });

  // =============================================================================
  // ID PROPERTY TESTS
  // =============================================================================

  test.describe("id property handling", () => {
    test("handles special characters in heading ids", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Heading level="h2" value="Special-chars_test.heading" />
          <TableOfContents />
        </VStack>
      `);

      const specialLink = page.getByRole("link", { name: "Special-chars_test.heading" });
      await expect(specialLink).toBeVisible();
      await specialLink.click();
      await page.waitForURL(/#.*$/);
    });

    test("handles unicode characters in heading titles", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Heading level="h2" value="测试标题-émojis🚀" />
          <TableOfContents />
        </VStack>
      `);

      const unicodeLink = page.getByRole("link", { name: "测试标题-émojis🚀" });
      await expect(unicodeLink).toBeVisible();
      await unicodeLink.click();
      await page.waitForURL(/#.*$/);
    });

    test("handles bookmarks with special characters", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Bookmark id="special-bookmark_test.section" title="Special Bookmark" level="{2}" />
          <TableOfContents />
        </VStack>
      `);

      const bookmarkLink = page.getByRole("link", { name: "Special Bookmark" });
      await expect(bookmarkLink).toBeVisible();
      await bookmarkLink.click();
      await page.waitForURL(/#special-bookmark_test\.section$/);
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct navigation semantics", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Heading level="h1" value="Main Title" />
        <Heading level="h2" value="Section 1" />
        <Heading level="h3" value="Subsection 1.1" />
        <TableOfContents />
      </VStack>
    `);

    const nav = page.locator('nav, [role="navigation"]').or(page.locator(".nav")).first();
    await expect(nav).toBeVisible();

    const list = nav.locator("ul");
    await expect(list).toBeVisible();

    const listItems = list.locator("li");
    await expect(listItems).toHaveCount(3);
  });

  test("supports keyboard navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Heading level="h2" value="First Section" />
        <Heading level="h2" value="Second Section" />
        <TableOfContents />
      </VStack>
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
    await page.keyboard.press("Enter");
    await page.waitForURL(/#.*$/);
  });

  test("has accessible link text", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Heading level="h2" value="Accessible Section Title" />
        <Bookmark id="bookmark-section" title="Accessible Bookmark Title" level="{3}" />
        <TableOfContents />
      </VStack>
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
    await initTestBed(`
      <VStack>
        <Heading level="h1" value="Styled Title" />
        <Heading level="h2" value="Styled Section" />
        <TableOfContents />
      </VStack>
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
    await initTestBed(`
      <VStack>
        <Heading level="h1" value="Level 1" />
        <Heading level="h2" value="Level 2" />
        <Heading level="h3" value="Level 3" />
        <Heading level="h4" value="Level 4" />
        <Heading level="h5" value="Level 5" />
        <Heading level="h6" value="Level 6" />
        <TableOfContents />
      </VStack>
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
    await initTestBed(`
      <VStack>
        <Text>Just some text content</Text>
        <TableOfContents />
      </VStack>
    `);

    const tocContainer = page.locator(".nav").first();
    await expect(tocContainer).toBeVisible();

    const list = tocContainer.locator("ul");
    await expect(list).toBeVisible();
    await expect(list.locator("li")).toHaveCount(0);
  });

  test("handles null props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Heading level="h2" value="Test Heading" />
        <TableOfContents maxHeadingLevel="{null}" omitH1="{null}" smoothScrolling="{null}" />
      </VStack>
    `);

    const testLink = page.getByRole("link", { name: "Test Heading" });
    await expect(testLink).toBeVisible();
    await testLink.click();
    await page.waitForURL(/#.*$/);
  });

  test("handles undefined props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Heading level="h1" value="Test H1" />
        <Heading level="h2" value="Test H2" />
        <TableOfContents maxHeadingLevel="{undefined}" omitH1="{undefined}" smoothScrolling="{undefined}" />
      </VStack>
    `);

    // Should use default values
    await expect(page.getByRole("link", { name: "Test H1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Test H2" })).toBeVisible();
  });

  test("handles mixed valid and invalid props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Heading level="h1" value="H1 Title" />
        <Heading level="h2" value="H2 Title" />
        <Heading level="h3" value="H3 Title" />
        <TableOfContents maxHeadingLevel="{2}" omitH1="{null}" smoothScrolling="invalid" />
      </VStack>
    `);

    // maxHeadingLevel=2 should work
    await expect(page.getByRole("link", { name: "H1 Title" })).toBeVisible();
    await expect(page.getByRole("link", { name: "H2 Title" })).toBeVisible();
    await expect(page.getByRole("link", { name: "H3 Title" })).not.toBeVisible();
  });

  test("handles bookmarks without titles", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Bookmark id="no-title-bookmark" level="{2}" />
        <Heading level="h2" value="Regular Heading" />
        <TableOfContents />
      </VStack>
    `);

    // Should show the regular heading
    await expect(page.getByRole("link", { name: "Regular Heading" })).toBeVisible();

    // Check if bookmark without title appears (depends on implementation)
    const tocLinks = page.getByRole("link");
    await expect(tocLinks).toHaveCount(1);
  });

  test("handles very long heading text", async ({ initTestBed, page }) => {
    const longTitle =
      "This is a very long heading title that should test how the table of contents handles text overflow and wrapping in various scenarios";

    await initTestBed(`
      <VStack>
        <Heading level="h2" value="${longTitle}" />
        <TableOfContents />
      </VStack>
    `);

    const longLink = page.getByRole("link", { name: longTitle });
    await expect(longLink).toBeVisible();
    await longLink.click();
    await page.waitForURL(/#.*$/);
  });

  test("handles dynamic heading updates", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack var.headingText="Initial Heading">
        <Heading level="h2" value="{headingText}" />
        <Button onClick="headingText = 'Updated Heading'">Update Heading</Button>
        <TableOfContents />
      </VStack>
    `);

    await expect(page.getByRole("link", { name: "Initial Heading" })).toBeVisible();

    await page.getByRole("button", { name: "Update Heading" }).click();

    await expect(page.getByRole("link", { name: "Updated Heading" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Initial Heading" })).not.toBeVisible();
  });

  test("handles ctrl+click for opening in new tab", async ({ initTestBed, page, context }) => {
    await initTestBed(`
      <VStack>
        <Heading level="h2" value="External Link Test" />
        <TableOfContents />
      </VStack>
    `);

    const link = page.getByRole("link", { name: "External Link Test" });
    await expect(link).toBeVisible();

    // Simulate ctrl+click (should not prevent default navigation)
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      link.click({ modifiers: ["Control"] }),
    ]);

    await expect(newPage).toBeTruthy();
    await newPage.close();
  });
});

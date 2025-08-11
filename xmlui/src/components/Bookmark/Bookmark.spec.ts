import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders as standalone bookmark", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="test-bookmark" />`);
    const bookmark = page.locator("#test-bookmark");
    await expect(bookmark).toHaveCount(1);
  });

  test("renders children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="test-bookmark">
        <Text>Bookmark content</Text>
      </Bookmark>
    `);
    const bookmark = page.locator("#test-bookmark");
    await expect(bookmark).toBeVisible();
    await expect(bookmark).toContainText("Bookmark content");
  });

  test("renders children without id", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark>Content without id</Bookmark>`);
    await expect(page.getByText("Content without id")).toBeVisible();
  });

  // =============================================================================
  // DOCUMENTATION USAGE PATTERNS
  // =============================================================================

  test.describe("Documentation Usage Patterns", () => {
    test("links navigate to standalone bookmarks", async ({ initTestBed, page }) => {
      // Based on documentation example with standalone bookmarks and adjacent content
      await initTestBed(`
        <VStack height="600px">
          <Link to="#red-section">Jump to red</Link>
          <Link to="#green-section">Jump to green</Link>
          <Bookmark id="red-section" />
          <VStack height="700px" backgroundColor="red">Red content</VStack>
          <Bookmark id="green-section" />
          <VStack height="700px" backgroundColor="green">Green content</VStack>
        </VStack>
      `);

      const redLink = page.getByRole("link", { name: "Jump to red" });
      const greenLink = page.getByRole("link", { name: "Jump to green" });

      const redContent = page.getByText("Red content");
      const greenContent = page.getByText("Green content");

      await expect(redContent).toBeInViewport();
      await expect(greenContent).not.toBeInViewport();

      await greenLink.click();
      await page.waitForURL(/#green-section$/);
      await expect(redContent).not.toBeInViewport();
      await expect(greenContent).toBeInViewport();

      await redLink.click();
      await page.waitForURL(/#red-section$/);
      await expect(redContent).toBeInViewport();
      await expect(greenContent).not.toBeInViewport();
    });

    test("links navigate to nested bookmarks", async ({ initTestBed, page }) => {
      // Based on documentation example with standalone bookmarks and adjacent content
      await initTestBed(`
        <VStack height="600px">
          <Link to="#red-section">Jump to red</Link>
          <Link to="#green-section">Jump to green</Link>
          <Bookmark id="red-section" >
            <VStack height="700px" backgroundColor="red">Red content</VStack>
          </Bookmark>
          <Bookmark id="green-section" >
            <VStack height="700px" backgroundColor="green">Green content</VStack>
          </Bookmark>
        </VStack>
      `);

      const redLink = page.getByRole("link", { name: "Jump to red" });
      const greenLink = page.getByRole("link", { name: "Jump to green" });

      const redContent = page.getByText("Red content");
      const greenContent = page.getByText("Green content");

      await expect(redContent).toBeInViewport();
      await expect(greenContent).not.toBeInViewport();

      await greenLink.click();
      await page.waitForURL(/#green-section$/);
      await expect(redContent).not.toBeInViewport();
      await expect(greenContent).toBeInViewport();

      await redLink.click();
      await page.waitForURL(/#red-section$/);
      await expect(redContent).toBeInViewport();
      await expect(greenContent).not.toBeInViewport();
    });
  });

  // =============================================================================
  // ID PROPERTY TESTS
  // =============================================================================

  test.describe("id property", () => {
    test("handles special characters in id", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="bookmark-with_special.chars" />`);
      const anchor = page.locator('[id="bookmark-with_special.chars"]');
      await expect(anchor).toHaveCount(1);
    });

    test("handles unicode characters in id", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="书签-émojis🚀" />`);
      const anchor = page.locator('[id="书签-émojis🚀"]');
      await expect(anchor).toHaveCount(1);
    });

    test("handles null id gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="{null}">Content</Bookmark>`);
      await expect(page.getByText("Content")).toBeVisible();
    });

    test("handles undefined id gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="{undefined}">Content</Bookmark>`);
      await expect(page.getByText("Content")).toBeVisible();
    });

    test("handles object id gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="{{a: 1}}">Content</Bookmark>`);
      const anchor = page.locator('[id="[object Object]"]');
      await expect(anchor).toHaveCount(1);
    });
  });

  // =============================================================================
  // SCROLL INTO VIEW API TESTS
  // =============================================================================

  test.describe("scrollIntoView API", () => {
    test("scrollIntoView works in scrollable container", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack height="300px">
          <Button onClick="target.scrollIntoView()" >Scroll to Target</Button>
          <VStack height="700px" backgroundColor="lightblue">Top spacer</VStack>
          <Bookmark id="target" ref="bookmarkRef">Target content</Bookmark>
        </VStack>
      `);

      const bookmark = page.locator("#target");
      await expect(bookmark).not.toBeInViewport();

      const button = page.getByRole("button", { name: "Scroll to Target" });
      await button.click();

      await expect(bookmark).toBeInViewport();
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("creates semantic anchor element", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="accessible-bookmark" />`);
    const anchor = page.locator("#accessible-bookmark");
    await expect(anchor).toHaveCount(1);
  });

  test("preserves content accessibility when wrapping children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="test">
        <Button>Accessible Button</Button>
      </Bookmark>
    `);
    const button = page.getByRole("button", { name: "Accessible Button" });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test("provides navigatable anchor when id is set", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="navigation-target">Navigate here</Bookmark>`);

    // Verify anchor exists and can be targeted for navigation
    const anchor = page.locator("#navigation-target");
    await expect(anchor).toHaveCount(1);
    await expect(anchor).toHaveAttribute("id", "navigation-target");
  });

  test("supports keyboard navigation to content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="keyboard-test">
        <Button>Focusable Content</Button>
      </Bookmark>
    `);

    const button = page.getByRole("button", { name: "Focusable Content" });
    await button.focus();
    await expect(button).toBeFocused();
  });

  test("maintains document structure with nested content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="structure-test">
        <Text>Section content</Text>
      </Bookmark>
    `);

    const bookmark = page.locator("#structure-test");
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText("Section content");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles mixed valid and invalid props", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Bookmark id="valid" level="{null}" title="Valid Title" omitFromToc="{undefined}" />`,
    );
    const bookmark = page.locator("#valid");
    await expect(bookmark).toHaveCount(1);
  });

  test("handles deeply nested children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="nested">
        <VStack>
          <HStack>
            <Text>Deeply nested content</Text>
          </HStack>
        </VStack>
      </Bookmark>
    `);
    const bookmark = page.locator("#nested");
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText("Deeply nested content");
  });

  test("handles empty children", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="empty"></Bookmark>`);
    const bookmark = page.locator("#empty");
    await expect(bookmark).toHaveCount(1);
  });

  test("handles multiple bookmarks with same content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Bookmark id="first">Same content</Bookmark>
        <Bookmark id="second">Same content</Bookmark>
      </VStack>
    `);
    const firstBookmark = page.locator("#first");
    const secondBookmark = page.locator("#second");
    await expect(firstBookmark).toHaveCount(1);
    await expect(secondBookmark).toHaveCount(1);
    await expect(firstBookmark).toContainText("Same content");
    await expect(secondBookmark).toContainText("Same content");
  });

  test("preserves whitespace in content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="whitespace">   Text with   spaces   </Bookmark>
    `);
    const bookmark = page.locator("#whitespace");
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText("Text with   spaces");
  });

  test("handles rapid API calls", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Bookmark id="rapid-test" ref="bookmarkRef">Content</Bookmark>
      <Button onClick="bookmarkRef.scrollIntoView(); bookmarkRef.scrollIntoView(); bookmarkRef.scrollIntoView(); testState = 'rapid-calls'">Rapid Calls</Button>
    `);

    const button = page.getByRole("button", { name: "Rapid Calls" });
    await button.click();
    await expect.poll(testStateDriver.testState).toEqual("rapid-calls");

    // Component should still be functional
    const bookmark = page.locator("#rapid-test");
    await expect(bookmark).toBeVisible();
  });

  test("works with dynamic content updates", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Bookmark id="dynamic">
        <Text>{testState || 'Initial content'}</Text>
        <Button onClick="testState = 'Updated content'">Update</Button>
      </Bookmark>
    `);

    const bookmark = page.locator("#dynamic");
    const button = page.getByRole("button", { name: "Update" });

    await expect(bookmark).toContainText("Initial content");
    await button.click();
    await expect.poll(testStateDriver.testState).toEqual("Updated content");
    await expect(bookmark).toContainText("Updated content");
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("works in different layout contexts", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <HStack>
          <Bookmark id="layout-test">Layout content</Bookmark>
        </HStack>
      </VStack>
    `);
    const bookmark = page.locator("#layout-test");
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText("Layout content");
  });

  test("integrates with navigation components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Link to="#target">Navigate to bookmark</Link>
        <VStack height="100px">Spacer</VStack>
        <Bookmark id="target">Navigation target</Bookmark>
      </VStack>
    `);

    const link = page.getByRole("link", { name: "Navigate to bookmark" });
    const bookmark = page.locator("#target");

    await expect(link).toBeVisible();
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText("Navigation target");
  });

  test("works with form components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <Bookmark id="form-section">
          <FormItem>
            <TextBox />
          </FormItem>
        </Bookmark>
      </Form>
    `);

    const bookmark = page.locator("#form-section");
    const input = page.getByRole("textbox");

    await expect(bookmark).toHaveCount(1);
    await expect(input).toBeVisible();
    await expect(input).toBeEditable();
  });

  test("preserves component hierarchy", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="card-bookmark">
        <Text>Content within bookmark</Text>
      </Bookmark>
    `);

    const bookmark = page.locator("#card-bookmark");

    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText("Content within bookmark");
  });

  test("maintains responsive behavior", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="responsive">
        <VStack width="100%">
          <Text>Responsive content</Text>
        </VStack>
      </Bookmark>
    `);

    const bookmark = page.locator("#responsive");
    await expect(bookmark).toHaveCount(1);

    // Test viewport resize behavior
    await page.setViewportSize({ width: 400, height: 600 });
    await expect(bookmark).toHaveCount(1);

    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(bookmark).toHaveCount(1);
  });
});

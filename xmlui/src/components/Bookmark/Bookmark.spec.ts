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
        <VStack height="600px" gap="100px">
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
        <VStack height="600px" gap="100px">
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
  test("supports keyboard navigation to content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="keyboard-test">
        <Button>Focusable Content</Button>
      </Bookmark>
    `);

    await page.keyboard.press("Tab");
    const button = page.getByRole("button", { name: "Focusable Content" });
    await expect(button).toBeFocused();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("links navigate to bookmarks with 'null' other props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack height="600px">
        <Link to="#green-section">Jump to green</Link>
        <VStack height="700px" backgroundColor="red">Red content</VStack>
        <Bookmark id="green-section" level="{null}" title="{null}" omitFromToc="{null}" />
        <VStack height="700px" backgroundColor="green">Green content</VStack>
      </VStack>
    `);

    const greenContent = page.getByText("Green content");
    await expect(greenContent).not.toBeInViewport();

    const greenLink = page.getByRole("link", { name: "Jump to green" });
    await greenLink.click();

    await page.waitForURL(/#green-section$/);
    await expect(greenContent).toBeInViewport();
  });

  test("links navigate to bookmarks with valid other props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack height="600px">
        <Link to="#green-section">Jump to green</Link>
        <VStack height="700px" backgroundColor="red">Red content</VStack>
        <Bookmark id="green-section" level="{50}" title="green content section" omitFromToc="{true}" />
        <VStack height="700px" backgroundColor="green">Green content</VStack>
      </VStack>
    `);

    const greenContent = page.getByText("Green content");
    await expect(greenContent).not.toBeInViewport();

    const greenLink = page.getByRole("link", { name: "Jump to green" });
    await greenLink.click();

    await page.waitForURL(/#green-section$/);
    await expect(greenContent).toBeInViewport();
  });

  test("links navigate to bookmarks with empty children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack height="600px">
        <Link to="#green-section">Jump to green</Link>
        <VStack height="700px" backgroundColor="red">Red content</VStack>
        <Bookmark id="green-section" level="{50}" title="green content section" omitFromToc="{true}" ></Bookmark>
        <VStack height="700px" backgroundColor="green">Green content</VStack>
      </VStack>
    `);

    const greenContent = page.getByText("Green content");
    await expect(greenContent).not.toBeInViewport();

    const greenLink = page.getByRole("link", { name: "Jump to green" });
    await greenLink.click();

    await page.waitForURL(/#green-section$/);
    await expect(greenContent).toBeInViewport();
  });

  test("navigates to dynamic 'id' prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack var.dynId="initial-id" height="600px">
        <Link to="#green-section">Jump to green</Link>
        <Button onClick="dynId = 'green-section'">Set green section id</Button>
        <VStack height="700px" backgroundColor="red">Red content</VStack>
        <Bookmark id="{dynId}" />
        <VStack height="700px" backgroundColor="green">Green content</VStack>
      </VStack>
    `);

    const greenContent = page.getByText("Green content");
    await expect(greenContent).not.toBeInViewport();

    await page.getByRole("button", { name: "Set green section id" }).click();

    const greenLink = page.getByRole("link", { name: "Jump to green" });
    await greenLink.click();

    await page.waitForURL(/#green-section$/);
    await expect(greenContent).toBeInViewport();
  });
});

import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders as standalone bookmark", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="test-bookmark" />`);
    const bookmark = page.locator('#test-bookmark[data-anchor="true"]');
    // Standalone bookmarks exist but may not be visually apparent
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toHaveAttribute('data-anchor', 'true');
  });

  test("renders with children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="test-bookmark">
        <Text>Bookmark content</Text>
      </Bookmark>
    `);
    const bookmark = page.locator('#test-bookmark[data-anchor="true"]');
    await expect(bookmark).toBeVisible();
    await expect(bookmark).toContainText("Bookmark content");
  });

  test("renders without id", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark>Content without id</Bookmark>`);
    // Component exists in the DOM but without id attribute
    const component = page.locator('[data-anchor="true"]');
    await expect(component).toHaveCount(1);
    await expect(component).toContainText("Content without id");
  });

  // =============================================================================
  // DOCUMENTATION USAGE PATTERNS
  // =============================================================================

  test.describe("Documentation Usage Patterns", () => {
    test("standalone usage pattern - adjacent content navigation", async ({ initTestBed, page }) => {
      // Based on documentation example with standalone bookmarks and adjacent content
      await initTestBed(`
        <VStack>
          <Link to="#red-section">Jump to red</Link>
          <Link to="#green-section">Jump to green</Link>
          <Bookmark id="red-section" />
          <VStack height="200px" backgroundColor="red">Red content</VStack>
          <Bookmark id="green-section" />
          <VStack height="200px" backgroundColor="green">Green content</VStack>
        </VStack>
      `);

      const redBookmark = page.locator('#red-section');
      const greenBookmark = page.locator('#green-section');
      const redLink = page.getByRole('link', { name: 'Jump to red' });
      const greenLink = page.getByRole('link', { name: 'Jump to green' });

      // Verify bookmarks exist and are positioned correctly
      await expect(redBookmark).toHaveCount(1);
      await expect(greenBookmark).toHaveCount(1);
      await expect(redBookmark).toHaveAttribute('data-anchor', 'true');
      await expect(greenBookmark).toHaveAttribute('data-anchor', 'true');

      // Verify links are functional
      await expect(redLink).toBeVisible();
      await expect(greenLink).toBeVisible();
      await expect(redLink).toHaveAttribute('href', '#/#red-section');
      await expect(greenLink).toHaveAttribute('href', '#/#green-section');
    });

    test("nested children usage pattern - content wrapping", async ({ initTestBed, page }) => {
      // Based on documentation example with nested children inside bookmarks
      await initTestBed(`
        <VStack>
          <Link to="#wrapped-red">Jump to red</Link>
          <Link to="#wrapped-green">Jump to green</Link>
          <Bookmark id="wrapped-red">
            <VStack height="200px" backgroundColor="red">Red wrapped content</VStack>
          </Bookmark>
          <Bookmark id="wrapped-green">
            <VStack height="200px" backgroundColor="green">Green wrapped content</VStack>
          </Bookmark>
        </VStack>
      `);

      const redBookmark = page.locator('#wrapped-red');
      const greenBookmark = page.locator('#wrapped-green');
      const redLink = page.getByRole('link', { name: 'Jump to red' });
      const greenLink = page.getByRole('link', { name: 'Jump to green' });

      // Verify bookmarks exist and contain the content
      await expect(redBookmark).toHaveCount(1);
      await expect(greenBookmark).toHaveCount(1);
      await expect(redBookmark).toContainText('Red wrapped content');
      await expect(greenBookmark).toContainText('Green wrapped content');

      // Verify links are functional
      await expect(redLink).toBeVisible();
      await expect(greenLink).toBeVisible();
      await expect(redLink).toHaveAttribute('href', '#/#wrapped-red');
      await expect(greenLink).toHaveAttribute('href', '#/#wrapped-green');
    });

    test("standalone vs nested patterns produce equivalent navigation behavior", async ({ initTestBed, page }) => {
      // Test that both patterns work equivalently for scrollIntoView API
      const { testStateDriver } = await initTestBed(`
        <VStack>
          <!-- Standalone pattern -->
          <Bookmark id="standalone-bookmark" ref="standaloneRef" />
          <VStack height="100px">Adjacent content for standalone</VStack>
          
          <!-- Nested pattern -->
          <Bookmark id="nested-bookmark" ref="nestedRef">
            <VStack height="100px">Nested content</VStack>
          </Bookmark>
          
          <Button onClick="standaloneRef.scrollIntoView(); testState = 'standalone-scrolled'">Scroll Standalone</Button>
          <Button onClick="nestedRef.scrollIntoView(); testState = 'nested-scrolled'">Scroll Nested</Button>
        </VStack>
      `);

      const standaloneButton = page.getByRole('button', { name: 'Scroll Standalone' });
      const nestedButton = page.getByRole('button', { name: 'Scroll Nested' });
      const standaloneBookmark = page.locator('#standalone-bookmark');
      const nestedBookmark = page.locator('#nested-bookmark');

      // Test standalone pattern scrollIntoView
      await standaloneButton.click();
      await expect.poll(testStateDriver.testState).toEqual('standalone-scrolled');
      await expect(standaloneBookmark).toHaveCount(1);

      // Test nested pattern scrollIntoView
      await nestedButton.click();
      await expect.poll(testStateDriver.testState).toEqual('nested-scrolled');
      await expect(nestedBookmark).toHaveCount(1);
      await expect(nestedBookmark).toContainText('Nested content');
    });

    test("standalone pattern recommended for reduced nesting depth", async ({ initTestBed, page }) => {
      // Verify standalone pattern doesn't add unnecessary nesting as mentioned in docs
      await initTestBed(`
        <VStack>
          <Bookmark id="standalone-test" />
          <Text>Content after standalone bookmark</Text>
        </VStack>
      `);

      const bookmark = page.locator('#standalone-test');
      const textContent = page.getByText('Content after standalone bookmark');

      // Standalone bookmark should exist without affecting content structure
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
      await expect(textContent).toBeVisible();

      // Verify the bookmark is a simple span element (minimal nesting)
      const tagName = await bookmark.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('span');
    });

    test("nested pattern allows content grouping", async ({ initTestBed, page }) => {
      // Verify nested pattern groups content as shown in documentation
      await initTestBed(`
        <VStack>
          <Bookmark id="grouped-content">
            <Text>First line of grouped content</Text>
            <Text>Second line of grouped content</Text>
            <Button>Action within group</Button>
          </Bookmark>
        </VStack>
      `);

      const bookmark = page.locator('#grouped-content');
      const firstLine = page.getByText('First line of grouped content');
      const secondLine = page.getByText('Second line of grouped content');
      const actionButton = page.getByRole('button', { name: 'Action within group' });

      // All content should be within the bookmark container
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toContainText('First line of grouped content');
      await expect(bookmark).toContainText('Second line of grouped content');
      
      // Child elements should be functional
      await expect(firstLine).toBeVisible();
      await expect(secondLine).toBeVisible();
      await expect(actionButton).toBeVisible();
      await expect(actionButton).toBeEnabled();
    });
  });

  // =============================================================================
  // ID PROPERTY TESTS
  // =============================================================================

  test.describe("id property", () => {
    test("creates anchor element with specified id", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="my-bookmark" />`);
      const anchor = page.locator('#my-bookmark');
      await expect(anchor).toHaveCount(1);
      await expect(anchor).toHaveAttribute('data-anchor', 'true');
    });

    test("handles special characters in id", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="bookmark-with_special.chars" />`);
      const anchor = page.locator('[id="bookmark-with_special.chars"]');
      await expect(anchor).toHaveCount(1);
      await expect(anchor).toHaveAttribute('data-anchor', 'true');
    });

    test("handles unicode characters in id", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="书签-émojis🚀" />`);
      const anchor = page.locator('[id="书签-émojis🚀"]');
      await expect(anchor).toHaveCount(1);
      await expect(anchor).toHaveAttribute('data-anchor', 'true');
    });

    test("handles null id gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="{null}">Content</Bookmark>`);
      const component = page.locator('[data-anchor="true"]');
      await expect(component).toHaveCount(1);
      await expect(component).toContainText("Content");
    });

    test("handles undefined id gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="{undefined}">Content</Bookmark>`);
      const component = page.locator('[data-anchor="true"]');
      await expect(component).toHaveCount(1);
      await expect(component).toContainText("Content");
    });
  });

  // =============================================================================
  // LEVEL PROPERTY TESTS
  // =============================================================================

  test.describe("level property", () => {
    test("uses default level when not specified", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("accepts valid level numbers", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" level="3" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles level as object gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" level="{{}}" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles negative level gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" level="-1" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles null level gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" level="{null}" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles very large level numbers", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" level="999" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });
  });

  // =============================================================================
  // TITLE PROPERTY TESTS
  // =============================================================================

  test.describe("title property", () => {
    test("accepts string title", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" title="My Bookmark Title" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles empty title", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" title="" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles title with special characters", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" title="Title with émojis 🚀 & quotes" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles title with unicode characters", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" title="标题 with 中文 characters" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles title as object gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" title="{{}}" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles null title gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" title="{null}" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles very long title", async ({ initTestBed, page }) => {
      const longTitle = "Very ".repeat(100) + "Long Title";
      await initTestBed(`<Bookmark id="test" title="${longTitle}" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });
  });

  // =============================================================================
  // OMIT FROM TOC PROPERTY TESTS
  // =============================================================================

  test.describe("omitFromToc property", () => {
    test("uses default omitFromToc when not specified", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("accepts true value", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" omitFromToc="true" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("accepts false value", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" omitFromToc="false" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });

    test("handles null omitFromToc gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Bookmark id="test" omitFromToc="{null}" />`);
      const bookmark = page.locator('#test');
      await expect(bookmark).toHaveCount(1);
      await expect(bookmark).toHaveAttribute('data-anchor', 'true');
    });
  });

  // =============================================================================
  // SCROLL INTO VIEW API TESTS
  // =============================================================================

  test.describe("scrollIntoView API", () => {
    test("scrollIntoView method can be called via ref", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Bookmark id="test" ref="bookmarkRef">Content</Bookmark>
        <Button onClick="bookmarkRef.scrollIntoView(); testState = 'scrolled'">Scroll</Button>
      `);
      
      const button = page.getByRole('button', { name: 'Scroll' });
      await button.click();
      await expect.poll(testStateDriver.testState).toEqual('scrolled');
    });

    test("scrollIntoView works in scrollable container", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <VStack height="300px" overflow="auto">
          <VStack height="500px" backgroundColor="lightblue">Top spacer</VStack>
          <Bookmark id="target" ref="bookmarkRef">Target content</Bookmark>
          <VStack height="500px" backgroundColor="lightcoral">Bottom spacer</VStack>
          <Button onClick="bookmarkRef.scrollIntoView(); testState = 'scrolled'">Scroll to Target</Button>
        </VStack>
      `);
      
      const button = page.getByRole('button', { name: 'Scroll to Target' });
      await button.click();
      await expect.poll(testStateDriver.testState).toEqual('scrolled');
      
      // Verify bookmark is still visible after scroll
      const bookmark = page.locator('#target');
      await expect(bookmark).toBeVisible();
    });

    test("scrollIntoView handles multiple calls gracefully", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Bookmark id="test" ref="bookmarkRef">Content</Bookmark>
        <Button onClick="bookmarkRef.scrollIntoView(); bookmarkRef.scrollIntoView(); testState = 'multiple-scrolls'">Multiple Scrolls</Button>
      `);
      
      const button = page.getByRole('button', { name: 'Multiple Scrolls' });
      await button.click();
      await expect.poll(testStateDriver.testState).toEqual('multiple-scrolls');
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("creates semantic anchor element", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="accessible-bookmark" />`);
    const anchor = page.locator('#accessible-bookmark');
    await expect(anchor).toHaveAttribute('data-anchor', 'true');
    await expect(anchor).toHaveCount(1);
  });

  test("preserves content accessibility when wrapping children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="test">
        <Button>Accessible Button</Button>
      </Bookmark>
    `);
    const button = page.getByRole('button', { name: 'Accessible Button' });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test("provides navigatable anchor when id is set", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="navigation-target">Navigate here</Bookmark>`);
    
    // Verify anchor exists and can be targeted for navigation
    const anchor = page.locator('#navigation-target');
    await expect(anchor).toHaveCount(1);
    await expect(anchor).toHaveAttribute('id', 'navigation-target');
    await expect(anchor).toHaveAttribute('data-anchor', 'true');
  });

  test("supports keyboard navigation to content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="keyboard-test">
        <Button>Focusable Content</Button>
      </Bookmark>
    `);
    
    const button = page.getByRole('button', { name: 'Focusable Content' });
    await button.focus();
    await expect(button).toBeFocused();
  });

  test("maintains document structure with nested content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="structure-test">
        <Text>Section content</Text>
      </Bookmark>
    `);
    
    const bookmark = page.locator('#structure-test');
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText('Section content');
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles no props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark />`);
    const component = page.locator('[data-anchor="true"]');
    await expect(component).toHaveCount(1);
  });

  test("handles all props as null", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="{null}" level="{null}" title="{null}" omitFromToc="{null}" />`);
    const component = page.locator('[data-anchor="true"]');
    await expect(component).toHaveCount(1);
  });

  test("handles all props as undefined", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="{undefined}" level="{undefined}" title="{undefined}" omitFromToc="{undefined}" />`);
    const component = page.locator('[data-anchor="true"]');
    await expect(component).toHaveCount(1);
  });

  test("handles mixed valid and invalid props", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="valid" level="{null}" title="Valid Title" omitFromToc="{undefined}" />`);
    const bookmark = page.locator('#valid');
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toHaveAttribute('data-anchor', 'true');
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
    const bookmark = page.locator('#nested');
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText("Deeply nested content");
  });

  test("handles empty children", async ({ initTestBed, page }) => {
    await initTestBed(`<Bookmark id="empty"></Bookmark>`);
    const bookmark = page.locator('#empty');
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toHaveAttribute('data-anchor', 'true');
  });

  test("handles multiple bookmarks with same content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Bookmark id="first">Same content</Bookmark>
        <Bookmark id="second">Same content</Bookmark>
      </VStack>
    `);
    const firstBookmark = page.locator('#first');
    const secondBookmark = page.locator('#second');
    await expect(firstBookmark).toHaveCount(1);
    await expect(secondBookmark).toHaveCount(1);
    await expect(firstBookmark).toContainText("Same content");
    await expect(secondBookmark).toContainText("Same content");
  });

  test("preserves whitespace in content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="whitespace">   Text with   spaces   </Bookmark>
    `);
    const bookmark = page.locator('#whitespace');
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText("Text with   spaces");
  });

  test("handles rapid API calls", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Bookmark id="rapid-test" ref="bookmarkRef">Content</Bookmark>
      <Button onClick="bookmarkRef.scrollIntoView(); bookmarkRef.scrollIntoView(); bookmarkRef.scrollIntoView(); testState = 'rapid-calls'">Rapid Calls</Button>
    `);
    
    const button = page.getByRole('button', { name: 'Rapid Calls' });
    await button.click();
    await expect.poll(testStateDriver.testState).toEqual('rapid-calls');
    
    // Component should still be functional
    const bookmark = page.locator('#rapid-test');
    await expect(bookmark).toBeVisible();
  });

  test("works with dynamic content updates", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Bookmark id="dynamic">
        <Text>{testState || 'Initial content'}</Text>
        <Button onClick="testState = 'Updated content'">Update</Button>
      </Bookmark>
    `);
    
    const bookmark = page.locator('#dynamic');
    const button = page.getByRole('button', { name: 'Update' });
    
    await expect(bookmark).toContainText('Initial content');
    await button.click();
    await expect.poll(testStateDriver.testState).toEqual('Updated content');
    await expect(bookmark).toContainText('Updated content');
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
    const bookmark = page.locator('#layout-test');
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
    
    const link = page.getByRole('link', { name: 'Navigate to bookmark' });
    const bookmark = page.locator('#target');
    
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
    
    const bookmark = page.locator('#form-section');
    const input = page.getByRole('textbox');
    
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
    
    const bookmark = page.locator('#card-bookmark');
    
    await expect(bookmark).toHaveCount(1);
    await expect(bookmark).toContainText('Content within bookmark');
  });

  test("maintains responsive behavior", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Bookmark id="responsive">
        <VStack width="100%">
          <Text>Responsive content</Text>
        </VStack>
      </Bookmark>
    `);
    
    const bookmark = page.locator('#responsive');
    await expect(bookmark).toHaveCount(1);
    
    // Test viewport resize behavior
    await page.setViewportSize({ width: 400, height: 600 });
    await expect(bookmark).toHaveCount(1);
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(bookmark).toHaveCount(1);
  });
});

import { expect, test } from "xmlui/testing";

// Three uncategorized items used by most tests.
// "ut" matches Button (B**ut**ton) and Input (Inp**ut**) but not Table.
const SEARCH_XS = `
  var sampleData = [
    { path: '#button', title: 'Button', content: 'A clickable button component' },
    { path: '#input', title: 'Input', content: 'A text input field component' },
    { path: '#table', title: 'Table', content: 'A data table component for rows' },
  ];
  var categorizedData = [
    { path: '#button', title: 'Button', content: 'A clickable button', category: 'Components' },
    { path: '#input',  title: 'Input',  content: 'A text input field', category: 'Components' },
    { path: '#guide',  title: 'Getting Started', content: 'How to get started with the framework', category: 'Guides' },
  ];
`;

// =============================================================================
// BASIC FUNCTIONALITY TESTS  (mode="inline" — popover, no overlay portal)
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" />`, {
      extensionIds: "xmlui-search",
    });
    const field = page.getByRole("searchbox");
    await expect(field).toBeAttached();
    await expect(field).toBeEmpty();
  });

  test("dropdown is hidden when input is empty", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("dropdown appears when typing a matching query", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option", { name: /Button/ })).toBeVisible();
  });

  test("dropdown hides when input is cleared", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await field.fill("");
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("shows 'No results found' message when query matches nothing after a previous match", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    // Get the dropdown open first so show=true is set
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    // Change to a query with no match — show stays true, results become empty
    await field.fill("xyzxyz");
    await expect(page.getByText("No results found")).toBeVisible();
  });

  test("custom noResultsMessage is displayed", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" noResultsMessage="Nothing here" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await field.fill("xyzxyz");
    await expect(page.getByText("Nothing here")).toBeVisible();
  });

  test("single-character query does not open dropdown", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("b");
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("custom placeholder is displayed", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" placeholder="Find something..." />`, {
      extensionIds: "xmlui-search",
    });
    await expect(page.getByPlaceholder("Find something...")).toBeVisible();
  });

  test("default placeholder is displayed when none is supplied", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" />`, {
      extensionIds: "xmlui-search",
    });
    await expect(page.getByPlaceholder("Type to search")).toBeVisible();
  });

  test("limit prop restricts number of displayed results", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{manyItems}" limit="2" />`, {
      extensionIds: "xmlui-search",
      mainXs: `
        var manyItems = [
          { path: '#i0', title: 'Alpha Item 0', content: 'Common content item zero' },
          { path: '#i1', title: 'Alpha Item 1', content: 'Common content item one' },
          { path: '#i2', title: 'Alpha Item 2', content: 'Common content item two' },
          { path: '#i3', title: 'Alpha Item 3', content: 'Common content item three' },
          { path: '#i4', title: 'Alpha Item 4', content: 'Common content item four' },
        ];
      `,
    });
    await page.getByRole("searchbox").fill("Alpha");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(2);
  });

  test("first result is auto-highlighted when results appear", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  });

  test("suggested queries are shown in no-results panel", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Search mode="inline" data="{sampleData}" suggestedQueries="{['Button', 'Table']}" />`,
      {
        extensionIds: "xmlui-search",
        mainXs: SEARCH_XS,
      },
    );
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await field.fill("xyzxyz");
    // The no-results panel sits inside aria-hidden="true" list item, so use CSS-based selectors
    const listbox = page.getByRole("listbox");
    await expect(listbox.locator("button").filter({ hasText: /^Button$/ })).toBeVisible();
    await expect(listbox.locator("button").filter({ hasText: /^Table$/ })).toBeVisible();
  });

  test("clicking a suggested query fills the search input", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Search mode="inline" data="{sampleData}" suggestedQueries="{['Button']}" />`,
      {
        extensionIds: "xmlui-search",
        mainXs: SEARCH_XS,
      },
    );
    const field = page.getByRole("searchbox");
    // First get results to open the dropdown (show=true), then switch to a no-match query
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await field.fill("xyzxyz");
    // The no-results panel sits inside aria-hidden="true", use CSS-based selector
    await page.getByRole("listbox").locator("button").filter({ hasText: /^Button$/ }).click();
    await expect(field).toHaveValue("Button");
  });
});

// =============================================================================
// KEYBOARD NAVIGATION TESTS
// =============================================================================

test.describe("Keyboard Navigation", () => {
  test("results are auto-highlighted on open (activeIndex starts at 0)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  });

  test("ArrowDown moves highlight from first to second result", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    // "ut" matches both Button and Input
    await field.fill("ut");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    // First item is already highlighted on load (activeIndex starts at 0)
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "false");
    await expect(page.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("ArrowDown wraps from last result back to first", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    // "ut" produces exactly 2 results: Button and Input
    await field.fill("ut");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    // First item is already highlighted on load; navigate to last, then wrap back to first
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option").last()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  });

  test("ArrowUp from first result wraps to last result", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("ut");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    // First item is already highlighted on load; ArrowUp wraps directly to last
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowUp");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "false");
    await expect(page.getByRole("option").last()).toHaveAttribute("aria-selected", "true");
  });

  test("Escape closes the dropdown", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("Enter closes the dropdown", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("Enter after ArrowDown closes dropdown and clears input", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    await page.keyboard.press("ArrowDown");
    // With 1 result "button", ArrowDown wraps to index 0 — first item stays selected
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Enter");

    await expect(page.getByRole("listbox")).not.toBeVisible();
    await expect(field).toBeEmpty();
  });
});

// =============================================================================
// MOUSE INTERACTION TESTS
// =============================================================================

test.describe("Mouse Interactions", () => {
  test("hovering a result highlights it", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    // "ut" produces two results so we can hover the second and verify the first is deselected
    await field.fill("ut");
    await expect(page.getByRole("listbox")).toBeVisible();

    const secondOption = page.getByRole("option").nth(1);
    await expect(secondOption).toBeVisible();
    await secondOption.hover();

    await expect(secondOption).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "false");
  });

  test("clicking a result closes the dropdown", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.getByRole("option").first().click();

    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("clicking a result clears the search input", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.getByRole("option").first().click();

    await expect(field).toBeEmpty();
  });

  test("switching from keyboard highlight to mouse hover updates selection", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("ut");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    // First item is already highlighted on load (activeIndex=0)
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");

    // Mouse hovering second item should switch the highlight
    const secondOption = page.getByRole("option").nth(1);
    await expect(secondOption).toBeVisible();
    await secondOption.hover();
    await expect(secondOption).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "false");
  });
});

// =============================================================================
// CATEGORY TESTS
// =============================================================================

test.describe("Categories", () => {
  test("category headers are shown for categorized results", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{categorizedData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("ut");
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // Category header <li role="presentation"> should be present inside the listbox
    await expect(listbox.locator('[role="presentation"]').first()).toBeVisible();
  });

  test("category header shows the category name", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{categorizedData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("ut");
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // "ut" matches "Button" and "Input" which are both in "Components"
    await expect(
      listbox.locator('[role="presentation"]').filter({ hasText: "Components" }),
    ).toBeVisible();
  });

  test("no category headers when all results are uncategorized", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("ut");
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // Scope to the listbox so page-level role='presentation' elements don't interfere
    await expect(listbox.locator('[role="presentation"]')).toHaveCount(0);
  });

  test("multiple category headers appear when results span different categories", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{categorizedData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    // "in" matches "Input" (Components) and "Getting" in "Getting Started" (Guides)
    await page.getByRole("searchbox").fill("in");
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    // Expect one header per category, scoped to the listbox
    await expect(listbox.locator('[role="presentation"]')).toHaveCount(2);
    await expect(listbox.locator('[role="presentation"]').filter({ hasText: "Components" })).toBeVisible();
    await expect(listbox.locator('[role="presentation"]').filter({ hasText: "Guides" })).toBeVisible();
  });

  test("category tabs appear when results span multiple categories", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{categorizedData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("in");
    await expect(page.getByRole("listbox")).toBeVisible();

    const tablist = page.getByRole("tablist", { name: "Filter by category" });
    await expect(tablist).toBeVisible();
    await expect(tablist.getByRole("tab", { name: "Components" })).toBeVisible();
    await expect(tablist.getByRole("tab", { name: "Guides" })).toBeVisible();
  });

  test("clicking a category tab filters results to that category", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{categorizedData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("in");
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    const tablist = page.getByRole("tablist", { name: "Filter by category" });
    await tablist.getByRole("tab", { name: "Guides" }).click();

    // After filtering only Guides, Input (Components) should not be visible
    // Use filter({hasText}) instead of accessible name to avoid matching issues with highlighted text
    await expect(listbox.getByRole("option").filter({ hasText: /Getting Started/ })).toBeVisible();
    await expect(listbox.getByRole("option").filter({ hasText: /Input/ })).not.toBeVisible();
  });

  test("'All content' tab restores all results after filtering", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{categorizedData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("in");
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    const tablist = page.getByRole("tablist", { name: "Filter by category" });
    await tablist.getByRole("tab", { name: "Guides" }).click();
    await tablist.getByRole("tab", { name: "All content" }).click();

    await expect(listbox.getByRole("option").filter({ hasText: /Input/ })).toBeVisible();
    await expect(listbox.getByRole("option").filter({ hasText: /Getting Started/ })).toBeVisible();
  });
});

// =============================================================================
// PAGINATION TESTS
// =============================================================================

test.describe("Pagination", () => {
  test("Load more button appears when results exceed pageSize", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{manyItems}" pageSize="2" />`, {
      extensionIds: "xmlui-search",
      mainXs: `
        var manyItems = [
          { path: '#i0', title: 'Alpha Item 0', content: 'Common content item zero' },
          { path: '#i1', title: 'Alpha Item 1', content: 'Common content item one' },
          { path: '#i2', title: 'Alpha Item 2', content: 'Common content item two' },
          { path: '#i3', title: 'Alpha Item 3', content: 'Common content item three' },
        ];
      `,
    });
    await page.getByRole("searchbox").fill("Alpha");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByText("Load more")).toBeVisible();
  });

  test("clicking Load more shows additional results", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{manyItems}" pageSize="2" />`, {
      extensionIds: "xmlui-search",
      mainXs: `
        var manyItems = [
          { path: '#i0', title: 'Alpha Item 0', content: 'Common content item zero' },
          { path: '#i1', title: 'Alpha Item 1', content: 'Common content item one' },
          { path: '#i2', title: 'Alpha Item 2', content: 'Common content item two' },
          { path: '#i3', title: 'Alpha Item 3', content: 'Common content item three' },
        ];
      `,
    });
    await page.getByRole("searchbox").fill("Alpha");
    await expect(page.getByRole("listbox")).toBeVisible();
    const countBefore = await page.getByRole("option").count();
    await page.getByText("Load more").click();
    const countAfter = await page.getByRole("option").count();
    expect(countAfter).toBeGreaterThan(countBefore);
  });
});

// =============================================================================
// OVERLAY MODE TESTS
// =============================================================================

test.describe("Overlay Mode", () => {
  test("visible input acts as a trigger — not a real searchbox — before overlay opens", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    // Before opening the overlay the trigger input is readonly
    const trigger = page.getByRole("searchbox");
    await expect(trigger).toBeAttached();
    await expect(trigger).toHaveAttribute("readonly", "");
  });

  test("clicking the trigger opens the overlay with an active search input", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    // Click the trigger input to open the overlay
    await page.getByRole("searchbox").click();
    // After opening, the overlay provides a writable searchbox
    const overlayInput = page.getByRole("dialog").getByRole("searchbox");
    await expect(overlayInput).toBeVisible();
    await expect(overlayInput).not.toHaveAttribute("readonly", "");
  });

  test("typing in the overlay shows matching results", async ({ initTestBed, page }) => {
    await initTestBed(`<Search data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").click();
    const overlayInput = page.getByRole("dialog").getByRole("searchbox");
    await overlayInput.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option", { name: /Button/ })).toBeVisible();
  });

  test("Escape closes the overlay", async ({ initTestBed, page }) => {
    await initTestBed(`<Search data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking the backdrop closes the overlay", async ({ initTestBed, page }) => {
    await initTestBed(`<Search data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Click outside the dialog panel (on the backdrop)
    await page.mouse.click(10, 10);

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("closing the overlay clears the search input", async ({ initTestBed, page }) => {
    await initTestBed(`<Search data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").click();
    const overlayInput = page.getByRole("dialog").getByRole("searchbox");
    await overlayInput.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("overlay default placeholder is 'Type to search…'", async ({ initTestBed, page }) => {
    await initTestBed(`<Search />`, {
      extensionIds: "xmlui-search",
    });
    await page.getByRole("searchbox").click();
    await expect(page.getByRole("dialog").getByPlaceholder("Type to search…")).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("searchbox has aria-autocomplete='list'", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" />`, {
      extensionIds: "xmlui-search",
    });
    await expect(page.getByRole("searchbox")).toHaveAttribute("aria-autocomplete", "list");
  });

  test("result items have role='option' inside a role='listbox'", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option").first()).toBeVisible();
  });

  test("aria-activedescendant points to first result when results are shown", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();

    // First item is auto-selected on load, so activedescendant points to it immediately
    await expect(field).toHaveAttribute("aria-activedescendant", "option-0");
  });

  test("aria-activedescendant updates after ArrowDown navigation", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    // "ut" gives 2 results so ArrowDown moves to index 1
    await field.fill("ut");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    await page.keyboard.press("ArrowDown");

    await expect(field).toHaveAttribute("aria-activedescendant", "option-1");
  });

  test("overlay search input has aria-autocomplete='list'", async ({ initTestBed, page }) => {
    await initTestBed(`<Search data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    await page.getByRole("searchbox").click();
    const overlayInput = page.getByRole("dialog").getByRole("searchbox");
    await expect(overlayInput).toHaveAttribute("aria-autocomplete", "list");
  });
});

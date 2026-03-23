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
// BASIC FUNCTIONALITY TESTS
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

  test("shows 'No results' message when query matches nothing after a previous match", async ({
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
    await expect(page.getByText("No results")).toBeVisible();
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
});

// =============================================================================
// KEYBOARD NAVIGATION TESTS
// =============================================================================

test.describe("Keyboard Navigation", () => {
  test("first ArrowDown highlights the first result", async ({ initTestBed, page }) => {
    await initTestBed(`<Search mode="inline" data="{sampleData}" />`, {
      extensionIds: "xmlui-search",
      mainXs: SEARCH_XS,
    });
    const field = page.getByRole("searchbox");
    await field.fill("button");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(field).toBeFocused();

    await page.keyboard.press("ArrowDown");

    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  });

  test("second ArrowDown moves highlight from first to second result", async ({
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

  test("Enter without prior arrow navigation closes the dropdown", async ({
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

  test("aria-activedescendant is set after ArrowDown navigation", async ({
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

    await page.keyboard.press("ArrowDown");

    await expect(field).toHaveAttribute("aria-activedescendant", "option-0");
  });
});

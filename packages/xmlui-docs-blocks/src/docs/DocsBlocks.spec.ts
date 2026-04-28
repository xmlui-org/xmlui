import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-docs-blocks" };

// =============================================================================
// TBD
// =============================================================================

test.describe("TBD", () => {
  test("renders TBD text", async ({ initTestBed, page }) => {
    await initTestBed(`<TBD />`, EXT);
    await expect(page.getByText("TBD")).toBeVisible();
  });
});

// =============================================================================
// SectionHeader
// =============================================================================

test.describe("SectionHeader", () => {
  test("renders title text", async ({ initTestBed, page }) => {
    await initTestBed(`<SectionHeader title="My Section" />`, EXT);
    await expect(page.getByText("My Section")).toBeVisible();
  });

  test("renders as a heading", async ({ initTestBed, page }) => {
    await initTestBed(`<SectionHeader title="Heading Text" />`, EXT);
    await expect(page.getByRole("heading", { name: "Heading Text" })).toBeVisible();
  });
});

// =============================================================================
// LinkButton
// =============================================================================

test.describe("LinkButton", () => {
  test("renders label text", async ({ initTestBed, page }) => {
    await initTestBed(`<LinkButton label="Click Me" to="/some-page" />`, EXT);
    await expect(page.getByText("Click Me")).toBeVisible();
  });

  test("renders as a link", async ({ initTestBed, page }) => {
    await initTestBed(`<LinkButton label="Go Here" to="/destination" />`, EXT);
    await expect(page.getByRole("link", { name: "Go Here" })).toBeVisible();
  });
});

// =============================================================================
// OverviewCard
// =============================================================================

test.describe("OverviewCard", () => {
  test("renders label text", async ({ initTestBed, page }) => {
    await initTestBed(`<OverviewCard label="My Card" to="/page" />`, EXT);
    await expect(page.getByText("My Card")).toBeVisible();
  });

  test("renders as a link", async ({ initTestBed, page }) => {
    await initTestBed(`<OverviewCard label="Card Link" to="/target" />`, EXT);
    await expect(page.getByRole("link")).toBeVisible();
  });
});

// =============================================================================
// Breadcrumbs
// =============================================================================

const DEFAULT_ITEMS_MARKUP = `defaultItems="{[
  { label: 'Documentation', to: '/docs' },
  { label: 'Learn XMLUI', to: '/docs/learn' },
  { label: 'Introduction' }
]}"`;

test.describe("Breadcrumbs", () => {
  test.describe("Basic Functionality", () => {
    test("renders nothing but the Documentation root when no linkInfo and no defaultItems", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Breadcrumbs />`, EXT);
      const nav = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(nav).toBeVisible();
      await expect(nav.getByRole("link", { name: "Documentation" })).toBeVisible();
      // Only the root link — no chevron, no current item
      await expect(nav.getByRole("link")).toHaveCount(1);
    });

    test("renders every label from 'defaultItems' in order", async ({ initTestBed, page }) => {
      await initTestBed(`<Breadcrumbs ${DEFAULT_ITEMS_MARKUP} />`, EXT);
      const nav = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(nav.getByText("Documentation")).toBeVisible();
      await expect(nav.getByText("Learn XMLUI")).toBeVisible();
      await expect(nav.getByText("Introduction")).toBeVisible();
    });

    test("renders non-last items with 'to' as links", async ({ initTestBed, page }) => {
      await initTestBed(`<Breadcrumbs ${DEFAULT_ITEMS_MARKUP} />`, EXT);
      await expect(page.getByRole("link", { name: "Documentation" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Learn XMLUI" })).toBeVisible();
    });

    test("renders the last item as non-link with aria-current='page'", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Breadcrumbs ${DEFAULT_ITEMS_MARKUP} />`, EXT);
      // "Introduction" is the last item — no link role
      await expect(page.getByRole("link", { name: "Introduction" })).toHaveCount(0);
      const current = page.locator('[aria-current="page"]');
      await expect(current).toHaveText("Introduction");
    });

    test("renders a chevron separator between every item", async ({ initTestBed, page }) => {
      await initTestBed(`<Breadcrumbs ${DEFAULT_ITEMS_MARKUP} />`, EXT);
      // 3 items → 2 chevrons
      const chevrons = page
        .getByRole("navigation", { name: "Breadcrumb" })
        .locator('[data-icon-name="chevronright"]');
      await expect(chevrons).toHaveCount(2);
    });

    test("treats an intermediate item without 'to' as plain text", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `<Breadcrumbs defaultItems="{[
          { label: 'A', to: '/a' },
          { label: 'B' },
          { label: 'C', to: '/c' }
        ]}" />`,
        EXT,
      );
      await expect(page.getByRole("link", { name: "A" })).toBeVisible();
      // B has no `to` — rendered as text, not link
      await expect(page.getByRole("link", { name: "B" })).toHaveCount(0);
      // C is the last item — also not a link
      await expect(page.getByRole("link", { name: "C" })).toHaveCount(0);
    });

    test("falls back to 'linkInfo'-derived trail when 'defaultItems' is empty array", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Breadcrumbs defaultItems="{[]}" />`, EXT);
      // Empty array → fallback to linkInfo; with no linkInfo, only root is shown
      const nav = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(nav.getByRole("link", { name: "Documentation" })).toBeVisible();
      await expect(nav.getByRole("link")).toHaveCount(1);
    });

    test("derives the trail from the navigation hierarchy on nested pages", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(
        `
        <App layout="vertical">
          <NavPanel>
            <NavGroup label="Learn XMLUI">
              <NavLink to="/intro" label="Introduction" />
            </NavGroup>
          </NavPanel>
          <Pages fallbackPath="/intro">
            <Page url="/intro">
              <Breadcrumbs />
              <Text testId="page-content">Intro content</Text>
            </Page>
          </Pages>
        </App>
      `,
        EXT,
      );
      await expect(page.getByTestId("page-content")).toBeVisible();
      const nav = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(nav.getByRole("link", { name: "Documentation" })).toBeVisible();
      // "Learn XMLUI" ancestor appears as intermediate text (NavGroup has no `to`)
      await expect(nav.getByText("Learn XMLUI")).toBeVisible();
      // Current page ("Introduction") is not a link
      await expect(nav.locator('[aria-current="page"]')).toHaveText("Introduction");
    });
  });

  test.describe("Accessibility", () => {
    test("exposes a 'Breadcrumb'-labeled navigation landmark", async ({ initTestBed, page }) => {
      await initTestBed(`<Breadcrumbs ${DEFAULT_ITEMS_MARKUP} />`, EXT);
      await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    });

    test("marks only the last item with aria-current='page'", async ({ initTestBed, page }) => {
      await initTestBed(`<Breadcrumbs ${DEFAULT_ITEMS_MARKUP} />`, EXT);
      const current = page.locator('[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText("Introduction");
    });
  });

  test.describe("Theme Variables", () => {
    test("applies 'color-Breadcrumbs--current' to the current item", async ({
      initTestBed,
      page,
    }) => {
      const EXPECTED = "rgb(255, 0, 0)";
      await initTestBed(`<Breadcrumbs ${DEFAULT_ITEMS_MARKUP} />`, {
        ...EXT,
        testThemeVars: { "color-Breadcrumbs--current": EXPECTED },
      });
      await expect(page.locator('[aria-current="page"]')).toHaveCSS("color", EXPECTED);
    });

    test("applies 'color-Breadcrumbs' to the intermediate items and chevrons", async ({
      initTestBed,
      page,
    }) => {
      const EXPECTED = "rgb(0, 128, 0)";
      await initTestBed(
        `<Breadcrumbs defaultItems="{[
          { label: 'A', to: '/a' },
          { label: 'B' },
          { label: 'C' }
        ]}" />`,
        { ...EXT, testThemeVars: { "color-Breadcrumbs": EXPECTED } },
      );
      // Intermediate plain-text item ("B") uses color-Breadcrumbs
      await expect(page.getByText("B", { exact: true })).toHaveCSS("color", EXPECTED);
    });
  });
});

// =============================================================================
// ReadingTime
// =============================================================================

test.describe("ReadingTime", () => {
  test.describe("Basic Functionality", () => {
    test("renders nothing when 'content' is missing", async ({ initTestBed, page }) => {
      await initTestBed(`<ReadingTime />`, EXT);
      await expect(page.locator(".xmlui-reading-time")).toHaveCount(0);
    });

    test("renders nothing when 'content' is empty", async ({ initTestBed, page }) => {
      await initTestBed(`<ReadingTime content="" />`, EXT);
      await expect(page.locator(".xmlui-reading-time")).toHaveCount(0);
    });

    test("renders nothing when 'content' is whitespace-only", async ({ initTestBed, page }) => {
      await initTestBed(`<ReadingTime content="   \n\t  " />`, EXT);
      await expect(page.locator(".xmlui-reading-time")).toHaveCount(0);
    });

    test("renders 'X min read' caption with computed minutes", async ({ initTestBed, page }) => {
      // 200 words at 200 wpm = exactly 1 min
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(200)}" wordsPerMinute="200" />`,
        EXT,
      );
      await expect(page.getByText("1 min read")).toBeVisible();
    });

    test("computes minutes for content longer than one minute", async ({ initTestBed, page }) => {
      // 600 words at 200 wpm = 3 min
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(600)}" wordsPerMinute="200" />`,
        EXT,
      );
      await expect(page.getByText("3 min read")).toBeVisible();
    });

    test("rounds partial minutes up", async ({ initTestBed, page }) => {
      // 250 words at 200 wpm = 1.25 → ceil → 2 min
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(250)}" wordsPerMinute="200" />`,
        EXT,
      );
      await expect(page.getByText("2 min read")).toBeVisible();
    });

    test("returns at least 1 min for very short content", async ({ initTestBed, page }) => {
      // 5 words at 200 wpm = 0.025 → ceil → 1 min (min floor)
      await initTestBed(
        `<ReadingTime content="just a handful of words" wordsPerMinute="200" />`,
        EXT,
      );
      await expect(page.getByText("1 min read")).toBeVisible();
    });

    test("uses 'wordsPerMinute' to scale the duration", async ({ initTestBed, page }) => {
      // 200 words at 100 wpm = 2 min
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(200)}" wordsPerMinute="100" />`,
        EXT,
      );
      await expect(page.getByText("2 min read")).toBeVisible();
    });

    test("uses default 'wordsPerMinute' (265) when not specified", async ({
      initTestBed,
      page,
    }) => {
      // 530 words / 265 wpm = 2 min exactly
      await initTestBed(`<ReadingTime content="{'word '.repeat(530)}" />`, EXT);
      await expect(page.getByText("2 min read")).toBeVisible();
    });

    test("renders custom 'label' suffix instead of default", async ({ initTestBed, page }) => {
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(200)}" wordsPerMinute="200" label="minute olvasás" />`,
        EXT,
      );
      await expect(page.getByText("1 minute olvasás")).toBeVisible();
    });

    test("strips fenced code blocks from word count", async ({ initTestBed, page }) => {
      // 50 plain words + a fenced code block with 1000 "code" words.
      // With stripping at 50 wpm, only the 50 plain words count → 1 min read.
      // Without stripping it would be 21 min read.
      await initTestBed(
        `<ReadingTime
          content="{'word '.repeat(50) + '\\n' + '\\u0060\\u0060\\u0060\\n' + 'code '.repeat(1000) + '\\n\\u0060\\u0060\\u0060'}"
          wordsPerMinute="50" />`,
        EXT,
      );
      await expect(page.getByText("1 min read")).toBeVisible();
    });

    test("strips inline code from word count", async ({ initTestBed, page }) => {
      // 100 plain words + many "code" words inside backtick spans.
      // At 100 wpm, plain words alone = 1 min; including the 1000 code words would be 11 min.
      await initTestBed(
        `<ReadingTime
          content="{'word '.repeat(100) + ' \\u0060' + 'code '.repeat(1000) + '\\u0060'}"
          wordsPerMinute="100" />`,
        EXT,
      );
      await expect(page.getByText("1 min read")).toBeVisible();
    });

    test("counts the link text but not the URL in markdown links", async ({
      initTestBed,
      page,
    }) => {
      // 100 "word" tokens + a markdown link [link text here](https://example.com/path/to/very/long/url).
      // The 4-word label is preserved while the URL is stripped, so total ≈ 104 words → 2 min @ 50 wpm.
      // (If the URL were counted, the path tokens would push the total well past 2 min.)
      await initTestBed(
        `<ReadingTime
          content="{'word '.repeat(100) + ' [link text here](https://example.com/path/to/very/long/url)'}"
          wordsPerMinute="50" />`,
        EXT,
      );
      await expect(page.getByText("3 min read")).toBeVisible();
    });

    test("renders the clock icon with aria-hidden", async ({ initTestBed, page }) => {
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(200)}" wordsPerMinute="200" />`,
        EXT,
      );
      const icon = page.locator(".xmlui-reading-time svg");
      await expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  test.describe("Accessibility", () => {
    test("exposes the duration via aria-label", async ({ initTestBed, page }) => {
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(600)}" wordsPerMinute="200" />`,
        EXT,
      );
      await expect(page.getByLabel("3 min read")).toBeVisible();
    });
  });

  test.describe("Theme Variables", () => {
    test("applies 'color-ReadingTime' to the caption", async ({ initTestBed, page }) => {
      const EXPECTED = "rgb(255, 0, 0)";
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(200)}" wordsPerMinute="200" />`,
        { ...EXT, testThemeVars: { "color-ReadingTime": EXPECTED } },
      );
      await expect(page.locator(".xmlui-reading-time")).toHaveCSS("color", EXPECTED);
    });

    test("applies 'fontSize-ReadingTime' to the caption", async ({ initTestBed, page }) => {
      const EXPECTED = "20px";
      await initTestBed(
        `<ReadingTime content="{'word '.repeat(200)}" wordsPerMinute="200" />`,
        { ...EXT, testThemeVars: { "fontSize-ReadingTime": EXPECTED } },
      );
      await expect(page.locator(".xmlui-reading-time")).toHaveCSS("font-size", EXPECTED);
    });
  });
});

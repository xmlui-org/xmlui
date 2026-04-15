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

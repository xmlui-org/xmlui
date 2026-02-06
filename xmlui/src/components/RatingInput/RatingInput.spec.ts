import { PART_INPUT } from "../../components-core/parts";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
  });

  test("renders default 5 stars", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput />`);
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByRole("button", { name: `Set rating to ${i}` })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Set rating to 6" })).not.toBeVisible();
  });

  test("sets initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="3" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("3", { timeout: 2000 });
  });

  test("clicking star updates value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await page.getByRole("button", { name: "Set rating to 4" }).click();
    await expect(page.getByTestId("value")).toHaveText("4");
  });

  test("maxRating renders correct number of stars", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput maxRating="10" />`);
    for (let i = 1; i <= 10; i++) {
      await expect(
        page.getByRole("button", { name: `Set rating to ${i}`, exact: true }),
      ).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Set rating to 11" })).not.toBeVisible();
  });

  test("placeholder visible when value empty", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput placeholder="Rate this" />`);
    await expect(page.getByText("Rate this")).toBeVisible();
  });

  test("placeholder hidden when value set", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput placeholder="Rate this" initialValue="1" />`);
    await expect(page.getByText("Rate this")).not.toBeVisible({ timeout: 2000 });
  });

  test("enabled=false disables interaction", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput testId="test" id="r" enabled="false" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    const container = page.locator(`[data-part-id='${PART_INPUT}']`);
    await expect(container).toHaveAttribute("aria-disabled", "true");
    await expect(container.getByRole("button", { name: "Set rating to 1", exact: true })).toBeDisabled();
  });

  test("readOnly prevents value change", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" readOnly="true" initialValue="2" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("2");
    const inputPart = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await inputPart.getByRole("button", { name: "Set rating to 5", exact: true }).click({ force: true });
    await expect(page.getByTestId("value")).toHaveText("2");
  });
});

// =============================================================================
// ACCESSIBILITY
// =============================================================================

test.describe("Accessibility", () => {
  test("each star has accessible name", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput maxRating="3" />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Set rating to 2" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Set rating to 3" })).toBeVisible();
  });
});

// =============================================================================
// API
// =============================================================================

test.describe("Api", () => {
  test("value reflects current rating", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="4" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("4");
  });

  test("setValue updates rating", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" />
        <Button testId="setBtn" onClick="r.setValue(5)" label="{r.value}" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("setBtn")).toHaveText("5");
  });
});

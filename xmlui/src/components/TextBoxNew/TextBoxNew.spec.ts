import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";



// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelPosition=start positions label before input", async ({ initTestBed, page }) => {
    await initTestBed(`<App><TextBoxNew direction="ltr" label="test" labelPosition="start" /></App>`);

    const { left: textboxLeft } = await getBounds(page.getByLabel("test"));
    const { right: labelRight } = await getBounds(page.getByText("test"));

    expect(labelRight).toBeLessThan(textboxLeft);
  });

  test("labelPosition=end positions label after input", async ({ initTestBed, page }) => {
    await initTestBed(`<App><TextBoxNew direction="ltr" label="test" labelPosition="end" /></App>`);

    const { right: textboxRight } = await getBounds(page.getByLabel("test"));
    const { left: labelLeft } = await getBounds(page.getByText("test"));

    expect(labelLeft).toBeGreaterThan(textboxRight);
  });

  test("labelPosition=top positions label above input", async ({ initTestBed, page }) => {
    await initTestBed(`<App><TextBoxNew label="test" labelPosition="top" /></App>`);

    const { top: textboxTop } = await getBounds(page.getByLabel("test"));
    const { bottom: labelBottom } = await getBounds(page.getByText("test"));

    expect(labelBottom).toBeLessThan(textboxTop);
  });

  test("labelPosition=bottom positions label below input", async ({ initTestBed, page }) => {
    await initTestBed(`<App><TextBoxNew label="test" labelPosition="bottom" /></App>`);

    const { bottom: textboxBottom } = await getBounds(page.getByLabel("test"));
    const { top: labelTop } = await getBounds(page.getByText("test"));

    expect(labelTop).toBeGreaterThan(textboxBottom);
  });

  test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
    const expected = 200;
    await initTestBed(`<App><TextBoxNew label="test test" labelWidth="${expected}px" /></App>`);
    const { width } = await getBounds(page.getByText("test test"));
    expect(width).toEqual(expected);
  });

  test("labelBreak enables label line breaks", async ({ initTestBed, page }) => {
    const labelText = "Very long label text that should break";
    const commonProps = `label="${labelText}" labelWidth="100px"`;
    await initTestBed(
      `<App>
          <TextBoxNew ${commonProps} testId="break" labelBreak="{true}" />
          <TextBoxNew ${commonProps} testId="oneLine" labelBreak="{false}" />
      </App>`,
    );
    const labelBreak = page.getByTestId("break").getByText(labelText);
    const labelOneLine = page.getByTestId("oneLine").getByText(labelText);
    const { height: heightBreak } = await getBounds(labelBreak);
    const { height: heightOneLine } = await getBounds(labelOneLine);

    expect(heightBreak).toBeGreaterThan(heightOneLine);
  });

  test("component handles invalid labelPosition gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<App><TextBoxNew labelPosition="invalid" label="test" /></App>`);
    await expect(page.getByLabel("test")).toBeVisible();
    await expect(page.getByText("test")).toBeVisible();
  });
});

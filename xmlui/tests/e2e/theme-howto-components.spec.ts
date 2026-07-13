import type { Locator } from "@playwright/test";

import { expect, test } from "../../src/testing/fixtures";

test.describe("component theme how-to compatibility", () => {
  test("button variant and color theming renders the how-to buttons and keeps them interactive", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.clicks="{0}">
        <VStack gap="12px">
          <Button
            testId="primary-solid"
            label="Primary solid"
            variant="solid"
            themeColor="primary"
            onClick="clicks++" />
          <Button
            testId="secondary-outlined"
            label="Secondary outlined"
            variant="outlined"
            themeColor="secondary"
            onClick="clicks++" />
          <Button
            testId="attention-ghost"
            label="Attention ghost"
            variant="ghost"
            themeColor="attention"
            onClick="clicks++" />
          <Text testId="clicks">Clicks: {clicks}</Text>
        </VStack>
      </App>
    `, {
      testThemeVars: {
        "backgroundColor-Button-primary-solid": "rgb(44, 123, 229)",
        "borderColor-Button-secondary-outlined": "rgb(18, 140, 126)",
        "borderWidth-Button-secondary-outlined": "2px",
        "textColor-Button-attention-ghost": "rgb(190, 24, 93)",
      },
    });

    await expect(page.getByRole("button", { name: "Primary solid" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Secondary outlined" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Attention ghost" })).toBeVisible();
    await expectRgbClose(page.getByTestId("primary-solid"), "background-color", "rgb(44, 123, 229)");
    await expect(page.getByTestId("secondary-outlined")).toHaveCSS("border-top-width", "2px");
    await expectRgbClose(page.getByTestId("attention-ghost"), "color", "rgb(190, 24, 93)");

    await page.getByRole("button", { name: "Primary solid" }).click();
    await page.getByRole("button", { name: "Secondary outlined" }).click();
    await page.getByRole("button", { name: "Attention ghost" }).click();
    await expect(page.getByTestId("clicks")).toContainText("Clicks: 3");
  });

  test("form input state theming renders default validation states and disabled input", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <VStack gap="12px" width="360px">
          <TextBox testId="default-input" label="Default input" initialValue="Ready" />
          <TextBox testId="error-input" label="Error state" validationStatus="error" initialValue="Fix me" />
          <TextBox testId="warning-input" label="Warning state" validationStatus="warning" initialValue="Review me" />
          <TextBox testId="success-input" label="Success state" validationStatus="valid" initialValue="Looks good" />
          <TextBox testId="disabled-input" label="Disabled input" enabled="false" initialValue="Cannot edit" />
        </VStack>
      </App>
    `, {
      testThemeVars: {
        "borderColor-TextBox--error": "rgb(220, 38, 38)",
        "borderColor-TextBox--warning": "rgb(217, 119, 6)",
        "borderColor-TextBox--success": "rgb(22, 163, 74)",
        "backgroundColor-TextBox--disabled": "rgb(243, 244, 246)",
      },
    });

    await expect(page.getByRole("textbox", { name: "Default input" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Disabled input" })).toBeDisabled();
    await expect(page.getByRole("textbox", { name: "Disabled input" })).toHaveValue("Cannot edit");
    await expectRgbClose(textboxRoot(page, "error-input"), "border-color", "rgb(220, 38, 38)");
    await expectRgbClose(textboxRoot(page, "warning-input"), "border-color", "rgb(217, 119, 6)");
    await expectRgbClose(textboxRoot(page, "success-input"), "border-color", "rgb(22, 163, 74)");

    await page.getByRole("textbox", { name: "Default input" }).fill("hello");
    await expect(page.getByRole("textbox", { name: "Default input" })).toHaveValue("hello");
  });

  test("badge shape and color theming renders rectangular and pill badges", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <VStack gap="12px">
          <Text>Rectangular badges:</Text>
          <HStack>
            <Badge testId="new-badge" value="New" />
            <Badge value="Beta" />
            <Badge value="Deprecated" />
          </HStack>
          <Text>Pill badges:</Text>
          <HStack>
            <Badge testId="active-pill" variant="pill" value="Active" />
            <Badge variant="pill" value="Online" />
            <Badge variant="pill" value="Verified" />
          </HStack>
        </VStack>
      </App>
    `, {
      testThemeVars: {
        "backgroundColor-Badge": "rgb(239, 246, 255)",
        "borderRadius-Badge-pill": "9999px",
        "backgroundColor-Badge-pill": "rgb(220, 252, 231)",
      },
    });

    await expect(page.getByText("Rectangular badges:")).toBeVisible();
    await expect(page.getByText("Pill badges:")).toBeVisible();
    await expect(page.getByText("Deprecated")).toBeVisible();
    await expect(page.getByText("Verified")).toBeVisible();
    await expectRgbClose(page.getByTestId("new-badge"), "background-color", "rgb(239, 246, 255)");
    await expect(page.getByTestId("active-pill")).toHaveCSS("border-radius", "9999px");
  });

  test("DatePicker calendar item theming opens both pickers and styles selected inline days", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <HStack gap="24px">
          <VStack>
            <Text>Default</Text>
            <DatePicker testId="default-date" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />
          </VStack>
          <VStack>
            <Text>Themed</Text>
            <DatePicker testId="themed-date" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />
          </VStack>
        </HStack>
        <DatePicker testId="inline-date" inline mode="single" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />
      </App>
    `, {
      testThemeVars: {
        "backgroundColor-day-DatePicker--selected": "rgb(50, 100, 200)",
        "textColor-day-DatePicker--selected": "rgb(255, 255, 255)",
      },
    });

    await expect(page.getByText("Default", { exact: true })).toBeVisible();
    await expect(page.getByText("Themed", { exact: true })).toBeVisible();
    await page.getByTestId("default-date").locator('[data-part="control"]').click({ position: { x: 6, y: 6 } });
    await expect.poll(() => page.locator('[data-part="table-header"]:visible').count()).toBeGreaterThan(0);
    await page.keyboard.press("Escape");
    await page.getByTestId("themed-date").locator('[data-part="control"]').click({ position: { x: 6, y: 6 } });
    await expect.poll(() => page.locator('[data-part="table-header"]:visible').count()).toBeGreaterThan(0);

    const selectedDay = page
      .getByTestId("inline-date")
      .locator('[data-part="table-cell-trigger"][data-view="day"][data-selected]')
      .first();
    await expectRgbClose(selectedDay, "background-color", "rgb(50, 100, 200)");
    await expectRgbClose(selectedDay, "color", "rgb(255, 255, 255)");
  });

  test("multi-level NavGroup theming preserves nested expansion and progressive padding", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <NavGroup testId="products" label="Products">
          <NavLink testId="overview" to="/products">Overview</NavLink>
          <NavGroup testId="catalog" label="Catalog">
            <NavGroup testId="accessories" label="Accessories">
              <NavLink testId="adapters" to="/products/accessories/adapters">Adapters</NavLink>
            </NavGroup>
          </NavGroup>
        </NavGroup>
      </App>
    `, {
      testThemeVars: {
        "paddingLeft-level1-NavGroup": "8px",
        "paddingLeft-level2-NavGroup": "32px",
        "paddingLeft-level3-NavGroup": "56px",
      },
    });

    await expect(page.getByText("Products", { exact: true })).toBeVisible();
    await expect(page.getByTestId("overview")).not.toBeVisible();
    await page.getByText("Products", { exact: true }).click();
    await page.getByText("Catalog", { exact: true }).click();
    await page.getByText("Accessories", { exact: true }).click();
    await expect(page.getByTestId("adapters")).toBeVisible();

    const productBox = await page.getByText("Products", { exact: true }).boundingBox();
    const catalogBox = await page.getByText("Catalog", { exact: true }).boundingBox();
    const accessoriesBox = await page.getByText("Accessories", { exact: true }).boundingBox();
    expect(productBox).not.toBeNull();
    expect(catalogBox).not.toBeNull();
    expect(accessoriesBox).not.toBeNull();
    expect(catalogBox!.x).toBeGreaterThan(productBox!.x);
    expect(accessoriesBox!.x).toBeGreaterThan(catalogBox!.x);
  });

  test("ExpandableItem transition theming keeps summary toggles functional", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <VStack gap="8px">
          <ExpandableItem testId="snappy" summary="What is XMLUI?">
            <Text>XMLUI is a declarative UI framework.</Text>
          </ExpandableItem>
          <ExpandableItem testId="relaxed" summary="How does theming work?">
            <Text>Themes provide scoped component variables.</Text>
          </ExpandableItem>
        </VStack>
      </App>
    `, {
      testThemeVars: {
        "backgroundColor-summary-ExpandableItem": "rgb(239, 246, 255)",
        "animationDuration-content-ExpandableItem": "1ms",
      },
    });

    await expect(page.getByText("What is XMLUI?")).toBeVisible();
    await expect(page.getByText("XMLUI is a declarative UI framework.")).not.toBeVisible();
    await expectRgbClose(
      page.getByTestId("snappy").locator('[data-part-id="summary"]'),
      "background-color",
      "rgb(239, 246, 255)",
    );
    await page.getByRole("button", { name: /What is XMLUI/ }).click();
    await expect(page.getByText("XMLUI is a declarative UI framework.")).toBeVisible();
  });

  test("Tooltip appearance theming renders all positioned examples and styled content", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <HStack gap="12px">
          <Tooltip defaultOpen="true" delayDuration="0" text="Appears above with arrow" side="top">
            <Button label="Top with arrow" />
          </Tooltip>
          <Tooltip delayDuration="0" text="Appears to the right with arrow" side="right">
            <Button label="Right with arrow" />
          </Tooltip>
          <Tooltip delayDuration="0" text="Appears below, no arrow" side="bottom" showArrow="false">
            <Button label="Bottom no arrow" />
          </Tooltip>
          <Tooltip delayDuration="0" text="Appears to the left with arrow" side="left">
            <Button label="Left with arrow" />
          </Tooltip>
        </HStack>
      </App>
    `, {
      testThemeVars: {
        "backgroundColor-Tooltip": "rgb(17, 24, 39)",
        "textColor-Tooltip": "rgb(255, 255, 255)",
        "borderRadius-Tooltip": "10px",
      },
    });

    await expect(page.getByRole("button", { name: "Top with arrow" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Right with arrow" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Bottom no arrow" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Left with arrow" })).toBeVisible();

    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toContainText("Appears above with arrow");
    await expectRgbClose(tooltip, "background-color", "rgb(17, 24, 39)");
    await expect(tooltip).toHaveCSS("border-radius", "10px");
  });

  test("Markdown admonition variants and NoResult placeholder theming render styled docs content", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <VStack gap="16px">
          <Markdown testId="markdown"><![CDATA[
:::info
This is an info note.
:::

:::warning
This is a warning.
:::

:::danger
This is a danger message.
:::

:::tip
This is a tip.
:::

> A standard blockquote for comparison.
          ]]></Markdown>
          <NoResult testId="empty" label="No results found" />
        </VStack>
      </App>
    `, {
      testThemeVars: {
        "backgroundColor-Markdown": "rgb(250, 250, 255)",
        "backgroundColor-NoResult": "rgb(250, 245, 255)",
        "size-icon-NoResult": "48px",
      },
    });

    await expect(page.getByText("This is an info note.")).toBeVisible();
    await expect(page.getByText("This is a warning.")).toBeVisible();
    await expect(page.getByText("This is a danger message.")).toBeVisible();
    await expect(page.getByText("This is a tip.")).toBeVisible();
    await expect(page.getByText("A standard blockquote for comparison.")).toBeVisible();
    await expect(page.getByText("No results found")).toBeVisible();
    await expectRgbClose(page.getByTestId("empty"), "background-color", "rgb(250, 245, 255)");
  });

  test("Slider track thumb and range theming renders default and themed enabled and disabled sliders", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <HStack gap="24px">
          <VStack>
            <Text>Default</Text>
            <Slider testId="default-volume" label="Volume" initialValue="30" />
            <Slider testId="default-disabled" label="Disabled" enabled="false" initialValue="30" />
          </VStack>
          <VStack>
            <Text>Themed</Text>
            <Slider testId="themed-volume" label="Volume" initialValue="70" />
            <Slider testId="themed-disabled" label="Disabled" enabled="false" initialValue="70" />
          </VStack>
        </HStack>
      </App>
    `, {
      testThemeVars: {
        "backgroundColor-track-Slider": "rgb(226, 232, 240)",
        "backgroundColor-range-Slider": "rgb(59, 130, 246)",
        "backgroundColor-thumb-Slider": "rgb(37, 99, 235)",
        "backgroundColor-track-Slider--disabled": "rgb(203, 213, 225)",
      },
    });

    await expect(page.getByText("Default", { exact: true })).toBeVisible();
    await expect(page.getByText("Themed", { exact: true })).toBeVisible();
    await expect(page.getByRole("slider")).toHaveCount(4);
    await expect(page.getByRole("slider").nth(1)).toBeDisabled();
    await expect(page.getByRole("slider").nth(3)).toBeDisabled();
    await expectRgbClose(page.getByTestId("themed-volume").locator("[data-range]"), "background-color", "rgb(59, 130, 246)");
    await expectRgbClose(page.getByTestId("themed-volume").getByRole("slider"), "background-color", "rgb(37, 99, 235)");
    await expectRgbClose(page.getByTestId("themed-disabled").locator("[data-track]"), "background-color", "rgb(203, 213, 225)");
  });
});

function textboxRoot(page: { locator: (selector: string) => Locator }, testId: string) {
  return page.locator(`[data-testid="${testId}"][data-xmlui-part="input"]`);
}

async function cssValue(locator: Locator, property: string): Promise<string> {
  return locator.evaluate((element, cssProperty) =>
    getComputedStyle(element).getPropertyValue(cssProperty),
  property);
}

async function expectRgbClose(
  locator: Locator,
  property: string,
  expected: string,
  tolerance = 3,
) {
  const actual = await cssValue(locator, property);
  const actualRgb = parseRgb(actual);
  const expectedRgb = parseRgb(expected);
  expect(actualRgb, `${property} should be an rgb color`).not.toBeNull();
  expect(expectedRgb, `${expected} should be an rgb color`).not.toBeNull();
  for (let index = 0; index < 3; index++) {
    expect(Math.abs(actualRgb![index] - expectedRgb![index])).toBeLessThanOrEqual(tolerance);
  }
}

function parseRgb(value: string): number[] | null {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

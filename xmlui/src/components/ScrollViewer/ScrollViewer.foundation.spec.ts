import { expect, test } from "../../testing/fixtures";

test.describe("ScrollViewer foundation", () => {
  test("renders scrollable content and header/footer templates", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" height="120px">
        <property name="headerTemplate">
          <Text testId="header">Header</Text>
        </property>
        <VStack gap="8px">
          <Text testId="row-1">Row 1</Text>
          <Text>Row 2</Text>
          <Text>Row 3</Text>
          <Text>Row 4</Text>
          <Text>Row 5</Text>
          <Text>Row 6</Text>
        </VStack>
        <property name="footerTemplate">
          <Text testId="footer">Footer</Text>
        </property>
      </ScrollViewer>
    `);

    const viewer = page.getByTestId("viewer");
    await expect(viewer).toBeVisible();
    await expect(page.getByTestId("header")).toHaveText("Header");
    await expect(page.getByTestId("footer")).toHaveText("Footer");
    await expect(page.getByTestId("row-1")).toBeVisible();
  });

  test("supports state updates inside scrollable content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" height="120px" var.count="{0}">
        <Button testId="increment" onClick="count++">Increment {count}</Button>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("increment")).toHaveText("Increment 0");
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("increment")).toHaveText("Increment 1");
  });

  test("plain scroller stretches to the app viewport despite an authored height", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 900, height: 700 });
    await initTestBed(`
      <App scrollWholePage="false">
        <ScrollViewer
          testId="viewer"
          scrollStyle="normal"
          height="300px"
          backgroundColor="$color-surface-100"
        >
          <Items
            id="myList"
            data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
          >
            <H3 value="{$item}" />
          </Items>
        </ScrollViewer>
      </App>
    `);

    const metrics = await page.getByTestId("viewer").evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));

    expect(metrics.height).toBeGreaterThan(500);
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  });

  test("overlay scroller shows fade shading while scrolling", async ({ initTestBed, page }) => {
    await page.setViewportSize({ width: 900, height: 700 });
    await initTestBed(`
      <App scrollWholePage="false">
        <ScrollViewer
          testId="viewer"
          scrollStyle="overlay"
          height="300px"
          backgroundColor="$color-surface-100"
        >
          <Items
            id="myList"
            data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
          >
            <H3 value="{$item}" />
          </Items>
        </ScrollViewer>
      </App>
    `);

    const bottomFade = page.locator("[class*='fadeBottom']");
    await expect(bottomFade).toHaveCount(1);
    await expect(bottomFade).toHaveClass(/fadeVisible/);

    const bottomFadeStyle = await bottomFade.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        backgroundImage: style.backgroundImage,
      };
    });
    expect(bottomFadeStyle.height).toBeGreaterThan(0);
    expect(bottomFadeStyle.backgroundImage).toContain("gradient");

    await page.getByTestId("viewer").evaluate((element) => {
      element.querySelector("[data-overlayscrollbars-viewport]")?.scrollTo(0, 80);
    });

    await expect(page.locator("[class*='fadeTop']")).toHaveClass(/fadeVisible/);
  });
});

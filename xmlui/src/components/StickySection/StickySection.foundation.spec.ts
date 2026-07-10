import { expect, test } from "../../testing/fixtures";

test.describe("Sticky foundation", () => {
  test("StickyBox renders migrated sticky content in a scroll container", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer height="180px" testId="scroller" showScrollerFade="false">
        <StickyBox testId="sticky-box" to="top">
          <Text testId="sticky-text">Sticky box</Text>
        </StickyBox>
        <Stack height="420px" />
      </ScrollViewer>
    `);

    await expect(page.getByTestId("sticky-box")).toBeVisible();
    await expect(page.getByTestId("sticky-text")).toHaveText("Sticky box");
  });

  test("StickySection supports top and bottom stick targets", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer height="180px" testId="scroller" showScrollerFade="false">
        <StickySection testId="top-section" stickTo="top">Top</StickySection>
        <Stack height="240px" />
        <StickySection testId="bottom-section" stickTo="bottom">Bottom</StickySection>
        <Stack height="240px" />
      </ScrollViewer>
    `);

    await expect(page.getByTestId("top-section")).toHaveCSS("position", "sticky");
    await expect(page.getByTestId("top-section")).toHaveCSS("top", "0px");
    await expect(page.getByTestId("bottom-section")).toHaveCSS("position", "sticky");
    await expect(page.getByTestId("bottom-section")).toHaveCSS("bottom", "0px");
  });

  test("sticky content can mutate XMLUI state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer height="180px" var.count="{0}" showScrollerFade="false">
        <StickySection stickTo="top">
          <Button testId="increment" onClick="count++">Increment</Button>
        </StickySection>
        <Stack height="300px" />
        <Text testId="value">Count: {count}</Text>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("value")).toContainText("Count: 0");
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("value")).toContainText("Count: 1");
  });

  test("nested Items after sticky headers keep their row boxes in flow", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <ScrollViewer backgroundColor="lightyellow" showScrollerFade="false">
          <Items data="{[1,2,3,4,5]}">
            <StickySection
              stickTo="top"
              backgroundColor="lightgreen"
              testId="header-{$item}"
            >
              <H2>Item #{$item}</H2>
            </StickySection>
            <Items data="{[1,2,3,4,5]}">
              <Stack
                height="30px"
                backgroundColor="lightyellow"
                testId="row-{$itemIndex}"
              >
                <H4>
                  Nested #{$item}
                </H4>
              </Stack>
            </Items>
          </Items>
        </ScrollViewer>
      </App>
    `);

    const headerBox = await page.getByTestId("header-1").boundingBox();
    const firstRowBox = await page.getByTestId("row-0").first().boundingBox();
    expect(headerBox).not.toBeNull();
    expect(firstRowBox).not.toBeNull();
    expect(firstRowBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);
    expect(firstRowBox!.height).toBeCloseTo(30, 0);
  });
});

import { expect, test } from "../../testing/fixtures";

test.describe("Sticky foundation", () => {
  test("StickyBox renders with native sticky positioning", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer height="180px" testId="scroller" showScrollerFade="false">
        <StickyBox testId="sticky-box" to="top">
          <Text>Sticky box</Text>
        </StickyBox>
        <Stack height="420px" />
      </ScrollViewer>
    `);

    await expect(page.getByTestId("sticky-box")).toHaveCSS("position", "sticky");
    await expect(page.getByTestId("sticky-box")).toHaveCSS("top", "0px");
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
});

import { expect, test } from "../src/testing/fixtures";

test("debug style cascade", async ({ initTestBed, page }) => {
  await initTestBed(
    `<App>
      <Stack width="200px" height="80px" backgroundColor="purple" color="white" testId="box">
        <H3 testId="heading">Hello</H3>
      </Stack>
    </App>`,
    { appGlobals: { applyLayoutProperties: "all" } },
  );

  const heading = page.getByTestId("heading");
  await expect(heading).toBeVisible();

  const debugInfo = await page.evaluate(() => {
    const h3 = document.querySelector("[data-testid=heading]") as HTMLElement;
    const box = document.querySelector("[data-testid=box]") as HTMLElement;
    const htmlEl = document.documentElement;
    const h3Var = window.getComputedStyle(h3).getPropertyValue("--xmlui-textColor-H3");
    const htmlVar = window.getComputedStyle(htmlEl).getPropertyValue("--xmlui-textColor-H3");
    return {
      h3Color: window.getComputedStyle(h3).color,
      h3Classes: h3.className,
      boxColor: window.getComputedStyle(box).color,
      boxBg: window.getComputedStyle(box).backgroundColor,
      boxClasses: box.className,
      hasBaseTag: !!document.head.querySelector("#xmlui-base-styles"),
      styleCount: document.head.querySelectorAll("style").length,
      h3TextColorVar: h3Var,
      htmlTextColorVar: htmlVar,
      htmlClasses: htmlEl.className,
    };
  });

  console.log("DEBUG_OUT " + JSON.stringify(debugInfo));
  expect(debugInfo.h3Color).toBe("rgb(255, 255, 255)");
});

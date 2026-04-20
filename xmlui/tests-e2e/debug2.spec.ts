import { expect, test } from "../src/testing/fixtures";

test("debug base styles", async ({ initTestBed, page }) => {
  await initTestBed(
    `<App><Text testId="t">hello</Text></App>`,
  );
  await expect(page.getByTestId("t")).toBeVisible();

  const info = await page.evaluate(() => {
    const baseTag = document.head.querySelector("#xmlui-base-styles");
    const content = baseTag ? baseTag.textContent : "NO-BASE-TAG";
    return {
      hasBaseTag: !!baseTag,
      length: content.length,
      hasTextColor: content.includes("textColor"),
      hasLayer: content.includes("@layer"),
      first300: content.substring(0, 300),
    };
  });

  console.log("BASE_INFO " + JSON.stringify(info));
  expect(info.hasBaseTag).toBe(true);
});

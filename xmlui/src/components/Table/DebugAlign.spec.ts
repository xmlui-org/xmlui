import { test, expect } from "../../testing/fixtures";

test("measure header vs cell alignment with maxWidth", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Table data='{[
      {name:"Apples",quantity:5,unit:"pieces"},
      {name:"Bananas",quantity:6,unit:"pieces"},
      {name:"Carrots",quantity:100,unit:"grams"}
    ]}' testId="table">
      <Column bindTo="name" maxWidth="$space-12"/>
      <Column bindTo="quantity"/>
      <Column bindTo="unit"/>
    </Table>
  `);

  await page.getByTestId("table").waitFor({ state: "visible" });
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll("thead th")).map((el) => {
      const cs = getComputedStyle(el);
      return {
        text: el.textContent?.trim(),
        width: el.getBoundingClientRect().width,
        styleWidth: (el as HTMLElement).style.width,
        computedWidth: cs.width,
        computedBoxSizing: cs.boxSizing,
        computedPaddingLeft: cs.paddingLeft,
        computedPaddingRight: cs.paddingRight,
        computedFlexShrink: cs.flexShrink,
      };
    });
    const firstRow = document.querySelector("tbody tr");
    const tds = firstRow
      ? Array.from(firstRow.querySelectorAll("td")).map((el) => {
          const cs = getComputedStyle(el);
          return {
            text: el.textContent?.trim(),
            width: el.getBoundingClientRect().width,
            left: el.getBoundingClientRect().left,
            styleWidth: (el as HTMLElement).style.width,
            computedWidth: cs.width,
            computedBoxSizing: cs.boxSizing,
            computedPaddingLeft: cs.paddingLeft,
            computedPaddingRight: cs.paddingRight,
            computedBorderLeft: cs.borderLeftWidth,
            computedBorderRight: cs.borderRightWidth,
            computedFlexShrink: cs.flexShrink,
            cssVarColumnWidth: cs.getPropertyValue("--column-width"),
          };
        })
      : [];
    return { ths, tds };
  });

  console.log("HEADER: " + JSON.stringify(info.ths));
  console.log("DATA:   " + JSON.stringify(info.tds));
  expect(info.ths).toHaveLength(3);
});

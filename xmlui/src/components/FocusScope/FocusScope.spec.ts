import { expect, test } from "../../testing/fixtures";

test.describe("FocusScope", () => {
  async function deepActiveText(page: any) {
    return page.evaluate(() => {
      let active = document.activeElement;
      while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement;
      }
      return (
        active?.textContent?.trim() ||
        active?.getAttribute("aria-label") ||
        (active instanceof HTMLInputElement ? active.value : "")
      );
    });
  }

  test("traps Tab navigation inside the scope", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <FocusScope>
          <Button label="First" />
          <Button label="Second" />
        </FocusScope>
        <Button label="Outside" />
      </Fragment>
    `);

    const first = page.getByRole("button", { name: "First" });
    const second = page.getByRole("button", { name: "Second" });

    await first.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(second).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
  });

  test("traps focus in the active sibling scope", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <FocusScope>
          <Button label="First A" />
          <Button label="Second A" />
        </FocusScope>
        <FocusScope>
          <Button label="First B" />
          <Button label="Second B" />
        </FocusScope>
        <Button label="Outside" />
      </Fragment>
    `);

    await page.getByRole("button", { name: "Second A" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "First A" })).toBeFocused();

    await page.getByRole("button", { name: "First B" }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Second B" })).toBeFocused();
  });

  test("traps focus inside an xmlui-pg nested app", async ({ page, initTestBed }) => {
    test.fixme(true, "Blocked until the Markdown/xmlui-pg component migration is completed.");
    const source = [
      "```xmlui-pg copy display height=\"320px\" name=\"Example: trap focus in a panel\"",
      "<App>",
      "  <VStack gap=\"$space-4\">",
      "    <FocusScope>",
      "      <VStack padding=\"$space-4\" gap=\"$space-3\" border=\"1px solid $borderColor\">",
      "        <H3>Edit status</H3>",
      "        <Select initialValue=\"open\">",
      "          <Option value=\"open\" label=\"Open\" />",
      "          <Option value=\"closed\" label=\"Closed\" />",
      "        </Select>",
      "        <HStack>",
      "          <Button label=\"Cancel\" />",
      "          <Button label=\"Save\" />",
      "        </HStack>",
      "      </VStack>",
      "    </FocusScope>",
      "",
      "    <Button label=\"Outside scope\" />",
      "  </VStack>",
      "</App>",
      "```",
    ].join("\n");

    await initTestBed(`<Markdown><![CDATA[${source}]]></Markdown>`);

    await page.getByRole("button", { name: "Save" }).focus();
    await page.keyboard.press("Tab");
    await expect.poll(() => deepActiveText(page)).toBe("Open");
    await page.keyboard.press("Shift+Tab");
    await expect.poll(() => deepActiveText(page)).toBe("Save");
  });

  test("does not trap when trap is false", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <FocusScope trap="false">
          <Button label="First" />
          <Button label="Second" />
        </FocusScope>
        <Button label="Outside" />
      </Fragment>
    `);

    await page.getByRole("button", { name: "Second" }).focus();
    await page.keyboard.press("Tab");

    await expect(page.getByRole("button", { name: "Outside" })).toBeFocused();
  });

  test("restores focus when the scope unmounts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.open="{false}">
        <Button label="Open" onClick="open = true" />
        <FocusScope when="{open}" restore="true">
          <Button label="Close" onClick="open = false" />
        </FocusScope>
      </Fragment>
    `);

    const open = page.getByRole("button", { name: "Open" });
    await open.click();
    await page.getByRole("button", { name: "Close" }).click();

    await expect(open).toBeFocused();
  });
});

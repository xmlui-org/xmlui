import { expect, test } from "../../testing/fixtures";

test.describe("RadioGroup - compatibility", () => {
  test("selected options use original validation border colors", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack>
        <RadioGroup initialValue="first" validationStatus="error">
          <Option label="First Item" value="first" />
          <Option label="Second Item" value="second" />
        </RadioGroup>
        <RadioGroup initialValue="first" validationStatus="warning">
          <Option label="First Item" value="first" />
          <Option label="Second Item" value="second" />
        </RadioGroup>
        <RadioGroup initialValue="first" validationStatus="valid">
          <Option label="First Item" value="first" />
          <Option label="Second Item" value="second" />
        </RadioGroup>
      </HStack>
    `);

    const radios = page.getByRole("radio");

    await expect(radios.nth(0)).toHaveCSS("border-top-color", "rgb(245, 0, 16)");
    await expect(radios.nth(0)).toHaveCSS("border-top-width", "2px");
    await expect(radios.nth(1)).toHaveCSS("border-top-color", "rgb(199, 214, 225)");

    await expect(radios.nth(2)).toHaveCSS("border-top-color", "rgb(218, 127, 0)");
    await expect(radios.nth(2)).toHaveCSS("border-top-width", "2px");
    await expect(radios.nth(3)).toHaveCSS("border-top-color", "rgb(199, 214, 225)");

    await expect(radios.nth(4)).toHaveCSS("border-top-color", "rgb(86, 211, 106)");
    await expect(radios.nth(4)).toHaveCSS("border-top-width", "2px");
    await expect(radios.nth(5)).toHaveCSS("border-top-color", "rgb(199, 214, 225)");
  });

  test("disabled options use the original border color when options are wrapped", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup initialValue="first" enabled="false">
        <HStack padding="$space-normal">
          <Option label="First Item" value="first" />
          <Option label="Second Item" value="second" />
          <Option label="Third Item" value="third" />
        </HStack>
      </RadioGroup>
    `);

    const radios = await page.getByRole("radiogroup").getByRole("radio").all();
    expect(radios).toHaveLength(3);

    for (const radio of radios) {
      await expect(radio).toHaveCSS("border-top-color", "rgb(199, 214, 225)");
    }
  });
});

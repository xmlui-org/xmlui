import { expect, test } from "./fixtures";
import { initApp } from "./component-test-helpers";

test("display selected emoticon", async ({ page }) => {
  const EXPECTED_EMOTICON = "😀";
  await initApp(page, {
    entryPoint: `
      <HStack var.selected="" gap="1rem">
        <EmojiSelector onSelect="(emoji) => { selected = emoji }" />
        <Text testId="text" value="Selected emoji: {selected}" />
      </HStack>`,
  });

  await page.getByText(EXPECTED_EMOTICON).click();
  await expect(page.getByTestId("text")).toContainText(EXPECTED_EMOTICON);
});

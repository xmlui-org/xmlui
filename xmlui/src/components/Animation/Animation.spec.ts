import { expect, test } from "../../testing/fixtures";

test.describe("Animation behavior", () => {
  test("preset animation styles the rendered component without hiding it permanently", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Button
        testId="animated"
        animation="fadeIn"
        animationOptions="duration: 120; delay: 5"
      >
        Animated
      </Button>
    `);

    const button = page.getByTestId("animated");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("data-xmlui-behavior", "animation");
    await expect(button).toHaveCSS("transition-delay", "0.005s");
    await expect
      .poll(() => button.evaluate((element) => getComputedStyle(element).opacity))
      .toBe("1");
  });

  test("reverse option applies the preset target as the initial visual direction", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Text
        testId="animated"
        animation="slideIn"
        animationOptions="reverse; duration: 100"
      >
        Animated text
      </Text>
    `);

    const text = page.getByTestId("animated");
    await expect(text).toBeVisible();
    await expect(text).toHaveAttribute("data-xmlui-behavior", "animation");
    await expect(text).toHaveCSS("transition-duration", "0.1s");
  });
});

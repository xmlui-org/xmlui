import { expect, test } from "../../testing/fixtures";

test.describe("Animation behavior", () => {
  test("preset animation keeps the rendered component visible", async ({
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
    await expect
      .poll(() => button.evaluate((element) => getComputedStyle(element).opacity))
      .toBe("1");
  });

  test("option string attaches animation behavior to the rendered component", async ({
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
  });
});

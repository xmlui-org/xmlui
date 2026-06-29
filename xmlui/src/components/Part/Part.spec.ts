import { expect, test } from "../../testing/fixtures";

test.describe("Part", () => {
  test("marks a single child as a named part without adding a wrapper", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <HStack testId="row">
        <Part partId="custom">
          <Text testId="marked">Marked</Text>
        </Part>
        <Text testId="next">Next</Text>
      </HStack>
    `);

    const marked = page.getByTestId("marked");
    const next = page.getByTestId("next");

    await expect(marked).toHaveAttribute("data-part-id", "custom");
    await expect(marked).toHaveAttribute("data-xmlui-part", "custom");
    await expect
      .poll(async () =>
        marked.evaluate((element) => {
          const next = document.querySelector('[data-testid="next"]');
          return element.parentElement === next?.parentElement;
        }),
      )
      .toBe(true);
  });

  test("does not mark children when partId is missing", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Part>
        <Text testId="plain">Plain</Text>
      </Part>
    `);

    const plain = page.getByTestId("plain");
    await expect(plain).not.toHaveAttribute("data-part-id", "custom");
    await expect(plain).toHaveAttribute("data-xmlui-part", "root");
  });

  test("renders multiple children without a wrapper", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack>
        <Part partId="ignored">
          <Text testId="first">First</Text>
          <Text testId="second">Second</Text>
        </Part>
      </HStack>
    `);

    const first = page.getByTestId("first");
    const second = page.getByTestId("second");

    await expect(first).not.toHaveAttribute("data-part-id", "ignored");
    await expect(second).not.toHaveAttribute("data-part-id", "ignored");
    await expect
      .poll(async () =>
        first.evaluate((element) => {
          const second = document.querySelector('[data-testid="second"]');
          return element.parentElement === second?.parentElement;
        }),
      )
      .toBe(true);
  });
});

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
});

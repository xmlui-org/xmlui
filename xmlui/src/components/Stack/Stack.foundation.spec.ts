import { expect, test } from "../../testing/fixtures";

test.describe("Stack family foundation", () => {
  test("Stack lays out children vertically by default and supports reactive reverse", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.reverse="{false}">
        <Stack testId="stack" reverse="{reverse}" gap="12px">
          <Text testId="first">First</Text>
          <Text testId="second">Second</Text>
          <Button testId="toggle" onClick="reverse = !reverse">Toggle</Button>
        </Stack>
      </App>
    `);

    const stack = page.getByTestId("stack");
    await expect(stack).toHaveCSS("flex-direction", "column");
    await expect(stack).toHaveCSS("gap", "12px");

    await page.getByTestId("toggle").click();
    await expect(stack).toHaveCSS("flex-direction", "column-reverse");
  });

  test("HStack and VStack force their specialized orientations", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <HStack testId="row" gap="8px">
          <Text>A</Text>
          <Text>B</Text>
        </HStack>
        <VStack testId="column" gap="10px">
          <Text>A</Text>
          <Text>B</Text>
        </VStack>
      </App>
    `);

    await expect(page.getByTestId("row")).toHaveCSS("flex-direction", "row");
    await expect(page.getByTestId("row")).toHaveCSS("gap", "8px");
    await expect(page.getByTestId("column")).toHaveCSS("flex-direction", "column");
    await expect(page.getByTestId("column")).toHaveCSS("gap", "10px");
  });

  test("implicit vertical Stack keeps verticalAlignment on the main axis", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Stack testId="stack" height="100px" verticalAlignment="end" backgroundColor="cyan">
          <Stack testId="box" width="36px" height="36px" backgroundColor="red" />
        </Stack>
      </App>
    `);

    const stackBox = await page.getByTestId("stack").boundingBox();
    const box = await page.getByTestId("box").boundingBox();
    expect(box?.x).toBe(stackBox?.x);
    expect(box?.y).toBe((stackBox?.y ?? 0) + (stackBox?.height ?? 0) - (box?.height ?? 0));
  });
});

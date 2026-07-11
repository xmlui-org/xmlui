import { expect, test } from "../../testing/fixtures";

test("App keeps verticalAlignment on the vertical axis", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App verticalAlignment="center">
      <Text testId="content">Content</Text>
    </App>
  `);

  const app = page.locator('[data-xmlui-component="App"]').first();
  await expect(app).toHaveCSS("flex-direction", "column");
  await expect(app).toHaveCSS("justify-content", "center");
  await expect(app).not.toHaveCSS("align-items", "center");
});

test("nested App reuses the existing router", async ({ initTestBed, page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await initTestBed(`
    <App>
      <App>
        <ColorPicker
          id="colorPicker"
          testId="color"
          label="Select your favorite color"
          initialValue="#808080" />
        <HStack>
          <Button
            label="Set to red"
            testId="red"
            onClick="colorPicker.setValue('#ff0000')" />
          <Button
            label="Set to green"
            onClick="colorPicker.setValue('#00c000')" />
          <Button
            label="Set to blue"
            onClick="colorPicker.setValue('#0000ff')" />
        </HStack>
      </App>
    </App>
  `);

  const colorInput = page.getByTestId("color").locator('input[type="color"]');
  await expect(colorInput).toHaveValue("#808080");
  await page.getByTestId("red").click();
  await expect(colorInput).toHaveValue("#ff0000");
  expect(pageErrors.some((message) => message.includes("You cannot render a <Router> inside another <Router>"))).toBe(false);
});

test("ToneSwitch updates the App shell background for dark tone", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <AppHeader>
        <SpaceFiller />
        <ToneSwitch />
      </AppHeader>
      <Card
        title="Tone Switch"
        subtitle="Toggle the switch to change the tone."
      />
    </App>
  `);

  await page.locator('input[role="switch"]').click({ force: true });

  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(23, 35, 43)");
  await expect(page.locator('[class*="pagesContainer"]').first()).toHaveCSS(
    "background-color",
    "rgb(23, 35, 43)",
  );
});

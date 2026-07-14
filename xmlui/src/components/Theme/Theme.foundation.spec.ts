import { expect, test } from "../../testing/fixtures";

test.describe("Theme foundation", () => {
  test("scopes theme variables to nested components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme textColor-Text="rgb(10, 20, 30)">
        <Text testId="inside">Inside</Text>
      </Theme>
      <Text testId="outside">Outside</Text>
    `);

    await expect(page.getByTestId("inside")).toHaveCSS("color", "rgb(10, 20, 30)");
    await expect(page.getByTestId("outside")).not.toHaveCSS("color", "rgb(10, 20, 30)");
  });

  test("marks scoped tone on the wrapper", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme tone="dark">
        <Text testId="inside">Inside</Text>
      </Theme>
    `);

    await expect(page.locator('[class*="themeWrapper"]').last()).toHaveCSS("color-scheme", "dark");
  });

  test("does not apply theme variables or wrapper when applyIf is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme textColor-Text="rgb(255, 0, 0)" applyIf="false">
        <Text testId="inside">Inside</Text>
      </Theme>
    `);

    await expect(page.getByTestId("inside")).toBeVisible();
    await expect(page.getByTestId("inside")).not.toHaveCSS("color", "rgb(255, 0, 0)");
  });

  test("does not insert a wrapper for an empty no-op Theme", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack testId="row">
        <Theme>
          <Text testId="inside">Inside</Text>
        </Theme>
        <Text testId="sibling">Sibling</Text>
      </HStack>
    `);

    await expect(page.locator('[data-xmlui-component="Theme"]')).toHaveCount(0);
    await expect
      .poll(async () =>
        page.getByTestId("inside").evaluate((element) => {
          const sibling = document.querySelector('[data-testid="sibling"]');
          return element.parentElement === sibling?.parentElement;
        }),
      )
      .toBe(true);
  });

  test("reacts to dynamic applyIf changes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.applyTheme="{false}">
        <Button testId="toggle" onClick="applyTheme = !applyTheme">Toggle</Button>
        <Theme textColor-Text="rgb(255, 0, 0)" applyIf="{applyTheme}">
          <Text testId="inside">Inside</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("inside")).not.toHaveCSS("color", "rgb(255, 0, 0)");
    await page.getByTestId("toggle").click();
    await expect(page.getByTestId("inside")).toHaveCSS("color", "rgb(255, 0, 0)");
  });

  test("keeps themed children in the parent stack layout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <HStack>
          <Theme width-Button="120px">
            <Button label="Short" testId="short" />
            <Button label="Longer" testId="longer" />
            <Button label="Longest" testId="longest" />
            <Button label="Disabled" enabled="false" testId="disabled" />
            <Button label="Outlined" variant="outlined" testId="outlined" />
          </Theme>
        </HStack>
      </App>
    `);

    await expect(page.locator('[class*="themeWrapper"]').last()).toHaveCSS("display", "contents");

    const boxes = await Promise.all(
      ["short", "longer", "longest", "disabled", "outlined"].map(async (testId) => {
        const box = await page.getByTestId(testId).boundingBox();
        if (!box) {
          throw new Error(`Missing button ${testId}`);
        }
        return box;
      }),
    );
    const firstY = boxes[0].y;
    for (const box of boxes) {
      expect(Math.abs(box.y - firstY)).toBeLessThan(1);
      expect(Math.round(box.width)).toBe(120);
    }
  });

  test("scoped dark tone applies semantic background aliases with component overrides", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Theme
          tone="dark"
          backgroundColor-ProgressBar="cyan"
          color-indicator-ProgressBar="purple"
          thickness-ProgressBar="12px"
          borderRadius-indicator-ProgressBar="12px"
          borderRadius-Progressbar="4px"
        >
          <VStack testId="stack" backgroundColor="$backgroundColor-primary">
            <ProgressBar testId="p0" value="0"/>
            <ProgressBar testId="p20" value="0.2"/>
            <ProgressBar testId="p60" value="0.6"/>
            <ProgressBar testId="p100" value="1.0"/>
          </VStack>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("stack")).toHaveCSS("background-color", "rgb(23, 35, 43)");
    await expect(page.getByTestId("p20")).toHaveCSS("background-color", "rgb(0, 255, 255)");
    await expect(page.getByTestId("p20").locator('[role="progressbar"]')).toHaveCSS(
      "background-color",
      "rgb(128, 0, 128)",
    );
    await expect(page.getByTestId("p100").locator('[role="progressbar"]')).toHaveCSS(
      "background-color",
      "rgb(144, 226, 157)",
    );
  });

  test("applyIf controls hierarchical Button theme overrides", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.apply="{false}">
        <Theme backgroundColor-Button="rgb(255, 100, 100)" applyIf="true">
          <VStack>
            <H3>Theme Applied (applyIf="true"):</H3>
            <Button testId="always-themed">Themed Button</Button>
          </VStack>
        </Theme>
        <Theme backgroundColor-Button="rgb(255, 100, 100)" applyIf="false">
          <VStack>
            <H3>Theme Not Applied (applyIf="false"):</H3>
            <Button testId="never-themed">Default Button</Button>
          </VStack>
        </Theme>
        <Theme backgroundColor-Button="rgb(100, 192, 100)" applyIf="{apply}">
          <VStack>
            <H3>Conditional Theme (dynamic):</H3>
            <Button testId="dynamic" onClick="apply = !apply">
              {apply ? 'Themed' : 'Default'} - Click to Toggle
            </Button>
          </VStack>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("always-themed")).toHaveCSS(
      "background-color",
      "rgb(255, 100, 100)",
    );
    await expect(page.getByTestId("never-themed")).not.toHaveCSS(
      "background-color",
      "rgb(255, 100, 100)",
    );
    await expect(page.getByTestId("dynamic")).not.toHaveCSS(
      "background-color",
      "rgb(100, 192, 100)",
    );

    await page.getByTestId("dynamic").click();

    await expect(page.getByTestId("dynamic")).toHaveText("Themed - Click to Toggle");
    await expect(page.getByTestId("dynamic")).toHaveCSS(
      "background-color",
      "rgb(100, 192, 100)",
    );
  });

  test("themeId can select built-in XMLUI theme variants", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Theme themeId="xmlui">
          <VStack testId="xmlui-stack" backgroundColor="$backgroundColor-primary">
            <H3>Use 'xmlui' theme:</H3>
            <ProgressBar testId="xmlui-progress" value="0.6"/>
          </VStack>
        </Theme>
        <Theme themeId="xmlui-green">
          <VStack testId="green-stack" backgroundColor="$backgroundColor-primary">
            <H3>Use 'xmlui-green' theme:</H3>
            <ProgressBar testId="green-progress" value="0.6"/>
          </VStack>
        </Theme>
        <Theme themeId="xmlui-red">
          <VStack testId="red-stack" backgroundColor="$backgroundColor-primary">
            <H3>Use the 'xmlui-red' theme:</H3>
            <ProgressBar testId="red-progress" value="0.6"/>
          </VStack>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("xmlui-stack")).toBeVisible();
    await expect(page.getByTestId("green-stack")).toBeVisible();
    await expect(page.getByTestId("red-stack")).toBeVisible();

    const indicatorColors = await Promise.all(
      ["xmlui-progress", "green-progress", "red-progress"].map((testId) =>
        page.getByTestId(testId).locator('[role="progressbar"]').evaluate((element) =>
          getComputedStyle(element).backgroundColor,
        ),
      ),
    );

    expect(new Set(indicatorColors).size).toBe(3);
  });

  test("dynamic themeId updates the scoped theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.themeId="{'xmlui-green'}">
        <Button testId="toggle" onClick="themeId = themeId === 'xmlui-green' ? 'xmlui-red' : 'xmlui-green'">Toggle</Button>
        <Theme themeId="{themeId}">
          <ProgressBar testId="progress" value="0.6" />
        </Theme>
      </App>
    `);

    const indicator = page.getByTestId("progress").locator('[role="progressbar"]');
    const initialColor = await indicator.evaluate((element) =>
      getComputedStyle(element).backgroundColor,
    );

    await page.getByTestId("toggle").click();

    await expect
      .poll(() => indicator.evaluate((element) => getComputedStyle(element).backgroundColor))
      .not.toBe(initialColor);
  });

  test("dynamic tone updates the scoped wrapper color scheme", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tone="{'light'}">
        <Button testId="toggle" onClick="tone = tone === 'light' ? 'dark' : 'light'">Toggle</Button>
        <Theme tone="{tone}">
          <Text testId="inside">Inside</Text>
        </Theme>
      </App>
    `);

    const wrapper = page.locator('[class*="themeWrapper"]').last();
    await expect(wrapper).toHaveCSS("color-scheme", "light");

    await page.getByTestId("toggle").click();

    await expect(wrapper).toHaveCSS("color-scheme", "dark");
  });

  test("dynamic theme variables update scoped runtime component styles", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.color="{'rgb(20, 40, 60)'}">
        <Button testId="toggle" onClick="color = 'rgb(120, 40, 20)'">Toggle</Button>
        <Theme textColor-Text="{color}">
          <Text testId="inside">Inside</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("inside")).toHaveCSS("color", "rgb(20, 40, 60)");

    await page.getByTestId("toggle").click();

    await expect(page.getByTestId("inside")).toHaveCSS("color", "rgb(120, 40, 20)");
  });

  test("disableInlineStyle inherits through scoped Theme and can be overridden", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Theme disableInlineStyle="true">
          <Text testId="disabled" color="rgb(255, 0, 0)">Disabled inline color</Text>
          <Theme disableInlineStyle="false">
            <Text testId="enabled" color="rgb(0, 128, 0)">Enabled inline color</Text>
          </Theme>
        </Theme>
      </App>
    `);

    const disabledInlineStyle = await page.getByTestId("disabled").getAttribute("style");
    const enabledInlineStyle = await page.getByTestId("enabled").getAttribute("style");
    expect(disabledInlineStyle ?? "").not.toContain("color");
    expect(enabledInlineStyle ?? "").toContain("color");
  });
});

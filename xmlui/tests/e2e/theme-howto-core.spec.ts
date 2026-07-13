import type { Locator } from "@playwright/test";

import { expect, test } from "../../src/testing/fixtures";

test.describe("core theme how-to compatibility", () => {
  test("custom color theme scopes generated palette tokens", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <VStack gap="12px">
          <H3>Custom warm palette</H3>
          <Theme
            color-primary="#d35400"
            color-secondary="#16a085"
            color-surface="#fdf6ec">
            <VStack
              testId="warm-section"
              padding="12px"
              gap="8px"
              backgroundColor="$backgroundColor-primary">
              <Text testId="warm-primary" color="$color-primary">Warm primary</Text>
              <Text testId="warm-secondary" color="$color-secondary">Warm secondary</Text>
              <HStack>
                <Button label="Solid primary" variant="solid" themeColor="primary" />
                <Button label="Outlined secondary" variant="outlined" themeColor="secondary" />
              </HStack>
              <HStack>
                <Badge value="Active" />
                <Badge value="Archived" variant="pill" />
              </HStack>
              <ProgressBar value="0.65" />
              <HStack>
                <Checkbox initialValue="{true}" label="Agree to terms" labelPosition="start" />
                <Switch initialValue="{true}" label="Notifications" labelPosition="start" />
              </HStack>
              <HStack>
                <Text value="Success" color="$color-success" />
                <Text value="Warning" color="$color-warn" />
                <Text value="Danger" color="$color-danger" />
              </HStack>
            </VStack>
          </Theme>

          <H3>Built-in green variant</H3>
          <Theme themeId="xmlui-green">
            <VStack testId="green-section" padding="12px" backgroundColor="$backgroundColor-primary">
              <Text testId="green-primary" color="$color-primary">Green primary</Text>
              <Button label="Green primary button" variant="solid" themeColor="primary" />
            </VStack>
          </Theme>
        </VStack>
      </App>
    `);

    await expect(page.getByText("Custom warm palette")).toBeVisible();
    await expect(page.getByText("Built-in green variant")).toBeVisible();
    await expect(page.getByRole("button", { name: "Solid primary" })).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
    await expect(page.getByText("Success")).toBeVisible();

    await expectRgbClose(page.getByTestId("warm-primary"), "color", "rgb(211, 84, 0)");
    await expectRgbClose(page.getByTestId("warm-secondary"), "color", "rgb(22, 160, 133)");
    await expectRgbClose(page.getByTestId("warm-section"), "background-color", "rgb(253, 246, 236)", 16);

    const warmPrimary = await cssValue(page.getByTestId("warm-primary"), "color");
    const greenPrimary = await cssValue(page.getByTestId("green-primary"), "color");
    expect(greenPrimary).not.toBe(warmPrimary);
  });

  test("component-scoped theme vars affect only descendant cards and buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <VStack gap="16px">
          <H3>Default Cards</H3>
          <Card testId="default-card" title="Revenue">
            <Text>$12,400 this month</Text>
          </Card>

          <H3>Restyled Cards</H3>
          <Theme
            backgroundColor-Card="$color-primary-50"
            borderRadius-Card="16px"
            borderColor-Card="$color-primary-300"
            borderWidth-Card="2px">
            <Card testId="restyled-card" title="Users">
              <Text>3,210 active</Text>
            </Card>
          </Theme>

          <H3>Button with hover override</H3>
          <Theme
            backgroundColor-Button-primary-solid="#9b59b6"
            backgroundColor-Button-primary-solid--hover="#8e44ad">
            <Button
              testId="purple-button"
              label="Custom purple button"
              variant="solid"
              themeColor="primary" />
          </Theme>
        </VStack>
      </App>
    `);

    await expect(page.getByText("Default Cards")).toBeVisible();
    await expect(page.getByText("Restyled Cards")).toBeVisible();
    await expect(page.getByText("$12,400 this month")).toBeVisible();
    await expect(page.getByText("3,210 active")).toBeVisible();

    const defaultCard = page.getByTestId("default-card");
    const restyledCard = page.getByTestId("restyled-card");
    await expect(restyledCard).toHaveCSS("border-radius", "16px");
    await expect(restyledCard).toHaveCSS("border-top-width", "2px");
    expect(await cssValue(restyledCard, "background-color")).not.toBe(
      await cssValue(defaultCard, "background-color"),
    );

    const button = page.getByTestId("purple-button");
    await expectRgbClose(button, "background-color", "rgb(155, 89, 182)");
    await button.click();
    await expect(button).toBeVisible();
  });

  test("scoped themes change only wrapped pricing cards and react to applyIf", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.highlight="{true}">
        <VStack gap="12px">
          <HStack wrapContent itemWidth="33%">
            <Card testId="free-card" title="Free">
              <VStack>
                <Text variant="strong" fontSize="24px">$0</Text>
                <Text>5 projects</Text>
                <Button label="Current plan" variant="outlined" themeColor="secondary" />
              </VStack>
            </Card>

            <Theme tone="dark" color-primary="#9b59b6" applyIf="{highlight}">
              <Card testId="pro-card" title="Pro">
                <VStack>
                  <Text variant="strong" fontSize="24px">$19/mo</Text>
                  <Text>Unlimited projects</Text>
                  <Button label="Upgrade" variant="solid" themeColor="primary" />
                </VStack>
              </Card>
            </Theme>

            <Theme tone="dark" color-primary="#e67e22">
              <Card testId="enterprise-card" title="Enterprise">
                <VStack>
                  <Text variant="strong" fontSize="24px">Custom</Text>
                  <Text>Unlimited everything</Text>
                  <Button label="Contact sales" variant="solid" themeColor="primary" />
                </VStack>
              </Card>
            </Theme>
          </HStack>
          <Button testId="toggle-highlight" onClick="highlight = !highlight">Toggle highlight</Button>
        </VStack>
      </App>
    `);

    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("$19/mo")).toBeVisible();
    await expect(page.getByText("Custom")).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade" })).toBeVisible();

    const freeCard = page.getByTestId("free-card");
    const proCard = page.getByTestId("pro-card");
    const enterpriseCard = page.getByTestId("enterprise-card");
    const freeBackground = await cssValue(freeCard, "background-color");
    const proBackground = await cssValue(proCard, "background-color");
    const enterpriseBackground = await cssValue(enterpriseCard, "background-color");

    expect(proBackground).not.toBe(freeBackground);
    expect(enterpriseBackground).not.toBe(freeBackground);

    await page.getByTestId("toggle-highlight").click();
    await expect
      .poll(() => cssValue(proCard, "background-color"))
      .not.toBe(proBackground);
    expect(await cssValue(enterpriseCard, "background-color")).toBe(enterpriseBackground);
  });

  test("ToneSwitch how-to renders the dashboard controls and header switch", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App defaultTone="light" autoDetectTone="{false}">
        <AppHeader>
          <SpaceFiller />
          <ToneSwitch testId="tone-switch" iconLight="sun" iconDark="moon" />
        </AppHeader>
        <VStack testId="dashboard" padding="16px" backgroundColor="$backgroundColor-primary">
          <Card title="Dashboard" subtitle="Your analytics at a glance">
            <ProgressBar value="0.72" />
            <HStack>
              <Badge value="Active" />
              <Text variant="secondary">Last updated: today</Text>
            </HStack>
          </Card>
          <HStack>
            <Button label="Primary action" variant="solid" themeColor="primary" />
            <Button label="Secondary" variant="outlined" themeColor="secondary" />
            <Button label="Danger" variant="solid" themeColor="attention" />
          </HStack>
        </VStack>
      </App>
    `);

    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Your analytics at a glance")).toBeVisible();
    await expect(page.getByRole("button", { name: "Primary action" })).toBeVisible();

    const switchControl = page.getByRole("switch");
    await expect(switchControl).toBeVisible();
  });
});

async function cssValue(locator: Locator, property: string): Promise<string> {
  return locator.evaluate((element, cssProperty) =>
    getComputedStyle(element).getPropertyValue(cssProperty),
  property);
}

async function expectRgbClose(
  locator: Locator,
  property: string,
  expected: string,
  tolerance = 3,
) {
  const actual = await cssValue(locator, property);
  const actualRgb = parseRgb(actual);
  const expectedRgb = parseRgb(expected);
  expect(actualRgb, `${property} should be an rgb color`).not.toBeNull();
  expect(expectedRgb, `${expected} should be an rgb color`).not.toBeNull();
  for (let index = 0; index < 3; index++) {
    expect(Math.abs(actualRgb![index] - expectedRgb![index])).toBeLessThanOrEqual(tolerance);
  }
}

function parseRgb(value: string): number[] | null {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

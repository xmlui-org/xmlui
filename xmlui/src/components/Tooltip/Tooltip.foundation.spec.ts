import { expect, test } from "../../testing/fixtures";

test.describe("Tooltip foundation", () => {
  test("shows text tooltip on hover", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tooltip text="Helpful detail" delayDuration="{0}">
        <Button testId="trigger">Hover me</Button>
      </Tooltip>
    `);

    await page.getByTestId("trigger").hover();
    await expect(page.getByRole("tooltip")).toContainText("Helpful detail");
  });

  test("defaultOpen renders tooltip content immediately", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tooltip text="Already visible" defaultOpen="{true}">
        <Button testId="trigger">Trigger</Button>
      </Tooltip>
    `);

    await expect(page.getByRole("tooltip")).toContainText("Already visible");
  });

  test("renders tiny markdown content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tooltip markdown="This *example* uses \`code\`" defaultOpen="{true}">
        <Button testId="trigger">Trigger</Button>
      </Tooltip>
    `);

    const tooltip = page.getByRole("tooltip");
    await expect(tooltip.locator("em")).toContainText("example");
    await expect(tooltip.locator("code")).toContainText("code");
  });

  test("tooltipTemplate renders and tooltip content can mutate state", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.count="{0}">
        <Tooltip defaultOpen="{true}">
          <property name="tooltipTemplate">
            <VStack>
              <Text testId="tip">Count: {count}</Text>
              <Button testId="increment" onClick="count++">Increment</Button>
            </VStack>
          </property>
          <Button testId="trigger">Trigger</Button>
        </Tooltip>
      </App>
    `);

    const tip = page.getByRole("tooltip").getByTestId("tip");
    await expect(tip).toContainText("Count: 0");
    await page.getByRole("tooltip").getByTestId("increment").click({ force: true });
    await expect(tip).toContainText("Count: 1");
  });
});

test("tooltip behavior renders themed portal tooltip instead of inline or native title", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <App>
      <CHStack height="100px" verticalAlignment="center">
        <Button
          testId="button"
          label="Hover the mouse over me!"
          tooltip="I'm hovered!"
          tooltipOptions="delayDuration: 10" />
      </CHStack>
    </App>
  `);

  const button = page.getByTestId("button");
  await expect(button).not.toHaveAttribute("title");
  await expect(page.getByText("I'm hovered!")).toHaveCount(0);

  await button.hover();

  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("I'm hovered!");
  const tooltipContainer = page.locator("[data-tooltip-container]");
  await expect(tooltipContainer).toBeVisible();
  await expect(tooltipContainer).toHaveClass(/_Tooltip_content_/);
});

test("tooltip behavior works on explicitly sized icons", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <HStack>
        <Icon
          testId="email"
          name="email"
          width="48px"
          height="48px"
          tooltipMarkdown="**Tooltip** to the bottom with no arrows, aligned left"
          tooltipOptions="bottom; !showArrow; start; delayDuration: 10" />
        <Icon
          testId="phone"
          name="phone"
          width="48px"
          height="48px"
          tooltipMarkdown="*Tooltip* to the bottom with arrows, 28 pixels away"
          tooltipOptions="bottom; showArrow; sideOffset: 28; delayDuration: 10" />
      </HStack>
    </App>
  `);

  const email = page.getByTestId("email");
  const emailSvg = email.locator("svg");
  await expect(emailSvg).toHaveCSS("width", "48px");
  await expect(emailSvg).toHaveCSS("height", "48px");
  await email.hover();
  const emailTooltip = page.getByRole("tooltip");
  await expect(emailTooltip).toContainText("to the bottom with no arrows, aligned left");

  await page.mouse.move(0, 0);
  const phone = page.getByTestId("phone");
  const phoneSvg = phone.locator("svg");
  await expect(phoneSvg).toHaveCSS("width", "48px");
  await expect(phoneSvg).toHaveCSS("height", "48px");
  await phone.hover();
  const phoneTooltip = page.getByRole("tooltip");
  await expect(phoneTooltip).toContainText("to the bottom with arrows, 28 pixels away");
});

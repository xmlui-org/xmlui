import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/customize-a-selects-selected-value.md",
  ),
);

test.describe("The default: a long label wraps and centers", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "The default: a long label wraps and centers",
  );

  // The motivating bug, reproduced with zero customization: a long selected
  // label wraps inside the trigger, and every wrapped line renders centered
  // because the trigger is a real <button> and nothing overrides its
  // inherited text-align: center.
  test("the default value display wraps the long label centered", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const trigger = page.getByRole("combobox", { name: "Priority" });
    const valueText = page.getByText(
      "Escalate to the payments team's on-call engineer for urgent review",
    );
    await expect(valueText).toBeVisible();

    const triggerBox = await trigger.boundingBox();
    const valueBox = await valueText.boundingBox();
    expect(triggerBox).toBeTruthy();
    expect(valueBox).toBeTruthy();

    // It wraps onto more than one line...
    expect(valueBox!.height).toBeGreaterThan(30);

    // ...and it's centered, not left-aligned: the default renderer's value
    // box already fills the trigger, so this is purely an alignment claim.
    const align = await valueText.evaluate((el) => getComputedStyle(el).textAlign);
    expect(align).toBe("center");
  });
});

test.describe("A valueTemplate with width and textAlign", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "A valueTemplate with width and textAlign",
  );

  // The verified fix: width="100%" makes the template's Text fill the
  // trigger, and textAlign="start" overrides the inherited button
  // centering, so a chosen long label wraps flush against the left edge.
  test("choosing the long option renders it full-width and left-aligned", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const trigger = page.getByRole("combobox", { name: "Priority" });
    await trigger.click();
    await page
      .getByRole("option", {
        name: "Escalate to the payments team's on-call engineer for urgent review",
      })
      .click();

    const value = page.getByTestId("full-value");
    await expect(value).toBeVisible();
    await expect(value).toHaveText(
      "Escalate to the payments team's on-call engineer for urgent review",
    );

    const triggerBox = await trigger.boundingBox();
    const valueBox = await value.boundingBox();
    expect(triggerBox).toBeTruthy();
    expect(valueBox).toBeTruthy();

    // The template's Text spans the trigger's inner width (within a couple
    // of pixels for border/subpixel rounding), not just its own content...
    expect(valueBox!.width).toBeGreaterThan(triggerBox!.width - 40);

    // ...wraps onto more than one line...
    expect(valueBox!.height).toBeGreaterThan(30);

    // ...and is left-aligned rather than inheriting the button's centering.
    const align = await value.evaluate((el) => getComputedStyle(el).textAlign);
    expect(["left", "start"]).toContain(align);
  });

  // The trap the how-to calls out explicitly: width alone isn't enough,
  // because the inherited centering doesn't come from box sizing. Built as
  // an independent literal (rather than string surgery on the extracted
  // example) so the assertion doesn't depend on exact markdown formatting.
  test("width alone would still leave the label centered (documents the mechanism)", async ({
    initTestBed,
    page,
  }) => {
    const widthOnlyApp = `
<App>
  <VStack width="260px">
    <Select width="100%" label="Priority">
      <property name="valueTemplate">
        <Text testId="full-value" width="100%" value="{$item.label}" />
      </property>
      <Option value="normal" label="Normal priority" />
      <Option value="escalate" label="Escalate to the payments team's on-call engineer for urgent review" />
    </Select>
  </VStack>
</App>`;

    await initTestBed(widthOnlyApp, { components, apiInterceptor });

    const trigger = page.getByRole("combobox", { name: "Priority" });
    await trigger.click();
    await page
      .getByRole("option", {
        name: "Escalate to the payments team's on-call engineer for urgent review",
      })
      .click();

    const value = page.getByTestId("full-value");
    await expect(value).toBeVisible();

    const align = await value.evaluate((el) => getComputedStyle(el).textAlign);
    expect(align).toBe("center");
  });
});

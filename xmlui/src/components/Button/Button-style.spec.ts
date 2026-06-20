import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/?example=buttonCompatibility");
});

test("old Button smoke, label, state, and event behavior", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Button compatibility" })).toBeVisible();
  await expect(page.getByTestId("empty")).toBeAttached();

  await expect(page.getByTestId("ascii")).toHaveText("hello");
  await expect(page.getByTestId("unicode")).toHaveText("😀");
  await expect(page.getByTestId("label-null")).toHaveText("null");
  await expect(page.getByTestId("label-undefined")).toHaveText("undefined");
  await expect(page.getByTestId("label-object")).toHaveText("[object Object]");
  await expect(page.getByTestId("label-empty-object")).toHaveText("[object Object]");
  await expect(page.getByTestId("label-array")).toHaveText("1,2,3");
  await expect(page.getByTestId("label-empty-array")).toHaveText("");
  await expect(page.getByTestId("children-label")).toHaveText("world");
  await expect(page.getByTestId("text-child")).not.toHaveText("hello");
  await expect(page.getByTestId("text-child").getByText("world")).toBeVisible();

  await expect(page.getByTestId("enabled")).toBeEnabled();
  await expect(page.getByTestId("disabled")).toBeDisabled();

  await page.getByTestId("click").click();
  await expect(page.getByTestId("click")).toHaveText("Click count: 1");
  await expect(page.getByText("Clicks: 1")).toBeVisible();

  await page.getByTestId("context-menu").click({ button: "right" });
  await expect(page.getByText("Context menu: yes")).toBeVisible();
});

test("old Button icon, accessibility, positioning, type, and focus behavior", async ({ page }) => {
  await expect(page.getByTestId("icon-only")).toHaveAccessibleName("test");
  await expect(page.getByTestId("icon-label")).toHaveAccessibleName("label");
  await expect(page.getByTestId("icon-contextual")).toHaveAccessibleName("context label");
  await expect(page.getByTestId("icon-label").locator('[data-xmlui-part="icon"]')).toBeVisible();
  await expect(page.getByTestId("icon-with-children").locator('[data-xmlui-part="icon"]')).toBeVisible();
  await expect(page.getByTestId("icon-missing-with-label").locator('[data-xmlui-part="icon"]')).not.toBeAttached();
  await expect(page.getByTestId("icon-missing-with-label")).toHaveText("hello");

  const startIcon = page.getByTestId("icon-position-start").locator('[data-xmlui-part="icon"]');
  const endIcon = page.getByTestId("icon-position-end").locator('[data-xmlui-part="icon"]');
  await expect(startIcon).toBeVisible();
  await expect(endIcon).toBeVisible();
  expect((await startIcon.boundingBox())!.x).toBeLessThan((await page.getByTestId("icon-position-start").boundingBox())!.x + 20);
  expect((await endIcon.boundingBox())!.x).toBeGreaterThan((await page.getByTestId("icon-position-end").boundingBox())!.x + 20);

  await expect(page.getByTestId("content-start")).toHaveCSS("justify-content", "start");
  await expect(page.getByTestId("content-center")).toHaveCSS("justify-content", "center");
  await expect(page.getByTestId("content-end")).toHaveCSS("justify-content", "end");

  await expect(page.getByTestId("type-button")).toHaveAttribute("type", "button");
  await expect(page.getByTestId("type-submit")).toHaveAttribute("type", "submit");
  await expect(page.getByTestId("type-reset")).toHaveAttribute("type", "reset");
  await expect(page.getByTestId("autofocus")).toBeFocused();

  await page.getByTestId("focus-events").focus();
  await expect(page.getByTestId("focus-events")).toBeFocused();
  await expect(page.getByText("Got focus: yes")).toBeVisible();
  await page.getByTestId("focus-events").blur();
  await expect(page.getByText("Lost focus: yes")).toBeVisible();
});

test("old Button size and default style behavior", async ({ page }) => {
  const xs = await page.getByTestId("size-empty-xs").boundingBox();
  const sm = await page.getByTestId("size-empty-sm").boundingBox();
  const md = await page.getByTestId("size-empty-md").boundingBox();
  const lg = await page.getByTestId("size-empty-lg").boundingBox();

  expect(xs!.width).toBeLessThanOrEqual(sm!.width);
  expect(sm!.width).toBeLessThanOrEqual(md!.width);
  expect(md!.width).toBeLessThanOrEqual(lg!.width);
  expect(xs!.height).toBeLessThan(sm!.height);
  expect(sm!.height).toBeLessThan(md!.height);
  expect(md!.height).toBeLessThan(lg!.height);

  const labeledXs = await page.getByTestId("size-xs").boundingBox();
  const labeledSm = await page.getByTestId("size-sm").boundingBox();
  const labeledMd = await page.getByTestId("size-md").boundingBox();
  const labeledLg = await page.getByTestId("size-lg").boundingBox();
  expect(labeledXs!.height).toBeLessThan(labeledSm!.height);
  expect(labeledSm!.height).toBeLessThan(labeledMd!.height);
  expect(labeledMd!.height).toBeLessThan(labeledLg!.height);

  const button = page.getByRole("button", { name: "Click count: 0" });
  await expect(button).toHaveCSS("background-color", "rgb(32, 107, 196)");
  await expect(button).toHaveCSS("color", "rgb(243, 247, 249)");
  await expect(button).not.toHaveCSS("width", `${page.viewportSize()?.width ?? 1280}px`);
});

test("old Button theme override variables affect rendered CSS", async ({ page }) => {
  const primarySolid = page.getByTestId("theme-primary-solid");
  await expect(primarySolid).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(primarySolid).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(primarySolid).toHaveCSS("border-color", "rgb(255, 0, 0)");
  await expect(primarySolid).toHaveCSS("border-width", "5px");
  await expect(primarySolid).toHaveCSS("border-style", "dotted");
  await expect(primarySolid).toHaveCSS("border-radius", "10px");
  await expect(primarySolid).toHaveCSS("font-family", "Arial, sans-serif");
  await expect(primarySolid).toHaveCSS("font-size", "20px");
  await expect(primarySolid).toHaveCSS("font-weight", "200");

  const secondarySolid = page.getByTestId("theme-secondary-solid");
  await expect(secondarySolid).toHaveCSS("background-color", "rgb(255, 0, 0)");

  const secondaryOutlined = page.getByTestId("theme-secondary-outlined");
  await expect(secondaryOutlined).toHaveCSS("border-color", "rgb(0, 128, 0)");
  await expect(secondaryOutlined).toHaveCSS("border-width", "5px");
  await expect(secondaryOutlined).toHaveCSS("border-style", "double");
  await expect(secondaryOutlined).toHaveCSS("color", "rgb(255, 255, 255)");

  const attentionGhost = page.getByTestId("theme-attention-ghost");
  await expect(attentionGhost).toHaveCSS("border-width", "5px");
  await expect(attentionGhost).toHaveCSS("border-radius", "10px");
  await expect(attentionGhost).toHaveCSS("color", "rgb(255, 255, 255)");
});

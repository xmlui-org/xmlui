import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";

test("has app title", async ({ page }) => {
  const entryPoint = `<Text />`;
  await initApp(page, {
    name: "Test app title",
    entryPoint,
  });

  await expect(page).toHaveTitle("Test app title");
});

test("can render text", async ({ page }) => {
  const entryPoint = `<Text testId="textComponent" value="stuff" />`;
  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("textComponent")).toHaveText("stuff");
});

test("can render button", async ({ page }) => {
  const entryPoint = `
    <Stack var.counter="{0}" >
      <Button
        testId="buttonComponent"
        label="click me"
        onClick="counter++" />
      <Text
        testId="textComponent"
        value="{counter}" />
    </Stack>
  `;
  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("textComponent")).toHaveText("1");
});

test("example visual regression test", async ({ page }, testInfo) => {
  // by default is `process.platform`, but we run it in github actions too, so we ditch the platfrom suffix.
  //  It can cause problems if it renders differently on other platforms. If it does, we shouldn't override the
  //  snapshot suffix, and generate the playwright snapshots with the refresh-playwright-snapshots-in-docker.sh script.
  //  more info here: https://github.com/microsoft/playwright/issues/14218
  testInfo.snapshotSuffix = "";
  await initApp(page, {
    entryPoint: {
      type: "Button",
      testId: "buttonComponent",
      props: {
        label: "click me",
      },
    },
  });
  await expect(page).toHaveScreenshot();
});

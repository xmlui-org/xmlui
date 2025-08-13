import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { getFullRectangle } from "../../testing/themed-app-test-helpers";

test.describe("Basic Functionality", () => {
  test("component renders with basic props", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();
  });

  test("component renders with delay prop", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner delay="0" />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();
  });

  test("component renders with fullScreen prop", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner fullScreen="true" />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("component has correct accessibility attributes", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toHaveAttribute("aria-label", "loading", { ignoreCase: true });
  });

  test("component maintains accessibility with fullScreen", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner fullScreen="true" />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toHaveAttribute("aria-label", "loading", { ignoreCase: true });
  });
});

test.describe("Theme Variables", () => {
  test.skip(
    "component applies theme variables",
    SKIP_REASON.UNSURE("about the actual assertions"),
    async ({ page, initTestBed }) => {
      await initTestBed(`<Spinner delay="0" />`, {
        testThemeVars: {
          "size-Spinner": "60px",
          "thickness-Spinner": "6px",
          "borderColor-Spinner": "#ff0000",
        },
      });

      const spinner = page.getByRole("status");
    },
  );
});

test.describe("Delay Behavior", () => {
  test("component respects delay prop", { tag: "@smoke" }, async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="500" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).not.toBeVisible({ timeout: 0 });

    await expect(spinner).toBeVisible();
  });

  test("component shows immediately with zero delay", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="0" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible({ timeout: 0 });
  });

  test("component shows immediately with null delay", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="{null}" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible({ timeout: 0 });
  });

  test("component shows immediately with undefined delay", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="{undefined}" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible({ timeout: 0 });
  });

  test("component handles negative delay values", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="-100" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible({ timeout: 0 });
  });

  test("component respects numeric delay prop", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="{ 500 }" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).not.toBeVisible({ timeout: 0 });

    await expect(spinner).toBeVisible();
  });
});

test.describe("Full Screen Mode", () => {
  test("component renders in fullScreen mode", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner fullScreen="true" />`);
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();

    const { width } = await getFullRectangle(spinner);
    expect(width).toEqual(page.viewportSize().width);
  });

  test("component renders normally without fullScreen", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner fullScreen="false" />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();

    const { width } = await getFullRectangle(spinner);
    expect(width).not.toEqual(page.viewportSize().width);
  });
});

test.describe("Edge Cases", { tag: "@smoke" }, () => {
  test("delayed fullScreen spinner spans viewport width", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner fullScreen="true" delay="{ 500 }" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).not.toBeVisible({ timeout: 0 });

    await expect(spinner).toBeVisible();

    const { width } = await getFullRectangle(spinner);
    expect(width).toEqual(page.viewportSize().width);
  });

  test("button behind fullScreen spinner can't be clicked", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button label="Click Me" onClick="testState = clicked" />
        <Spinner fullScreen="true" />
      </Fragment>`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();

    await page.getByRole("button").click({ force: true });

    expect.poll(testStateDriver.testState).not.toEqual("clicked");
  });
});

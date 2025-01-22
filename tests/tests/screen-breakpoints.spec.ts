import { test, expect } from "./fixtures";
import { initApp } from "./component-test-helpers";

// test("Recognizes xs (phone) viewport size #1", async ({ page }) => {
//   const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.phone}"/>`;

//   await initApp(page, {
//     entryPoint,
//   });

//   page.setViewportSize({ width: 0, height: 480 });
//   const text = await page
//     .getByTestId("bp")
//     .first()
//     .evaluate((element) => element.textContent);
//   expect(text).toBe("xs|0|true");
// });

test("Recognizes xs (phone) viewport size #2", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.phone}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 320, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("xs|0|true");
});

test("Recognizes xs (phone) viewport size #3", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.phone}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 575, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("xs|0|true");
});

test("Recognizes sm (landscape phone) viewport size #1", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.landscapePhone}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 576, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("sm|1|true");
});

test("Recognizes sm (landscape phone) viewport size #2", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.landscapePhone}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 640, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("sm|1|true");
});

test("Recognizes sm (landscape phone) viewport size #3", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.landscapePhone}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 767, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("sm|1|true");
});

test("Recognizes md (tablet) viewport size #1", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.tablet}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 768, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("md|2|true");
});

test("Recognizes md (tablet) viewport size #2", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.tablet}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 840, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("md|2|true");
});

test("Recognizes md (tablet) viewport size #3", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.tablet}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 991, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("md|2|true");
});

test("Recognizes lg (desktop) viewport size #1", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.desktop}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 992, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("lg|3|true");
});

test("Recognizes lg (desktop) viewport size #2", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.desktop}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 1024, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("lg|3|true");
});

test("Recognizes lg (desktop) viewport size #3", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.desktop}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 1199, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("lg|3|true");
});

test("Recognizes xl (large desktop) viewport size #1", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.largeDesktop}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 1200, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("xl|4|true");
});

test("Recognizes xl (large desktop) viewport size #2", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.largeDesktop}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 1364, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("xl|4|true");
});

test("Recognizes xl (large desktop) viewport size #3", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.largeDesktop}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 1399, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("xl|4|true");
});

test("Recognizes xxl (xl desktop) viewport size #1", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.xlDesktop}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 1400, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("xxl|5|true");
});

test("Recognizes xxl (xl desktop) viewport size #2", async ({ page }) => {
  const entryPoint = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.xlDesktop}"/>`;

  await initApp(page, {
    entryPoint,
  });

  page.setViewportSize({ width: 4096, height: 480 });
  const text = await page
    .getByTestId("bp")
    .first()
    .evaluate((element) => element.textContent);
  expect(text).toBe("xxl|5|true");
});

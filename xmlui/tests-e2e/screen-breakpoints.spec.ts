import { test, expect } from "../src/testing/fixtures";

test("Recognizes xs (phone) viewport size #1", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 180, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.phone}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("xs|0|true");
});

test("Recognizes xs (phone) viewport size #2", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.phone}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("xs|0|true");
});

test("Recognizes xs (phone) viewport size #3", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 575, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.phone}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("xs|0|true");
});

test("Recognizes sm (landscape phone) viewport size #1", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 576, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.landscapePhone}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("sm|1|true");
});

test("Recognizes sm (landscape phone) viewport size #2", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 640, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.landscapePhone}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("sm|1|true");
});

test("Recognizes sm (landscape phone) viewport size #3", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 767, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.landscapePhone}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("sm|1|true");
});

test("Recognizes md (tablet) viewport size #1", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 768, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.tablet}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("md|2|true");
});

test("Recognizes md (tablet) viewport size #2", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 840, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.tablet}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("md|2|true");
});

test("Recognizes md (tablet) viewport size #3", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 991, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.tablet}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("md|2|true");
});

test("Recognizes lg (desktop) viewport size #1", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 992, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.desktop}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("lg|3|true");
});

test("Recognizes lg (desktop) viewport size #2", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 1024, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.desktop}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("lg|3|true");
});

test("Recognizes lg (desktop) viewport size #3", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 1199, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.desktop}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("lg|3|true");
});

test("Recognizes xl (large desktop) viewport size #1", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 1200, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.largeDesktop}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("xl|4|true");
});

test("Recognizes xl (large desktop) viewport size #2", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 1364, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.largeDesktop}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("xl|4|true");
});

test("Recognizes xl (large desktop) viewport size #3", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 1399, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.largeDesktop}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("xl|4|true");
});

test("Recognizes xxl (xl desktop) viewport size #1", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 1400, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.xlDesktop}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("xxl|5|true");
});

test("Recognizes xxl (xl desktop) viewport size #2", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 4096, height: 480 });
  await initTestBed(
    `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.xlDesktop}"/>`,
  );
  await expect(page.getByTestId("bp")).toHaveText("xxl|5|true");
});

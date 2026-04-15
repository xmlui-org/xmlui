import { test, expect } from "../src/testing/fixtures";

// Breakpoint reference (default theme):
//   xs  (0): width < 576px       → phone
//   sm  (1): 576px ≤ width < 768px  → landscapePhone
//   md  (2): 768px ≤ width < 992px  → tablet
//   lg  (3): 992px ≤ width < 1200px → desktop
//   xl  (4): 1200px ≤ width < 1400px → largeDesktop
//   xxl (5): width ≥ 1400px         → xlDesktop

const MARKUP_PHONE         = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.phone}"/>`;
const MARKUP_LANDSCAPE     = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.landscapePhone}"/>`;
const MARKUP_TABLET        = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.tablet}"/>`;
const MARKUP_DESKTOP       = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.desktop}"/>`;
const MARKUP_LARGE_DESKTOP = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.largeDesktop}"/>`;
const MARKUP_XL_DESKTOP    = `<Text testId="bp" value="{mediaSize.size}|{mediaSize.sizeIndex}|{mediaSize.xlDesktop}"/>`;

test("Recognizes xs (phone) breakpoint at representative widths", async ({ page, initTestBed }) => {
  for (const width of [180, 320, 575]) {
    await page.setViewportSize({ width, height: 480 });
    await initTestBed(MARKUP_PHONE);
    await expect(page.getByTestId("bp")).toHaveText("xs|0|true");
  }
});

test("Recognizes sm (landscape phone) breakpoint at representative widths", async ({ page, initTestBed }) => {
  for (const width of [576, 640, 767]) {
    await page.setViewportSize({ width, height: 480 });
    await initTestBed(MARKUP_LANDSCAPE);
    await expect(page.getByTestId("bp")).toHaveText("sm|1|true");
  }
});

test("Recognizes md (tablet) breakpoint at representative widths", async ({ page, initTestBed }) => {
  for (const width of [768, 840, 991]) {
    await page.setViewportSize({ width, height: 480 });
    await initTestBed(MARKUP_TABLET);
    await expect(page.getByTestId("bp")).toHaveText("md|2|true");
  }
});

test("Recognizes lg (desktop) breakpoint at representative widths", async ({ page, initTestBed }) => {
  for (const width of [992, 1024, 1199]) {
    await page.setViewportSize({ width, height: 480 });
    await initTestBed(MARKUP_DESKTOP);
    await expect(page.getByTestId("bp")).toHaveText("lg|3|true");
  }
});

test("Recognizes xl (large desktop) breakpoint at representative widths", async ({ page, initTestBed }) => {
  for (const width of [1200, 1364, 1399]) {
    await page.setViewportSize({ width, height: 480 });
    await initTestBed(MARKUP_LARGE_DESKTOP);
    await expect(page.getByTestId("bp")).toHaveText("xl|4|true");
  }
});

test("Recognizes xxl (xl desktop) breakpoint at representative widths", async ({ page, initTestBed }) => {
  for (const width of [1400, 4096]) {
    await page.setViewportSize({ width, height: 480 });
    await initTestBed(MARKUP_XL_DESKTOP);
    await expect(page.getByTestId("bp")).toHaveText("xxl|5|true");
  }
});

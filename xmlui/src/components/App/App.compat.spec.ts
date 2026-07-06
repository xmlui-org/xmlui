import { expect, test } from "../../testing/fixtures";
import type { Page } from "@playwright/test";

const ALL_APP_LAYOUTS = [
  "vertical",
  "vertical-sticky",
  "vertical-full-header",
  "horizontal",
  "horizontal-sticky",
  "condensed",
  "condensed-sticky",
  "desktop",
];

function createNarrowDrawerMarkup(layout: string) {
  return `
    <App layout="${layout}" testId="app">
      <AppHeader testId="appHeader">
        Header
      </AppHeader>
      <NavPanel testId="navPanel">
        <NavLink testId="homeLink" label="Home" to="/" icon="home" />
        <NavLink testId="page1Link" label="Page 1" to="/page1" />
      </NavPanel>
      <Pages fallbackPath="/">
        <Page url="/">
          <Text testId="page">Home</Text>
        </Page>
        <Page url="/page1">
          <Text testId="page">Page 1</Text>
        </Page>
      </Pages>
      <Footer testId="footer">Footer</Footer>
    </App>
  `;
}

function createLayoutMarkup(
  layout: string,
  noScrollbarGutters: boolean,
  scrollWholePage: boolean,
  contentHeight: string,
) {
  return `
    <App
      layout="${layout}"
      noScrollbarGutters="${noScrollbarGutters}"
      scrollWholePage="${scrollWholePage}"
    >
      <AppHeader testId="appHeader">
        Header
      </AppHeader>
      <NavPanel testId="navPanel">
        <NavLink label="Link 1" to="/page1" />
        <NavLink label="Link 2" to="/page2" />
      </NavPanel>
      <Pages fallbackPath="/">
        <Page url="/">
          <Stack testId="mainContent" height="${contentHeight}" backgroundColor="lightblue">
            <Text>
              Main Content
            </Text>
          </Stack>
        </Page>
      </Pages>
      <Footer testId="footer">
        Footer
      </Footer>
    </App>
  `;
}

async function scrollAppContainerTo(page: Page, position: "top" | "mid" | "bottom") {
  await page.evaluate((pos) => {
    const appWrapper = document.querySelector('[class*="appContainer"]') as HTMLElement;
    if (!appWrapper) {
      return;
    }

    let scrollTop = 0;
    if (pos === "mid") {
      scrollTop = (appWrapper.scrollHeight - appWrapper.clientHeight) / 3;
    } else if (pos === "bottom") {
      scrollTop = appWrapper.scrollHeight - appWrapper.clientHeight;
    }

    appWrapper.scrollTop = scrollTop;
  }, position);
}

test("exposes loggedInUser to descendant expressions", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App loggedInUser="{{ name: 'Joe', token: '1234' }}">
      <NavPanel>
        <NavLink label="Home" to="/" icon="home"/>
      </NavPanel>
      <Pages fallbackPath="/">
        <Page url="/">
          <Text testId="user-name" value="User name: {loggedInUser.name}" />
          <Text testId="user-token" value="User token: {loggedInUser.token}" />
        </Page>
      </Pages>
    </App>
  `);

  await expect(page.getByTestId("user-name")).toHaveText("User name: Joe");
  await expect(page.getByTestId("user-token")).toHaveText("User token: 1234");
});

test.describe("Narrow Layout - hamburger drawer", () => {
  for (const layout of ALL_APP_LAYOUTS) {
    test(`renders NavPanel in a hamburger drawer for ${layout}`, async ({ initTestBed, page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await initTestBed(createNarrowDrawerMarkup(layout));

      await expect(page.getByTestId("appHeader")).toBeVisible();
      await expect(page.getByTestId("page")).toHaveText("Home");
      await expect(page.getByTestId("navPanel")).toHaveCount(0);

      const screenSize = await page.getByTestId("app").evaluate((app) =>
        getComputedStyle(app).getPropertyValue("--screenSize").trim(),
      );
      expect(screenSize).toBe("0");

      const hamburger = page.locator('[data-part-id="hamburger"]').first();
      await expect(hamburger).toBeVisible();
      await hamburger.click();

      const drawer = page.getByRole("dialog");
      await expect(drawer).toBeVisible();
      await expect(page.getByTestId("navPanel")).toBeVisible();
      await expect(drawer.getByRole("img", { name: "Logo" })).toBeVisible();
      const closeButton = drawer.getByRole("button", { name: "Close" });
      await expect(closeButton).toBeVisible();
      const closeMetrics = await closeButton.evaluate((button) => {
        const rect = button.getBoundingClientRect();
        const drawerRect = button.closest('[role="dialog"]')!.getBoundingClientRect();
        const style = getComputedStyle(button);
        return {
          top: Math.round(rect.top - drawerRect.top),
          right: Math.round(drawerRect.right - rect.right),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
        };
      });
      expect(closeMetrics).toEqual({
        top: 8,
        right: 9,
        width: 27,
        height: 35,
        fontSize: "16px",
        lineHeight: "27.2px",
      });
      await expect(page.getByTestId("homeLink")).toBeVisible();
      await expect(page.getByTestId("page1Link")).toBeVisible();

      await page.getByTestId("page1Link").click();
      await expect(page.getByTestId("page")).toHaveText("Page 1");
      await expect(drawer).not.toBeVisible();
    });
  }
});

test("wide horizontal layout centers header, nav, content, and footer on the same content band", async ({
  initTestBed,
  page,
}) => {
  await page.setViewportSize({ width: 2048, height: 1080 });
  await initTestBed(createLayoutMarkup("horizontal", false, true, "200px"));

  const boxes = await page.evaluate(() => {
    const box = (element: Element | null) => {
      if (!element) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      return {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      };
    };
    const pageRoot = document.querySelector('[data-xmlui-component="Page"]');
    return {
      header: box(document.querySelector('[data-xmlui-component="AppHeader"] > div')),
      nav: box(document.querySelector('[data-xmlui-component="NavPanel"] > div')),
      content: box(pageRoot?.parentElement ?? null),
      footer: box(document.querySelector('[data-xmlui-component="Footer"] > div')),
      styles: (() => {
        const headerInner = document.querySelector('[data-xmlui-component="AppHeader"] > div');
        const header = document.querySelector('[data-xmlui-component="AppHeader"]');
        const nav = document.querySelector('[data-xmlui-component="NavPanel"]');
        const navWrapper = nav?.parentElement;
        const footer = document.querySelector('[data-xmlui-component="Footer"]');
        const footerInner = footer?.querySelector("div");
        const page = document.querySelector('[data-xmlui-component="Page"]');
        if (!headerInner || !header || !nav || !navWrapper || !footer || !footerInner || !page) {
          return null;
        }
        const headerInnerStyle = getComputedStyle(headerInner);
        const headerStyle = getComputedStyle(header);
        const navStyle = getComputedStyle(nav);
        const navWrapperStyle = getComputedStyle(navWrapper);
        const footerStyle = getComputedStyle(footer);
        const footerInnerStyle = getComputedStyle(footerInner);
        const pageStyle = getComputedStyle(page);
        return {
          headerPaddingLeft: headerInnerStyle.paddingLeft,
          navBackgroundColor: navStyle.backgroundColor,
          headerBackgroundColor: headerStyle.backgroundColor,
          navWrapperBorderBottomWidth: navWrapperStyle.borderBottomWidth,
          navWrapperBorderBottomStyle: navWrapperStyle.borderBottomStyle,
          footerBackgroundColor: footerStyle.backgroundColor,
          footerColor: footerStyle.color,
          footerBorderTopWidth: footerStyle.borderTopWidth,
          footerBorderTopStyle: footerStyle.borderTopStyle,
          footerFontFamily: footerInnerStyle.fontFamily,
          footerFontSize: footerInnerStyle.fontSize,
          footerPadding: footerInnerStyle.padding,
          pagePadding: pageStyle.padding,
          pageGap: pageStyle.gap,
        };
      })(),
    };
  });

  expect(boxes.header).not.toBeNull();
  expect(boxes.nav).not.toBeNull();
  expect(boxes.content).not.toBeNull();
  expect(boxes.footer).not.toBeNull();

  const expectedLeft = boxes.content!.left;
  const expectedRight = boxes.content!.right;
  for (const band of [boxes.header, boxes.nav, boxes.footer]) {
    expect(Math.abs(band!.left - expectedLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(band!.right - expectedRight)).toBeLessThanOrEqual(1);
  }
  expect(boxes.content!.left).toBeGreaterThan(300);
  expect(Math.abs(boxes.content!.left - (2048 - boxes.content!.right))).toBeLessThanOrEqual(20);
  expect(boxes.styles).toEqual(expect.objectContaining({
    headerPaddingLeft: "16px",
    navBackgroundColor: boxes.styles!.headerBackgroundColor,
    navWrapperBorderBottomWidth: "1px",
    navWrapperBorderBottomStyle: "solid",
    footerBackgroundColor: "rgb(255, 255, 255)",
    footerColor: "rgb(71, 108, 133)",
    footerBorderTopWidth: "1px",
    footerBorderTopStyle: "solid",
    footerFontSize: "14px",
    footerPadding: "7px 14px",
    pagePadding: "20px 16px",
    pageGap: "20px",
  }));
  expect(boxes.styles!.footerFontFamily).toContain("Inter");
});

test("renders resource logo in side NavPanel and uses top-level vertical link spacing", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <App layout="vertical">
      <AppHeader>
        <property name="logoTemplate">
          <Heading level="h3" value="Example App"/>
        </property>
      </AppHeader>
      <NavPanel testId="navPanel">
        <NavLink testId="homeLink" label="Home" to="/" icon="home"/>
        <NavLink testId="page1Link" label="Page 1" to="/page1"/>
        <NavLink testId="page2Link" label="Page 2" to="/page2"/>
      </NavPanel>
      <Pages fallbackPath="/">
        <Page url="/">
          <Text testId="page">Home</Text>
        </Page>
        <Page url="/page1">
          <Text testId="page">Page 1</Text>
        </Page>
        <Page url="/page2">
          <Text testId="page">Page 2</Text>
        </Page>
      </Pages>
      <Footer>Powered by XMLUI</Footer>
    </App>
  `, {
    resources: {
      logo: "/resources/test-image-100x100.jpg",
      "logo-dark": "/resources/test-image-100x100.jpg",
    },
  });

  const navPanel = page.getByTestId("navPanel");
  await expect(navPanel.getByRole("img", { name: "Logo" })).toBeVisible();
  await expect(navPanel.getByText("Example App")).toHaveCount(0);
  const logoMetrics = await navPanel.getByRole("img", { name: "Logo" }).evaluate((image) => {
    const wrapper = image.parentElement;
    const imageRect = image.getBoundingClientRect();
    const wrapperStyle = wrapper ? getComputedStyle(wrapper) : undefined;
    return {
      imageHeight: Math.round(imageRect.height),
      wrapperPaddingTop: wrapperStyle?.paddingTop,
      wrapperPaddingBottom: wrapperStyle?.paddingBottom,
    };
  });
  expect(logoMetrics).toEqual({
    imageHeight: 24,
    wrapperPaddingTop: "16px",
    wrapperPaddingBottom: "16px",
  });

  await page.getByTestId("page1Link").click();
  await expect(page.getByTestId("page")).toHaveText("Page 1");
  await expect(page.getByTestId("homeLink")).not.toHaveClass(/xmlui-navlink-active/);
  await expect(page.getByTestId("page1Link")).toHaveClass(/xmlui-navlink-active/);

  const indicator = await page.getByTestId("page1Link").evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return {
      width: parseFloat(style.width),
      height: parseFloat(style.height),
      top: style.top,
      bottom: style.bottom,
    };
  });

  expect(indicator.width).toBeLessThan(4);
  expect(indicator.height).toBeGreaterThan(20);
  expect(indicator.top).toBe("0px");
  expect(indicator.bottom).toBe("0px");

  const levelSpacer = await page.getByTestId("page1Link").evaluate((element) =>
    parseFloat(getComputedStyle(element, "::before").width),
  );
  expect(levelSpacer).toBe(0);
});

test("tall content keeps nav fixed, hides horizontal overflow, and uses app content background", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(createLayoutMarkup("vertical-full-header", true, true, "2000px"));

  const topMetrics = await page.evaluate(() => {
    const app = document.querySelector('[class*="appContainer"]') as HTMLElement;
    const navPanel = document.querySelector('[data-testid="navPanel"]') as HTMLElement;
    const mainContentArea = app.querySelector('[class*="mainContentArea"]') as HTMLElement;
    const appStyle = getComputedStyle(app);
    const navPanelStyle = getComputedStyle(navPanel);
    const mainStyle = getComputedStyle(mainContentArea);
    return {
      overflowX: appStyle.overflowX,
      clientWidth: app.clientWidth,
      scrollWidth: app.scrollWidth,
      navTop: navPanel.getBoundingClientRect().top,
      navBackground: navPanelStyle.backgroundColor,
      mainBackground: mainStyle.backgroundColor,
    };
  });

  await scrollAppContainerTo(page, "bottom");

  const bottomMetrics = await page.evaluate(() => {
    const app = document.querySelector('[class*="appContainer"]') as HTMLElement;
    const navPanel = document.querySelector('[data-testid="navPanel"]') as HTMLElement;
    return {
      clientWidth: app.clientWidth,
      scrollWidth: app.scrollWidth,
      navTop: navPanel.getBoundingClientRect().top,
    };
  });

  expect(topMetrics.overflowX).toBe("hidden");
  expect(topMetrics.scrollWidth).toBeLessThanOrEqual(topMetrics.clientWidth);
  expect(bottomMetrics.scrollWidth).toBeLessThanOrEqual(bottomMetrics.clientWidth);
  expect(Math.abs(bottomMetrics.navTop - topMetrics.navTop)).toBeLessThanOrEqual(1);
  expect(topMetrics.mainBackground).toBe("rgb(248, 250, 251)");
  expect(topMetrics.navBackground).toBe(topMetrics.mainBackground);
});

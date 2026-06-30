import { expect, test } from "../../testing/fixtures";

test.describe("App shell foundation", () => {
  test("ready event fires once after App renders", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{0}" onReady="count++">
        <Button testId="rerender" onClick="count = count">Re-render</Button>
        <Text testId="count">{count}</Text>
      </App>
    `);

    await expect(page.getByTestId("count")).toHaveText("1");
    await page.getByTestId("rerender").click();
    await expect(page.getByTestId("count")).toHaveText("1");
  });

  test("messageReceived receives posted data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="none" onMessageReceived="msg => message = msg.text">
        <Text testId="message">{message}</Text>
      </App>
    `);

    await page.evaluate(() => {
      window.postMessage({ text: "hello-app" }, "*");
    });

    await expect(page.getByTestId("message")).toHaveText("hello-app");
  });

  test("keyDown and keyUp receive keyboard events", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App
        var.lastKey="none"
        onKeyDown="event => lastKey = 'down:' + event.key"
        onKeyUp="event => lastKey = 'up:' + event.key">
        <Text testId="content">Press a key</Text>
        <Text testId="lastKey">{lastKey}</Text>
      </App>
    `);

    await expect(page.getByTestId("content")).toBeVisible();
    await page.keyboard.down("x");
    await expect(page.getByTestId("lastKey")).toHaveText("down:x");

    await page.keyboard.up("x");
    await expect(page.getByTestId("lastKey")).toHaveText("up:x");
  });

  test("scrollWholePage controls whether App content is the scroll container", async ({
    initTestBed,
    page,
  }) => {
    const rows = Array.from({ length: 100 }, (_, index) => `<Text>Row ${index + 1}</Text>`).join(
      "\n",
    );
    const tallContent = `
      <App testId="app">
        <Pages>
          <Page url="/">
            <VStack testId="tall-content">
              ${rows}
            </VStack>
          </Page>
        </Pages>
      </App>
    `;

    await initTestBed(tallContent);
    await expect(page.getByTestId("app")).toHaveClass(/scrollWholePage/);

    const defaultScrollInfo = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const content = document.querySelector("[data-xmlui-part='content']") as HTMLElement;
      const appStyle = getComputedStyle(app);
      const contentStyle = getComputedStyle(content);
      const scrollingElement = document.scrollingElement as HTMLElement;
      return {
        appOverflow: appStyle.overflow,
        contentOverflow: contentStyle.overflow,
        appCanScroll: app.scrollHeight > app.clientHeight,
        documentCanScroll: scrollingElement.scrollHeight > scrollingElement.clientHeight,
        contentCanScroll: content.scrollHeight > content.clientHeight,
      };
    });

    expect(defaultScrollInfo).toMatchObject({
      appOverflow: "auto",
      contentOverflow: "visible",
      appCanScroll: true,
      documentCanScroll: false,
      contentCanScroll: false,
    });

    await initTestBed(
      tallContent.replace(
        "<App testId=\"app\">",
        "<App testId=\"app\" scrollWholePage=\"false\">",
      ),
    );

    const contentScrollInfo = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const content = document.querySelector("[data-xmlui-part='content']") as HTMLElement;
      const appStyle = getComputedStyle(app);
      const contentStyle = getComputedStyle(content);
      const scrollingElement = document.scrollingElement as HTMLElement;
      return {
        appOverflow: appStyle.overflow,
        contentOverflow: contentStyle.overflow,
        appCanScroll: app.scrollHeight > app.clientHeight,
        documentCanScroll: scrollingElement.scrollHeight > scrollingElement.clientHeight,
        contentCanScroll: content.scrollHeight > content.clientHeight,
      };
    });

    expect(contentScrollInfo).toMatchObject({
      appOverflow: "hidden",
      contentOverflow: "auto",
      appCanScroll: false,
      documentCanScroll: false,
      contentCanScroll: true,
    });
  });

  test("horizontal-sticky pins header and footer while the App scrolls", async ({
    initTestBed,
    page,
  }) => {
    const rows = Array.from({ length: 100 }, (_, index) => `<Text>Row ${index + 1}</Text>`).join(
      "\n",
    );
    await initTestBed(`
      <App testId="app" layout="horizontal-sticky">
        <AppHeader>
          <property name="logoTemplate">
            <Heading level="h3" value="Example App" />
          </property>
        </AppHeader>
        <NavPanel>
          <NavLink label="Home" to="/" icon="home" />
          <NavLink label="Page 1" to="/page1" />
          <NavLink label="Page 2" to="/page2" />
        </NavPanel>
        <Pages>
          <Page url="/">
            <VStack>
              ${rows}
            </VStack>
          </Page>
        </Pages>
        <Footer>Powered by XMLUI</Footer>
      </App>
    `);

    const stickyMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      app.scrollTop = 500;
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const navPanel = document.querySelector("[data-xmlui-part='navPanel']") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const headerRect = header.getBoundingClientRect();
      const navPanelRect = navPanel.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const appRect = app.getBoundingClientRect();
      const headerStyle = getComputedStyle(header);
      const navPanelStyle = getComputedStyle(navPanel);
      const footerStyle = getComputedStyle(footer);
      return {
        appCanScroll: app.scrollHeight > app.clientHeight,
        appScrollTop: app.scrollTop,
        headerPosition: headerStyle.position,
        navPanelPosition: navPanelStyle.position,
        footerPosition: getComputedStyle(footer).position,
        headerTopDelta: Math.round(headerRect.top - appRect.top),
        headerZIndex: Number(headerStyle.zIndex),
        navPanelTopDelta: Math.round(navPanelRect.top - appRect.top),
        navPanelZIndex: Number(navPanelStyle.zIndex),
        headerHeight: Math.round(headerRect.height),
        footerBottomDelta: Math.round(appRect.bottom - footerRect.bottom),
        footerBackgroundColor: footerStyle.backgroundColor,
      };
    });

    expect(stickyMetrics).toMatchObject({
      appCanScroll: true,
      appScrollTop: 500,
      headerPosition: "sticky",
      navPanelPosition: "sticky",
      footerPosition: "sticky",
      headerTopDelta: 0,
      footerBottomDelta: 0,
    });
    expect(Math.abs(stickyMetrics.navPanelTopDelta - stickyMetrics.headerHeight)).toBeLessThanOrEqual(
      1,
    );
    expect(stickyMetrics.headerZIndex).toBeGreaterThan(stickyMetrics.navPanelZIndex);
    expect(stickyMetrics.footerBackgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("condensed layout renders NavPanel inside the AppHeader", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App testId="app" layout="condensed">
        <AppHeader>
          <property name="logoTemplate">
            <Heading level="h3" value="Example App" />
          </property>
        </AppHeader>
        <NavPanel testId="navPanel">
          <NavLink label="Home" to="/" icon="home" />
          <NavLink label="Page 1" to="/page1" />
          <NavLink label="Page 2" to="/page2" />
        </NavPanel>
        <Pages>
          <Page url="/">
            <Text>Home</Text>
          </Page>
        </Pages>
      </App>
    `);

    const condensedMetrics = await page.evaluate(() => {
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const navPanel = document.querySelector("[data-testid='navPanel']") as HTMLElement;
      const subNavSlot = document.querySelector("[data-xmlui-part='subNavPanel']") as HTMLElement;
      const logoAndTitle = header.querySelector("[class*='logoAndTitle']") as HTMLElement;
      const headerRect = header.getBoundingClientRect();
      const navRect = navPanel.getBoundingClientRect();
      const slotRect = subNavSlot.getBoundingClientRect();
      const logoRect = logoAndTitle.getBoundingClientRect();
      return {
        navInHeaderTop: navRect.top >= headerRect.top,
        navInHeaderBottom: navRect.bottom <= headerRect.bottom,
        navInSlotTop: Math.round(navRect.top - slotRect.top),
        titleToNavGap: Math.round(navRect.left - logoRect.right),
        headerHeight: Math.round(headerRect.height),
        navHeight: Math.round(navRect.height),
        slotWidth: Math.round(slotRect.width),
      };
    });

    expect(condensedMetrics).toMatchObject({
      navInHeaderTop: true,
      navInHeaderBottom: true,
      navInSlotTop: 0,
    });
    expect(condensedMetrics.navHeight).toBeLessThanOrEqual(condensedMetrics.headerHeight);
    expect(condensedMetrics.slotWidth).toBeGreaterThan(0);
    expect(condensedMetrics.titleToNavGap).toBeGreaterThanOrEqual(24);
  });

  test("vertical layout renders the side NavPanel beside the main content column", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App testId="app" layout="vertical">
        <AppHeader>
          <property name="logoTemplate">
            <Heading level="h3" value="Example App" />
          </property>
        </AppHeader>
        <NavPanel testId="navPanel">
          <NavLink label="Home" to="/" icon="home" />
          <NavLink label="Page 1" to="/page1" />
          <NavLink label="Page 2" to="/page2" />
        </NavPanel>
        <Pages>
          <Page url="/">
            <Text>Home</Text>
          </Page>
        </Pages>
        <Footer>Powered by XMLUI</Footer>
      </App>
    `);

    const verticalMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const navPanel = app.querySelector(":scope > [data-xmlui-part='navPanel']") as HTMLElement;
      const content = app.querySelector(":scope > [data-xmlui-part='content']") as HTMLElement;
      const header = content.querySelector(":scope > [data-xmlui-part='header']") as HTMLElement;
      const pageContent = document.querySelector("[data-xmlui-part='pageContent']") as HTMLElement;
      const footer = content.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const appRect = app.getBoundingClientRect();
      const navRect = navPanel.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const pageContentRect = pageContent.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      return {
        appDirection: getComputedStyle(app).flexDirection,
        contentDirection: getComputedStyle(content).flexDirection,
        navAtAppLeft: Math.round(navRect.left - appRect.left),
        contentAfterNav: Math.round(contentRect.left - navRect.right),
        headerInsideContent: headerRect.left >= contentRect.left && headerRect.right <= contentRect.right,
        pageBelowHeader: Math.round(pageContentRect.top - headerRect.bottom),
        footerInsideContent: footerRect.left >= contentRect.left && footerRect.right <= contentRect.right,
      };
    });

    expect(verticalMetrics).toMatchObject({
      appDirection: "row",
      contentDirection: "column",
      navAtAppLeft: 0,
      contentAfterNav: 0,
      headerInsideContent: true,
      footerInsideContent: true,
    });
    expect(verticalMetrics.pageBelowHeader).toBeGreaterThanOrEqual(0);
  });

  test("vertical layout moves branding to the side NavPanel", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App testId="app" layout="vertical">
        <AppHeader>
          <property name="logoTemplate">
            <Heading level="h3" value="Example App" />
          </property>
        </AppHeader>
        <NavPanel testId="navPanel">
          <NavLink label="Home" to="/" icon="home" />
          <NavLink label="Page 1" to="/page1" />
        </NavPanel>
        <Pages>
          <Page url="/">
            <Text>Home</Text>
          </Page>
        </Pages>
      </App>
    `, {
      resources: {
        logo: "/resources/test-image-100x100.jpg",
      },
    });

    const header = page.locator("[data-xmlui-part='header']");
    await expect(header).not.toContainText("Example App");

    const navLogo = page.locator("[data-testid='navPanel'] [data-xmlui-part='logo'] img");
    await expect(navLogo).toBeVisible();
    await expect(navLogo).toHaveAttribute("src", "/resources/test-image-100x100.jpg");

    await page.locator("[data-testid='navPanel'] a", { hasText: "Page 1" }).hover();
    await page.waitForTimeout(100);
    const navMetrics = await page.evaluate(() => {
      const navPanel = document.querySelector("[data-testid='navPanel']") as HTMLElement;
      const logo = navPanel.querySelector("[data-xmlui-part='logo'] img") as HTMLElement;
      const logoWrapper = navPanel.querySelector("[data-xmlui-part='logo']") as HTMLElement;
      const links = Array.from(navPanel.querySelectorAll("a, button")) as HTMLElement[];
      const homeLink = links.find((link) => link.textContent?.includes("Home"))!;
      const page1Link = links.find((link) => link.textContent?.includes("Page 1"))!;
      const navRect = navPanel.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const logoWrapperRect = logoWrapper.getBoundingClientRect();
      const homeRect = homeLink.getBoundingClientRect();
      const page1Rect = page1Link.getBoundingClientRect();
      const homeIndicator = getComputedStyle(homeLink, "::after");
      const homeIndent = getComputedStyle(homeLink, "::before");
      const page1Indicator = getComputedStyle(page1Link, "::after");
      return {
        logoTop: Math.round(logoRect.top - navRect.top),
        logoLeft: Math.round(logoRect.left - navRect.left),
        logoCenteredOffset: Math.abs(
          Math.round(
            logoRect.left - logoWrapperRect.left - (logoWrapperRect.width - logoRect.width) / 2,
          ),
        ),
        logoHeight: Math.round(logoRect.height),
        logoWrapperWidth: Math.round(logoWrapperRect.width),
        firstLinkTop: Math.round(homeRect.top - navRect.top),
        homeLinkWidth: Math.round(homeRect.width),
        homeIndentWidth: Math.round(Number.parseFloat(homeIndent.width)),
        homeIndicatorWidth: Math.round(Number.parseFloat(homeIndicator.width)),
        homeIndicatorHeight: Math.round(Number.parseFloat(homeIndicator.height)),
        homeLinkHeight: Math.round(homeRect.height),
        homeIndicatorTop: Math.round(Number.parseFloat(homeIndicator.top)),
        page1IndicatorWidth: Math.round(Number.parseFloat(page1Indicator.width)),
        page1IndicatorHeight: Math.round(Number.parseFloat(page1Indicator.height)),
        page1LinkHeight: Math.round(page1Rect.height),
        page1IndicatorTop: Math.round(Number.parseFloat(page1Indicator.top)),
        page1IndicatorColor: page1Indicator.backgroundColor,
      };
    });

    expect(navMetrics).toMatchObject({
      logoTop: 36,
      logoCenteredOffset: 0,
      logoHeight: 24,
      logoWrapperWidth: 244,
      firstLinkTop: 92,
      homeLinkWidth: 244,
      homeIndentWidth: 0,
      homeIndicatorWidth: 2,
      homeIndicatorTop: 0,
      page1IndicatorWidth: 2,
      page1IndicatorTop: 0,
    });
    expect(navMetrics.homeIndicatorHeight).toBe(navMetrics.homeLinkHeight);
    expect(navMetrics.page1IndicatorHeight).toBe(navMetrics.page1LinkHeight);
    expect(navMetrics.page1IndicatorColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("vertical layout keeps scrolling inside the main content area", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App testId="app" layout="vertical">
        <AppHeader>
          <property name="logoTemplate">
            <Heading level="h3" value="Example App" />
          </property>
        </AppHeader>
        <NavPanel>
          <NavLink label="Home" to="/" icon="home" />
        </NavPanel>
        <Pages>
          <Page url="/">
            <VStack>
              <Card title="Item 1" />
              <Card title="Item 2" />
              <Card title="Item 3" />
              <Card title="Item 4" />
              <Card title="Item 5" />
              <Card title="Item 6" />
              <Card title="Item 7" />
              <Card title="Item 8" />
              <Card title="Item 9" />
              <Card title="Item 10" />
              <Card title="Item 11" />
              <Card title="Item 12" />
            </VStack>
          </Page>
        </Pages>
      </App>
    `);

    const scrollMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const content = app.querySelector(":scope > [data-xmlui-part='content']") as HTMLElement;
      const scrollingElement = document.scrollingElement as HTMLElement;
      const contentStyle = getComputedStyle(content);
      return {
        contentOverflow: contentStyle.overflow,
        contentScrollbarGutter: contentStyle.scrollbarGutter,
        contentCanScroll: content.scrollHeight > content.clientHeight,
        documentCanScroll: scrollingElement.scrollHeight > scrollingElement.clientHeight,
        bodyClientWidth: document.body.clientWidth,
        documentClientWidth: document.documentElement.clientWidth,
        windowInnerWidth: window.innerWidth,
      };
    });

    expect(scrollMetrics).toMatchObject({
      contentOverflow: "auto",
      contentCanScroll: true,
      documentCanScroll: false,
    });
    expect(scrollMetrics.contentScrollbarGutter).toContain("stable");
    expect(scrollMetrics.bodyClientWidth).toBe(scrollMetrics.windowInnerWidth);
    expect(scrollMetrics.documentClientWidth).toBe(scrollMetrics.windowInnerWidth);
  });

  test("vertical-full-header default scroll keeps chrome pinned and does not scroll the List", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const items = Array.from({ length: 16 }, (_, index) => ({
      title: `Coffee ${index + 1}`,
      description:
        "A full description long enough to make the card consume vertical space in the layout.",
    }));

    await initTestBed(`
      <App testId="app" layout="vertical-full-header">
        <AppHeader>
          <property name="logoTemplate">
            <Heading level="h3" value="Example App" />
          </property>
        </AppHeader>
        <NavPanel>
          <NavLink label="Home" to="/" icon="home" />
          <NavLink label="Page 1" to="/page1" />
          <NavLink label="Page 2" to="/page2" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <List testId="coffee-list" data='{${JSON.stringify(items)}}'>
              <property name="itemTemplate">
                <Card title="{$item.title}" subtitle="{$item.description}" />
              </property>
            </List>
          </Page>
        </Pages>
        <Footer>Powered by XMLUI</Footer>
      </App>
    `);

    const initialMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const list = document.querySelector("[data-testid='coffee-list']") as HTMLElement;
      const navPanel = document.querySelector("[data-xmlui-part='navPanel']") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      return {
        appCanScroll: app.scrollHeight > app.clientHeight,
        listCanScroll: list.scrollHeight > list.clientHeight,
        navPanelHeight: Math.round(navPanel.getBoundingClientRect().height),
        footerHeight: Math.round(footer.getBoundingClientRect().height),
      };
    });

    expect(initialMetrics.appCanScroll).toBe(true);
    expect(initialMetrics.listCanScroll).toBe(false);
    expect(initialMetrics.navPanelHeight).toBeLessThan(720);
    expect(initialMetrics.footerHeight).toBeGreaterThan(0);

    const scrolledMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const navPanel = document.querySelector("[data-xmlui-part='navPanel']") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const list = document.querySelector("[data-testid='coffee-list']") as HTMLElement;
      app.scrollTop = 300;
      list.scrollTop = 100;
      const appRect = app.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const navRect = navPanel.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      return {
        appScrollTop: Math.round(app.scrollTop),
        listScrollTop: Math.round(list.scrollTop),
        headerTop: Math.round(headerRect.top - appRect.top),
        navTop: Math.round(navRect.top - appRect.top),
        headerBottom: Math.round(headerRect.bottom - appRect.top),
        footerBottom: Math.round(appRect.bottom - footerRect.bottom),
      };
    });

    expect(scrolledMetrics.appScrollTop).toBeGreaterThan(0);
    expect(scrolledMetrics.listScrollTop).toBe(0);
    expect(scrolledMetrics.headerTop).toBe(0);
    expect(Math.abs(scrolledMetrics.navTop - scrolledMetrics.headerBottom)).toBeLessThanOrEqual(1);
    expect(scrolledMetrics.footerBottom).toBe(0);
  });
});

test.describe("App shell old-suite transfer debt", () => {
  test("messageReceived passes the MessageEvent as the second argument", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        var.eventInfo="none"
        onMessageReceived="(msg, ev) => eventInfo = msg.text + ':' + ev.type">
        <Text testId="eventInfo">{eventInfo}</Text>
      </App>
    `);

    await page.evaluate(() => {
      window.postMessage({ text: "hello-app-event" }, "*");
    });

    await expect(page.getByTestId("eventInfo")).toHaveText("hello-app-event:message");
  });
});

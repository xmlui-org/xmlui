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
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const navPanel = document.querySelector("[data-xmlui-part='navPanel']") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const initialNavPanelRect = navPanel.getBoundingClientRect();

      app.scrollTop = 500;

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
        initialNavPanelHeight: Math.round(initialNavPanelRect.height),
        scrolledNavPanelHeight: Math.round(navPanelRect.height),
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
    expect(stickyMetrics.navPanelTopDelta).toBe(stickyMetrics.headerHeight);
    expect(stickyMetrics.scrolledNavPanelHeight).toBe(stickyMetrics.initialNavPanelHeight);
    expect(stickyMetrics.headerZIndex).toBeGreaterThan(stickyMetrics.navPanelZIndex);
    expect(stickyMetrics.footerBackgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("horizontal layouts keep NavPanel at content height by default", async ({
    initTestBed,
    page,
  }) => {
    for (const layout of ["horizontal", "horizontal-sticky"]) {
      await initTestBed(`
        <App testId="app" layout="${layout}">
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

      const metrics = await page.evaluate(() => {
        const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
        const navPanelWrapper = document.querySelector(
          "[data-xmlui-component='App'][data-xmlui-part='navPanel']",
        ) as HTMLElement;
        const navPanel = document.querySelector("[data-testid='navPanel']") as HTMLElement;
        const headerRect = header.getBoundingClientRect();
        const wrapperRect = navPanelWrapper.getBoundingClientRect();
        const navRect = navPanel.getBoundingClientRect();
        return {
          headerHeight: Math.round(headerRect.height),
          wrapperHeight: Math.round(wrapperRect.height),
          navHeight: Math.round(navRect.height),
          headerHeightVar: getComputedStyle(navPanel).getPropertyValue("--xmlui-height-AppHeader"),
          navBelowHeader: Math.round(wrapperRect.top - headerRect.bottom),
        };
      });

      expect(metrics.headerHeightVar).toBe("");
      expect(metrics.navBelowHeader).toBe(0);
      expect(metrics.navHeight).toBeLessThan(metrics.headerHeight);
      expect(metrics.wrapperHeight).toBe(metrics.navHeight + 1);
    }
  });

  test("desktop layout hides NavPanel and scrolls only the page content", async ({
    initTestBed,
    page,
  }) => {
    const rows = Array.from({ length: 100 }, (_, index) => (
      `{ title: 'Row ${index + 1}', description: 'Description ${index + 1}' }`
    )).join(", ");
    await initTestBed(`
      <App testId="app" layout="desktop">
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
            <List data="{[${rows}]}">
              <property name="itemTemplate">
                <Card title="{$item.title}" subtitle="{$item.description}" />
              </property>
            </List>
          </Page>
        </Pages>
        <Footer>Powered by XMLUI</Footer>
      </App>
    `);

    const desktopMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      app.style.setProperty("--scrollbar-width", "16px");
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const navPanel = document.querySelector("[data-testid='navPanel']");
      const content = document.querySelector(
        "[data-xmlui-component='App'][data-xmlui-part='content']",
      ) as HTMLElement;
      const appHeader = document.querySelector("[data-xmlui-component='AppHeader']") as HTMLElement;
      const headerInner = appHeader.firstElementChild as HTMLElement;
      const appTitle = [...appHeader.querySelectorAll("h3")]
        .find((heading) => heading.textContent?.trim() === "Example App") as HTMLElement;
      const pageContent = document.querySelector("[data-xmlui-part='pageContent']") as HTMLElement;
      const pageRoot = document.querySelector(
        "[data-xmlui-component='Page'][data-xmlui-part='root']",
      ) as HTMLElement;
      const list = document.querySelector("[data-xmlui-component='List']") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const footerOuter = footer.firstElementChild as HTMLElement;
      const footerContent = footerOuter.firstElementChild as HTMLElement;
      const appRect = app.getBoundingClientRect();
      const headerRectBefore = header.getBoundingClientRect();
      const footerRectBefore = footer.getBoundingClientRect();
      const listRectBefore = list.getBoundingClientRect();
      pageContent.scrollTop = 500;
      const headerRectAfter = header.getBoundingClientRect();
      const footerRectAfter = footer.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const pageContentRect = pageContent.getBoundingClientRect();
      const listRectAfter = list.getBoundingClientRect();
      const appHeaderRect = appHeader.getBoundingClientRect();
      const headerInnerRect = headerInner.getBoundingClientRect();
      const appTitleRect = appTitle.getBoundingClientRect();
      const footerOuterRect = footerOuter.getBoundingClientRect();
      const footerContentRect = footerContent.getBoundingClientRect();
      const headerStyle = getComputedStyle(header);
      const appHeaderStyle = getComputedStyle(appHeader);
      const headerInnerStyle = getComputedStyle(headerInner);
      const footerOuterStyle = getComputedStyle(footerOuter);
      const footerContentStyle = getComputedStyle(footerContent);
      const pageRootStyle = getComputedStyle(pageRoot);
      const listStyle = getComputedStyle(list);
      return {
        navPanelRendered: !!navPanel,
        appCanScroll: app.scrollHeight > app.clientHeight,
        contentCanScroll: content.scrollHeight > content.clientHeight,
        pageContentCanScroll: pageContent.scrollHeight > pageContent.clientHeight,
        pageContentScrollTop: pageContent.scrollTop,
        listScrollTop: list.scrollTop,
        listOverflow: listStyle.overflow,
        headerTopBefore: Math.round(headerRectBefore.top - appRect.top),
        headerTopAfter: Math.round(headerRectAfter.top - appRect.top),
        headerMarginLeft: Math.round(parseFloat(headerStyle.marginLeft)),
        appHeaderPaddingLeft: Math.round(parseFloat(appHeaderStyle.paddingLeft)),
        appHeaderLeft: Math.round(appHeaderRect.left - headerRectAfter.left),
        appHeaderWidth: Math.round(appHeaderRect.width),
        headerWidth: Math.round(headerRectAfter.width),
        headerInnerLeft: Math.round(headerInnerRect.left - headerRectAfter.left),
        headerInnerPaddingLeft: Math.round(parseFloat(headerInnerStyle.paddingLeft)),
        headerInnerMaxWidth: Math.round(parseFloat(headerInnerStyle.maxWidth)),
        appTitleOffsetFromHeaderInner: Math.round(appTitleRect.left - headerInnerRect.left),
        footerBottomBefore: Math.round(appRect.bottom - footerRectBefore.bottom),
        footerBottomAfter: Math.round(appRect.bottom - footerRectAfter.bottom),
        footerOuterPaddingLeft: Math.round(parseFloat(footerOuterStyle.paddingLeft)),
        footerContentPaddingLeft: Math.round(parseFloat(footerContentStyle.paddingLeft)),
        footerContentLeft: Math.round(footerContentRect.left - footerOuterRect.left),
        contentBelowHeader: Math.round(contentRect.top - headerRectAfter.bottom),
        pageContentStartsAtContent: Math.round(pageContentRect.left - contentRect.left),
        pageContentWidth: Math.round(pageContentRect.width),
        contentWidth: Math.round(contentRect.width),
        pageRootPaddingTop: Math.round(parseFloat(pageRootStyle.paddingTop)),
        listBelowPageContentBefore: Math.round(listRectBefore.top - pageContentRect.top),
        listBelowPageContentAfter: Math.round(listRectAfter.top - pageContentRect.top),
      };
    });

    expect(desktopMetrics).toMatchObject({
      navPanelRendered: false,
      appCanScroll: false,
      contentCanScroll: false,
      pageContentCanScroll: true,
      pageContentScrollTop: 500,
      listScrollTop: 0,
      listOverflow: "visible",
      headerTopBefore: 0,
      headerTopAfter: 0,
      headerMarginLeft: 0,
      appHeaderPaddingLeft: 0,
      appHeaderLeft: 0,
      footerBottomBefore: 0,
      footerBottomAfter: 0,
      footerOuterPaddingLeft: 0,
      footerContentPaddingLeft: 14,
      contentBelowHeader: 0,
      pageContentStartsAtContent: 0,
      pageRootPaddingTop: 20,
    });
    expect(desktopMetrics.appHeaderWidth).toBe(desktopMetrics.headerWidth);
    expect(desktopMetrics.headerInnerMaxWidth).toBeGreaterThan(0);
    expect(desktopMetrics.headerInnerLeft).toBeGreaterThanOrEqual(0);
    expect(desktopMetrics.headerInnerPaddingLeft).toBe(16);
    expect(desktopMetrics.appTitleOffsetFromHeaderInner).toBe(16);
    expect(desktopMetrics.footerContentLeft).toBe(desktopMetrics.headerInnerLeft);
    expect(desktopMetrics.listBelowPageContentBefore).toBe(desktopMetrics.pageRootPaddingTop);
    expect(desktopMetrics.listBelowPageContentAfter).toBeLessThan(0);
    expect(desktopMetrics.pageContentWidth).toBe(desktopMetrics.contentWidth);
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
    await page.setViewportSize({ width: 1280, height: 720 });
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
      firstLinkTop: 92,
      homeIndentWidth: 0,
      homeIndicatorWidth: 2,
      homeIndicatorTop: 0,
      page1IndicatorWidth: 2,
      page1IndicatorTop: 0,
    });
    expect(navMetrics.logoWrapperWidth).toBe(navMetrics.homeLinkWidth);
    expect(navMetrics.homeLinkWidth).toBeGreaterThanOrEqual(244);
    expect(navMetrics.homeLinkWidth).toBeLessThanOrEqual(255);
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

  test("vertical layouts with scrollWholePage false clamp the App and do not gutter-shift content", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const rows = Array.from({ length: 32 }, (_, index) => (
      `{ title: 'Coffee ${index + 1}', description: 'Description ${index + 1}' }`
    )).join(", ");

    for (const layout of ["vertical", "vertical-sticky"]) {
      await initTestBed(`
        <App testId="app" layout="${layout}" scrollWholePage="false">
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
              <List data="{[${rows}]}">
                <property name="itemTemplate">
                  <Card title="{$item.title}" subtitle="{$item.description}" />
                </property>
              </List>
            </Page>
          </Pages>
          <Footer>Powered by XMLUI</Footer>
        </App>
      `);

      const metrics = await page.evaluate(() => {
        const app = document.querySelector("[data-testid='app']") as HTMLElement;
        const navPanel = document.querySelector("[data-xmlui-part='navPanel']") as HTMLElement;
        const content = document.querySelector(
          "[data-xmlui-component='App'][data-xmlui-part='content']",
        ) as HTMLElement;
        const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
        const pages = document.querySelector("[data-xmlui-part='pages']") as HTMLElement;
        const pageContent = document.querySelector("[data-xmlui-part='pageContent']") as HTMLElement;
        const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
        const appRect = app.getBoundingClientRect();
        const navRect = navPanel.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        const pagesRect = pages.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        const appStyle = getComputedStyle(app);
        const contentStyle = getComputedStyle(content);
        const pagesStyle = getComputedStyle(pages);
        const pageContentStyle = getComputedStyle(pageContent);
        content.scrollTop = 300;
        app.scrollTop = 300;
        return {
          appHeight: Math.round(appRect.height),
          appOverflow: appStyle.overflow,
          appCanScroll: app.scrollHeight > app.clientHeight,
          appScrollTop: Math.round(app.scrollTop),
          contentLeftDelta: Math.round(contentRect.left - navRect.right),
          contentWidth: Math.round(contentRect.width),
          headerLeftDelta: Math.round(headerRect.left - contentRect.left),
          headerWidth: Math.round(headerRect.width),
          contentOverflow: contentStyle.overflow,
          contentCanScroll: content.scrollHeight > content.clientHeight,
          contentScrollTop: Math.round(content.scrollTop),
          pagesOverflow: pagesStyle.overflow,
          pageContentOverflow: pageContentStyle.overflow,
          pagesTopDelta: Math.round(pagesRect.top - headerRect.bottom),
          footerBottomDelta: Math.round(appRect.bottom - footerRect.bottom),
          documentCanScroll: document.scrollingElement!.scrollHeight >
            document.scrollingElement!.clientHeight,
        };
      });

      expect(metrics).toMatchObject({
        appHeight: 720,
        appOverflow: "clip",
        appCanScroll: false,
        appScrollTop: 0,
        contentLeftDelta: 0,
        headerLeftDelta: 0,
        contentOverflow: "visible",
        contentCanScroll: false,
        contentScrollTop: 0,
        pagesOverflow: "hidden",
        pageContentOverflow: "hidden",
        pagesTopDelta: 0,
        footerBottomDelta: 0,
        documentCanScroll: false,
      });
      expect(metrics.headerWidth).toBe(metrics.contentWidth);
    }
  });

  test("narrow screens move every layout NavPanel into the hamburger drawer", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    const layouts = [
      "vertical",
      "vertical-sticky",
      "vertical-full-header",
      "horizontal",
      "horizontal-sticky",
      "condensed",
      "condensed-sticky",
      "desktop",
    ];

    for (const layout of layouts) {
      await initTestBed(`
        <App layout="${layout}" testId="app">
          <AppHeader testId="header">
            <property name="logoTemplate">
              <Heading level="h3" value="Example App"/>
            </property>
          </AppHeader>
          <NavPanel testId="navPanel">
            <NavLink label="Home" to="/" icon="home"/>
            <NavLink label="Page 1" to="/page1"/>
            <NavLink label="Page 2" to="/page2"/>
          </NavPanel>
          <Pages>
            <Page url="/">
              <Text testId="content" value="${layout} content"/>
            </Page>
            <Page url="/page1">
              <Text testId="content" value="${layout} page 1"/>
            </Page>
          </Pages>
          <Footer>Powered by XMLUI</Footer>
        </App>
      `);

      await expect(page.getByTestId("app")).toHaveClass(/mobile/);
      await expect(page.getByTestId("header")).toBeVisible();
      await expect(page.getByTestId("content")).toHaveText(`${layout} content`);
      await expect(page.getByTestId("navPanel")).not.toBeVisible();

      const hamburger = page.locator('[data-part-id="hamburger"]').first();
      await expect(hamburger).toBeVisible();
      const headerMetrics = await page.evaluate(() => {
        const header = document.querySelector("[data-testid='header']") as HTMLElement;
        const headerInner = header.firstElementChild as HTMLElement;
        const drawerToggle = document.querySelector("[data-xmlui-part='drawerToggle']") as HTMLElement;
        const title = [...header.querySelectorAll("h1,h2,h3,a,span")]
          .find((element) => element.textContent?.trim() === "Example App") as HTMLElement;
        const headerRect = header.getBoundingClientRect();
        const drawerToggleRect = drawerToggle.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        return {
          headerInnerPaddingLeft: Math.round(parseFloat(getComputedStyle(headerInner).paddingLeft)),
          drawerToggleLeft: Math.round(drawerToggleRect.left - headerRect.left),
          drawerToggleTop: Math.round(drawerToggleRect.top - headerRect.top),
          drawerToggleWidth: Math.round(drawerToggleRect.width),
          titleLeftFromDrawerToggle: Math.round(titleRect.left - drawerToggleRect.left),
          titleTop: Math.round(titleRect.top - headerRect.top),
        };
      });
      expect(headerMetrics).toMatchObject({
        headerInnerPaddingLeft: 30,
        drawerToggleLeft: 30,
        drawerToggleTop: 7,
        drawerToggleWidth: 42,
        titleLeftFromDrawerToggle: 58,
        titleTop: 17,
      });
      await hamburger.click();

      await expect(page.locator('[data-xmlui-part="drawer"][data-state="open"]')).toBeVisible();
      await expect(page.getByTestId("navPanel")).toBeVisible();
      await page.waitForTimeout(350);

      const drawerMetrics = await page.evaluate(() => {
        const app = document.querySelector("[data-testid='app']") as HTMLElement;
        const dialog = document.querySelector("[data-xmlui-part='drawer'] [role='dialog']") as HTMLElement;
        const navPanel = document.querySelector("[data-testid='navPanel']") as HTMLElement;
        const overlay = document.querySelector("[data-xmlui-part='drawer'] button[aria-hidden='true']") as HTMLElement;
        const closeButton = document.querySelector(
          "[data-xmlui-part='drawer'] button[aria-label='Close navigation menu']",
        ) as HTMLElement;
        const closeIcon = closeButton.querySelector("svg[data-icon-name='close']") as SVGElement;
        const logoWrapper = navPanel.querySelector("[data-xmlui-part='logo']") as HTMLElement;
        const appRect = app.getBoundingClientRect();
        const dialogRect = dialog.getBoundingClientRect();
        const navRect = navPanel.getBoundingClientRect();
        const closeRect = closeButton.getBoundingClientRect();
        const closeStyle = getComputedStyle(closeButton);
        const overlayStyle = getComputedStyle(overlay);
        const dialogStyle = getComputedStyle(dialog);
        const logoWrapperStyle = getComputedStyle(logoWrapper);
        return {
          dialogLeft: Math.round(dialogRect.left - appRect.left),
          dialogWidth: Math.round(dialogRect.width),
          dialogAnimation: dialogStyle.animationName,
          overlayAnimation: overlayStyle.animationName,
          navLeft: Math.round(navRect.left - dialogRect.left),
          navWidth: Math.round(navRect.width),
          closeTop: Math.round(closeRect.top - dialogRect.top),
          closeRight: Math.round(dialogRect.right - closeRect.right),
          closeOpacity: closeStyle.opacity,
          closePaddingLeft: Math.round(parseFloat(closeStyle.paddingLeft)),
          closeIconName: closeIcon?.getAttribute("data-icon-name"),
          logoMinHeight: Math.round(parseFloat(logoWrapperStyle.minHeight)),
          appWidth: Math.round(appRect.width),
        };
      });

      expect(drawerMetrics).toMatchObject({
        dialogLeft: 0,
        navLeft: 0,
      });
      expect(drawerMetrics.dialogWidth).toBe(drawerMetrics.appWidth);
      expect(drawerMetrics.navWidth).toBe(drawerMetrics.appWidth);
      expect(drawerMetrics.dialogAnimation).toContain("slide-in-from-left");
      expect(drawerMetrics.overlayAnimation).toContain("blur-in");
      expect(drawerMetrics.closeTop).toBe(8);
      expect(drawerMetrics.closeRight).toBe(8);
      expect(drawerMetrics.closeOpacity).toBe("0.7");
      expect(drawerMetrics.closePaddingLeft).toBe(4);
      expect(drawerMetrics.closeIconName).toBe("close");
      expect(drawerMetrics.logoMinHeight).toBe(32);

      await page.locator('[data-xmlui-part="drawer"] a', { hasText: "Page 1" }).click();
      await expect(page.getByTestId("content")).toHaveText(`${layout} page 1`);
      await expect(page.locator('[data-xmlui-part="drawer"][data-state="closed"]')).toBeAttached();
      const closeAnimation = await page.evaluate(() => {
        const drawer = document.querySelector("[data-xmlui-part='drawer'] [role='dialog']") as HTMLElement;
        const overlay = document.querySelector("[data-xmlui-part='drawer'] button[aria-hidden='true']") as HTMLElement;
        return {
          dialogAnimation: getComputedStyle(drawer).animationName,
          overlayAnimation: getComputedStyle(overlay).animationName,
        };
      });
      expect(closeAnimation.dialogAnimation).toContain("slide-out-to-left");
      expect(closeAnimation.overlayAnimation).toContain("blur-out");
      await expect(page.locator('[data-xmlui-part="drawer"]')).toBeHidden({ timeout: 1000 });
    }
  });

  test("narrow horizontal default pins chrome while the App scrolls", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 852, height: 700 });
    const rows = Array.from({ length: 200 }, (_, index) => (
      `<Text>Row ${index + 1}</Text>`
    )).join("\n");

    await initTestBed(`
      <App layout="horizontal" testId="app">
        <AppHeader testId="header">
          <property name="logoTemplate">
            <Heading level="h3" value="Example App"/>
          </property>
        </AppHeader>
        <NavPanel testId="navPanel">
          <NavLink label="Home" to="/" icon="home"/>
          <NavLink label="Page 1" to="/page1"/>
          <NavLink label="Page 2" to="/page2"/>
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

    const metrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const content = document.querySelector(
        "[data-xmlui-component='App'][data-xmlui-part='content']",
      ) as HTMLElement;
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const appRect = app.getBoundingClientRect();
      const headerRectBefore = header.getBoundingClientRect();
      const footerRectBefore = footer.getBoundingClientRect();
      content.scrollTop = 400;
      app.scrollTop = 400;
      const headerRectAfter = header.getBoundingClientRect();
      const footerRectAfter = footer.getBoundingClientRect();
      const footerStyle = getComputedStyle(footer);
      return {
        appOverflow: getComputedStyle(app).overflow,
        appCanScroll: app.scrollHeight > app.clientHeight,
        appScrollTop: Math.round(app.scrollTop),
        contentOverflow: getComputedStyle(content).overflow,
        contentCanScroll: content.scrollHeight > content.clientHeight,
        contentScrollTop: Math.round(content.scrollTop),
        headerTopBefore: Math.round(headerRectBefore.top - appRect.top),
        headerTopAfter: Math.round(headerRectAfter.top - appRect.top),
        footerBottomBefore: Math.round(appRect.bottom - footerRectBefore.bottom),
        footerBottomAfter: Math.round(appRect.bottom - footerRectAfter.bottom),
        footerBackgroundColor: footerStyle.backgroundColor,
        documentCanScroll: document.scrollingElement!.scrollHeight >
          document.scrollingElement!.clientHeight,
      };
    });

    expect(metrics).toMatchObject({
      appOverflow: "auto",
      appCanScroll: true,
      appScrollTop: 400,
      contentOverflow: "visible",
      contentCanScroll: false,
      contentScrollTop: 0,
      headerTopBefore: 0,
      headerTopAfter: 0,
      footerBottomBefore: 0,
      footerBottomAfter: 0,
      documentCanScroll: false,
    });
    expect(metrics.footerBackgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("narrow vertical-full-header pins header and footer while the App scrolls", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 852, height: 700 });
    const rows = Array.from({ length: 60 }, (_, index) => (
      `{ title: 'Coffee ${index + 1}', description: 'Description ${index + 1}' }`
    )).join(", ");

    await initTestBed(`
      <App layout="vertical-full-header" testId="app">
        <AppHeader testId="header">
          <property name="logoTemplate">
            <Heading level="h3" value="Example App"/>
          </property>
        </AppHeader>
        <NavPanel testId="navPanel">
          <NavLink label="Home" to="/" icon="home"/>
          <NavLink label="Page 1" to="/page1"/>
          <NavLink label="Page 2" to="/page2"/>
        </NavPanel>
        <Pages>
          <Page url="/">
            <List data="{[${rows}]}">
              <property name="itemTemplate">
                <Card title="{$item.title}" subtitle="{$item.description}" />
              </property>
            </List>
          </Page>
        </Pages>
        <Footer>Powered by XMLUI</Footer>
      </App>
    `);

    const metrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const content = document.querySelector(
        "[data-xmlui-component='App'][data-xmlui-part='content']",
      ) as HTMLElement;
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const list = document.querySelector("[data-xmlui-component='List']") as HTMLElement;
      const listRectBefore = list.getBoundingClientRect();
      const appRect = app.getBoundingClientRect();
      const headerRectBefore = header.getBoundingClientRect();
      const footerRectBefore = footer.getBoundingClientRect();
      const listTopBefore = Math.round(listRectBefore.top - appRect.top);
      content.scrollTop = 400;
      list.scrollTop = 400;
      app.scrollTop = 400;
      const headerRectAfter = header.getBoundingClientRect();
      const footerRectAfter = footer.getBoundingClientRect();
      const listRectAfter = list.getBoundingClientRect();
      const listStyle = getComputedStyle(list);
      const footerStyle = getComputedStyle(footer);
      const appRectAfter = app.getBoundingClientRect();
      return {
        appOverflow: getComputedStyle(app).overflow,
        appCanScroll: app.scrollHeight > app.clientHeight,
        appScrollTop: Math.round(app.scrollTop),
        contentOverflow: getComputedStyle(content).overflow,
        contentCanScroll: content.scrollHeight > content.clientHeight,
        contentScrollTop: Math.round(content.scrollTop),
        listOverflow: listStyle.overflow,
        listScrollTop: Math.round(list.scrollTop),
        listTopBefore,
        listTopAfter: Math.round(listRectAfter.top - appRectAfter.top),
        headerTopBefore: Math.round(headerRectBefore.top - appRect.top),
        headerTopAfter: Math.round(headerRectAfter.top - appRect.top),
        footerBottomBefore: Math.round(appRect.bottom - footerRectBefore.bottom),
        footerBottomAfter: Math.round(appRect.bottom - footerRectAfter.bottom),
        footerBackgroundColor: footerStyle.backgroundColor,
        documentCanScroll: document.scrollingElement!.scrollHeight >
          document.scrollingElement!.clientHeight,
      };
    });

    await expect(page.getByTestId("navPanel")).not.toBeVisible();
    expect(metrics).toMatchObject({
      appOverflow: "auto",
      appCanScroll: true,
      appScrollTop: 400,
      contentOverflow: "visible",
      contentCanScroll: false,
      contentScrollTop: 0,
      listOverflow: "visible",
      listScrollTop: 0,
      headerTopBefore: 0,
      headerTopAfter: 0,
      footerBottomBefore: 0,
      footerBottomAfter: 0,
      documentCanScroll: false,
    });
    expect(metrics.footerBackgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(metrics.listTopBefore).toBeGreaterThan(0);
    expect(metrics.listTopAfter).toBeLessThan(0);
  });

  test("narrow short pages keep the Footer on the viewport bottom", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 852, height: 700 });
    await initTestBed(`
      <App layout="horizontal" testId="app">
        <AppHeader testId="header">
          <property name="logoTemplate">
            <Heading level="h3" value="Example App"/>
          </property>
        </AppHeader>
        <NavPanel>
          <NavLink label="Home" to="/" icon="home"/>
          <NavLink label="Page 1" to="/page1"/>
          <NavLink label="Page 2" to="/page2"/>
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="short-page" value="Page 1"/>
          </Page>
        </Pages>
        <Footer>Powered by XMLUI</Footer>
      </App>
    `);

    const metrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const content = document.querySelector(
        "[data-xmlui-component='App'][data-xmlui-part='content']",
      ) as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const appRect = app.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      return {
        appCanScroll: app.scrollHeight > app.clientHeight,
        contentFlex: getComputedStyle(content).flex,
        contentBottomToFooterTop: Math.round(footerRect.top - contentRect.bottom),
        footerBottomDelta: Math.round(appRect.bottom - footerRect.bottom),
      };
    });

    await expect(page.getByTestId("short-page")).toHaveText("Page 1");
    expect(metrics.appCanScroll).toBe(false);
    expect(metrics.contentFlex).toContain("1 0 auto");
    expect(metrics.contentBottomToFooterTop).toBe(0);
    expect(metrics.footerBottomDelta).toBe(0);
  });

  test("vertical-full-header default scroll keeps chrome pinned and does not scroll the List", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 2048, height: 1050 });
    const items = Array.from({ length: 40 }, (_, index) => ({
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
        appHeight: Math.round(app.getBoundingClientRect().height),
        navPanelHeight: Math.round(navPanel.getBoundingClientRect().height),
        footerHeight: Math.round(footer.getBoundingClientRect().height),
      };
    });

    expect(initialMetrics.appCanScroll).toBe(true);
    expect(initialMetrics.listCanScroll).toBe(false);
    expect(initialMetrics.navPanelHeight).toBeLessThan(initialMetrics.appHeight);
    expect(initialMetrics.footerHeight).toBeGreaterThan(0);

    const scrolledMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const navPanelWrapper = document.querySelector(
        "[data-xmlui-component='App'][data-xmlui-part='navPanel']",
      ) as HTMLElement;
      const navPanel = document.querySelector("[data-xmlui-component='NavPanel']") as HTMLElement;
      const firstNavLink = navPanel.querySelector("a") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      const list = document.querySelector("[data-testid='coffee-list']") as HTMLElement;
      app.scrollTop = 300;
      list.scrollTop = 100;
      const appRect = app.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const navWrapperRect = navPanelWrapper.getBoundingClientRect();
      const navRect = navPanel.getBoundingClientRect();
      const firstLinkRect = firstNavLink.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      return {
        appScrollTop: Math.round(app.scrollTop),
        listScrollTop: Math.round(list.scrollTop),
        headerTop: Math.round(headerRect.top - appRect.top),
        navWrapperTop: Math.round(navWrapperRect.top - appRect.top),
        navTop: Math.round(navRect.top - appRect.top),
        firstLinkOffset: Math.round(firstLinkRect.top - navRect.top),
        headerBottom: Math.round(headerRect.bottom - appRect.top),
        footerBottom: Math.round(appRect.bottom - footerRect.bottom),
      };
    });

    expect(scrolledMetrics.appScrollTop).toBeGreaterThan(0);
    expect(scrolledMetrics.listScrollTop).toBe(0);
    expect(scrolledMetrics.headerTop).toBe(0);
    expect(Math.abs(scrolledMetrics.navTop - scrolledMetrics.headerBottom)).toBeLessThanOrEqual(1);
    expect(scrolledMetrics.footerBottom).toBe(0);

    const bottomMetrics = await page.evaluate(() => {
      const app = document.querySelector("[data-testid='app']") as HTMLElement;
      const header = document.querySelector("[data-xmlui-part='header']") as HTMLElement;
      const navPanelWrapper = document.querySelector(
        "[data-xmlui-component='App'][data-xmlui-part='navPanel']",
      ) as HTMLElement;
      const navPanel = document.querySelector("[data-xmlui-component='NavPanel']") as HTMLElement;
      const firstNavLink = navPanel.querySelector("a") as HTMLElement;
      const footer = document.querySelector("[data-xmlui-part='footer']") as HTMLElement;
      app.scrollTop = app.scrollHeight - app.clientHeight;
      const appRect = app.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const navWrapperRect = navPanelWrapper.getBoundingClientRect();
      const navRect = navPanel.getBoundingClientRect();
      const firstLinkRect = firstNavLink.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      return {
        appScrollTop: Math.round(app.scrollTop),
        maxScrollTop: Math.round(app.scrollHeight - app.clientHeight),
        headerTop: Math.round(headerRect.top - appRect.top),
        navWrapperTop: Math.round(navWrapperRect.top - appRect.top),
        navTop: Math.round(navRect.top - appRect.top),
        firstLinkOffset: Math.round(firstLinkRect.top - navRect.top),
        headerBottom: Math.round(headerRect.bottom - appRect.top),
        footerBottom: Math.round(appRect.bottom - footerRect.bottom),
      };
    });

    expect(bottomMetrics.appScrollTop).toBe(bottomMetrics.maxScrollTop);
    expect(bottomMetrics.headerTop).toBe(0);
    expect(Math.abs(bottomMetrics.navWrapperTop - bottomMetrics.headerBottom)).toBeLessThanOrEqual(1);
    expect(Math.abs(bottomMetrics.navTop - bottomMetrics.headerBottom)).toBeLessThanOrEqual(1);
    expect(bottomMetrics.firstLinkOffset).toBe(scrolledMetrics.firstLinkOffset);
    expect(bottomMetrics.footerBottom).toBe(0);
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

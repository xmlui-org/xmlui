import { expect, test } from "../../src/testing/fixtures";
import { websiteThemes } from "./website-theme-fixtures";

const routeShell = `
  <Theme
    width-navPanel-App="{pathname.startsWith('/docs') ? '280px' : '0px'}"
    borderRight-navPanelWrapper-App="{pathname.startsWith('/docs') ? '1px' : '0px'}"
  >
    <App layout="vertical-full-header" noScrollbarGutters="false">
      <AppHeader testId="site-header" height="44px">
        <HStack width="100%" verticalAlignment="center" gap="16px">
          <Text variant="strong">XMLUI</Text>
          <SpaceFiller />
          <NavLink testId="nav-home" to="/" exact="true">Home</NavLink>
          <NavLink testId="nav-docs" to="/docs" active="{pathname.startsWith('/docs')}">Docs</NavLink>
          <NavLink testId="nav-blog" to="/blog">Blog</NavLink>
          <NavLink testId="nav-news" to="/news">News</NavLink>
          <NavLink testId="nav-get-started" to="/get-started">Get Started</NavLink>
        </HStack>
      </AppHeader>
      <NavPanel testId="site-docs-nav" when="{pathname.startsWith('/docs')}" syncWithContent="false">
        <NavLink to="/docs" label="Learn XMLUI" />
        <NavLink to="/docs/components-intro" label="Components" />
        <NavLink to="/docs/guides" label="Guides" />
      </NavPanel>
      <Pages fallbackPath="/">
        <Page url="/">
          <VStack testId="route-home" width="100%" maxWidth="1200px" padding="32px" gap="8px">
            <H1 testId="home-headline" showAnchor="false">Practical User Interfaces</H1>
            <H1 showAnchor="false">Built Simply</H1>
            <Text>Define your UI in any text editor.</Text>
            <Text>The UI button shows a live XMLUI app. Try it! Then switch to XML to see the code.</Text>
          </VStack>
        </Page>
        <Page url="/docs">
          <VStack testId="route-docs" width="100%" maxWidth="920px" padding="32px" gap="12px">
            <H1 testId="docs-headline" showAnchor="false">Learn XMLUI</H1>
            <Text>Guides, tutorials, reference material, and examples.</Text>
          </VStack>
        </Page>
        <Page url="/blog">
          <VStack testId="route-blog" width="100%" maxWidth="920px" padding="32px" gap="12px">
            <H1 testId="blog-headline" showAnchor="false">Build UIs the simple way.</H1>
            <Text>Articles from the XMLUI team.</Text>
          </VStack>
        </Page>
        <Page url="/get-started">
          <VStack testId="route-get-started" width="100%" maxWidth="920px" padding="32px" gap="12px">
            <H1 testId="get-started-headline" showAnchor="false">Get Started</H1>
            <Text>Get a running XMLUI app, an AI assistant that knows the XMLUI docs, and a built-in Inspector for debugging.</Text>
          </VStack>
        </Page>
        <Page url="/news">
          <VStack testId="route-news" width="100%" maxWidth="920px" padding="32px" gap="12px">
            <H1 testId="news-headline" showAnchor="false">News &amp; reviews</H1>
            <Text>Recent XMLUI coverage and announcements.</Text>
          </VStack>
        </Page>
      </Pages>
    </App>
  </Theme>
`;

test.describe("website route parity", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("home, blog, get-started, and news keep the website header shell without docs nav", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(routeShell, {
      themes: websiteThemes,
      defaultTheme: "xmlui-website-theme",
      appGlobals: { useHashBasedRouting: false },
    });

    for (const route of [
      { linkTestId: "nav-home", testId: "route-home", heading: "Practical User Interfaces" },
      { linkTestId: "nav-blog", testId: "route-blog", heading: "Build UIs the simple way." },
      { linkTestId: "nav-get-started", testId: "route-get-started", heading: "Get Started" },
      { linkTestId: "nav-news", testId: "route-news", heading: "News & reviews" },
    ]) {
      await page.getByTestId(route.linkTestId).click();
      await expect(page.getByTestId(route.testId)).toBeVisible();
      await expect(page.getByRole("heading", { name: route.heading })).toBeInViewport();
      await expect(page.getByTestId("site-header")).toBeVisible();
      await expect(page.getByTestId("site-header")).toHaveCSS("height", "44px");
      await expect(page.getByTestId("site-docs-nav")).not.toBeVisible();
    }
  });

  test("docs route keeps the website header and exposes the 280px docs nav", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(routeShell, {
      themes: websiteThemes,
      defaultTheme: "xmlui-website-theme",
      appGlobals: { useHashBasedRouting: false },
    });

    await page.getByTestId("nav-docs").click();

    await expect(page.getByTestId("site-header")).toBeVisible();
    await expect(page.getByTestId("site-header")).toHaveCSS("height", "44px");
    await expect(page.getByTestId("route-docs")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Learn XMLUI" })).toBeInViewport();
    await expect(page.getByTestId("site-docs-nav")).toBeVisible();
    await expect(page.getByTestId("site-docs-nav")).toHaveCSS("width", "280px");
    await expect(page.getByTestId("nav-docs")).toHaveAttribute("aria-current", "page");
  });
});

import { expect, test, type Page } from "@playwright/test";

test("home route renders the migrated website shell", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/");

  await expect(page.getByText("XMLUI", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Display milestone" })).toBeVisible();
  await expect(page.getByText("Website blocks: loaded")).toBeVisible();
  await expect(page.getByText("Search package: loaded")).toBeVisible();
  expect(errors).toEqual([]);
});

test("home content and public website artifacts render copied assets", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Simple" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reactive" })).toBeVisible();

  await page.goto("/get-started");
  await expect(page.getByRole("heading", { name: "Get Started" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose your platform" })).toBeVisible();

  const feed = await page.request.get("/feed.rss");
  expect(feed.ok()).toBeTruthy();
  expect(await feed.text()).toContain("XMLUI Blog");

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("https://docs.xmlui.org/docs");

  const redirects = await page.request.get("/_redirects");
  expect(redirects.ok()).toBeTruthy();
  expect(await redirects.text()).toContain("/index.html");

  const staticWebAppConfig = await page.request.get("/staticwebapp.config.json");
  expect(staticWebAppConfig.ok()).toBeTruthy();
  expect(await staticWebAppConfig.json()).toMatchObject({
    navigationFallback: { rewrite: "/index.html" },
  });

  const logo = await page.request.get("/resources/logo.svg");
  expect(logo.ok()).toBeTruthy();
  expect(await logo.text()).toContain("<svg");

  expect(errors).toEqual([]);
});

test("docs smoke route renders migrated extension packages and state updates", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs");

  await expect(page.getByRole("heading", { name: "Documentation quick check" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Masonry extension check" })).toBeVisible();
  await expect(page.getByText("Alpha")).toBeVisible();
  await expect(page.locator("smart-gauge")).toHaveCount(1);
  await expect(page.getByText("Gauge value: 42")).toBeVisible();
  await page.getByRole("button", { name: "Set gauge to 72" }).click();
  await expect(page.getByText("Gauge value: 72")).toBeVisible();

  await expect(page.getByRole("heading", { name: "EChart extension check" })).toBeVisible();
  await expect(page.locator('[class*="echartContainer"] svg').first()).toBeVisible();
  await expect(page.getByText("Chart boost: 0")).toBeVisible();
  await page.getByRole("button", { name: "Boost chart data" }).click();
  await expect(page.getByText("Chart boost: 5")).toBeVisible();

  await expect(page.locator(".rbc-calendar")).toHaveCount(1);
  await expect(page.getByText("Visual Check 0")).toBeVisible();
  await page.getByRole("button", { name: "Advance calendar smoke" }).click();
  await expect(page.getByText("Calendar shift: 1")).toBeVisible();
  await expect(page.getByText("Visual Check 1")).toBeVisible();

  await expect(page.locator(".react-grid-layout")).toHaveCount(1);
  await expect(page.locator(".react-grid-item")).toHaveCount(3);
  await expect(page.getByText("Layout tile: 0")).toBeVisible();
  await page.getByRole("button", { name: "Advance grid layout smoke" }).click();
  await expect(page.getByText("Layout tile: 1")).toBeVisible();

  await expect(page.locator(".ProseMirror")).toHaveCount(1);
  await expect(page.getByText("Editor value: Initial rich text")).toBeVisible();
  await page.getByRole("button", { name: "Update editor content" }).click();
  await expect(page.getByText("Editor value: Updated rich text")).toBeVisible();

  await expect(page.getByText("Docs state updates: 0")).toBeVisible();
  await page.getByRole("button", { name: "Update docs state" }).click();
  await expect(page.getByText("Docs state updates: 1")).toBeVisible();
  expect(errors).toEqual([]);
});

test("copied docs markdown route renders real website content", async ({ page }) => {
  test.setTimeout(60000);
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/intro");

  await expect(page.getByRole("heading", { name: "Introduction" })).toBeVisible();
  await expect(page.getByText("building user interfaces declaratively")).toBeVisible();
  await expect(page.getByText("tiny app that reports the status")).toBeVisible();
  await expect(page.getByText("Markup. You write XMLUI apps")).toBeVisible();

  await page.goto("/docs/reactive-intro");
  await expect(page.getByRole("heading", { name: "Reactive data binding" })).toBeVisible();
  await expect(page.getByText("Let's load that same London tube data")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reactive magic" })).toBeVisible();

  await page.goto("/docs/components-intro");
  await expect(page.getByRole("heading", { name: "Components", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Built-in components" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "User-defined components" })).toBeVisible();

  await page.goto("/docs/guides");
  await expect(page.getByRole("heading", { name: "Guides" })).toBeVisible();
  await expect(page.getByText("This section contains practical guides")).toBeVisible();

  await page.goto("/docs/app-structure");
  await expect(page.getByRole("heading", { name: "Structure of an XMLUI app" })).toBeVisible();
  await expect(page.getByText("The XMLUI Invoice demo app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Main.xmlui" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Local deployment" })).toBeVisible();

  await page.goto("/docs/guides/app-structure");
  await expect(page.getByRole("heading", { name: "Structure of an XMLUI app" })).toBeVisible();
  await expect(page.getByText("The XMLUI Invoice demo app")).toBeVisible();

  await page.goto("/docs/guides/markup");
  await expect(page.getByRole("heading", { name: "XML Markup" })).toBeVisible();
  await expect(page.getByText("When you write XML markup")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Properties" })).toBeVisible();

  await page.goto("/docs/guides/scripting");
  await expect(page.getByRole("heading", { name: "XMLUI Scripting" })).toBeVisible();
  await expect(page.getByText("small JavaScript snippets")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Identifier resolution in callbacks" })).toBeVisible();

  await page.goto("/docs/guides/scoping");
  await expect(page.getByRole("heading", { name: "Scoping" })).toBeVisible();
  await expect(page.getByText("Variables declared on a component flow downward")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Variables", exact: true })).toBeVisible();

  await page.goto("/docs/guides/visibility");
  await expect(page.getByRole("heading", { name: "Visibility and Responsive Display" })).toBeVisible();
  await expect(page.getByText("Every XMLUI component supports a")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The when attribute" })).toBeVisible();

  await page.goto("/docs/guides/layout");
  await expect(page.getByRole("heading", { name: "Layout", exact: true })).toBeVisible();
  await expect(page.getByText("hierarchical component tree")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Viewport" })).toBeVisible();

  await page.goto("/docs/guides/working-with-text");
  await expect(page.getByRole("heading", { name: "Working with Text" })).toBeVisible();
  await expect(page.getByText("Text elements appear in UI components")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Specifying text content" })).toBeVisible();

  await page.goto("/docs/guides/working-with-markdown");
  await expect(page.getByRole("heading", { name: "Working with Markdown" })).toBeVisible();
  await expect(page.getByText("XMLUI can also support sites like this one")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Using the Markdown component" })).toBeVisible();

  await page.goto("/docs/guides/routing-and-links");
  await expect(page.getByRole("heading", { name: "Routing and Links" })).toBeVisible();
  await expect(page.getByText("XMLUI implements client-side routing")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hash routing" })).toBeVisible();

  await page.goto("/docs/guides/forms");
  await expect(page.getByRole("heading", { name: "Forms", exact: true })).toBeVisible();
  await expect(page.getByText("without the hassle of managing")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Form Layouts" })).toBeVisible();

  await page.goto("/docs/guides/modal-dialogs");
  await expect(page.getByRole("heading", { name: "Modal Dialogs" })).toBeVisible();
  await expect(page.getByText("can be invoked declaratively")).toBeVisible();
  await expect(page.getByText("This is the imperative method")).toBeVisible();

  await page.goto("/docs/guides/user-defined-components");
  await expect(page.getByRole("heading", { name: "User-defined components" })).toBeVisible();
  await expect(page.getByText("You can define your own components")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();

  await page.goto("/docs/guides/refactoring");
  await expect(page.getByRole("heading", { name: "Refactoring XMLUI: Extract Modal Components" })).toBeVisible();
  await expect(page.getByText("complex components that handle multiple modals")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Pattern: Modal Components with Event Communication" })).toBeVisible();

  await page.goto("/docs/styles-and-themes/layout-props");
  await expect(page.getByRole("heading", { name: "Layout Properties" })).toBeVisible();
  await expect(page.getByText("summarizes the layout properties")).toBeVisible();
  await expect(page.getByRole("heading", { name: "backgroundColor" })).toBeVisible();

  await page.goto("/docs/styles-and-themes/theme-variables");
  await expect(page.getByRole("heading", { name: "Theme Variables" })).toBeVisible();
  await expect(page.getByText("The basic unit of a theme is")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Theme Property Names" })).toBeVisible();

  await page.goto("/docs/styles-and-themes/theme-variable-defaults");
  await expect(page.getByRole("heading", { name: "Default Theme Variables" })).toBeVisible();
  await expect(page.getByText("const-color-primary-500")).toBeVisible();

  await page.goto("/docs/styles-and-themes/common-units");
  await expect(page.getByRole("heading", { name: "Common Visual Property Units" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Border Values" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("copied core docs markdown routes render real website content", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/context-variables");
  await expect(page.getByRole("heading", { name: "Context variables" })).toBeVisible();
  await expect(page.getByText("key context variables available")).toBeVisible();
  await expect(page.getByRole("heading", { name: "$item", exact: true })).toBeVisible();

  await page.goto("/docs/context-variables2");
  await expect(page.getByRole("heading", { name: "Context Variables Summary" })).toBeVisible();
  await expect(page.getByText("comprehensive overview of all context variables")).toBeVisible();
  await expect(page.locator("#attempts")).toBeVisible();

  await page.goto("/docs/behaviors");
  await expect(page.getByRole("heading", { name: "Behaviors" })).toBeVisible();
  await expect(page.getByText("attaching a specific behavior to components")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Using a behavior" })).toBeVisible();

  await page.goto("/docs/globals");
  await expect(page.getByRole("heading", { name: "Global Functions and Variables" })).toBeVisible();
  await expect(page.getByText("dozens of global functions and properties")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Actions Namespace" })).toBeVisible();

  await page.goto("/docs/app-globals");
  await expect(page.getByRole("heading", { name: "App Globals" })).toBeVisible();
  await expect(page.getByText("values that belong to your application logic")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product labels and contact details" })).toBeVisible();

  await page.goto("/docs/xmlui-config");
  await expect(page.getByRole("heading", { name: "XMLUI Config Reference" })).toBeVisible();
  await expect(page.getByText("home for framework and runtime settings")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quick reference" })).toBeVisible();

  await page.goto("/docs/helper-tags");
  await expect(page.getByRole("heading", { name: "Helper Tags" })).toBeVisible();
  await expect(page.getByText("alternative XML markup syntax")).toBeVisible();
  await expect(page.getByRole("heading", { name: "variable" })).toBeVisible();

  await page.goto("/docs/core-properties");
  await expect(page.getByRole("heading", { name: "Core Properties" })).toBeVisible();
  await expect(page.getByText("built into the XMLUI rendering engine")).toBeVisible();
  await expect(page.getByRole("heading", { name: "id" })).toBeVisible();

  await page.goto("/docs/template-properties");
  await expect(page.getByRole("heading", { name: "Template Properties" })).toBeVisible();
  await expect(page.getByText("define custom markup for specific parts")).toBeVisible();
  await expect(page.getByRole("heading", { name: "App Components" })).toBeVisible();

  await page.goto("/docs/glossary");
  await expect(page.getByRole("heading", { name: "Glossary" })).toBeVisible();
  await expect(page.getByText("Dashboard.xmlui", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Theme variable" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("tutorial learn routes render copied website content", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/learn");
  await expect(page.getByRole("heading", { name: "Learn XMLUI" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tutorial" })).toBeVisible();

  await page.goto("/docs/themes-intro");
  await expect(page.getByRole("heading", { name: "Themes" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Theme Variables", exact: true })).toBeVisible();

  await page.goto("/docs/tutorial");
  await expect(page.getByRole("heading", { name: "Tutorial", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "XMLUI Invoice" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();

  await page.goto("/docs/tutorial-01");
  await expect(page.getByRole("heading", { name: "XMLUI Invoice" })).toBeVisible();
  await expect(page.getByText("demo app that illustrates")).toBeVisible();

  await page.goto("/docs/tutorial-12");
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect(page.getByText("State management pattern")).toBeVisible();
  expect(errors).toEqual([]);
});

test("reference resources icons and palettes routes display", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/reference");
  await expect(page.getByRole("heading", { name: "Reference", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Components" }).nth(1)).toBeVisible();
  await expect(page.getByRole("link", { name: "Extensions" }).nth(1)).toBeVisible();

  await page.goto("/docs/reference/themes");
  await expect(page.getByRole("heading", { name: "Themes" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Palettes" })).toBeVisible();

  await page.goto("/docs/resources");
  await expect(page.getByRole("heading", { name: "Resources" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Codefences and playgrounds" })).toBeVisible();

  await page.goto("/docs/icons");
  await expect(page.getByRole("heading", { name: "Icons" })).toBeVisible();
  await expect(page.getByText("markdown")).toBeVisible();

  await page.goto("/docs/palettes");
  await expect(page.getByRole("heading", { name: "Palettes" })).toBeVisible();
  await expect(page.getByText("Primary")).toBeVisible();
  expect(errors).toEqual([]);
});

test("playground and wrap component guide routes render copied markdown", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/guides/playground-and-codefence");
  await expect(page.getByRole("heading", { name: "XMLUI codefences and playgrounds" })).toBeVisible();
  await expect(page.getByText("plain codefence with XMLUI syntax highlighting")).toBeVisible();

  await page.goto("/docs/guides/wrap-component");
  await expect(page.getByRole("heading", { name: "Wrapping and Theming" })).toBeVisible();
  await expect(page.getByText("React ecosystem offers thousands more")).toBeVisible();

  await page.goto("/docs/guides/wrap-component/wrap-component-fn");
  await expect(page.getByRole("heading", { name: "wrapComponent" })).toBeVisible();
  await expect(page.getByText("default wrapper primitive")).toBeVisible();

  await page.goto("/docs/guides/wrap-component/extension-packaging");
  await expect(page.getByRole("heading", { name: "Extension packaging" })).toBeVisible();
  await expect(page.getByText("Each wrapped component ships as an independent UMD bundle")).toBeVisible();
  expect(errors).toEqual([]);
});

test("first how-to basics routes render copied markdown", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/howto");
  await expect(page.getByRole("heading", { name: "How-to" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Expose a method from a component" })).toBeVisible();

  await page.goto("/docs/howto/expose-a-method-from-a-component");
  await expect(page.getByRole("heading", { name: "Expose a method from a component" })).toBeVisible();
  await expect(page.getByText("Use the")).toBeVisible();

  await page.goto("/docs/howto/delegate-a-method");
  await expect(page.getByRole("heading", { name: "Delegate a method" })).toBeVisible();

  await page.goto("/docs/howto/filter-and-transform-data-from-an-api");
  await expect(page.getByRole("heading", { name: "Transform nested API responses" })).toBeVisible();

  await page.goto("/docs/howto/use-fetched-data-safely-in-when");
  await expect(page.getByRole("heading", { name: "Use fetched data safely in when" })).toBeVisible();
  await expect(page.getByText("guard the fetch lifecycle first")).toBeVisible();
  expect(errors).toEqual([]);
});

test("next five how-to route slices render copied markdown", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/howto");
  await expect(page.getByRole("heading", { name: "Forms and modal basics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Layout, i18n, and accessibility" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Runtime state and async" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Advanced forms" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "API operations" })).toBeVisible();

  await page.goto("/docs/howto/use-built-in-form-validation");
  await expect(page.getByRole("heading", { name: "Use built-in form validation" })).toBeVisible();

  await page.goto("/docs/howto/pass-data-to-a-modal-dialog");
  await expect(page.getByRole("heading", { name: "Pass data to a Modal Dialog" })).toBeVisible();

  await page.goto("/docs/howto/make-a-set-of-equal-width-cards");
  await expect(page.getByRole("heading", { name: "Make a set of equal-width cards" })).toBeVisible();

  await page.goto("/docs/howto/announce-status-changes-with-liveregion");
  await expect(page.getByRole("heading", { name: "Announce status changes with LiveRegion" })).toBeVisible();

  await page.goto("/docs/howto/paginate-a-list");
  await expect(page.getByRole("heading", { name: "Paginate a List" })).toBeVisible();

  await page.goto("/docs/howto/implement-an-authentication-gate");
  await expect(page.getByRole("heading", { name: "Implement an authentication gate" })).toBeVisible();

  await page.goto("/docs/howto/validate-dependent-fields-together");
  await expect(page.getByRole("heading", { name: "Validate dependent fields together" })).toBeVisible();

  await page.goto("/docs/howto/submit-a-form-with-file-uploads");
  await expect(page.getByRole("heading", { name: "Submit a form with file uploads" })).toBeVisible();

  await page.goto("/docs/howto/poll-an-api-at-regular-intervals");
  await expect(page.getByRole("heading", { name: "Poll an API at regular intervals" })).toBeVisible();

  await page.goto("/docs/howto/cancel-a-deferred-api-operation");
  await expect(page.getByRole("heading", { name: "Cancel a deferred API operation" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("second five how-to route slices render copied markdown", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/howto");
  await expect(page.getByRole("heading", { name: "Tables, lists, and trees" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Routing and layout UI" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dialogs, themes, and user components" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lifecycle, errors, menus, and content" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Theming recipes" })).toBeVisible();

  await page.goto("/docs/howto/auto-size-column-widths-with-star");
  await expect(page.getByRole("heading", { name: "Auto-size column widths with star" })).toBeVisible();

  await page.goto("/docs/howto/configure-tree-data-format-and-mapping");
  await expect(page.getByRole("heading", { name: "Configure Tree data format and mapping" })).toBeVisible();

  await page.goto("/docs/howto/navigate-programmatically");
  await expect(page.getByRole("heading", { name: "Navigate programmatically" })).toBeVisible();

  await page.goto("/docs/howto/build-a-master-detail-layout");
  await expect(page.getByRole("heading", { name: /Build a master.detail layout/ })).toBeVisible();

  await page.goto("/docs/howto/open-a-confirmation-before-delete");
  await expect(page.getByRole("heading", { name: "Open a confirmation before delete" })).toBeVisible();

  await page.goto("/docs/howto/create-a-reusable-component");
  await expect(page.getByRole("heading", { name: "Create a reusable component" })).toBeVisible();

  await page.goto("/docs/howto/run-a-one-time-action-on-page-load");
  await expect(page.getByRole("heading", { name: "Run a one-time action on page load" })).toBeVisible();

  await page.goto("/docs/howto/render-markdown-content-as-a-page");
  await expect(page.getByRole("heading", { name: "Render Markdown content as a page" })).toBeVisible();

  await page.goto("/docs/howto/create-a-custom-color-theme");
  await expect(page.getByRole("heading", { name: "Create a custom color theme" })).toBeVisible();

  await page.goto("/docs/howto/theme-form-inputs-for-all-states");
  await expect(page.getByRole("heading", { name: "Theme form inputs for all states" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("next five content parity slices render copied markdown", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/howto");
  await expect(page.getByRole("heading", { name: "Advanced components, charts, and media" })).toBeVisible();

  await page.goto("/docs/howto/use-echarts-for-advanced-charting");
  await expect(page.getByRole("heading", { name: "Use ECharts for advanced charting" })).toBeVisible();

  await page.goto("/docs/howto/generate-a-qr-code-from-user-input");
  await expect(page.getByRole("heading", { name: "Generate a QR code from user input" })).toBeVisible();

  await page.goto("/docs/hosted-deployment");
  await expect(page.getByRole("heading", { name: "Hosted deployment" })).toBeVisible();

  await page.goto("/docs/mcp");
  await expect(page.getByRole("heading", { name: /xmlui-mcp: Model Context Protocol server for XMLUI/ })).toBeVisible();

  await page.goto("/docs/vscode");
  await expect(page.getByRole("heading", { name: "XMLUI Tools for Visual Studio Code" })).toBeVisible();

  await page.goto("/docs/managed-react");
  await expect(page.getByRole("heading", { name: "Managed React Overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Managed React topics" })).toBeVisible();

  await page.goto("/docs/managed-react/dom-api-isolation");
  await expect(page.getByRole("heading", { name: "DOM API Isolation" })).toBeVisible();

  await page.goto("/docs/managed-react/xss-protection");
  await expect(page.getByRole("heading", { name: "XSS Protection" })).toBeVisible();

  await page.goto("/docs/reference/components/Table");
  await expect(page.getByRole("heading", { name: /^Table/ })).toBeVisible();

  await page.goto("/docs/reference/components/ModalDialog");
  await expect(page.getByRole("heading", { name: /^ModalDialog/ })).toBeVisible();

  await page.goto("/docs/reference/extensions/xmlui-website-blocks/HeroSection");
  await expect(page.getByRole("heading", { name: /^HeroSection/ })).toBeVisible();

  await page.goto("/docs/reference/extensions/xmlui-echart/EChart");
  await expect(page.getByRole("heading", { name: /^EChart/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("header search uses copied docs and blog search data", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/");

  await page.getByRole("button", { name: "Open search" }).click();
  const searchBox = page.getByRole("searchbox");
  await expect(searchBox).toBeVisible();
  await searchBox.fill("XMLUI");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("option", { name: /Introducing XMLUI/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("reference routes render copied component and extension nav metadata", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/reference/components");
  await expect(page.getByRole("heading", { name: "Components", exact: true })).toBeVisible();
  await expect(page.getByText(/Reference entries loaded: \d+/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Button", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Text", exact: true })).toBeVisible();

  await page.goto("/docs/reference/components/Button");
  await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
  await expect(page.getByText("Reference counter: 0")).toBeVisible();
  await page.getByRole("button", { name: "Increment reference counter" }).click();
  await expect(page.getByText("Reference counter: 1")).toBeVisible();

  await page.goto("/docs/reference/extensions");
  await expect(page.getByRole("heading", { name: "Extensions", exact: true })).toBeVisible();
  await expect(page.getByText(/Extension packages loaded: \d+/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Xmlui Gauge" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Xmlui Website Blocks" })).toBeVisible();

  await page.goto("/docs/reference/extensions/xmlui-gauge/Gauge");
  await expect(page.getByRole("heading", { name: "Gauge", exact: true })).toBeVisible();
  await expect(page.locator("smart-gauge")).toHaveCount(1);
  await expect(page.getByText("Reference gauge value: 25")).toBeVisible();
  await page.getByRole("button", { name: "Set reference gauge" }).click();
  await expect(page.getByText("Reference gauge value: 55")).toBeVisible();
  expect(errors).toEqual([]);
});

test("blog routes render copied website posts", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Introducing XMLUI/ })).toBeVisible();

  await page.goto("/blog/introducing-xmlui");
  await expect(page.getByRole("heading", { name: "Introducing XMLUI" })).toBeVisible();
  await expect(page.getByText("## Components")).toBeVisible();
  await expect(page.getByText("## Reactivity")).toBeVisible();

  await page.goto("/blog/xmlui-for-llms");
  await expect(page.getByRole("heading", { name: "The XMLUI loop for Claude Code and Codex" })).toBeVisible();
  await expect(page.getByText("## Two information channels")).toBeVisible();
  expect(errors).toEqual([]);
});

function trackBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

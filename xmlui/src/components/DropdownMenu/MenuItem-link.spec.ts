import { expect, test } from "../../testing/fixtures";

// =============================================================================
// A MenuItem with a `to` renders as a REAL link (an <a> with an href) instead of
// a click-handling <div>, so that ctrl/cmd-click, middle-click, "copy link
// address" and assistive technology all work.
//
// The single most important property of this change is that the navigation code
// path itself is unchanged: a plain left click is still routed through the
// `navigate` action, so `willNavigate`, `didNavigate`, the `kind:"navigate"`
// trace entry and relative path resolution keep behaving exactly as before.
// Group B below is the regression net around that.
//
// Note the default router: `useHashBasedRouting` defaults to TRUE
// (AppWrapper.tsx), so the expected href is "#/about" unless a test opts out.
// =============================================================================

/** An app whose home page hosts a dropdown menu, plus an /about page to navigate to. */
function menuApp(items: string, extraPages = "") {
  return `
    <App>
      <Pages>
        <Page url="/">
          HomePage
          <DropdownMenu label="Menu">
            ${items}
          </DropdownMenu>
        </Page>
        <Page url="/about">AboutPage</Page>
        ${extraPages}
      </Pages>
    </App>
  `;
}

const tagNameOf = (locator: any) => locator.evaluate((el: Element) => el.tagName);

// =============================================================================
// GROUP A — the anchor and its href
// =============================================================================

test.describe("A: anchor structure and href", () => {
  test("renders a real anchor with an href under the default hash router", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    const item = page.getByRole("menuitem", { name: "About" });

    await expect(item).toBeVisible();
    expect(await tagNameOf(item)).toBe("A");
    await expect(item).toHaveAttribute("href", "#/about");
  });

  test("builds a path-style href when hash based routing is turned off", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`), {
      xmluiConfig: { useHashBasedRouting: false },
    });

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem", { name: "About" })).toHaveAttribute("href", "/about");
  });

  test("resolves a relative `to` the same way the navigate action does", async ({
    initTestBed,
    page,
  }) => {
    // The href must match where a click actually lands. `resolveRelativePathname`
    // resolves against the current LOCATION; React Router's own <Link> would have
    // resolved against the route match, which can differ.
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/">
            <Link to="/parent">Go to parent</Link>
          </Page>
          <Page url="/parent">
            ParentPage
            <DropdownMenu label="Menu">
              <MenuItem to="details">Details</MenuItem>
            </DropdownMenu>
          </Page>
          <Page url="/parent/details">DetailsPage</Page>
        </Pages>
      </App>
    `);

    await page.getByRole("link", { name: "Go to parent" }).click();
    await expect(page.locator(".xmlui-page-root")).toContainText("ParentPage");

    await page.getByRole("button", { name: "Menu" }).click();
    const item = page.getByRole("menuitem", { name: "Details" });
    await expect(item).toHaveAttribute("href", "#/parent/details");

    await item.click();
    await expect(page.locator(".xmlui-page-root")).toContainText("DetailsPage");
  });

  test("keeps an absolute URL verbatim in the href", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="https://example.com/docs">External</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem", { name: "External" })).toHaveAttribute(
      "href",
      "https://example.com/docs",
    );
  });

  test("carries query parameters into the href", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about?tab=team">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem", { name: "About" })).toHaveAttribute(
      "href",
      "#/about?tab=team",
    );
  });

  test("a menu item without `to` stays a non-link element", async ({ initTestBed, page }) => {
    // Guards ResponsiveBar and ProfileMenu, which wrap arbitrary children (often
    // NavLinks) in a MenuItem. Turning those into anchors would nest anchors.
    await initTestBed(menuApp(`<MenuItem onClick="testState = 1">Plain</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    const item = page.getByRole("menuitem", { name: "Plain" });

    await expect(item).toBeVisible();
    expect(await tagNameOf(item)).not.toBe("A");
    await expect(item).not.toHaveAttribute("href", /.*/);
  });

  test("an empty or whitespace-only `to` produces no href", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="   ">Blank</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    const item = page.getByRole("menuitem", { name: "Blank" });

    // Still an anchor (the element type must not depend on the value), but inert.
    expect(await tagNameOf(item)).toBe("A");
    await expect(item).not.toHaveAttribute("href", /.*/);
  });

  test("does not leak a bogus `to` attribute into the DOM", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    const item = page.getByRole("menuitem", { name: "About" });

    expect(await item.getAttribute("to")).toBeNull();
  });

  test("marks an active link with aria-current", async ({ initTestBed, page }) => {
    await initTestBed(
      menuApp(`
        <MenuItem to="/about" active="true">Active</MenuItem>
        <MenuItem to="/about">Inactive</MenuItem>
      `),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(
      page.getByRole("menuitem", { name: "Active", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("menuitem", { name: "Inactive" })).not.toHaveAttribute(
      "aria-current",
      /.*/,
    );
  });
});

// =============================================================================
// GROUP B — the navigation code path is unchanged
// =============================================================================

test.describe("B: navigation goes through the same path as before", () => {
  test("a plain click navigates", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect(page.locator(".xmlui-page-root")).toContainText("AboutPage");
    await expect.poll(() => page.url()).toContain("#/about");
  });

  test("a plain click pushes exactly one history entry", async ({ initTestBed, page }) => {
    // A leftover navigate fallback running alongside the anchor's own navigation
    // would show up here as a double push.
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));

    const before = await page.evaluate(() => window.history.length);
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();
    await expect(page.locator(".xmlui-page-root")).toContainText("AboutPage");

    const after = await page.evaluate(() => window.history.length);
    expect(after - before).toBe(1);
  });

  test("willNavigate still guards the navigation and can cancel it", async ({
    initTestBed,
    page,
  }) => {
    // THE regression test for this change. `willNavigate` only works for
    // programmatic navigation (AppContent.tsx); had the anchor been left to
    // navigate on its own, this guard would have stopped working.
    await initTestBed(`
      <App onWillNavigate="(to) => false">
        <Pages>
          <Page url="/">
            HomePage
            <DropdownMenu label="Menu">
              <MenuItem to="/about">About</MenuItem>
            </DropdownMenu>
          </Page>
          <Page url="/about">AboutPage</Page>
        </Pages>
      </App>
    `);

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect(page.locator(".xmlui-page-root")).toContainText("HomePage");
    expect(page.url()).not.toContain("#/about");
  });

  test("willNavigate receives the resolved target", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App onWillNavigate="(to) => { testState = to; return true; }">
        <Pages>
          <Page url="/">
            HomePage
            <DropdownMenu label="Menu">
              <MenuItem to="/about">About</MenuItem>
            </DropdownMenu>
          </Page>
          <Page url="/about">AboutPage</Page>
        </Pages>
      </App>
    `);

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect.poll(testStateDriver.testState).toBe("/about");
  });

  test("didNavigate still fires after a menu item navigation", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App onDidNavigate="(to) => testState = to">
        <Pages>
          <Page url="/">
            HomePage
            <DropdownMenu label="Menu">
              <MenuItem to="/about">About</MenuItem>
            </DropdownMenu>
          </Page>
          <Page url="/about">AboutPage</Page>
        </Pages>
      </App>
    `);

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect(page.locator(".xmlui-page-root")).toContainText("AboutPage");
    await expect.poll(testStateDriver.testState).toContain("/about");
  });

  test("still records a navigate trace entry", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`), {
      xmluiConfig: { xsVerbose: true },
    });

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();
    await expect(page.locator(".xmlui-page-root")).toContainText("AboutPage");

    const navEntries = await page.evaluate(() =>
      ((window as any)._xsLogs ?? [])
        .filter((entry: any) => entry.kind === "navigate")
        .map((entry: any) => entry.to),
    );
    expect(navEntries).toContain("/about");
  });

  test("navigates when activated with Enter", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).hover();
    await page.keyboard.press("Enter");

    await expect(page.locator(".xmlui-page-root")).toContainText("AboutPage");
  });

  test("navigates when activated with Space", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).hover();
    await page.keyboard.press(" ");

    await expect(page.locator(".xmlui-page-root")).toContainText("AboutPage");
  });

  test("closes the menu after a navigating click", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect(page.getByRole("menuitem")).toHaveCount(0);
  });

  test("an absolute URL is followed by the anchor, not resolved to the app root", async ({
    initTestBed,
    page,
  }) => {
    // Before this change the navigate action resolved "https://example.com/" to
    // "/" and silently sent the user to the app root.
    await initTestBed(menuApp(`<MenuItem to="https://example.com/docs">External</MenuItem>`));

    await page.route("https://example.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<h1>ExternalSite</h1>" }),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "External" }).click();

    await expect.poll(() => page.url()).toContain("example.com/docs");
  });
});

// =============================================================================
// GROUP C — modifier clicks belong to the browser
// =============================================================================

test.describe("C: modifier clicks", () => {
  const stayPut = async (page: any, clickOptions: any) => {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click(clickOptions);
    // The current page must not have navigated; the browser handles the gesture.
    await expect(page.locator(".xmlui-page-root")).toContainText("HomePage");
    expect(page.url()).not.toContain("#/about");
  };

  test("ctrl/cmd-click does not navigate the current page", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));
    await stayPut(page, { modifiers: ["ControlOrMeta"] });
  });

  test("shift-click does not navigate the current page", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));
    await stayPut(page, { modifiers: ["Shift"] });
  });

  test("middle-click does not navigate the current page", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));
    await stayPut(page, { button: "middle" });
  });

  test("a plain click on a target=_blank item does not navigate the current page", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(menuApp(`<MenuItem to="/about" target="_blank">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem", { name: "About" })).toHaveAttribute(
      "target",
      "_blank",
    );
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect(page.locator(".xmlui-page-root")).toContainText("HomePage");
  });

  test("a click handler outranks target=_blank on a plain click", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(
      menuApp(
        `<MenuItem to="/about" target="_blank" onClick="testState = 'handled'">About</MenuItem>`,
      ),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect.poll(testStateDriver.testState).toBe("handled");
    await expect(page.locator(".xmlui-page-root")).toContainText("HomePage");
  });

  test("a modifier click does not run the app's click handler", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      menuApp(`<MenuItem to="/about" onClick="testState = 'handled'">About</MenuItem>`),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page
      .getByRole("menuitem", { name: "About" })
      .click({ modifiers: ["ControlOrMeta"] });

    await expect.poll(testStateDriver.testState).toBe(null);
  });
});

// =============================================================================
// GROUP D — `to` together with a `click` handler
// =============================================================================

test.describe("D: to + click", () => {
  test("a plain click runs only the handler and does not navigate", async ({
    initTestBed,
    page,
  }) => {
    // The documented precedence ("click takes precedence") is preserved.
    const { testStateDriver } = await initTestBed(
      menuApp(`<MenuItem to="/about" onClick="testState = 'handled'">About</MenuItem>`),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect.poll(testStateDriver.testState).toBe("handled");
    await expect(page.locator(".xmlui-page-root")).toContainText("HomePage");
    expect(page.url()).not.toContain("#/about");
  });

  test("the href is still there so the link can be opened deliberately", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      menuApp(`<MenuItem to="/about" onClick="testState = 'handled'">About</MenuItem>`),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem", { name: "About" })).toHaveAttribute("href", "#/about");
  });

  test("the menu closes after a handled click", async ({ initTestBed, page }) => {
    await initTestBed(
      menuApp(`<MenuItem to="/about" onClick="testState = 'handled'">About</MenuItem>`),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect(page.getByRole("menuitem")).toHaveCount(0);
  });
});

// =============================================================================
// GROUP E — disabled items
// =============================================================================

test.describe("E: enabled=false", () => {
  test("a disabled link has no href", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about" enabled="false">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    const item = page.getByRole("menuitem", { name: "About" });

    expect(await tagNameOf(item)).toBe("A");
    await expect(item).not.toHaveAttribute("href", /.*/);
  });

  test("clicking a disabled link does not navigate", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about" enabled="false">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click({ force: true });

    await expect(page.locator(".xmlui-page-root")).toContainText("HomePage");
  });

  test("a disabled link does not run its click handler", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      menuApp(`<MenuItem to="/about" enabled="false" onClick="testState = 'handled'">About</MenuItem>`),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "About" }).click({ force: true });

    await expect.poll(testStateDriver.testState).toBe(null);
  });

  test("keeps the element type stable when `to` resolves late", async ({ initTestBed, page }) => {
    // A binding that starts out empty must not flip the element from <div> to <a>:
    // that would remount the item and throw focus out of the open menu.
    await initTestBed(`
      <App var.target="">
        <Pages>
          <Page url="/">
            HomePage
            <Button testId="resolve" onClick="target = '/about'">Resolve</Button>
            <DropdownMenu label="Menu">
              <MenuItem to="{target}">About</MenuItem>
            </DropdownMenu>
          </Page>
          <Page url="/about">AboutPage</Page>
        </Pages>
      </App>
    `);

    await page.getByRole("button", { name: "Menu" }).click();
    const item = page.getByRole("menuitem", { name: "About" });
    expect(await tagNameOf(item)).toBe("A");
    await expect(item).not.toHaveAttribute("href", /.*/);
  });
});

// =============================================================================
// GROUP F — focus and keyboard (the tabIndex change)
// =============================================================================

test.describe("F: focus and keyboard behaviour", () => {
  test("the open menu is a single tab stop", async ({ initTestBed, page }) => {
    // Radix's roving focus owns tabIndex now; previously every item hard-coded
    // tabIndex=0, which made each one its own tab stop. With real anchors — which
    // are natively focusable — that would have been considerably worse.
    await initTestBed(
      menuApp(`
        <MenuItem to="/about">First</MenuItem>
        <MenuItem to="/about">Second</MenuItem>
        <MenuItem to="/about">Third</MenuItem>
      `),
    );

    await page.getByRole("button", { name: "Menu" }).click();

    // Before anything is highlighted nothing is a tab stop; the old hard-coded
    // tabIndex={0} would have made all three items tab stops right here.
    const initial = await page
      .getByRole("menuitem")
      .evaluateAll((els: Element[]) => els.map((el) => el.getAttribute("tabindex")));
    expect(initial.filter((value) => value === "0")).toHaveLength(0);

    // Once an item is highlighted, exactly that one becomes the single tab stop.
    await page.keyboard.press("ArrowDown");
    const afterArrow = await page
      .getByRole("menuitem")
      .evaluateAll((els: Element[]) => els.map((el) => el.getAttribute("tabindex")));
    expect(afterArrow.filter((value) => value === "0")).toHaveLength(1);
    await expect(page.getByRole("menuitem", { name: "First" })).toHaveAttribute("tabindex", "0");
  });

  test("arrow keys move between link items", async ({ initTestBed, page }) => {
    await initTestBed(
      menuApp(`
        <MenuItem to="/about">First</MenuItem>
        <MenuItem to="/about">Second</MenuItem>
      `),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "First" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Second" })).toBeFocused();
  });

  test("typeahead still finds a link item by its text", async ({ initTestBed, page }) => {
    // Radix derives the typeahead key from the item's textContent, which now
    // lives inside the anchor.
    await initTestBed(
      menuApp(`
        <MenuItem to="/about">Alpha</MenuItem>
        <MenuItem to="/about">Zulu</MenuItem>
      `),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page.keyboard.press("z");
    await expect(page.getByRole("menuitem", { name: "Zulu" })).toBeFocused();
  });

  test("Escape still closes a menu of links", async ({ initTestBed, page }) => {
    await initTestBed(menuApp(`<MenuItem to="/about">About</MenuItem>`));

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menuitem")).toHaveCount(0);
  });

  test("a link inside a SubMenuItem behaves the same", async ({ initTestBed, page }) => {
    await initTestBed(
      menuApp(`
        <SubMenuItem label="More">
          <MenuItem to="/about">Nested</MenuItem>
        </SubMenuItem>
      `),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByText("More").hover();

    const nested = page.getByRole("menuitem", { name: "Nested" });
    await expect(nested).toBeVisible();
    await expect(nested).toHaveAttribute("href", "#/about");

    await nested.click();
    await expect(page.locator(".xmlui-page-root")).toContainText("AboutPage");
  });
});

// =============================================================================
// GROUP G — ContextMenu shares the same MenuItem
// =============================================================================

test.describe("G: ContextMenu", () => {
  const contextApp = `
    <App>
      <Pages>
        <Page url="/">
          HomePage
          <Card testId="trigger" onContextMenu="ev => menu.openAt(ev)">Right click me</Card>
          <ContextMenu id="menu">
            <MenuItem to="/about">About</MenuItem>
          </ContextMenu>
        </Page>
        <Page url="/about">AboutPage</Page>
      </Pages>
    </App>
  `;

  test("renders a real link inside a context menu", async ({ initTestBed, page }) => {
    await initTestBed(contextApp);

    await page.getByTestId("trigger").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "About" })).toHaveAttribute("href", "#/about");
  });

  test("navigates from a context menu link", async ({ initTestBed, page }) => {
    await initTestBed(contextApp);

    await page.getByTestId("trigger").click({ button: "right" });
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect(page.locator(".xmlui-page-root")).toContainText("AboutPage");
  });

  test("closes the context menu after navigating", async ({ initTestBed, page }) => {
    await initTestBed(contextApp);

    await page.getByTestId("trigger").click({ button: "right" });
    await page.getByRole("menuitem", { name: "About" }).click();

    await expect(page.getByRole("menuitem")).toHaveCount(0);
  });
});

// =============================================================================
// GROUP I — developer feedback
// =============================================================================

test.describe("I: nested interactive children", () => {
  // The warning is guarded by `process.env.NODE_ENV !== "production"` so it costs nothing in a
  // shipped app. The built test bed IS a production bundle, so the warning is compiled out
  // there and only the dev-server run can observe it. (playwright.config.ts: the dev server is
  // the default, and `PLAYWRIGHT_USE_DEV_SERVER=false` selects the built bundle.)
  const productionBundle = process.env.PLAYWRIGHT_USE_DEV_SERVER === "false";

  test("warns when a link is nested inside a linking menu item", async ({
    initTestBed,
    page,
  }) => {
    test.skip(productionBundle, "the development-only warning is compiled out of this bundle");

    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });

    await initTestBed(
      menuApp(`
        <MenuItem to="/about">
          <Link to="/about">Nested link</Link>
        </MenuItem>
      `),
    );
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem")).toHaveCount(1);

    await expect
      .poll(() => warnings.some((text) => text.includes("nested inside a MenuItem")))
      .toBe(true);
  });

  test("does not warn for a plain menu item wrapping a link", async ({ initTestBed, page }) => {
    // This is what ResponsiveBar does for its overflow items; it must stay silent.
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });

    await initTestBed(
      menuApp(`
        <MenuItem>
          <Link to="/about">Nested link</Link>
        </MenuItem>
      `),
    );
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem")).toHaveCount(1);

    expect(warnings.some((text) => text.includes("nested inside a MenuItem"))).toBe(false);
  });
});

// =============================================================================
// GROUP H — appearance
// =============================================================================

test.describe("H: appearance", () => {
  test("a link menu item is not underlined", async ({ initTestBed, page }) => {
    await initTestBed(
      menuApp(`
        <MenuItem to="/about">Link item</MenuItem>
        <MenuItem>Plain item</MenuItem>
      `),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    const decoration = await page
      .getByRole("menuitem", { name: "Link item" })
      .evaluate((el: Element) => getComputedStyle(el).textDecorationLine);

    expect(decoration).toBe("none");
  });

  test("a link menu item lines up with a plain one", async ({ initTestBed, page }) => {
    await initTestBed(
      menuApp(`
        <MenuItem to="/about">Link item</MenuItem>
        <MenuItem>Plain item</MenuItem>
      `),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    const linkBox = await page.getByRole("menuitem", { name: "Link item" }).boundingBox();
    const plainBox = await page.getByRole("menuitem", { name: "Plain item" }).boundingBox();

    expect(linkBox!.width).toBeCloseTo(plainBox!.width, 0);
    expect(linkBox!.height).toBeCloseTo(plainBox!.height, 0);
    expect(linkBox!.x).toBeCloseTo(plainBox!.x, 0);
  });

  test("a link menu item uses the menu item colour, not the UA link colour", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      menuApp(`
        <MenuItem to="/about">Link item</MenuItem>
        <MenuItem>Plain item</MenuItem>
      `),
    );

    await page.getByRole("button", { name: "Menu" }).click();
    const linkColor = await page
      .getByRole("menuitem", { name: "Link item" })
      .evaluate((el: Element) => getComputedStyle(el).color);
    const plainColor = await page
      .getByRole("menuitem", { name: "Plain item" })
      .evaluate((el: Element) => getComputedStyle(el).color);

    expect(linkColor).toBe(plainColor);
  });
});

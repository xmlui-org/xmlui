import { test, expect } from "../../testing/fixtures";

// The test bed serves no `xmlui/` viewer files. Like many SPA hosts, it answers a
// missing file with the app's index.html and status 200, which the Inspector must
// not mistake for the viewer. Viewer files are stubbed with `page.route` where a
// test needs them, and no test reaches the real CDN.
//
// The dev test bed has no release version, so the CDN fallback itself is covered
// by the unit tests in `tests/components/Inspector/inspectorResolver.test.ts`.
const CDN_PATTERN = "https://cdn.jsdelivr.net/npm/xmlui@**";
const VIEWER_HTML = `<!doctype html><script type="module">import { XmluiSource } from "./xmlui-parser.es.js";</script><p>viewer</p>`;

const openInspector = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Inspector" }).click();

test.describe("Inspector viewer files (#3946)", () => {
  test("without fetchMissing, a missing viewer shows an error instead of the app's fallback page", async ({
    initTestBed,
    page,
  }) => {
    let cdnRequests = 0;
    await page.route(CDN_PATTERN, (route) => {
      cdnRequests++;
      return route.fulfill({ status: 404 });
    });
    await initTestBed(`<Inspector />`);

    await openInspector(page);

    const error = page.getByTestId("InspectorError");
    await expect(error).toBeVisible();
    await expect(error).toContainText("xs-diff.html");
    await expect(error).toContainText("fetchMissing");
    expect(cdnRequests).toBe(0);
  });

  test("with fetchMissing, local files win and the CDN is not contacted", async ({
    initTestBed,
    page,
  }) => {
    let cdnRequests = 0;
    await page.route(CDN_PATTERN, (route) => {
      cdnRequests++;
      return route.fulfill({ status: 404 });
    });
    await page.route("**/xmlui/xs-diff.html", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: VIEWER_HTML }),
    );
    await page.route("**/xmlui/xmlui-parser.es.js", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/javascript",
        body: "export const XmluiSource = {};",
      }),
    );
    await initTestBed(`<Inspector fetchMissing="true" />`);

    await openInspector(page);

    const frame = page.getByTestId("InspectorFrame");
    await expect(frame).toBeVisible();
    expect(await frame.getAttribute("srcdoc")).toMatch(
      /from "https?:\/\/[^"]+\/xmlui\/xmlui-parser\.es\.js"/,
    );
    await expect(page.frameLocator('[data-testid="InspectorFrame"]').getByText("viewer")).toBeVisible();
    expect(cdnRequests).toBe(0);
  });

  test("with fetchMissing, the error names the missing file and the URLs it tried", async ({
    initTestBed,
    page,
  }) => {
    await page.route(CDN_PATTERN, (route) => route.fulfill({ status: 404 }));
    await initTestBed(`<Inspector fetchMissing="true" />`);

    await openInspector(page);

    const error = page.getByTestId("InspectorError");
    await expect(error).toBeVisible();
    await expect(error).toContainText("xs-diff.html");
    const tried = error.getByRole("listitem");
    await expect(tried.first()).toContainText("/xmlui/xs-diff.html");
    // A build with a release version also lists the CDN URL; the dev test bed has none.
    const count = await tried.count();
    if (count > 1) {
      await expect(tried.nth(1)).toContainText("cdn.jsdelivr.net/npm/xmlui@");
    }
  });
});

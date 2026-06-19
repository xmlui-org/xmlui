import { expect, test, type Page } from "@playwright/test";

const productionBaseUrl = "http://127.0.0.1:5175";

test("production build renders precompiled component apps without XMLUI source fetches", async ({ page }) => {
  const sourceRequests = trackXmluiSourceRequests(page);

  await page.goto(`${productionBaseUrl}/?example=counterComponents`);

  await expect(page.getByRole("heading", { name: "Standalone counter with components" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Standalone increment: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Standalone increment: 0" }).click();
  await expect(page.getByRole("button", { name: "Standalone increment: 1" })).toBeVisible();
  expect(sourceRequests).toEqual([]);
});

test("production build preserves expression-backed style mutations", async ({ page }) => {
  const sourceRequests = trackXmluiSourceRequests(page);

  await page.goto(`${productionBaseUrl}/?example=styleMutation`);

  const stack = page.locator('[data-xmlui-component="VStack"]').first();
  await expect(page.getByRole("heading", { name: "Standalone style mutation" })).toBeVisible();
  await expect(page.getByText("Mode: comfortable", { exact: true })).toBeVisible();
  await expect(stack).toHaveCSS("width", "420px");

  await page.getByRole("button", { name: "Toggle standalone style" }).click();

  await expect(page.getByText("Mode: compact", { exact: true })).toBeVisible();
  await expect(stack).toHaveCSS("width", "260px");
  expect(sourceRequests).toEqual([]);
});

test("production build preserves hash routing and global state mutations", async ({ page }) => {
  const sourceRequests = trackXmluiSourceRequests(page);

  await page.goto(`${productionBaseUrl}/?example=routingState`);

  await expect(page.getByRole("heading", { name: "Standalone routing counter" })).toBeVisible();
  await page.getByRole("button", { name: "Count: 0" }).click();
  await expect(page.getByRole("button", { name: "Count: 1" })).toBeVisible();

  await page.getByRole("link", { name: "Summary" }).click();
  await expect(page.getByRole("heading", { name: "Standalone routing summary" })).toBeVisible();
  await expect(page.getByText("Count is 1", { exact: true })).toBeVisible();
  expect(sourceRequests).toEqual([]);
});

test("production manifest records fixtures, routes, built-ins, and emitted assets", async ({ request }) => {
  const response = await request.get(`${productionBaseUrl}/xmlui-manifest.json`);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();

  expect(manifest.schemaVersion).toBe(1);
  expect(manifest.fixtures.map((entry: { name: string }) => entry.name)).toEqual([
    "counterComponents",
    "styleMutation",
    "routingState",
    "extensionCounterBadge",
  ]);
  expect(manifest.routes).toEqual([
    { fixture: "routingState", url: "/" },
    { fixture: "routingState", url: "/summary" },
  ]);
  expect(manifest.usedBuiltins).toEqual(expect.arrayContaining(["Button", "H1", "Page", "Pages"]));
  expect(manifest.assets).toContain("index.html");
  expect(manifest.assets).toContain("mockApi.js");
  expect(manifest.assets).toContain("production-check.json");
  expect(manifest.assets).toContain("xmlui-metadata.json");
  expect(manifest.metadata).toMatchObject({ path: "xmlui-metadata.json" });
  expect(manifest.assets.some((asset: string) => /^internal\/.*\.mjs$/.test(asset))).toBe(true);
});

test("production output includes a JavaScript mock API compatibility stub", async ({ request }) => {
  const response = await request.get(`${productionBaseUrl}/mockApi.js`);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("text/javascript");
  await expect(response.text()).resolves.toContain("__xmluiMockApiStub");
});

test("production output exposes a diagnostic marker", async ({ request }) => {
  const response = await request.get(`${productionBaseUrl}/production-check.json`);
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    kind: "xmlui-production",
    sourceEntryForbidden: "/src/main.tsx",
  });
});

function trackXmluiSourceRequests(page: Page): string[] {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith(".xmlui")) {
      requests.push(request.url());
    }
  });
  return requests;
}

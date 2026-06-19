import { expect, test, type Page } from "@playwright/test";

const ssgBaseUrl = "http://127.0.0.1:5176";

test("SSG prerenders the routing home route and hydrates button updates", async ({ page }) => {
  const sourceRequests = trackXmluiSourceRequests(page);

  await page.goto(`${ssgBaseUrl}/`);

  await expect(page.locator("#root[data-xmlui-ssg='true']")).toBeAttached();
  await expect(page.getByRole("heading", { name: "Standalone routing counter" })).toBeVisible();
  await page.getByRole("button", { name: "Count: 0" }).click();
  await expect(page.getByRole("button", { name: "Count: 1" })).toBeVisible();
  expect(sourceRequests).toEqual([]);
});

test("SSG prerenders the routing summary route before JavaScript interaction", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${ssgBaseUrl}/summary/`);

  await expect(page.locator("#root[data-xmlui-ssg='true']")).toBeAttached();
  await expect(page.getByRole("heading", { name: "Standalone routing summary" })).toBeVisible();
  await expect(page.getByText("Count is 0", { exact: true })).toBeVisible();
  await context.close();
});

test("SSG hydrates component and style mutation fixtures", async ({ page }) => {
  await page.goto(`${ssgBaseUrl}/counter-components/`);
  await expect(page.getByRole("heading", { name: "Standalone counter with components" })).toBeVisible();
  await page.getByRole("button", { name: "Standalone increment: 0" }).click();
  await expect(page.getByRole("button", { name: "Standalone increment: 1" })).toBeVisible();

  await page.goto(`${ssgBaseUrl}/style-mutation/`);
  const stack = page.locator('[data-xmlui-component="VStack"]').first();
  await expect(page.getByText("Mode: comfortable", { exact: true })).toBeVisible();
  await expect(stack).toHaveCSS("width", "420px");
  await page.getByRole("button", { name: "Toggle standalone style" }).click();
  await expect(page.getByText("Mode: compact", { exact: true })).toBeVisible();
  await expect(stack).toHaveCSS("width", "260px");
});

test("SSG emits search and manifest artifacts and previews resource 404s", async ({ request }) => {
  const search = await request.get(`${ssgBaseUrl}/__xmlui-search-index.json`);
  expect(search.ok()).toBe(true);
  const entries = await search.json();
  expect(entries).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: "/", title: "Standalone routing counter" }),
    expect.objectContaining({ path: "/summary", title: "Standalone routing summary" }),
  ]));

  const manifest = await request.get(`${ssgBaseUrl}/xmlui-ssg-manifest.json`);
  expect(manifest.ok()).toBe(true);
  await expect(manifest.json()).resolves.toMatchObject({
    schemaVersion: 1,
    fallbackFile: "200.html",
    searchIndexFile: "__xmlui-search-index.json",
    assets: expect.arrayContaining(["xmlui-ssg-manifest.json"]),
  });

  const missingResource = await request.get(`${ssgBaseUrl}/missing.js`);
  expect(missingResource.status()).toBe(404);
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

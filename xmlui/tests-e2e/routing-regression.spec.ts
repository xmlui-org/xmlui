import { test, expect } from "../src/testing/fixtures";

const APP_MARKUP = `
<App>
  <Pages fallbackPath="/404">
    <Page url="/">
      <Redirect to="/Getting-Started" />
    </Page>
    <Page url="/*">
      <H1>Wild char page: {$routeParams['*']}</H1>
      <Redirect when="{$routeParams['*'].startsWith('q')}" to="/404" />
    </Page>
    <Page url="/Getting-Started">
      <H1>Getting Started</H1>
    </Page>
    <Page url="/404">
      <H1>404 - Not Found</H1>
    </Page>
  </Pages>
</App>
`;

test("default route redirects to Getting Started page", async ({ page, initTestBed }) => {
  await initTestBed(APP_MARKUP);
  await expect(page.getByRole("heading", { name: "Getting Started" })).toBeVisible();
});

test("wildcard route matches /blabla", async ({ page, initTestBed }) => {
  await initTestBed(APP_MARKUP);
  await page.goto("/#/blabla");
  await expect(page.getByRole("heading", { name: "Wild char page: blabla" })).toBeVisible();
});

test("wildcard route matches /303", async ({ page, initTestBed }) => {
  await initTestBed(APP_MARKUP);
  await page.goto("/#/303");
  await expect(page.getByRole("heading", { name: "Wild char page: 303" })).toBeVisible();
});

test("wildcard route starting with 'q' redirects to 404", async ({ page, initTestBed }) => {
  await initTestBed(APP_MARKUP);
  await page.goto("/#/qterm");
  await expect(page.getByRole("heading", { name: "404 - Not Found" })).toBeVisible();
});

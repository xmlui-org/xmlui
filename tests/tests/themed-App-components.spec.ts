import { expect, test } from "./fixtures";
import { getBoundingRect, getElementStyle, initApp } from "./component-test-helpers";

const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 500;
test.use({ viewport: { width: PAGE_WIDTH, height: PAGE_HEIGHT } });

test("Themed NavPanel", async ({ page }) => {
  const entryPoint =
    `<App layout="vertical">
      <Theme tone="dark">
        <NavPanel testId="nav-panel">
          <NavLink to="/something">Something</NavLink>
        </NavPanel>
      </Theme>
    </App>`;

  await initApp(page, {
    entryPoint
  });

  const backgroundColor = await getElementStyle(page.getByTestId("nav-panel"), "background-color");
  const boundingRect = await getBoundingRect(page.getByTestId("nav-panel"));

  expect(boundingRect.top).toBe(0);
  expect(boundingRect.height).toBe(PAGE_HEIGHT);
  expect(boundingRect.bottom).toBe(PAGE_HEIGHT);
  expect(backgroundColor).toBe("rgb(23, 35, 43)");    // dark theme background color
});

test("Themed AppHeader", async ({ page }) => {
  const entryPoint =
    `<App layout="vertical" scrollWholePage="false">
      <Theme tone="dark">
        <AppHeader testId="app-header"/>
      </Theme>
    </App>`;

  await initApp(page, {
    entryPoint
  });

  const backgroundColor = await getElementStyle(page.getByTestId("app-header"), "background-color");
  const boundingRect = await getBoundingRect(page.getByTestId("app-header"));

  expect(boundingRect.top).toBe(0);
  expect(boundingRect.width).toBe(PAGE_WIDTH);
  expect(backgroundColor).toBe("rgb(28, 43, 53)");    // dark theme background color
});

test("Themed Footer", async ({ page }) => {
  const entryPoint =
    `<App scrollWholePage="false">
      <Theme tone="dark">
        <Footer testId="app-footer"/>
      </Theme>
    </App>`;

  await initApp(page, {
    entryPoint
  });

  const backgroundColor = await getElementStyle(page.getByTestId("app-footer"), "background-color");
  const boundingRect = await getBoundingRect(page.getByTestId("app-footer"));

  expect(boundingRect.left).toBe(0);
  expect(boundingRect.bottom).toEqualWithTolerance(PAGE_HEIGHT, 0.01);
  expect(boundingRect.width).toEqualWithTolerance(PAGE_WIDTH, 0.01);
  expect(backgroundColor).toBe("rgb(28, 43, 53)");    // dark theme background color
});

test("Themed NavPanel", async ({ page }) => {
  const entryPoint =
    `<App layout="vertical">
      <Theme tone="dark">
        <NavPanel testId="nav-panel">
          <NavLink to="/something">Something</NavLink>
        </NavPanel>
      </Theme>
    </App>`;

  await initApp(page, {
    entryPoint
  });

  const backgroundColor = await getElementStyle(page.getByTestId("nav-panel"), "background-color");
  const boundingRect = await getBoundingRect(page.getByTestId("nav-panel"));

  expect(boundingRect.top).toBe(0);
  expect(boundingRect.height).toBe(PAGE_HEIGHT);
  expect(boundingRect.bottom).toBe(PAGE_HEIGHT);
  expect(backgroundColor).toBe("rgb(23, 35, 43)");    // dark theme background color
});

test("Themed H1 regression", async ({ page }) => {
  const entryPoint =
    `<App>
       <Theme
         textColor-H1="rgb(255, 0, 0)"
         textColor-H2="rgb(0, 255, 0)">
           <H1 testId="red">Should be red</H1>
           <H2 testId="green">Should be green</H2>
       </Theme>
    </App>`;

  await initApp(page, {
    entryPoint
  });

  const h1Color = await getElementStyle(page.getByTestId("red"), "color");
  const h2Color = await getElementStyle(page.getByTestId("green"), "color");

  expect(h1Color).toBe("rgb(255, 0, 0)");
  expect(h2Color).toBe("rgb(0, 255, 0)");
});
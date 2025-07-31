import { getBounds, getStyles } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 500;
test.use({ viewport: { width: PAGE_WIDTH, height: PAGE_HEIGHT } });

test("Themed NavPanel", async ({ page, initTestBed }) => {
  const EXPECTED_COLOR = "rgb(23, 35, 43)";
  await initTestBed(
    `
    <App layout="vertical">
      <Theme tone="dark">
        <NavPanel testId="nav-panel">
          <NavLink to="/something">Something</NavLink>
        </NavPanel>
      </Theme>
    </App>
  `,
    {
      themes: [
        {
          id: "test",
          extends: "light",
          tones: {
            dark: {
              themeVars: {
                "background-color": EXPECTED_COLOR,
              },
            },
          },
        },
      ],
      defaultTheme: "test",
    },
  );
  const { backgroundColor } = await getStyles(page.getByTestId("nav-panel"), "background-color");
  const boundingRect = await getBounds(page.getByTestId("nav-panel"));

  expect(boundingRect.top).toBe(0);
  expect(boundingRect.height).toBe(PAGE_HEIGHT);
  expect(boundingRect.bottom).toBe(PAGE_HEIGHT);
  expect(backgroundColor).toBe(EXPECTED_COLOR);
});

test("Themed AppHeader", async ({ page, initTestBed }) => {
  const EXPECTED_COLOR = "rgb(28, 43, 53)";
  await initTestBed(
    `
    <App layout="vertical" scrollWholePage="false">
      <Theme tone="dark">
        <AppHeader testId="app-header"/>
      </Theme>
    </App>
  `,
    {
      themes: [
        {
          id: "test",
          extends: "light",
          tones: {
            dark: {
              themeVars: {
                "background-color": EXPECTED_COLOR,
              },
            },
          },
        },
      ],
      defaultTheme: "test",
    },
  );
  const { backgroundColor } = await getStyles(page.getByTestId("app-header"), "background-color");
  const boundingRect = await getBounds(page.getByTestId("app-header"));

  expect(boundingRect.top).toBe(0);
  expect(boundingRect.width).toBe(PAGE_WIDTH);
  expect(backgroundColor).toBe(EXPECTED_COLOR);
});

test("Themed Footer", async ({ page, initTestBed }) => {
  const EXPECTED_COLOR = "rgb(28, 43, 53)";
  await initTestBed(
    `
    <App scrollWholePage="false">
      <Theme tone="dark">
        <Footer testId="app-footer"/>
      </Theme>
    </App>
  `,
    {
      themes: [
        {
          id: "test",
          extends: "light",
          tones: {
            dark: {
              themeVars: {
                "background-color": EXPECTED_COLOR,
              },
            },
          },
        },
      ],
      defaultTheme: "test",
    },
  );

  const { backgroundColor } = await getStyles(page.getByTestId("app-footer"), "background-color");
  const boundingRect = await getBounds(page.getByTestId("app-footer"));

  expect(boundingRect.left).toBe(0);
  expect(boundingRect.bottom).toEqualWithTolerance(PAGE_HEIGHT, 0.01);
  expect(boundingRect.width).toEqualWithTolerance(PAGE_WIDTH, 0.01);
  expect(backgroundColor).toBe(EXPECTED_COLOR);
});

test("Themed H1 regression", async ({ page, initTestBed }) => {
  await initTestBed(`
    <App>
      <Theme textColor-H1="rgb(255, 0, 0)" textColor-H2="rgb(0, 255, 0)">
          <H1 testId="red">Should be red</H1>
          <H2 testId="green">Should be green</H2>
      </Theme>
    </App>
  `);

  const { color: h1Color } = await getStyles(page.getByTestId("red"), "color");
  const { color: h2Color } = await getStyles(page.getByTestId("green"), "color");

  expect(h1Color).toBe("rgb(255, 0, 0)");
  expect(h2Color).toBe("rgb(0, 255, 0)");
});

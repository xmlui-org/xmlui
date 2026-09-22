import path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../testing/fixtures";

// Isolation reproduction for xmlui-org/xmlui#3830.
//
// The two test.fail() tests in List.spec.ts show xmlui's List emitting
// "ResizeObserver loop completed with undelivered notifications" under an
// ordinary mount-and-scroll. Neither of the bounded remedies helped
// (contain: layout on the row wrapper, virtua 0.48.8 -> 0.52.7), which left one
// question deciding who owns the defect: does virtua do this WITHOUT xmlui?
//
// This drives the same scroll pattern against a bare React + virtua page
// (tests/isolation/virtua-ro), served by a Vite dev server this file starts
// itself. Nothing in playwright.config.ts is touched, and the server is closed
// in afterAll so no dev server is left running.
// ESM scope: no __dirname, so derive it from import.meta.url.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(HERE, "../../../tests/isolation/virtua-ro");

let server: any;
let baseURL: string;

test.beforeAll(async () => {
  const { createServer } = await import("vite");
  server = await createServer({
    root: FIXTURE,
    configFile: false,
    server: { port: 0, strictPort: false },
    logLevel: "warn",
  });
  await server.listen();
  const address = server.httpServer.address();
  baseURL = `http://localhost:${address.port}/`;
});

test.afterAll(async () => {
  await server?.close();
});

test("bare virtua does not trigger RO feedback under the same scroll pattern", async ({
  page,
}) => {
  // EXPECTED FAILURE: measured 3 warnings here, the same count xmlui's List
  // control test produces — with no xmlui code in the page at all. The defect is
  // upstream in virtua. The assertion states the behaviour we want; test.fail()
  // records that virtua does not provide it, so CI stays green and turns red if a
  // future virtua release fixes it — which is exactly when we want to be told.
  test.fail();

  // Capture-phase listener installed before any page or Vite client code:
  // Vite's client registers its own window error handler, so
  // page.on("pageerror") never sees this error and the test reports a false
  // clean. That trap already produced one wrong answer on this issue.
  await page.addInitScript(() => {
    (window as any).__roErrors = [];
    window.addEventListener(
      "error",
      (e: any) => {
        const msg = String(e?.message ?? e);
        if (/ResizeObserver loop/i.test(msg)) (window as any).__roErrors.push(msg);
      },
      true,
    );
  });

  await page.goto(baseURL);
  await expect(page.getByText("Item 0", { exact: true })).toBeVisible();

  // Identical to the List control test: 5 wheel steps, 150ms apart.
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(150);
  }

  const roErrors = await page.evaluate(() => (window as any).__roErrors ?? []);
  console.log(`VIRTUA_ISOLATION_ERRORS=${roErrors.length}`);
  expect(roErrors).toEqual([]);
});

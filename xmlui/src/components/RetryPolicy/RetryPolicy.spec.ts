import { expect, test } from "../../testing/fixtures";

test.describe("RetryPolicy foundation", () => {
  test("DataSource retries server failures before publishing data", async ({ initTestBed, page }) => {
    let requests = 0;
    await page.route("**/api/retry-data", async (route) => {
      requests++;
      await route.fulfill({
        status: requests < 3 ? 500 : 200,
        contentType: "application/json",
        body: JSON.stringify(requests < 3 ? { error: "temporary" } : { message: "loaded", attempts: requests }),
      });
    });

    await initTestBed(`
      <RetryPolicy attempts="3" delayMs="1" jitter="{false}">
        <DataSource id="flaky" url="/api/retry-data" />
      </RetryPolicy>
      <Text testId="message">{flaky.value.message}</Text>
      <Text testId="attempts">{flaky.value.attempts}</Text>
    `);

    await expect(page.getByTestId("message")).toHaveText("loaded");
    await expect(page.getByTestId("attempts")).toHaveText("3");
    expect(requests).toBe(3);
  });

  test("DataSource does not retry categories excluded by onlyCategories", async ({ initTestBed, page }) => {
    let requests = 0;
    await page.route("**/api/retry-validation", async (route) => {
      requests++;
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "bad input" }),
      });
    });

    await initTestBed(`
      <RetryPolicy attempts="3" delayMs="1" jitter="{false}" onlyCategories="server">
        <DataSource id="invalid" url="/api/retry-validation" />
      </RetryPolicy>
      <Text testId="error">{invalid.error.code + ':' + invalid.error.category}</Text>
    `);

    await expect(page.getByTestId("error")).toHaveText("http-400:validation");
    expect(requests).toBe(1);
  });

  test("APICall execute uses the ambient retry policy", async ({ initTestBed, page }) => {
    let requests = 0;
    await page.route("**/api/retry-action", async (route) => {
      requests++;
      await route.fulfill({
        status: requests < 2 ? 503 : 200,
        contentType: "application/json",
        body: JSON.stringify({ result: "saved", attempts: requests }),
      });
    });

    await initTestBed(`
      <RetryPolicy attempts="2" delayMs="1" jitter="{false}">
        <APICall id="save" url="/api/retry-action" />
      </RetryPolicy>
      <Button testId="run" onClick="save.execute()">Run</Button>
      <Text testId="result">{save.lastResult.result}</Text>
      <Text testId="attempts">{save.lastResult.attempts}</Text>
    `);

    await page.getByTestId("run").click();
    await expect(page.getByTestId("result")).toHaveText("saved");
    await expect(page.getByTestId("attempts")).toHaveText("2");
    expect(requests).toBe(2);
  });
});

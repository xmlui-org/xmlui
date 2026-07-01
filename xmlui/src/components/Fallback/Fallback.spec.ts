import { test, expect } from "../../testing/fixtures";

test("renders normal children when not loading", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fallback>
      <property name="loadingTemplate">
        <Text testId="loading">Loading...</Text>
      </property>
      <Text testId="normal">Normal content</Text>
    </Fallback>
  `);

  await expect(page.getByTestId("normal")).toHaveText("Normal content");
  await expect(page.getByTestId("loading")).toHaveCount(0);
});

test("renders loadingTemplate while isLoading is true", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fallback isLoading="{true}">
      <property name="loadingTemplate">
        <Text testId="loading">Loading...</Text>
      </property>
      <Text testId="normal">Normal content</Text>
    </Fallback>
  `);

  await expect(page.getByTestId("loading")).toHaveText("Loading...");
  await expect(page.getByTestId("normal")).toHaveCount(0);
});

test("renders errorTemplate when a descendant DataSource fails", async ({ initTestBed, page }) => {
  await page.route("**/api/fallback-failure", async (route) => {
    await route.fulfill({
      status: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Nope" }),
    });
  });

  await initTestBed(`
    <Fallback>
      <property name="errorTemplate">
        <Text testId="error">{$error.category}:{$error.code}:{$error.data.statusCode}</Text>
      </property>
      <DataSource id="broken" url="/api/fallback-failure" />
      <Text testId="normal">Normal content</Text>
    </Fallback>
  `);

  await expect(page.getByTestId("error")).toHaveText("server:http-500:500");
  await expect(page.getByTestId("normal")).toHaveCount(0);
});

test("renders errorTemplate when a descendant APICall fails", async ({ initTestBed, page }) => {
  await page.route("**/api/save-failure", async (route) => {
    await route.fulfill({
      status: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Nope" }),
    });
  });

  await initTestBed(`
    <Fallback>
      <property name="errorTemplate">
        <Text testId="error">{$error.category}:{$error.code}</Text>
      </property>
      <APICall id="save" url="/api/save-failure" />
      <Button label="Save" onClick="save.execute().catch(e => null)" />
    </Fallback>
  `);

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByTestId("error")).toHaveText("server:http-500");
  await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
});

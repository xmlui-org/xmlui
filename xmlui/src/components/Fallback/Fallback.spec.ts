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

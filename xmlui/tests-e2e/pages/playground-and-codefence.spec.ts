import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The "list of fruits" example has a multiline initialize string in its ---api
// section that isn't parseable by extractXmluiExample. We construct the pieces
// manually to avoid the JSON.parse failure.
const app = `<App>\n  <List data="/api/fruits" />\n</App>`;
const apiInterceptor = {
  apiUrl: "/api",
  initialize:
    "$state.fruits = [{ id: 1, name: 'Orange' }, { id: 2, name: 'Apple' }, { id: 3, name: 'Pear' }]",
  operations: {
    "get-fruits": {
      url: "/fruits",
      method: "get" as const,
      handler: "return $state.fruits;",
    },
  },
};

test.describe("list of fruits", { tag: "@website" }, () => {

  test("initial state shows all three fruits from the API", async ({ initTestBed, page }) => {
    await initTestBed(app, { apiInterceptor });
    await expect(page.getByText("Orange")).toBeVisible();
    await expect(page.getByText("Apple")).toBeVisible();
    await expect(page.getByText("Pear")).toBeVisible();
  });
});

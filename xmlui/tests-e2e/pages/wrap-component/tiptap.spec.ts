import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/wrap-component/tiptap.md",
  ),
);

// display-only example — no interaction to test
test.describe("demo-b6d7", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "demo-b6d7");

  test("renders the TiptapEditor with initial content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // The editor renders a contenteditable div with initial rich text content
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByText("Try it out")).toBeVisible();
  });
});

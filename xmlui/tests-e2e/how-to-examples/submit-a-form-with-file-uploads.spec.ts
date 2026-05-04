import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/submit-a-form-with-file-uploads.md",
  ),
);

test.describe("Support ticket form with file attachment", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Support ticket form with file attachment",
  );

  test("initial state shows ticket fields, optional attachment, and submit button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Subject" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Description" })).toBeVisible();
    await expect(page.getByText("Attachment (optional)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Browse" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit ticket" })).toBeVisible();
  });

  test("submitting empty required fields shows validation errors", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Submit ticket" }).click();

    await expect(page.getByText("This field is required")).toHaveCount(2);
  });

  test("submitting without an attachment reports none", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Subject" }).fill("Cannot log in");
    await page.getByRole("textbox", { name: "Description" }).fill("Password reset fails.");
    await page.getByRole("button", { name: "Submit ticket" }).click();

    await expect(page.getByText("Ticket submitted. Attachment: none")).toBeVisible();
  });

  test("selected file is included in submitted form data", async ({
    initTestBed,
    page,
    createFileInputDriver,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const fileInput = await createFileInputDriver();

    await page.getByRole("textbox", { name: "Subject" }).fill("Upload evidence");
    await page.getByRole("textbox", { name: "Description" }).fill("Screenshot attached.");
    await fileInput.getHiddenInput().setInputFiles({
      name: "screenshot.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake png"),
    });
    await expect.poll(() => fileInput.getSelectedFiles()).toBe("screenshot.png");
    await page.getByRole("button", { name: "Submit ticket" }).click();

    await expect(page.getByText("Ticket submitted. Attachment: screenshot.png")).toBeVisible();
  });

  test("dropping multiple files is rejected while a single dropped file is accepted", async ({
    initTestBed,
    page,
    createFileInputDriver,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const fileInput = await createFileInputDriver();
    const dropTarget = fileInput.getContainer().locator('button[type="button"]').first();
    const dataTransfer = await page.evaluateHandle(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(["first"], "first.png", { type: "image/png" }));
      transfer.items.add(new File(["second"], "second.png", { type: "image/png" }));
      return transfer;
    });

    await dropTarget.dispatchEvent("dragenter", { dataTransfer });
    await dropTarget.dispatchEvent("dragover", { dataTransfer });
    await dropTarget.dispatchEvent("drop", { dataTransfer });

    await expect.poll(() => fileInput.getSelectedFiles()).toBe("");

    const singleFileTransfer = await page.evaluateHandle(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(["single"], "single.png", { type: "image/png" }));
      return transfer;
    });

    await dropTarget.dispatchEvent("dragenter", { dataTransfer: singleFileTransfer });
    await dropTarget.dispatchEvent("dragover", { dataTransfer: singleFileTransfer });
    await dropTarget.dispatchEvent("drop", { dataTransfer: singleFileTransfer });

    await expect.poll(() => fileInput.getSelectedFiles()).toBe("single.png");
  });
});

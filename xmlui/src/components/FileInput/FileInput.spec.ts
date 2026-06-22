import { expect, test } from "../../testing/fixtures";

test.describe("FileInput foundation", () => {
  test("renders the picker surface", async ({ initTestBed, page }) => {
    await initTestBed(`<FileInput testId="files" placeholder="Select a file" />`);

    await expect(page.getByTestId("files")).toBeVisible();
    await expect(page.getByTestId("files").locator("[data-part-id='input']")).toContainText("Select a file");
    await expect(page.getByRole("button", { name: /Browse/ })).toBeVisible();
  });

  test("selects a single file and fires didChange", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="files"
        onDidChange="(files) => testState = files[0]?.name" />
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles({
      name: "report.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello"),
    });

    await expect(page.getByTestId("files")).toContainText("report.txt");
    await expect.poll(testStateDriver.testState).toBe("report.txt");
  });

  test("supports multiple files", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="files"
        multiple="true"
        onDidChange="(files) => testState = files.map(f => f.name).join(',')" />
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles([
      { name: "a.txt", mimeType: "text/plain", buffer: Buffer.from("a") },
      { name: "b.txt", mimeType: "text/plain", buffer: Buffer.from("b") },
    ]);

    await expect(page.getByTestId("files")).toContainText("a.txt, b.txt");
    await expect.poll(testStateDriver.testState).toBe("a.txt,b.txt");
  });

  test("filters accepted extensions", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="files"
        multiple="true"
        acceptsFileType=".txt"
        onDidChange="(files) => testState = files.map(f => f.name).join(',')" />
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles([
      { name: "accepted.txt", mimeType: "text/plain", buffer: Buffer.from("a") },
      { name: "rejected.json", mimeType: "application/json", buffer: Buffer.from("{}") },
    ]);

    await expect(page.getByTestId("files")).toContainText("accepted.txt");
    await expect(page.getByTestId("files")).not.toContainText("rejected.json");
    await expect.poll(testStateDriver.testState).toBe("accepted.txt");
  });

  test("accepts dropped files", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="files"
        onDidChange="(files) => testState = files[0]?.name" />
    `);

    const dataTransfer = await page.evaluateHandle(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(["dropped"], "drop.txt", { type: "text/plain" }));
      return transfer;
    });
    await page.getByTestId("files").locator("[data-part-id='input']").dispatchEvent("drop", { dataTransfer });

    await expect(page.getByTestId("files")).toContainText("drop.txt");
    await expect.poll(testStateDriver.testState).toBe("drop.txt");
  });

  test("supports focus and blur events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="files"
        onGotFocus="testState = 'focused'"
        onLostFocus="testState = 'blurred'" />
      <Button testId="other">Other</Button>
    `);

    await page.getByRole("button", { name: /Browse/ }).focus();
    await expect.poll(testStateDriver.testState).toBe("focused");
    await page.getByTestId("other").focus();
    await expect.poll(testStateDriver.testState).toBe("blurred");
  });

  test("disabled and readOnly prevent changes", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="disabled"
        enabled="false"
        onDidChange="(files) => testState = files[0]?.name" />
      <FileInput
        testId="readonly"
        readOnly="true"
        onDidChange="(files) => testState = files[0]?.name" />
    `);

    await expect(page.getByTestId("disabled").locator("input[type='file']")).toBeDisabled();
    await expect(page.getByTestId("readonly").locator("input[type='file']")).toBeDisabled();
    await expect.poll(testStateDriver.testState).toBeNull();
  });

  test("parses basic CSV and exposes fields", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        id="files"
        testId="files"
        parseAs="csv"
        onDidChange="(result) => testState = result.parsedData[0].data[0].name + ':' + files.getFields()[0]" />
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles({
      name: "products.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,price\nHat,12"),
    });

    await expect.poll(testStateDriver.testState).toBe("Hat:name");
  });

  test("applies validation and focus theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`<FileInput testId="files" validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-TextBox--error": "rgb(255, 0, 0)",
      },
    });

    const inputPart = page.getByTestId("files").locator("[data-part-id='input']");
    await expect(inputPart).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test.fixme("Form/FormItem binding, submit serialization, advanced Papa Parse options, and directory picker parity are deferred to follow-up slices", async () => {});
});

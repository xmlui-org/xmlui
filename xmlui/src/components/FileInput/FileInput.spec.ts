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

  test("bindTo syncs selected files into Form data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form hideButtonRow="true">
        <FileInput id="files" testId="files" bindTo="documents" />
        <Text testId="dataValue">{$data.documents.length}</Text>
        <Text testId="apiValue">{files.value.length}</Text>
      </Form>
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles({
      name: "contract.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("contract"),
    });

    await expect(page.getByTestId("dataValue")).toHaveText("1");
    await expect(page.getByTestId("apiValue")).toHaveText("1");
  });

  test("submit serializes the selected file array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data.documents[0].name">
        <FileInput testId="files" bindTo="documents" />
      </Form>
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles({
      name: "invoice.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("pdf"),
    });
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toBe("invoice.pdf");
  });

  test("directory mode enables directory and multiple-file picking", async ({ initTestBed, page }) => {
    await initTestBed(`<FileInput testId="files" directory="true" multiple="false" />`);

    const hiddenInput = page.getByTestId("files").locator("input[type='file']");
    await expect(hiddenInput).toHaveAttribute("multiple", "");
    await expect(hiddenInput).toHaveAttribute("webkitdirectory", "true");
  });

  test("parseAs infers accepted file extensions and allows explicit override", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <FileInput testId="csv" parseAs="csv" />
        <FileInput testId="json" parseAs="json" />
        <FileInput testId="override" parseAs="csv" acceptsFileType=".txt,.csv" />
      </VStack>
    `);

    await expect(page.getByTestId("csv").locator("input[type='file']")).toHaveAttribute("accept", ".csv");
    await expect(page.getByTestId("json").locator("input[type='file']")).toHaveAttribute("accept", ".json");
    await expect(page.getByTestId("override").locator("input[type='file']")).toHaveAttribute("accept", ".txt,.csv");
  });

  test("csvOptions support custom delimiter, dynamic typing, and no-header rows", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="files"
        parseAs="csv"
        csvOptions="{{ delimiter: ';', dynamicTyping: true, header: false }}"
        onDidChange="result => testState = {
          rowCount: result.parsedData[0].data.length,
          firstName: result.parsedData[0].data[0][0],
          priceType: typeof result.parsedData[0].data[0][1]
        }" />
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles({
      name: "products.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("Hat;12\nCoat;40\n"),
    });

    await expect.poll(async () => (await testStateDriver.testState())?.rowCount).toBe(2);
    const parsed = await testStateDriver.testState();
    expect(parsed.firstName).toBe("Hat");
    expect(parsed.priceType).toBe("number");
  });

  test("JSON parsing normalizes object and array documents", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="files"
        parseAs="json"
        multiple="true"
        onDidChange="result => testState = result.parsedData.map(entry => entry.data.length).join(',')" />
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles([
      {
        name: "single.json",
        mimeType: "application/json",
        buffer: Buffer.from('{"name":"Hat"}'),
      },
      {
        name: "array.json",
        mimeType: "application/json",
        buffer: Buffer.from('[{"name":"Hat"},{"name":"Coat"}]'),
      },
    ]);

    await expect.poll(testStateDriver.testState).toBe("1,2");
  });

  test("parseError receives the parsing error and source file", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        testId="files"
        parseAs="json"
        onParseError="(error, file) => testState = { hasError: !!error, fileName: file.name }" />
    `);

    await page.getByTestId("files").locator("input[type='file']").setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{"),
    });

    await expect.poll(async () => (await testStateDriver.testState())?.hasError).toBe(true);
    const parseError = await testStateDriver.testState();
    expect(parseError.fileName).toBe("broken.json");
  });
});

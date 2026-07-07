import { expect, test } from "../../testing/fixtures";

test.describe("FileUploadDropZone foundation", () => {
  test("default border color matches original runtime", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <FileUploadDropZone
          height="100px"
          onUpload="
            (files) => {
              console.log(files);
              files.map(file => toast('file ' + file.path + ' uploaded'))}" />
      </App>
    `);

    const dropZone = page.locator('[data-xmlui-component="FileUploadDropZone"]');
    await expect(dropZone).toHaveCount(1);
    await expect(dropZone).toHaveCSS("border-color", "rgb(197, 203, 212)");
    await expect(dropZone).toHaveCSS("border-style", "dashed");
    await expect(dropZone).toHaveCSS("border-width", "2px");
  });
});

import { expect, test } from "../../testing/fixtures";

test.describe("IFrame foundation", () => {
  test("accepts and forwards the documented title prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <IFrame
          src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
          allow="camera; microphone; geolocation"
          width="560px"
          height="315px"
          title="Rick Astley - Never Gonna Give You Up (Official Video)"
          testId="iframe"
        />
      </App>
    `);

    await expect(page.getByTestId("iframe")).toHaveAttribute(
      "title",
      "Rick Astley - Never Gonna Give You Up (Official Video)",
    );
    await expect(page.getByTestId("iframe")).not.toHaveAttribute("data-xmlui-component");
    await expect(page.getByTestId("iframe")).not.toHaveAttribute("data-xmlui-part");
  });
});

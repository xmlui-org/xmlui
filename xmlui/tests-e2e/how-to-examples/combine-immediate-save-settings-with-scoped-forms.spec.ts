import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/combine-immediate-save-settings-with-scoped-forms.md",
  ),
);

test.describe("Choose save boundaries for settings", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "choose-save-boundaries-for-settings",
  );

  test("isolates save progress and adopts canonical Form baselines", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const digestSwitch = page.getByRole("switch", { name: "Weekly digest" });
    const senderName = page.getByRole("textbox", { name: "Sender name" });
    const replyTo = page.getByRole("textbox", { name: "Reply-to email" });
    const retentionDays = page.getByRole("spinbutton", { name: "Retention days" });

    await expect(digestSwitch).not.toBeChecked();
    await expect(page.getByText("Status: Saved", { exact: true })).toBeVisible();
    await expect(page.getByText("Server value: Off", { exact: true })).toBeVisible();
    await expect(senderName).toHaveValue("Bram Team");
    await expect(replyTo).toHaveValue("ops@example.com");
    await expect(retentionDays).toHaveValue("30");
    await expect(page.getByRole("button", { name: "Save delivery settings" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Save retention settings" })).not.toBeVisible();

    await digestSwitch.check();
    await expect.poll(() => digestSwitch.isDisabled()).toBe(true);
    await expect(page.getByText("Status: Saving…", { exact: true })).toBeVisible();
    await expect
      .poll(() =>
        page
          .getByText("Status: Could not save — restored the server value", { exact: true })
          .isVisible(),
      )
      .toBe(true);
    await expect(digestSwitch).not.toBeChecked();
    await expect(digestSwitch).toBeEnabled();
    await expect(page.getByText("Server value: Off", { exact: true })).toBeVisible();

    await digestSwitch.check();

    await expect
      .poll(() => page.getByText("Server value: On", { exact: true }).isVisible())
      .toBe(true);
    await expect(digestSwitch).toBeChecked();
    await expect(digestSwitch).toBeEnabled();
    await expect(page.getByText("Status: Saved", { exact: true })).toBeVisible();

    await senderName.fill("  XMLUI Team  ");
    await replyTo.fill("TEAM@XMLUI.ORG");
    await retentionDays.fill("31");
    await page.getByRole("button", { name: "Save delivery settings" }).click();

    const deliverySavingButton = page.getByRole("button", { name: "Saving delivery settings…" });
    await expect.poll(() => deliverySavingButton.isVisible()).toBe(true);
    await expect(deliverySavingButton).toBeDisabled();
    await expect(senderName).toBeDisabled();
    await expect(replyTo).toBeDisabled();
    await expect(retentionDays).toBeEnabled();
    await expect(page.getByRole("button", { name: "Save retention settings" })).toBeVisible();
    await expect(digestSwitch).toBeEnabled();

    await expect(senderName).toHaveValue("XMLUI Team");
    await expect(replyTo).toHaveValue("team@xmlui.org");
    await expect(page.getByText("Server sender: XMLUI Team", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Saved canonical sender: XMLUI Team", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save delivery settings" })).not.toBeVisible();
    await expect(retentionDays).toHaveValue("31");
    await expect(page.getByRole("button", { name: "Save retention settings" })).toBeVisible();

    await senderName.fill("Another draft");
    await page.getByRole("button", { name: "Reset delivery draft" }).click();
    await expect(senderName).toHaveValue("XMLUI Team");
    await expect(replyTo).toHaveValue("team@xmlui.org");
    await expect(page.getByRole("button", { name: "Save delivery settings" })).not.toBeVisible();

    await senderName.fill("Unsaved delivery draft");
    await page.getByRole("button", { name: "Save retention settings" }).click();

    const retentionSavingButton = page.getByRole("button", { name: "Saving retention settings…" });
    await expect.poll(() => retentionSavingButton.isVisible()).toBe(true);
    await expect(retentionSavingButton).toBeDisabled();
    await expect(retentionDays).toBeDisabled();
    await expect(senderName).toBeEnabled();
    await expect(page.getByRole("button", { name: "Save delivery settings" })).toBeVisible();

    await expect(retentionDays).toHaveValue("28");
    await expect(page.getByText("Server retention: 28 days", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Saved canonical retention: 28 days", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save retention settings" })).not.toBeVisible();
    await expect(senderName).toHaveValue("Unsaved delivery draft");
    await expect(page.getByRole("button", { name: "Save delivery settings" })).toBeVisible();

    await retentionDays.fill("35");
    await page.getByRole("button", { name: "Reset retention draft" }).click();
    await expect(retentionDays).toHaveValue("28");
    await expect(page.getByRole("button", { name: "Save retention settings" })).not.toBeVisible();
  });
});

test.describe("Reconcile external changes with a scoped Form", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "reconcile-external-changes-with-a-scoped-form",
  );

  test("adopts pristine snapshots and preserves dirty drafts until reload", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const senderName = page.getByRole("textbox", { name: "Sender name" });
    const replyTo = page.getByRole("textbox", { name: "Reply-to email" });

    await expect(senderName).toHaveValue("Bram Team");
    await expect(replyTo).toHaveValue("ops@example.com");
    await expect(page.getByText("Server sender: Bram Team", { exact: true })).toBeVisible();
    await expect(page.getByText("Settings changed elsewhere.", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save delivery settings" })).not.toBeVisible();

    await page.getByRole("button", { name: "Simulate external update" }).click();

    await expect.poll(() => senderName.inputValue()).toBe("Server Team 1");
    await expect(replyTo).toHaveValue("server1@example.com");
    await expect(page.getByText("Server sender: Server Team 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Settings changed elsewhere.", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save delivery settings" })).not.toBeVisible();

    await senderName.fill("Temporary draft");
    await page.getByRole("button", { name: "Reset delivery draft" }).click();
    await expect(senderName).toHaveValue("Server Team 1");

    await senderName.fill("My unsaved draft");
    await page.getByRole("button", { name: "Simulate external update" }).click();

    await expect
      .poll(() => page.getByText("Server sender: Server Team 2", { exact: true }).isVisible())
      .toBe(true);
    await expect(senderName).toHaveValue("My unsaved draft");
    await expect(replyTo).toHaveValue("server1@example.com");
    await expect(page.getByText("Settings changed elsewhere.", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reload server values" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save delivery settings" })).toBeVisible();

    await page.getByRole("button", { name: "Reload server values" }).click();

    await expect(senderName).toHaveValue("Server Team 2");
    await expect(replyTo).toHaveValue("server2@example.com");
    await expect(page.getByText("Settings changed elsewhere.", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save delivery settings" })).not.toBeVisible();
  });
});

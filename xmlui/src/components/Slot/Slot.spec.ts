import { expect, test } from "../../testing/fixtures";

test.describe("Slot foundation", () => {
  test("renders fallback children when no slot is injected", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Slot>
        <Text testId="fallback">Fallback slot</Text>
      </Slot>
    `);

    await expect(page.getByTestId("fallback")).toHaveText("Fallback slot");
  });

  test("renders default injected children in a user component", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ActionBar>
        <Button label="Create" />
        <Button label="Edit" />
      </ActionBar>
    `, {
      components: [
        `
        <Component name="ActionBar">
          <VStack>
            <Text>Actions</Text>
            <HStack>
              <Slot />
            </HStack>
          </VStack>
        </Component>
        `,
      ],
    });

    await expect(page.getByText("Actions")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  test("renders named slot content and keeps default fallback for missing slots", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Panel>
        <property name="headerTemplate">
          <Text testId="custom-header">Custom Header</Text>
        </property>
        <Text testId="body">Body</Text>
      </Panel>
    `, {
      components: [
        `
        <Component name="Panel">
          <VStack>
            <Slot name="headerTemplate">
              <Text testId="default-header">Default Header</Text>
            </Slot>
            <Slot />
            <Slot name="footerTemplate">
              <Text testId="default-footer">Default Footer</Text>
            </Slot>
          </VStack>
        </Component>
        `,
      ],
    });

    await expect(page.getByTestId("custom-header")).toHaveText("Custom Header");
    await expect(page.getByTestId("body")).toHaveText("Body");
    await expect(page.getByTestId("default-footer")).toHaveText("Default Footer");
    await expect(page.getByTestId("default-header")).not.toBeVisible();
  });

  test("passes reactive context values to named slot templates", async ({ initTestBed, page }) => {
    await initTestBed(`
      <MessageHost>
        <property name="messageTemplate">
          <Text testId="message">{$message}</Text>
        </property>
      </MessageHost>
    `, {
      components: [
        `
        <Component name="MessageHost" var.currentMessage="Initial Message">
          <VStack>
            <Button label="Update Message" onClick="currentMessage = 'Updated Message'" />
            <Slot name="messageTemplate" message="{currentMessage}">
              <Text>No message</Text>
            </Slot>
          </VStack>
        </Component>
        `,
      ],
    });

    await expect(page.getByTestId("message")).toHaveText("Initial Message");
    await page.getByRole("button", { name: "Update Message" }).click();
    await expect(page.getByTestId("message")).toHaveText("Updated Message");
  });
});

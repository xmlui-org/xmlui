import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";

test("can submit with invisible required field", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment var.couldSubmit="{false}">
        <Form onSubmit="couldSubmit = true" testId="form">
            <FormItem testId="select" bindTo="authenticationType" type="select" label="Authentication Type:" initialValue="{0}">
              <Option value="{0}" label="Password" />
              <Option value="{1}" label="Public Key" testId="publicKey" />
            </FormItem>
            <FormItem label="name1" testId="name1" bindTo="name1" required="true" when="{$data.authenticationType === 0}"/>
            <FormItem label="name2" testId="name2" bindTo="name2" required="true" when="{$data.authenticationType === 1}"/>
        </Form>
        <Text testId="couldSubmit" when="{couldSubmit}">SUCCESS</Text>
      </Fragment>  
    `,
  });

  await page.getByTestId("select").click();
  await page.getByTestId("publicKey").click();
  await page.getByTestId("name2").getByRole("textbox").fill("John");
  await page.getByTestId("form").locator("button[type='submit']").click();
  await expect(page.getByTestId("couldSubmit")).toHaveText("SUCCESS");
});

test("conditional fields keeps the state", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
        <Form testId="form">
          <FormItem testId="select" bindTo="authenticationType" type="radioGroup" label="Authentication Type:" initialValue="{0}">
            <Option value="{0}" label="Password" testId="password"/>
            <Option value="{1}" label="Public Key" testId="publicKey" />
          </FormItem>
          <FormItem label="name1" testId="name1" bindTo="name1" required="true" when="{$data.authenticationType === 0}"/>
          <FormItem label="name2" testId="name2" bindTo="name2" required="true" when="{$data.authenticationType === 1}"/>
        </Form>  
    `,
  });

  await page.getByTestId("name1").getByRole("textbox").fill("name1");
  await page.getByTestId("select").click();
  await page.getByTestId("publicKey").getByRole("radio").click();
  await page.getByTestId("name2").getByRole("textbox").fill("name2");
  await page.getByTestId("select").click();
  await page.getByTestId("password").getByRole("radio").click();
  await expect(page.getByTestId("name1").getByRole("textbox")).toHaveValue("name1");
});


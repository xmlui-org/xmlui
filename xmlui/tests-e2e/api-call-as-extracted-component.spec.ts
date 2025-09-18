import { expect, test } from "../src/testing/fixtures";
import { initApp } from "../src/testing/themed-app-test-helpers";

test("api call as an extracted component get called", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <Fragment>
        <APICall 
           id="apiCall"
           url="/postUrl"
           method="post"
           body="{$param}"
        />
        <Form onSubmit="(body)=>apiCall.execute(body)">
            <FormItem bindTo="name" testId="nameInput"/>
        </Form>
    </Fragment>
    `,
    apiInterceptor: {
      operations: {
        "postUrl": {
          url: "/postUrl",
          method: "post",
          handler: `()=>{
            return $requestBody;
          }`,
        }
      },
    },
  });


  const responsePromise = page.waitForResponse((response) => response.url().includes("/postUrl"));

  await page.getByTestId("nameInput").getByRole("textbox").fill("John");
  await page.locator("button[type='submit']").click();


  const response = await responsePromise;
  const responseBody = await response.json();
  expect(responseBody).toEqual({
    name: "John"
  });
});


test("api call as an extracted component get called (function reference + default body)", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <Fragment>
        <APICall 
           id="apiCall"
           url="/postUrl"
           method="post"
        />
        <Form onSubmit="apiCall.execute">
            <FormItem bindTo="name" testId="nameInput"/>
        </Form>
    </Fragment>
    `,
    apiInterceptor: {
      operations: {
        "postUrl": {
          url: "/postUrl",
          method: "post",
          handler: `()=>{
            return $requestBody;
          }`,
        }
      },
    },
  });


  const responsePromise = page.waitForResponse((response) => response.url().includes("/postUrl"));

  await page.getByTestId("nameInput").getByRole("textbox").fill("John");
  await page.locator("button[type='submit']").click();

  const response = await responsePromise;
  const responseBody = await response.json();
  expect(responseBody).toEqual({
    name: "John"
  });
});

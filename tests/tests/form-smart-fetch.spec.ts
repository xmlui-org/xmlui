import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";
import { ApiInterceptorDefinition } from "xmlui";

const crudInterceptor: ApiInterceptorDefinition = {
  // language=javascript
  initialize: `
    $state.items = {
      [10]: { name: "Smith", id: 10 }
    };
    $state.currentId = 10;
  `,
  operations: {
    create: {
      url: "/entities",
      method: "post",
      // language=javascript
      handler: `() => {
        $state.currentId++;
        $state.items[$state.currentId] = $requestBody;
        $state.items[$state.currentId].id = $state.currentId;

        return $state.items[$state.currentId];
      }`,
    },
    read: {
      url: "/entities/:id",
      method: "get",
      // language=javascript
      handler: `() => {
        return $state.items[$pathParams.id];
      }`,
    },
    update: {
      url: "/entities/:id",
      method: "put",
      // language=javascript
      handler: `() => {
        $state.items[$pathParams.id] = { ...$state.items[$pathParams.id], ...$requestBody };
        return $state.items[$pathParams.id];
      }`,
    },
  },
};

test("create form works with submitUrl", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
        <Form submitUrl="/entities">
            <FormItem bindTo="name" testId="nameInput"/>
        </Form>
    `,
    apiInterceptor: crudInterceptor,
  });
  const responsePromise = page.waitForResponse((response) => response.url().includes("/entities"));
  await page.getByTestId("nameInput").getByRole("textbox").fill("John");
  await page.locator("button[type='submit']").click();

  const response = await responsePromise;
  const responseBody = await response.json();
  expect(responseBody).toEqual({
    name: "John",
    id: 11,
  });
});

test("edit form works with data url", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
        <Form data="/entities/10">
            <FormItem bindTo="name" testId="nameInput"/>
        </Form>
    `,
    apiInterceptor: crudInterceptor,
  });
  await expect(page.getByTestId("nameInput").getByRole("textbox")).toHaveValue("Smith");
  const responsePromise = page.waitForResponse((response) => response.url().includes("/entities"));
  await page.getByTestId("nameInput").getByRole("textbox").fill("EDITED-Smith");
  await page.locator("button[type='submit']").click();

  const response = await responsePromise;
  const responseBody = await response.json();
  expect(responseBody).toEqual({
    name: "EDITED-Smith",
    id: 10,
  });
});


test("regression: data url through modal context", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment>
        <Button testId="openModalButton" onClick="modal.open({data: '/entities/10'})"/>
        <ModalDialog id="modal">
          <Form data="{$modalContext.data}" submitUrl="{$modalContext.submitUrl}">
             <FormItem bindTo="name" testId="nameInput"/>
          </Form>
        </ModalDialog>
      </Fragment>
    `,
    apiInterceptor: crudInterceptor,
  });

  await page.getByTestId("openModalButton").click();
  await expect(page.getByTestId("nameInput").getByRole("textbox")).toHaveValue("Smith");
  const responsePromise = page.waitForResponse((response) => response.url().includes("/entities"));
  await page.getByTestId("nameInput").getByRole("textbox").fill("EDITED-Smith");
  await page.locator("button[type='submit']").click();

  const response = await responsePromise;
  const responseBody = await response.json();
  expect(responseBody).toEqual({
    name: "EDITED-Smith",
    id: 10,
  });

});

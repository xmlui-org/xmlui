import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";
import { labelPositionValues } from "@components/abstractions";
import { expect, ComponentDriver, createTestWithDriver } from "@testing/fixtures";

// TODO: Copy over other tests to utilize this interceptor
const crudInterceptor: ApiInterceptorDefinition = {
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
      handler: `() => {
        return $state.items[$pathParams.id];
      }`,
    },
    update: {
      url: "/entities/:id",
      method: "put",
      handler: `() => {
        $state.items[$pathParams.id] = { ...$state.items[$pathParams.id], ...$requestBody };
        return $state.items[$pathParams.id];
      }`,
    },
  },
};

// --- Setup

type SubmitTrigger = "click" | "keypress";
type MockExternalApiOptions = {
  status?: number;
  headers?: Record<string, string>;
  body?: Record<string, any>;
};

class FormDriver extends ComponentDriver {
  async mockExternalApi(url: string, apiOptions: MockExternalApiOptions) {
    const { status = 200, headers = {}, body = {} } = apiOptions;
    await this.page.route(url, (route) =>
      route.fulfill({ status, headers, body: JSON.stringify(body) }),
    );
  }

  getSubmitButton() {
    return this.component.locator("button[type='submit']");
  }

  async hasSubmitButton() {
    return (await this.getSubmitButton().count()) > 0;
  }

  async submitForm(trigger: SubmitTrigger = "click") {
    if (trigger === "keypress") {
      if ((await this.hasSubmitButton()) && (await this.getSubmitButton().isEnabled())) {
        await this.getSubmitButton().focus();
      }
      await this.locator.locator("input").waitFor();
      const firstInputChild = this.locator.locator("input");
      if ((await firstInputChild.count()) > 0) {
        await firstInputChild.first().focus();
      }
      await this.page.keyboard.press("Enter");
    } else if (trigger === "click") {
      await this.getSubmitButton().click();
    }
  }

  async getSubmitRequest(
    endpoint = "/entities",
    requestMethod = "POST",
    trigger: SubmitTrigger = "click",
    timeout = 5000,
  ) {
    const requestPromise = this.page.waitForRequest(
      (request) =>
        request.url().endsWith(endpoint) &&
        request.method().toLowerCase() === requestMethod.toLowerCase(),
      { timeout },
    );
    await this.submitForm(trigger);
    return requestPromise;
  }

  async getSubmitResponse(
    endpoint = "/entities",
    requestMethod = "POST",
    trigger: SubmitTrigger = "click",
    timeout = 5000,
  ) {
    const request = await this.getSubmitRequest(endpoint, requestMethod, trigger, timeout);
    return request.response();
  }

  // TEMP: As we expand tests, we need to rethink how the input fields are accessed
  getFormItemWithTestId(testId: string) {
    return this.component.getByTestId(testId).getByRole("textbox");
  }
}

const test = createTestWithDriver(FormDriver);

// TODO: evaluate and add tests from 'form-smart-fetch.spec.ts' and 'conditional-field-in-form-submit.spec.ts',
// as well as other places that may be relevant

// --- Testing

test("renders component", async ({ createDriver }) => {
  const driver = await createDriver(`<Form />`);
  await expect(driver.component).toBeAttached();
});

// --- --- buttonRowTemplate

test.skip("buttonRowTemplate can render buttons", async ({ createDriver }) => {});

test.skip("buttonRowTemplate replaces built-in buttons", async ({ createDriver }) => {});

test("setting buttonRowTemplate without buttons still runs submit on Enter", async ({
  createDriver,
}) => {
  const driver = await createDriver(`
    <Form onSubmit="testState = true">
      <property name="buttonRowTemplate">
        <Fragment />
      </property>
      <FormItem testId="name" bindTo="name" />
    </Form>`);
  await driver.submitForm("keypress");
  await expect.poll(driver.testState).toBe(true);
});

// --- --- itemLabelPosition

labelPositionValues.forEach((pos) => {
  test.skip(`label position ${pos} is applied by default for all FormItems`, async ({
    createDriver,
  }) => {});
  test.skip(`label position ${pos} is not applied if overridden in FormItem`, async ({
    createDriver,
  }) => {});
});

// --- --- itemLabelWidth: Should we use this? Can we re-evaluate?

// --- --- itemLabelBreak: We should talk about this

test.skip("FormItem labels break to next line", async ({ createDriver }) => {});

test.skip("no label breaks if overriden in FormItem", async ({ createDriver }) => {});

// --- --- enabled

test.skip("Form buttons and contained FormItems are enabled", async ({ createDriver }) => {});

test.skip("Form buttons and contained FormItems are disabled", async ({ createDriver }) => {});

// --- --- data

test("Form does not render if data receives malformed input", async ({ createDriver }) => {
  const driver = await createDriver(`<Form data="{}" />`);
  await expect(driver.component).not.toBeAttached();
});

test("data accepts an object", async ({ createDriver }) => {
  const driver = await createDriver(`
    <Form data="{{ field1: 'test' }}">
      <FormItem testId="inputField" bindTo="field1" />
    </Form>
  `);
  await expect(driver.getFormItemWithTestId("inputField")).toHaveValue("test");
});

// NOTE: These will not throw an error on render, there is just no way to access them
// TODO: Check whether setting inaccessible data results in the submitMethod becoming PUT instead of POST
[
  { label: "primitive", value: "hi" },
  { label: "empty array", value: [] },
  { label: "array", value: ["hi", "hello", "yay"] },
  { label: "function", value: () => {} },
].forEach((type) => {
  test.skip(`data does not accept ${type.label}`, async ({ createDriver }) => {});
});

// Fails with CI mode, but otherwise works
// npm run build:test-bed;
// CI=true npm run test:e2e
test.fixme("data accepts relative URL endpoint", async ({ createDriver }) => {
  const driver = await createDriver(
    `
    <Form data="/test">
      <FormItem testId="inputField" bindTo="name" />
    </Form>`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: "/test",
            method: "get",
            handler: `return { name: 'John' };`,
          },
        },
      },
    },
  );
  await expect(driver.getFormItemWithTestId("inputField")).toHaveValue("John");
});

// TODO: Mock's not working for some reason, can access unmocked URLs though
test.skip("data accepts external URL endpoint", async ({ createDriver }) => {
  // data="https://api.spacexdata.com/v3/history/1"
  const driver = await createDriver(`
    <Form data="https://example.com/test">
      <FormItem testId="inputField" bindTo="title" />
    </Form>
  `);
  await driver.mockExternalApi("**/*/test", { body: { name: "John" } });
  await expect(driver.getFormItemWithTestId("inputField")).toHaveValue("John");
});

// --- --- cancelLabel: In the future we need to have a test case for the hideCancel prop

test.skip("cancel button uses default label if cancelLabel is not set", async ({
  createDriver,
}) => {});

test.skip("cancel button is rendered with cancelLabel", async ({ createDriver }) => {});

// saveLabel

test.skip("save button is rendered with default label if saveLabel is set to empty string", async ({
  createDriver,
}) => {});

test.skip("save button is rendered with saveLabel", async ({ createDriver }) => {});

// saveInProgressLabel

test.skip("save in progress label shows up on submission", async ({ createDriver }) => {});

test.skip("save in progress label does not get stuck after submission is done", async ({
  createDriver,
}) => {});

// swapCancelAndSave

test.skip("built-in button row order flips if swapCancelAndSave is true", async ({
  createDriver,
}) => {});

// --- submitUrl

// Fails with CI mode, but otherwise works
// npm run build:test-bed;
// CI=true npm run test:e2e
test.fixme("form submits to correct url", async ({ createDriver }) => {
  const endpoint = "/test";
  const driver = await createDriver(
    `
    <Form data="{{ name: 'John' }}" submitUrl="${endpoint}" submitMethod="post">
      <FormItem bindTo="name" />
    </Form>`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: endpoint,
            method: "post",
            handler: `{ return true; }`,
          },
        },
      },
    },
  );

  const response = await driver.getSubmitResponse(endpoint, "POST", "click");
  console.log(response);
  expect(response.ok()).toBe(true);
  expect(new URL(response.url()).pathname).toBe(endpoint);
});

// --- submitMethod

// TODO: GET doesn't work, are there any APIs that need to accept GET when submitting?
[/* "get", */ "post", "put", "delete"].forEach((method) => {
  test(`submitMethod uses the ${method} REST operation`, async ({ createDriver }) => {
    const driver = await createDriver(
      `
      <Form data="{{ name: 'John' }}" submitUrl="/test" submitMethod="${method}">
        <FormItem bindTo="name" />
      </Form>`,
      {
        apiInterceptor: {
          operations: {
            testPost: {
              url: "/test",
              method: "post",
              handler: `return true;`,
            },
            testGet: {
              url: "/test",
              method: "get",
              handler: `return true;`,
            },
            testPut: {
              url: "/test",
              method: "put",
              handler: `return true;`,
            },
            testDelete: {
              url: "/test",
              method: "delete",
              handler: `return true;`,
            },
          },
        },
      },
    );

    const request = await driver.getSubmitRequest("/test", method, "click");
    expect(request.failure()).toBeNull();
  });
});

// --- submitting the Form

test("submit triggers when clicking save/submit button", async ({ createDriver }) => {
  const driver = await createDriver(
    `
    <Form data="{{ name: 'John' }}" submitUrl="/test" submitMethod="post">
      <FormItem bindTo="name" />
    </Form>`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: "/test",
            method: "post",
            handler: `return true;`,
          },
        },
      },
    },
  );

  const request = await driver.getSubmitRequest("/test", "POST", "click");
  expect(request.failure()).toBeNull();
});

test("submit triggers when pressing Enter", async ({ createDriver }) => {
  const driver = await createDriver(
    `
    <Form data="{{ name: 'John' }}" submitUrl="/test" submitMethod="post">
      <FormItem bindTo="name" />
    </Form>`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: "/test",
            method: "post",
            handler: `return true;`,
          },
        },
      },
    },
  );

  const request = await driver.getSubmitRequest("/test", "POST", "keypress");
  expect(request.failure()).toBeNull();
});

// TODO: times out because the request cannot be sent - need to re-evaluate the assertion
test.skip("submit only triggers when enabled", async ({ createDriver }) => {
  const driver = await createDriver(
    `
    <Form enabled="false" data="{{ name: 'John' }}" submitUrl="/test" submitMethod="post">
      <FormItem bindTo="name" />
    </Form>`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: "/test",
            method: "post",
            handler: `return true;`,
          },
        },
      },
    },
  );
  await expect.soft(driver.getSubmitButton()).toBeDisabled();

  const request = await driver.getSubmitRequest("/test", "POST", "click");
  expect(request.failure()).not.toBeNull();
});

test("user cannot submit with clientside errors present", async ({ createDriver }) => {
  const driver = await createDriver(`
    <Form onSubmit="testState = true">
      <FormItem bindTo="name" required="true" />
    </Form>`);
  // The onSubmit event should have been triggered if not for the client error of an empty required field
  await expect.poll(driver.testState).toEqual(null);
});

// --- canceling

test.skip("cancel only triggers when enabled", async ({ createDriver }) => {});

// --- reset: TODO

// --- $data: should these be in FormItem.spec.ts?

test.skip("$data is correctly bound to form data", async ({ createDriver }) => {});

test.skip("$data is correctly undefined if data is not set in props", async ({
  createDriver,
}) => {});

// --- backend validation summary

test.skip("submitting with errors shows validation summary", async ({ createDriver }) => {});

test.skip("submitting without errors does not show summary", async ({ createDriver }) => {});

test.skip("general error messages are rendered in the summary", async ({ createDriver }) => {});

test.skip("field-related errors are rendered at the correct FormItems", async ({
  createDriver,
}) => {});

test.skip("field-related errors disappear if user updates FormItems", async ({
  createDriver,
}) => {});

// NOTE: this could be multiple tests
test.skip("user can close all parts of the summary according to severity", async ({
  createDriver,
}) => {});

test.skip("submitting with errors 2nd time after user close shows summary again", async ({
  createDriver,
}) => {});

test.skip("Form shows confirmation dialog if warnings are present", async ({ createDriver }) => {});

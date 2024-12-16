import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";
import { labelPositionValues } from "@components/abstractions";
import { expect, ComponentDriver, createTestWithDriver } from "@testing/fixtures";

// TEMP
const apiInterceptor: ApiInterceptorDefinition = {
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

class FormDriver extends ComponentDriver {
  getSubmitButton() {
    return this.component.locator("button[type='submit']");
  }

  async submitForm(trigger: SubmitTrigger = "click") {
    if (trigger === "keypress") {
      await this.getSubmitButton().focus();
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
}

const test = createTestWithDriver(FormDriver);

// TODO: evaluate and add tests from 'form-smart-fetch.spec.ts' and 'conditional-field-in-form-submit.spec.ts',
// as well as other places that may be relevant

// NOTE: Most important feature of Form: submit and data handling

// --- Testing

test("renders component", async ({ createDriver }) => {
  const driver = await createDriver(`<Form />`);
  await expect(driver.component).toBeAttached();
});

// --- --- buttonRowTemplate

test.skip("buttonRowTemplate can render buttons", async ({ createDriver }) => {});

test.skip("buttonRowTemplate replaces built-in buttons", async ({ createDriver }) => {});

test.skip("setting buttonRowTemplate without buttons still runs submit on Enter", async ({
  createDriver,
}) => {});

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

test.skip("data accepts an object", async ({ createDriver }) => {
  const driver = await createDriver(`<Form data="{{ test: 'test' }}" />`);
  await expect(driver.component).toBeAttached();
});

[
  { label: "empty array", value: [] },
  { label: "array", value: ["hi", "hello", "yay"] },
  { label: "function", value: () => {} },
].forEach((type) => {
  test.skip(`data does not accept ${type.label}`, async ({ createDriver }) => {});
});

// e.g. /api/endpoint
test.skip("data accepts relative URL endpoint", async ({ createDriver }) => {});

// e.g. https://example.com/api/endpoint
test.skip("data accepts external URL endpoint", async ({ createDriver }) => {});

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

test.skip("form submits to correct url", async ({ createDriver }) => {});

// --- submitMethod

["get", "post", "put", "delete"].forEach((method) => {
  test(`submitMethod uses the ${method} REST operation`, async ({ createDriver }) => {
    const driver = await createDriver(`
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
  const driver = await createDriver(`
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
  const driver = await createDriver(`
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

test("submit only triggers when enabled", async ({ createDriver }) => {
  const driver = await createDriver(`
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

test.skip("user cannot submit with clientside errors present", async ({ createDriver }) => {});

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

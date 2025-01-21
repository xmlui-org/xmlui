import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";
import { labelPositionValues } from "@components/abstractions";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { expect, test } from "@testing/fixtures";

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

// TODO: evaluate and add tests from 'form-smart-fetch.spec.ts' and 'conditional-field-in-form-submit.spec.ts',
// as well as other places that may be relevant

// --- Testing

test("renders component", async ({ initTestBed, createFormDriver }) => {
  await initTestBed(`<Form />`);
  await expect((await createFormDriver()).component).toBeAttached();
});

// --- --- buttonRowTemplate

test.skip(
  "buttonRowTemplate can render buttons",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "buttonRowTemplate replaces built-in buttons",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test("setting buttonRowTemplate without buttons still runs submit on Enter", async ({
  initTestBed,
  createFormDriver,
}) => {
  const testStateDriver = await initTestBed(`
    <Form onSubmit="testState = true">
      <property name="buttonRowTemplate">
        <Fragment />
      </property>
      <FormItem bindTo="name" />
    </Form>
  `);
  const driver = await createFormDriver();

  await driver.submitForm("keypress");
  await expect.poll(testStateDriver.testState).toBe(true);
});

// --- --- itemLabelPosition

labelPositionValues.forEach((pos) => {
  test.skip(
    `label position ${pos} is applied by default for all FormItems`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    `label position ${pos} is not applied if overridden in FormItem`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// --- --- itemLabelWidth: Should we use this? Can we re-evaluate?

// --- --- itemLabelBreak: We should talk about this

test.skip(
  "FormItem labels break to next line",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "no label breaks if overriden in FormItem",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- enabled

test.skip(
  "Form buttons and contained FormItems are enabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "Form buttons and contained FormItems are disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- data

test("Form does not render if data receives malformed input", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(`<Form data="{}" />`);
  await expect((await createFormDriver()).component).not.toBeAttached();
});

test("data accepts an object", async ({ initTestBed, createFormItemDriver }) => {
  await initTestBed(`
    <Form data="{{ field1: 'test' }}">
      <FormItem testId="inputField" bindTo="field1" />
    </Form>
  `);
  const driver = await createFormItemDriver("inputField");
  await expect(driver.input).toHaveValue("test");
});

// NOTE: These will not throw an error on render, there is just no way to access them
// TODO: Check whether setting inaccessible data results in the submitMethod becoming PUT instead of POST
[
  { label: "primitive", value: "hi" },
  { label: "empty array", value: [] },
  { label: "array", value: ["hi", "hello", "yay"] },
  { label: "function", value: () => {} },
].forEach((type) => {
  test.fixme(
    `data does not accept ${type.label}`,
    SKIP_REASON.UNSURE("Need to talk this through"),
    async ({ initTestBed }) => {},
  );
});

// Fails with CI mode, but otherwise works
// npm run build:test-bed;
// CI=true npm run test:e2e
test.fixme("data accepts relative URL endpoint", async ({ initTestBed, createFormItemDriver }) => {
  await initTestBed(
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
  const driver = await createFormItemDriver("inputField");
  await expect(driver.component).toHaveValue("John");
});

// TODO
test.fixme(
  "data accepts external URL endpoint",
  SKIP_REASON.TEST_NOT_WORKING(
    "Mock's not working for some reason, can access unmocked URLs though",
  ),
  async ({ initTestBed, createFormDriver, createFormItemDriver }) => {
    // data="https://api.spacexdata.com/v3/history/1"
    await initTestBed(`
    <Form data="https://example.com/test">
      <FormItem testId="inputField" bindTo="title" />
    </Form>
  `);
    const formDriver = await createFormDriver();
    const formItemDriver = await createFormItemDriver("inputField");

    await formDriver.mockExternalApi("**/*/test", { body: { name: "John" } });
    await expect(formItemDriver.component).toHaveValue("John");
  },
);

// --- --- cancelLabel: In the future we need to have a test case for the hideCancel prop

test.skip(
  "cancel button uses default label if cancelLabel is not set",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip("cancel button is rendered with cancelLabel", async ({ initTestBed }) => {});

// saveLabel

test.skip(
  "save button is rendered with default label if saveLabel is set to empty string",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "save button is rendered with saveLabel",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// saveInProgressLabel

test.skip(
  "save in progress label shows up on submission",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "save in progress label does not get stuck after submission is done",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// swapCancelAndSave

test.skip(
  "built-in button row order flips if swapCancelAndSave is true",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- submitUrl

// Fails with CI mode, but otherwise works
// npm run build:test-bed;
// CI=true npm run test:e2e
test.fixme("form submits to correct url", async ({ initTestBed, createFormDriver }) => {
  const endpoint = "/test";
  await initTestBed(
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
  const driver = await createFormDriver();

  const response = await driver.getSubmitResponse(endpoint, "POST", "click");
  expect(response.ok()).toBe(true);
  expect(new URL(response.url()).pathname).toBe(endpoint);
});

// --- submitMethod

// TODO: GET doesn't work, are there any APIs that need to accept GET when submitting?
[/* "get", */ "post", "put", "delete"].forEach((method) => {
  test(`submitMethod uses the ${method} REST operation`, async ({
    initTestBed,
    createFormDriver,
  }) => {
    await initTestBed(
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
    const driver = await createFormDriver();

    const request = await driver.getSubmitRequest("/test", method, "click");
    expect(request.failure()).toBeNull();
  });
});

// --- submitting the Form

test("submit triggers when clicking save/submit button", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(
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
  const driver = await createFormDriver();

  const request = await driver.getSubmitRequest("/test", "POST", "click");
  expect(request.failure()).toBeNull();
});

test("submit triggers when pressing Enter", async ({ initTestBed, createFormDriver }) => {
  await initTestBed(
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
  const driver = await createFormDriver();

  const request = await driver.getSubmitRequest("/test", "POST", "keypress");
  expect(request.failure()).toBeNull();
});

// TODO
test.fixme(
  "submit only triggers when enabled",
  SKIP_REASON.TEST_NOT_WORKING(
    "times out because the request cannot be sent, need to re-evaluate the assertion",
  ),
  async ({ initTestBed, createFormDriver }) => {
    await initTestBed(
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
    const driver = await createFormDriver();
    await expect.soft(driver.getSubmitButton()).toBeDisabled();

    const request = await driver.getSubmitRequest("/test", "POST", "click");
    expect(request.failure()).not.toBeNull();
  },
);

test("user cannot submit with clientside errors present", async ({
  initTestBed,
  createFormDriver,
}) => {
  const testStateDriver = await initTestBed(`
    <Form onSubmit="testState = true">
      <FormItem bindTo="name" required="true" />
    </Form>
  `);
  const driver = await createFormDriver();

  // The onSubmit event should have been triggered if not for the client error of an empty required field
  await driver.submitForm("click");
  await expect.poll(testStateDriver.testState).toEqual(null);
});

// --- canceling

test.skip(
  "cancel only triggers when enabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- reset: TODO

// --- $data: should these be in FormItem.spec.ts?

test.skip(
  "$data is correctly bound to form data",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "$data is correctly undefined if data is not set in props",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- backend validation summary

test.skip(
  "submitting with errors shows validation summary",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "submitting without errors does not show summary",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "general error messages are rendered in the summary",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "field-related errors are rendered at the correct FormItems",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "field-related errors disappear if user updates FormItems",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// NOTE: this could be multiple tests
test.skip(
  "user can close all parts of the summary according to severity",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "submitting with errors 2nd time after user close shows summary again",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "Form shows confirmation dialog if warnings are present",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

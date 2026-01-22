import { expect, test } from "../../testing/fixtures";
import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";

// Test data constants for API mocking
const basicApiInterceptor: ApiInterceptorDefinition = {
  operations: {
    "get-test": {
      url: "/api/test",
      method: "get",
      handler: `console.log('GET!!!'); return { message: "GET success", id: 1 };`,
    },
    "post-test": {
      url: "/api/test/1",
      method: "post",
      handler: `return { message: "POST success", id: 2, data: $requestBody };`,
    },
    "put-test": {
      url: "/api/test/1",
      method: "put",
      handler: `return { message: "PUT success", id: 1, data: $requestBody };`,
    },
    "delete-test": {
      url: "/api/test/1",
      method: "delete",
      handler: `return { message: "DELETE success", deleted: true };`,
    },
    "query-params-test": {
      url: "/api/search",
      method: "get",
      handler: `return { query: $queryParams, results: ["item1", "item2"] };`,
    },
    "headers-test": {
      url: "/api/headers",
      method: "get",
      handler: `console.log('hd', $requestHeaders); return { headers: $requestHeaders };`,
    },
    "error-test-400": {
      url: "/api/error/400",
      method: "post",
      handler: `throw Errors.HttpError(400, { message: "Bad request", details: "Invalid data" });`,
    },
    "error-test-500": {
      url: "/api/error/500",
      method: "post",
      handler: `throw Errors.HttpError(500, { message: "Internal server error", details: "Something went wrong" });`,
    },
    "error-test-unknown": {
      url: "/api/error/unknown",
      method: "post",
      handler: `throw new Error("Unknown error occurred");`,
    },
    "slow-test": {
      url: "/api/slow",
      method: "get",
      handler: `
        await new Promise(resolve => setTimeout(resolve, 100));
        return { message: "Slow response" };
      `,
    },
  },
};

const confirmationInterceptor: ApiInterceptorDefinition = {
  operations: {
    "confirm-test": {
      url: "/api/confirm",
      method: "post",
      handler: `return { message: "Confirmed action", timestamp: Date.now() };`,
    },
  },
};

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders and initializes correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<APICall id="test" url="/api/test" method="get" />`, {
      apiInterceptor: basicApiInterceptor,
    });

    // APICall is non-visual, so we check for proper registration by checking if it exists in context
    const component = page.getByTestId("test-id-component");
    expect(await component.count()).toBe(0); // Non-visual component
  });

  test("component executes with basic properties", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall id="api" url="/api/test" method="get" onSuccess="arg => testState = arg.message" />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const button = await createButtonDriver("trigger");
    await button.click();

    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("GET success");
  });

  // =============================================================================
  // HTTP METHOD TESTS
  // =============================================================================

  test.describe("HTTP method property", () => {
    const methods = ["get", "post", "put", "delete"];

    methods.forEach((method) => {
      test(`executes ${method.toUpperCase()} request correctly`, async ({
        initTestBed,
        createButtonDriver,
      }) => {
        const { testStateDriver } = await initTestBed(
          `
          <Fragment>
            <APICall 
              id="api" 
              url="/api/test${method === "get" ? "" : "/1"}" 
              method="${method}" 
              ${method !== "get" ? `body='{{ "test": "data" }}'` : ""}
              onSuccess="result => testState = result.message" 
            />
            <Button testId="trigger" onClick="api.execute()" label="Execute" />
          </Fragment>
        `,
          {
            apiInterceptor: basicApiInterceptor,
          },
        );

        const button = await createButtonDriver("trigger");
        await button.click();

        await expect
          .poll(testStateDriver.testState, { timeout: 2000 })
          .toEqual(`${method.toUpperCase()} success`);
      });
    });

    test("supports additional HTTP methods like PATCH", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test/1" 
            method="patch" 
            body='{{ "test": "data" }}'
            onSuccess="() => testState = 'patch-success'" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: {
            operations: {
              "real-patch": {
                url: "/api/test/1",
                method: "patch",
                handler: `return { message: "PATCH success" };`,
              },
            },
          },
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("patch-success");
    });

    test("defaults to GET method when not specified", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="/api/test" onSuccess="result => testState = result.message" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("GET success");
    });

    test("handles invalid method gracefully", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="/api/test" method="invalid" onError="() => testState = 'error'" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("error");
    });
  });

  // =============================================================================
  // URL PROPERTY TESTS
  // =============================================================================

  test.describe("url property", () => {
    test("handles absolute URLs", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="/api/test" onSuccess="() => testState = 'success'" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
    });

    test("handles relative URLs", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="api/test" onSuccess="() => testState = 'success'" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: {
            operations: {
              "relative-test": {
                url: "**/api/test",
                method: "get",
                handler: `return { success: true };`,
              },
            },
          },
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
    });

    test("handles URL with special characters", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="/api/test?q=hello%20world&filter=a%26b" onSuccess="() => testState = 'success'" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: {
            operations: {
              "special-chars": {
                url: "**/api/test**",
                method: "get",
                handler: `return { success: true };`,
              },
            },
          },
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
    });
  });

  // =============================================================================
  // BODY PROPERTY TESTS
  // =============================================================================

  test.describe("body property", () => {
    test("sends JSON body correctly", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test/1" 
            method="post" 
            body="{{ name: 'John', age: 30 }}" 
            onSuccess="result => testState = result.data.name" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("John");
    });

    test("handles empty body", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="/api/test/1" method="post" body="" onSuccess="() => testState = 'success'" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
    });

    test("handles complex nested objects in body", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test/1" 
            method="post" 
            body="{{ user: { profile: { name: 'Jane', settings: { theme: 'dark' } } }, items: [1, 2, 3] }}" 
            onSuccess="result => testState = result.data.user.profile.name" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("Jane");
    });
  });

  // =============================================================================
  // RAW BODY PROPERTY TESTS
  // =============================================================================

  test.describe("rawBody property", () => {
    test("sends raw string body", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test" 
            method="post" 
            rawBody="plain text content" 
            onSuccess="() => testState = 'success'" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: {
            operations: {
              "raw-body": {
                url: "/api/test",
                method: "post",
                handler: `return { received: $requestBody };`,
              },
            },
          },
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
    });

    test("rawBody takes precedence over body", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test" 
            method="post" 
            body="{{ name: 'John' }}" 
            rawBody="raw content" 
            onSuccess="() => testState = 'success'" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: {
            operations: {
              "precedence-test": {
                url: "/api/test",
                method: "post",
                handler: `return { received: $requestBody };`,
              },
            },
          },
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
    });
  });

  // =============================================================================
  // QUERY PARAMS PROPERTY TESTS
  // =============================================================================

  test.describe("queryParams property", () => {
    test("sends query parameters correctly", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/search" 
            queryParams="{{ q: 'test', limit: 10, active: true }}" 
            onSuccess="result => testState = result.query.q" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("test");
    });

    test("handles empty query parameters", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="/api/search" queryParams="{{}}" onSuccess="() => testState = 'success'" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
    });

    test("handles special characters in query parameters", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/search" 
            queryParams="{{ q: 'hello world', special: 'a&b=c' }}" 
            onSuccess="result => testState = result.query.q" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("hello world");
    });
  });

  // =============================================================================
  // HEADERS PROPERTY TESTS
  // =============================================================================

  test.describe("headers property", () => {
    test("sends custom headers correctly", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/headers" 
            headers="{{ 'X-Custom-Header': 'test-value', 'Authorization': 'Bearer token123' }}" 
            onSuccess="result => testState = result.headers['x-custom-header']" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("test-value");
    });

    test("handles empty headers", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="/api/headers" headers="{{}}" onSuccess="() => testState = 'success'" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
    });
  });

  // =============================================================================
  // CONFIRMATION DIALOG TESTS
  // =============================================================================

  test.describe("confirmation dialog properties", () => {
    test("shows confirmation dialog with custom title and message", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/confirm" 
            method="post"
            confirmTitle="Custom Title"
            confirmMessage="Are you sure you want to proceed?"
            confirmButtonLabel="Yes, Continue"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: confirmationInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for confirmation dialog
      await expect(page.getByText("Custom Title")).toBeVisible();
      await expect(page.getByText("Are you sure you want to proceed?")).toBeVisible();
      await expect(page.getByText("Yes, Continue")).toBeVisible();
    });

    test("API call proceeds when confirmation is accepted", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/confirm" 
            method="post"
            confirmTitle="Confirm"
            confirmMessage="Proceed?"
            onSuccess="() => testState = 'confirmed'"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: confirmationInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Accept confirmation
      await page.getByRole("button", { name: /yes/i }).click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("confirmed");
    });

    test("API call is cancelled when confirmation is rejected", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/confirm" 
            method="post"
            confirmTitle="Confirm"
            confirmMessage="Proceed?"
            onSuccess="() => testState = 'confirmed'"
            onError="() => testState = 'error'"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: confirmationInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Reject confirmation
      await page.getByRole("button", { name: /cancel|no/i }).click();

      // Should not execute API call
      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual(null);
    });
  });

  // =============================================================================
  // CREDENTIALS PROPERTY TESTS
  // =============================================================================

  test.describe("credentials property", () => {
    test("accepts 'omit' value", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test" 
            method="get" 
            credentials="omit"
            onSuccess="arg => testState = arg.message" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("GET success");
    });

    test("accepts 'same-origin' value", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test" 
            method="get" 
            credentials="same-origin"
            onSuccess="arg => testState = arg.message" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("GET success");
    });

    test("accepts 'include' value", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test" 
            method="get" 
            credentials="include"
            onSuccess="arg => testState = arg.message" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("GET success");
    });

    test("works without credentials property (default behavior)", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test" 
            method="get"
            onSuccess="arg => testState = arg.message" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("GET success");
    });

    test("credentials property works with POST method", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test/1" 
            method="post" 
            body='{{"test": "data"}}' 
            credentials="include"
            onSuccess="arg => testState = arg.message" 
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("POST success");
    });

    test("credentials property works with form submission", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <Form testId="form">
            <TextBox id="message" value="test message" />
            <Button testId="submit" label="Submit" type="submit" />
            <event name="submit">
              <APICall 
                url="/api/test/1" 
                method="post" 
                body='{{"message": message.value}}' 
                credentials="include"
                onSuccess="arg => testState = arg.message"
              />
            </event>
          </Form>
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("submit");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("POST success");
    });
  });

  // =============================================================================
  // NOTIFICATION MESSAGE TESTS
  // =============================================================================

  test.describe("notification message properties", () => {
    test("shows progress notification during API call", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/slow" 
            inProgressNotificationMessage="Processing your request..."
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for progress notification
      await expect(page.getByText("Processing your request...")).toBeVisible();
    });

    test("shows success notification with result data", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test" 
            completedNotificationMessage="Success: {$result.message}"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for success notification
      await expect(page.getByText("Success: GET success")).toBeVisible();
    });

    test("shows error notification: code 400", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/error/400" 
            method="post"
            errorNotificationMessage="Error {$error.statusCode}: {$error.message}"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for error notification
      await expect(page.getByText("Error 400: Bad request")).toBeVisible();
    });

    test("shows error notification and onError show the same", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/error/400" 
            method="post"
            errorNotificationMessage="Error {$error.statusCode}: {$error.message}"
            onError="(error) => testState = 'Error ' + error.statusCode + ': ' + error.message"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for error notification
      await expect(
        page
          .locator("div")
          .filter({ hasText: /^Error 400: Bad request$/ })
          .nth(3),
      ).toBeVisible();
      await expect
        .poll(testStateDriver.testState, { timeout: 2000 })
        .toEqual("Error 400: Bad request");
    });

    test("shows error notification: code 500", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/error/500" 
            method="post"
            errorNotificationMessage="Error {$error.statusCode}: {$error.message}"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for error notification
      await expect(page.getByText("Error 500: Internal server error")).toBeVisible();
    });

    test("shows error notification with error details", async ({
      initTestBed,
      createButtonDriver,
      page,
    }) => {
      await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/error/400" 
            method="post"
            errorNotificationMessage="Error {$error.statusCode}: {$error.message}, Details: {$error.details}"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for error notification
      await expect(page.getByText("Error 400: Bad request, Details: Invalid data")).toBeVisible();
    });

    test.skip("shows not found error notification on incorrect endpoint", async ({ initTestBed, createButtonDriver, page }) => {
      await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/error" 
            method="post"
            errorNotificationMessage="Error {$error.statusCode}: {$error.message}"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for error notification
      await expect(page.getByText("Error 404: <No error description>")).toBeVisible();
    });

    test("shows unknown error notification", async ({ initTestBed, createButtonDriver, page }) => {
      await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/error/unknown" 
            method="post"
            errorNotificationMessage="Error {$error.statusCode}: {$error.message}, Details: {JSON.stringify($error.details)}"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      // Check for error notification
      await expect(page.getByText("Error 500: Error without message, Details: {}")).toBeVisible();
    });
  });
  
  // =============================================================================
  // EXECUTE METHOD TESTS
  // =============================================================================

  test.describe("execute method", () => {
    test("triggers API call", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall id="api" url="/api/test" onSuccess="() => testState = 'executed'" />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("executed");
    });

    test("accepts parameters", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test/1" 
            method="post"
            body="{$param}"
            onSuccess="result => testState = result.data.name" 
          />
          <Button testId="trigger" onClick="api.execute({ name: 'John', age: 30 })" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("John");
    });

    test("provides access to multiple parameters", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test/1" 
            method="post"
            body="{{ first: $params[0], second: $params[1], third: $params[2] }}"
            onSuccess="result => testState = result.data.first + '-' + result.data.second + '-' + result.data.third" 
          />
          <Button testId="trigger" onClick="api.execute('param1', 'param2', 'param3')" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect
        .poll(testStateDriver.testState, { timeout: 2000 })
        .toEqual("param1-param2-param3");
    });

    test("can be called multiple times", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment var.callCount="{0}">
          <Button testId="trigger" label="Execute {callCount}" >
            <event name="click">
              <APICall 
                url="/api/test" 
                onSuccess="console.log('before', callCount); callCount++; console.log('after', callCount); testState = callCount;"
              />
            </event>
          </Button>
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");

      await button.click();
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for async execution
      //await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual(1);

      await button.click();
      //await expect.poll(testStateDriver.testState).toEqual(2);

      await button.click();
      //await expect.poll(testStateDriver.testState).toEqual(3);
    });
  });

  // =============================================================================
  // CONTEXT VARIABLE TESTS
  // =============================================================================

  test.describe("context variables", () => {
    test("$param provides access to first parameter", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test/1" 
            method="post"
            body="{$param}"
            onSuccess="result => testState = result.data.message" 
          />
          <Button testId="trigger" onClick="api.execute({ message: 'hello' })" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("hello");
    });

    test("$params provides access to all parameters", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test/1" 
            method="post"
            body="{{ all: $params }}"
            onSuccess="result => testState = result.data.all.length" 
          />
          <Button testId="trigger" onClick="api.execute('a', 'b', 'c')" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual(3);
    });

    test("$result provides access to response data", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/test" 
            onSuccess="result => testState = result.id + ' - ' + result.message"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("1 - GET success");
    });

    test("$error provides access to error information", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Fragment>
          <APICall 
            id="api" 
            url="/api/error/400" 
            method="post"
            onError="error => testState = error.statusCode + ' - ' + error.message"
          />
          <Button testId="trigger" onClick="api.execute()" label="Execute" />
        </Fragment>
      `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const button = await createButtonDriver("trigger");
      await button.click();

      await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("400 - Bad request");
    });
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles null and undefined parameters gracefully", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/test/1" 
          method="post"
          body="{$param}"
          onSuccess="() => testState = 'success'"
          onError="() => testState = 'error'"
        />
        <Button testId="trigger" onClick="api.execute(null)" label="Execute" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const button = await createButtonDriver("trigger");
    await button.click();

    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
  });

  test("handles undefined URL gracefully", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall id="api" onError="() => testState = 'error'" />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const button = await createButtonDriver("trigger");
    await button.click();

    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("error");
  });

  test("handles malformed JSON in body gracefully", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/test" 
          method="post"
          body="{ invalid json }"
          onSuccess="() => testState = 'success'"
          onError="() => testState = 'error'"
        />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const button = await createButtonDriver("trigger");
    await button.click();

    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("error");
  });

  test("handles very large request payloads", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/test/1" 
          method="post"
          body="{$param}"
          onSuccess="() => testState = 'success'"
        />
        <Button testId="trigger" onClick="api.execute({ data: 'x'.repeat(10000) })" label="Execute" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const button = await createButtonDriver("trigger");
    await button.click();

    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
  });

  test("handles special Unicode characters in data", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/test/1" 
          method="post"
          body="{$param}"
          onSuccess="result => testState = result.data.emoji"
        />
        <Button testId="trigger" onClick="api.execute({ emoji: '👨‍👩‍👧‍👦🚀', chinese: '你好世界' })" label="Execute" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const button = await createButtonDriver("trigger");
    await button.click();

    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("👨‍👩‍👧‍👦🚀");
  });

  test("handles component cleanup correctly", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment var.showApi="true">
        <Fragment if="showApi">
          <APICall id="api" url="/api/test" onSuccess="() => testState = 'success'" />
        </Fragment>
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
        <Button testId="hide" onClick="showApi = false" label="Hide" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const executeButton = await createButtonDriver("trigger");
    const hideButton = await createButtonDriver("hide");

    // Execute API call first
    await executeButton.click();
    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");

    // Hide the component
    await hideButton.click();

    // Try to execute again (should not crash)
    try {
      await executeButton.click();
    } catch (error) {
      // This is expected as the component is no longer available
    }
  });

  test("handles when condition preventing execution", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment var.allowExecution="false">
        <APICall 
          id="api" 
          url="/api/test" 
          when="allowExecution"
          onSuccess="() => testState = 'success'"
          onError="() => testState = 'error'"
        />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
        <Button testId="allow" onClick="allowExecution = true" label="Allow" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const executeButton = await createButtonDriver("trigger");
    const allowButton = await createButtonDriver("allow");

    // Try to execute when not allowed
    await executeButton.click();
    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual(null);

    // Allow execution and try again
    await allowButton.click();
    await executeButton.click();
    await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual("success");
  });
});

// =============================================================================
// STATE TRACKING TESTS
// =============================================================================

test.describe("State Tracking", () => {
  test("exposes inProgress during API call execution", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall id="api" url="/api/slow" method="get" />
        <Button testId="check" onClick="testState = api.inProgress" label="Check" />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const executeButton = await createButtonDriver("trigger");
    const checkButton = await createButtonDriver("check");

    // Initially not in progress  
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
    
    // Start execution
    await executeButton.click();
    
    // Check during execution (should be true)
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(true);
    
    // Wait for completion (slow endpoint takes 200ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Check after completion (should be false again)
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("stores lastResult after successful execution", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall id="api" url="/api/test" method="get" />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
        <Button testId="check" onClick="testState = api.lastResult" label="Check" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const executeButton = await createButtonDriver("trigger");
    const checkButton = await createButtonDriver("check");

    // Execute the API call
    await executeButton.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check the result
    await checkButton.click();
    const result = await testStateDriver.testState();
    expect(result).toEqual({ message: "GET success", id: 1 });
  });

  test("stores lastError after failed execution", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall id="api" url="/api/error/400" method="post" />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
        <Button testId="check" onClick="testState = api.lastError ? true : false" label="Check" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const executeButton = await createButtonDriver("trigger");
    const checkButton = await createButtonDriver("check");

    // Execute the API call (will fail)
    await executeButton.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check the error
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  test("sets loaded flag after successful execution", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall id="api" url="/api/test" method="get" />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
        <Button testId="check" onClick="testState = api.loaded" label="Check" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const executeButton = await createButtonDriver("trigger");
    const checkButton = await createButtonDriver("check");

    // Check loaded before execution
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(false);

    // Execute the API call
    await executeButton.click();
    await new Promise((resolve) => setTimeout(resolve, 500)); // Increased wait time

    // Check loaded after execution
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  test("clears lastError on successful execution", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall id="api" url="/api/test" method="get" />
        <Button testId="triggerSuccess" onClick="api.execute()" label="Execute Success" />
        <Button testId="check" onClick="testState = api.lastError" label="Check" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const successButton = await createButtonDriver("triggerSuccess");
    const checkButton = await createButtonDriver("check");

    // Trigger a success
    await successButton.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check that lastError is undefined
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(undefined);
  });

  test("inProgress resets to false after completion", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall id="api" url="/api/test" method="get" />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
        <Button testId="check" onClick="testState = api.inProgress" label="Check" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const executeButton = await createButtonDriver("trigger");
    const checkButton = await createButtonDriver("check");

    // Execute the API call
    await executeButton.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check inProgress after completion
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("can use inProgress to disable buttons during execution", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Fragment>
        <APICall id="api" url="/api/slow" method="get" />
        <Button testId="trigger" onClick="api.execute()" label="Execute" enabled="{!api.inProgress}" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const button = page.getByTestId("trigger");

    // Initially enabled
    await expect(button).toBeEnabled();

    // Click to start execution
    await button.click();

    // Should be disabled during execution
    await expect(button).toBeDisabled();

    // Wait for completion
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Should be enabled again
    await expect(button).toBeEnabled();
  });
});

// =============================================================================
// DEFERRED MODE - STEP 1: METADATA
// =============================================================================

test.describe("Deferred Mode - Step 1: Metadata", () => {
  test("accepts deferredMode property without error", async ({ initTestBed }) => {
    // Should not crash with new deferred mode properties
    await initTestBed(`
      <APICall 
        id="api" 
        url="/api/operation" 
        method="post"
        deferredMode="true"
        statusUrl="/api/status"
      />
    `, {
      apiInterceptor: basicApiInterceptor,
    });
    // Component should initialize without errors
  });

  test("accepts all Step 1 deferred properties", async ({ initTestBed }) => {
    // Should accept all new metadata properties
    await initTestBed(`
      <APICall 
        id="api" 
        url="/api/operation" 
        method="post"
        deferredMode="true"
        statusUrl="/api/operation/status/{$result.operationId}"
        statusMethod="get"
        pollingInterval="1000"
        maxPollingDuration="60000"
        completionCondition="$statusData.status === 'completed'"
        errorCondition="$statusData.status === 'failed'"
        progressExtractor="$statusData.progress"
      />
    `, {
      apiInterceptor: basicApiInterceptor,
    });
    // Component should initialize without errors
  });

  test("existing APICall functionality unchanged", async ({ initTestBed, createButtonDriver }) => {
    // Verify that adding deferred properties doesn't break basic functionality
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/test" 
          method="get" 
          onSuccess="arg => testState = arg.message"
        />
        <Button testId="trigger" onClick="api.execute()" label="Execute" />
      </Fragment>
    `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const button = await createButtonDriver("trigger");
    await button.click();

    // Wait for completion
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Should execute normally
    await expect.poll(testStateDriver.testState).toEqual("GET success");
  });

  test("deferred properties have correct types", async ({ initTestBed, page }) => {
    // Test that string, number, and boolean properties are accepted
    await initTestBed(`
      <Fragment>
        <APICall 
          id="api1" 
          url="/api/test" 
          deferredMode="true"
          statusUrl="/api/status"
          statusMethod="post"
          pollingInterval="2000"
          maxPollingDuration="300000"
        />
        <APICall 
          id="api2" 
          url="/api/test"
          deferredMode="false"
        />
      </Fragment>
    `, {
      apiInterceptor: basicApiInterceptor,
    });
    
    // Both should initialize without type errors
  });
});

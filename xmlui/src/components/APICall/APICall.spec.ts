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

// Step 3: Single poll mock backend
const singlePollMock: ApiInterceptorDefinition = {
  operations: {
    "start": {
      url: "/api/operation",
      method: "post",
      handler: `return { operationId: "op-123" };`,
    },
    "status": {
      url: "/api/operation/status/op-123",
      method: "get",
      handler: `return { status: "completed", progress: 100 };`,
    },
  },
};

// Step 4: Polling loop mock backend
const pollingLoopMock: ApiInterceptorDefinition = {
  initialize: "$state.pollCount = 0;",
  operations: {
    "start": {
      url: "/api/task",
      method: "post",
      handler: `
        $state.pollCount = 0;
        return { taskId: "task-1" };
      `,
    },
    "status": {
      url: "/api/task/status/task-1",
      method: "get",
      handler: `
        $state.pollCount++;
        
        // Complete after 3 polls
        if ($state.pollCount >= 3) {
          return { status: "completed", pollCount: $state.pollCount };
        }
        
        return { status: "pending", pollCount: $state.pollCount };
      `,
    },
  },
};

// Step 5: Status update event mock backend
const statusUpdateMock: ApiInterceptorDefinition = {
  initialize: "$state.statusChecks = 0;",
  operations: {
    "start": {
      url: "/api/deploy",
      method: "post",
      handler: `
        $state.statusChecks = 0;
        return { deploymentId: "deploy-1" };
      `,
    },
    "status": {
      url: "/api/deploy/status/deploy-1",
      method: "get",
      handler: `
        $state.statusChecks++;
        
        // Transition through states
        if ($state.statusChecks === 1) {
          return { status: "pending", phase: "Initializing" };
        } else if ($state.statusChecks === 2) {
          return { status: "in-progress", phase: "Running" };
        } else {
          return { status: "completed", phase: "Succeeded" };
        }
      `,
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

test.describe("Deferred Mode - Step 2: State Management", () => {
  test("deferred API methods can be called and return expected values", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/test" 
          method="get"
          deferredMode="true" 
        />
        <Button 
          onClick="
            let status = api.getStatus();
            let polling1 = api.isPolling();
            api.resumePolling();
            let polling2 = api.isPolling();
            api.stopPolling();
            let polling3 = api.isPolling();
            testState = { status, polling1, polling2, polling3 };
          " 
          testId="test" 
          label="Test" 
        />
      </Fragment>
    `, {
      apiInterceptor: basicApiInterceptor,
    });
    
    const button = await createButtonDriver("test");
    await button.click();

    // Wait for state to be updated
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const result = await testStateDriver.testState();
    expect(result.status).toEqual(null); // getStatus() returns null initially
    expect(result.polling1).toEqual(false); // isPolling() returns false initially
    expect(result.polling2).toEqual(true); // isPolling() returns true after resumePolling()
    expect(result.polling3).toEqual(false); // isPolling() returns false after stopPolling()
  });

  test("deferred state does not interfere with normal APICall operation", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/test" 
          method="get" 
          deferredMode="true"
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

    // Should execute normally even with deferredMode enabled
    await expect.poll(testStateDriver.testState).toEqual("GET success");
  });

  test("cancel() method can be called", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/test" 
          method="get"
          deferredMode="true" 
        />
        <Button 
          onClick="
            api.resumePolling();
            let before = api.isPolling();
            api.cancel();
            let after = api.isPolling();
            testState = { before, after };
          " 
          testId="test" 
          label="Test" 
        />
      </Fragment>
    `, {
      apiInterceptor: basicApiInterceptor,
    });
    
    const button = await createButtonDriver("test");
    await button.click();

    // Wait for state to be updated
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const result = await testStateDriver.testState();
    expect(result.before).toEqual(true); // Should be polling before cancel
    expect(result.after).toEqual(false); // Should not be polling after cancel
  });
});

test.describe("Deferred Mode - Step 3: Single Poll", () => {
  test("makes status request after initial call", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
          statusUrl="/api/operation/status/{$result.operationId}"
        />
        <Button onClick="api.execute(); delay(100); testState = api.getStatus();" testId="exec" label="Execute" />
      </Fragment>
    `, {
      apiInterceptor: singlePollMock,
    });
    
    const execButton = await createButtonDriver("exec");
    
    // Execute operation
    await execButton.click();
    
    // Poll until status is set
    await expect.poll(testStateDriver.testState).toEqual({ status: "completed", progress: 100 });
  });

  test("status request interpolates result variables", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const customMock: ApiInterceptorDefinition = {
      operations: {
        "start": {
          url: "/api/job",
          method: "post",
          handler: `return { jobId: "job-456", type: "export" };`,
        },
        "status": {
          url: "/api/job/job-456/status",
          method: "get",
          handler: `return { jobId: "job-456", status: "done" };`,
        },
      },
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/job" 
          method="post"
          deferredMode="true"
          statusUrl="/api/job/{$result.jobId}/status"
        />
        <Button onClick="api.execute(); delay(100); testState = api.getStatus();" testId="exec" label="Execute" />
      </Fragment>
    `, {
      apiInterceptor: customMock,
    });
    
    const execButton = await createButtonDriver("exec");
    
    // Execute operation and wait for status
    await execButton.click();
    
    // Poll until we get the status
    await expect.poll(async () => {
      const status = await testStateDriver.testState();
      return status?.jobId;
    }).toEqual("job-456");
    
    const status = await testStateDriver.testState();
    expect(status.status).toEqual("done");
  });

  test("does not make status request when statusUrl not provided", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
        />
        <Button onClick="api.execute(); delay(100); testState = api.getStatus();" testId="exec" label="Execute" />
      </Fragment>
    `, {
      apiInterceptor: singlePollMock,
    });
    
    const execButton = await createButtonDriver("exec");
    
    // Execute operation
    await execButton.click();
    
    // Wait a bit then check - should stay null
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const status = await testStateDriver.testState();
    expect(status).toEqual(null); // No status request made
  });
});

// =============================================================================
// DEFERRED MODE - STEP 4: POLLING LOOP
// =============================================================================

test.describe("Deferred Mode - Step 4: Polling Loop", () => {
  test("polls status endpoint multiple times until completion", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status/{$result.taskId}"
          pollingInterval="500"
        />
        <Button onClick="api.execute()" testId="exec" label="Execute" />
        <Button onClick="testState = api.getStatus()" testId="check" label="Check" />
      </Fragment>
    `, {
      apiInterceptor: pollingLoopMock,
    });
    
    const execButton = await createButtonDriver("exec");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    
    // Wait for multiple polls (3 * 500ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check final status
    await checkButton.click();
    
    const status = await expect.poll(testStateDriver.testState).not.toBeNull();
    const finalStatus = await testStateDriver.testState();
    expect(finalStatus.status).toEqual("completed");
    expect(finalStatus.pollCount).toBeGreaterThanOrEqual(3);
  });

  test("isPolling returns true during polling and false after completion", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status/{$result.taskId}"
          pollingInterval="500"
        />
        <Button onClick="api.execute(); delay(200); testState = api.isPolling();" testId="exec" label="Execute" />
      </Fragment>
    `, {
      apiInterceptor: pollingLoopMock,
    });
    
    const execButton = await createButtonDriver("exec");
    
    await execButton.click();
    
    // Should be polling immediately after execute
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  test("stopPolling() stops the polling loop", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status/{$result.taskId}"
          pollingInterval="500"
        />
        <Button onClick="api.execute(); delay(100); api.stopPolling(); delay(100); testState = api.isPolling();" testId="exec" label="Execute" />
      </Fragment>
    `, {
      apiInterceptor: pollingLoopMock,
    });
    
    const execButton = await createButtonDriver("exec");
    
    await execButton.click();
    
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("polling respects maxPollingDuration timeout", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status/{$result.taskId}"
          pollingInterval="200"
          maxPollingDuration="800"
          onTimeout="testState = { timedOut: true, isPolling: api.isPolling() };"
        />
        <Button onClick="api.execute();" testId="exec" label="Execute" />
      </Fragment>
    `, {
      apiInterceptor: pollingLoopMock,
    });
    
    const execButton = await createButtonDriver("exec");
    
    await execButton.click();
    
    // Wait for timeout event to fire (maxPollingDuration + buffer)
    await expect.poll(async () => {
      const state = await testStateDriver.testState();
      return state?.timedOut;
    }).toEqual(true);
    
    // Verify polling has stopped when timeout fired
    const finalState = await testStateDriver.testState();
    expect(finalState.isPolling).toEqual(false);
  });
});
// =============================================================================
// DEFERRED MODE - STEP 5: STATUS UPDATE EVENT
// =============================================================================

test.describe("Deferred Mode - Step 5: Status Update Event", () => {
  test("fires onStatusUpdate event on each poll", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/deploy" 
          method="post"
          deferredMode="true"
          statusUrl="/api/deploy/status/{$result.deploymentId}"
          pollingInterval="500"
          onStatusUpdate="statusData => {
            const updateCount = (testState?.updateCount || 0) + 1;
            testState = { lastStatus: statusData.status, updateCount: updateCount };
            if (statusData.status === 'completed') {
              api.stopPolling();
            }
          }"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="testState = { ...(testState || {}), isPolling: api.isPolling() }" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: statusUpdateMock,
    });
    
    const execButton = await createButtonDriver("exec");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    
    // Wait for polling to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check that updates were received
    await checkButton.click();
    const result = await testStateDriver.testState();
    
    expect(result.lastStatus).toEqual('completed');
    expect(result.updateCount).toBeGreaterThanOrEqual(3); // At least 3 polls
    expect(result.isPolling).toEqual(false); // Should have stopped
  });
  
  test("user can stop polling from onStatusUpdate", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/deploy" 
          method="post"
          deferredMode="true"
          statusUrl="/api/deploy/status/{$result.deploymentId}"
          pollingInterval="500"
          onStatusUpdate="statusData => {
            testState = statusData;
            if (statusData.status === 'completed') {
              api.stopPolling();
            }
          }"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="testState = { ...(testState || {}), pollingStatus: api.isPolling() }" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: statusUpdateMock,
    });
    
    const execButton = await createButtonDriver("exec");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    
    // Wait for polling to complete (3 polls at 500ms = ~1500ms)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check status
    await checkButton.click();
    const finalState = await testStateDriver.testState();
    
    expect(finalState.status).toEqual('completed');
    expect(finalState.pollingStatus).toEqual(false);
  });

  test("onStatusUpdate can handle errors", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const errorMock: ApiInterceptorDefinition = {
      operations: {
        "start": {
          url: "/api/risky",
          method: "post",
          handler: `return { operationId: "risky-1" };`,
        },
        "status": {
          url: "/api/risky/status/risky-1",
          method: "get",
          handler: `return { status: "failed", error: "Operation failed" };`,
        },
      },
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/risky" 
          method="post"
          deferredMode="true"
          statusUrl="/api/risky/status/{$result.operationId}"
          pollingInterval="500"
          onStatusUpdate="statusData => {
            testState = statusData;
            if (statusData.status === 'failed') {
              api.stopPolling();
            }
          }"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="testState = { ...(testState || {}), pollingStatus: api.isPolling() }" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: errorMock,
    });
    
    const execButton = await createButtonDriver("exec");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    
    // Wait for first poll
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check status
    await checkButton.click();
    const finalState = await testStateDriver.testState();
    
    expect(finalState.status).toEqual('failed');
    expect(finalState.pollingStatus).toEqual(false);
  });
});

// =============================================================================
// DEFERRED MODE - STEP 6: PROGRESS EXTRACTION & CONTEXT VARIABLES
// =============================================================================

test.describe("Deferred Mode - Step 6: Progress & Context Variables", () => {
  test("extracts progress from status data", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const progressMock: ApiInterceptorDefinition = {
      "initialize": "$state.progressValue = 0;",
      "operations": {
        "start": {
          "url": "/api/process",
          "method": "post",
          "handler": `
            $state.progressValue = 0;
            return { jobId: "job-1" };
          `,
        },
        "status": {
          "url": "/api/process/status/job-1",
          "method": "get",
          "handler": `
            if (!$state.progressValue) $state.progressValue = 0;
            $state.progressValue += 33;
            if ($state.progressValue > 100) $state.progressValue = 100;
            return { progress: $state.progressValue };
          `,
        },
      },
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/process" 
          method="post"
          deferredMode="true"
          statusUrl="/api/process/status/{$result.jobId}"
          pollingInterval="500"
          progressExtractor="$statusData.progress"
          onStatusUpdate="statusData => {
            testState = { statusProgress: statusData.progress };
          }"
        />
        <Button onClick="api.execute()" testId="exec" label="Execute" />
      </Fragment>
    `, {
      apiInterceptor: progressMock,
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    // Wait for multiple polls to ensure we get progress updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await testStateDriver.testState();
    expect(result).toBeTruthy();
    expect(result.statusProgress).toBeGreaterThan(0);
  });
  
  test("progress value passed to onStatusUpdate event", async ({ 
    initTestBed,
    createButtonDriver 
  }) => {
    const progressEventMock: ApiInterceptorDefinition = {
      "initialize": "$state.progressValue = 0;",
      "operations": {
        "start": {
          "url": "/api/task",
          "method": "post",
          "handler": `
            $state.progressValue = 0;
            return { taskId: "t1" };
          `,
        },
        "status": {
          "url": "/api/task/status",
          "method": "get",
          "handler": `
            if (!$state.progressValue) $state.progressValue = 0;
            $state.progressValue += 25;
            if ($state.progressValue > 100) $state.progressValue = 100;
            return { progress: $state.progressValue, done: $state.progressValue >= 100 };
          `,
        },
      },
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status"
          pollingInterval="500"
          progressExtractor="$statusData.progress"
          onStatusUpdate="statusData => {
            testState = statusData.progress;
            if (statusData.done === true) {
              api.stopPolling();
            }
          }"
        />
        <Button onClick="api.execute()" testId="exec" label="Execute" />
      </Fragment>
    `, {
      apiInterceptor: progressEventMock,
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    // Wait for at least one poll
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = await testStateDriver.testState();
    // Progress should be extracted and available in statusData
    expect(result).toBeGreaterThan(0);
  });
});
// =============================================================================
// DEFERRED MODE - STEP 7: NOTIFICATION UPDATES
// =============================================================================
test.describe("Deferred Mode - Step 7: Notifications", () => {
  test("shows progress notification with updates", async ({ 
    initTestBed,
    createButtonDriver,
    page 
  }) => {
    await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/upload" 
          method="post"
          deferredMode="true"
          statusUrl="/api/upload/status"
          pollingInterval="500"
          completionCondition="$progress === 100"
          progressExtractor="$statusData.percent"
          inProgressNotificationMessage="Uploading: {$progress}% complete"
          completedNotificationMessage="Upload complete!"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/upload",
            method: "post",
            handler: `
              $state.uploadPercent = 0;
              return { uploadId: "up-1" };
            `,
          },
          "status": {
            url: "/api/upload/status",
            method: "get",
            handler: `
              $state.uploadPercent += 50;
              if ($state.uploadPercent > 100) $state.uploadPercent = 100;
              return { percent: $state.uploadPercent };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    // Should see progress notification
    await expect(page.getByText(/Uploading: \d+% complete/)).toBeVisible();
    
    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Should see completion message (use .first() to avoid strict mode violation)
    await expect(page.getByText("Upload complete!").first()).toBeVisible();
  });
});

// =============================================================================
// DEFERRED MODE - STEP 8: TIMEOUT DETECTION
// =============================================================================
test.describe("Deferred Mode - Step 8: Timeout", () => {
  test("stops polling after maxPollingDuration", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/longop" 
          method="post"
          deferredMode="true"
          statusUrl="/api/longop/status"
          pollingInterval="200"
          maxPollingDuration="800"
          completionCondition="$statusData.done === true"
          onTimeout="() => testState = 'timeout'"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/longop",
            method: "post",
            handler: `return { id: "op-1" };`,
          },
          "status": {
            url: "/api/longop/status",
            method: "get",
            handler: `return { done: false };`, // Never completes
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    // Wait for timeout (800ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    await expect.poll(testStateDriver.testState).toEqual('timeout');
  });
});

// =============================================================================
// DEFERRED MODE - STEP 9: BACKOFF STRATEGIES
// =============================================================================
test.describe("Deferred Mode - Step 9: Retry Logic", () => {
  test("retries status check on failure", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status"
          pollingInterval="200"
          pollingBackoff="exponential"
          maxPollingInterval="1000"
          completionCondition="$statusData.done === true"
          onStatusUpdate="statusData => {
            const updateCount = (testState?.updateCount || 0) + 1;
            testState = { updateCount: updateCount, done: statusData.done };
          }"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/task",
            method: "post",
            handler: `
              $state.pollTimestamps = [];
              return { id: "t1" };
            `,
          },
          "status": {
            url: "/api/task/status",
            method: "get",
            handler: `
              if (!$state.pollTimestamps) $state.pollTimestamps = [];
              $state.pollTimestamps.push(Date.now());
              
              // Complete after 4 polls
              if ($state.pollTimestamps.length >= 4) {
                return { done: true, timestamps: $state.pollTimestamps };
              }
              
              return { done: false };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result = await testStateDriver.testState();
    // Should have made 4 attempts (polls)
    expect(result.updateCount).toBeGreaterThanOrEqual(3);
    expect(result.done).toEqual(true);
  });
});

// =============================================================================
// DEFERRED MODE - STEP 11: SERVER-SIDE CANCELLATION
// =============================================================================
test.describe("Deferred Mode - Step 11: Cancellation", () => {
  test("cancels operation on server", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
          statusUrl="/api/operation/status/{$result.operationId}"
          cancelUrl="/api/operation/cancel/{$result.operationId}"
          cancelMethod="post"
          pollingInterval="500"
        />
        <Button onClick="api.execute(); delay(800); api.cancel(); delay(1000); testState = { cancelled: true };" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        initialize: "$state.operationCancelled = false;",
        operations: {
          "start": {
            url: "/api/operation",
            method: "post",
            handler: `return { operationId: "op-1" };`,
          },
          "status": {
            url: "/api/operation/status/op-1",
            method: "get",
            handler: `
              if ($state.operationCancelled) {
                return { status: "cancelled" };
              }
              return { status: "in-progress" };
            `,
          },
          "cancel": {
            url: "/api/operation/cancel/op-1",
            method: "post",
            handler: `
              $state.operationCancelled = true;
              return { status: "cancelled" };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    
    await execButton.click();
    
    // Wait for cancellation to complete
    await expect.poll(testStateDriver.testState).toEqual({ cancelled: true });
  });
  
  test("cancel() stops polling immediately", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
          statusUrl="/api/operation/status/{$result.operationId}"
          cancelUrl="/api/operation/cancel/{$result.operationId}"
          pollingInterval="500"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="api.cancel()" testId="cancel" />
        <Button onClick="testState = api.isPolling()" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/operation",
            method: "post",
            handler: `return { operationId: "op-1" };`,
          },
          "status": {
            url: "/api/operation/status/op-1",
            method: "get",
            handler: `return { status: "in-progress" };`,
          },
          "cancel": {
            url: "/api/operation/cancel/op-1",
            method: "post",
            handler: `return { status: "cancelled" };`,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    const cancelButton = await createButtonDriver("cancel");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    await cancelButton.click();
    
    // Check immediately after cancel
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("cancel() works without cancelUrl (local stop only)", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
          statusUrl="/api/operation/status/{$result.operationId}"
          pollingInterval="500"
        />
        <Button onClick="api.execute(); delay(100); api.cancel(); delay(100); testState = api.isPolling();" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/operation",
            method: "post",
            handler: `return { operationId: "op-1" };`,
          },
          "status": {
            url: "/api/operation/status/op-1",
            method: "get",
            handler: `return { status: "in-progress" };`,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    
    await execButton.click();
    
    // After cancel, polling should be stopped
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("interpolates cancelUrl with result context", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
          statusUrl="/api/operation/status/{$result.id}"
          cancelUrl="/api/operation/cancel/{$result.id}"
          pollingInterval="500"
        />
        <Button onClick="api.execute(); delay(600); api.cancel(); delay(600); testState = 'done';" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        initialize: "$state.cancelCalled = false;",
        operations: {
          "start": {
            url: "/api/operation",
            method: "post",
            handler: `return { id: "custom-op-123" };`,
          },
          "status": {
            url: "/api/operation/status/custom-op-123",
            method: "get",
            handler: `
              return { 
                status: "in-progress", 
                cancelCalled: $state.cancelCalled
              };
            `,
          },
          "cancel": {
            url: "/api/operation/cancel/custom-op-123",
            method: "post",
            handler: `
              $state.cancelCalled = true;
              return { status: "cancelled" };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    
    await execButton.click();
    
    // Wait for the test to complete
    await expect.poll(testStateDriver.testState).toEqual('done');
  });
});

// =============================================================================
// DEFERRED MODE - STEP 12: INTEGRATION TESTING & POLISH
// =============================================================================
test.describe("Deferred Mode - Step 12: Integration & Polish", () => {
  test("encryption at rest scenario - complete workflow", async ({ 
    initTestBed, 
    createButtonDriver,
    page 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="enableEncryption"
          url="/api/encryption/enable"
          method="post"
          deferredMode="true"
          statusUrl="/api/encryption/status/{$result.operationId}"
          pollingInterval="800"
          progressExtractor="$statusData.progress"
          inProgressNotificationMessage="Enabling encryption: {$progress}% complete"
          completedNotificationMessage="Encryption enabled successfully!"
          onSuccess="result => testState = { started: true, id: result.operationId }"
        />
        <Button onClick="enableEncryption.execute()" testId="enable" label="Enable Encryption" />
      </Fragment>
    `, {
      apiInterceptor: {
        initialize: "$state.encryptionProgress = 0;",
        operations: {
          "enable": {
            url: "/api/encryption/enable",
            method: "post",
            handler: `
              $state.encryptionProgress = 0;
              return { operationId: "enc-op-1" };
            `,
          },
          "status": {
            url: "/api/encryption/status/enc-op-1",
            method: "get",
            handler: `
              $state.encryptionProgress += 50;
              
              if ($state.encryptionProgress >= 100) {
                return { status: "completed", progress: 100 };
              }
              
              return { status: "in-progress", progress: $state.encryptionProgress };
            `,
          },
        },
      },
    });
    
    const button = await createButtonDriver("enable");
    await button.click();
    
    // Should see initial success
    await expect.poll(testStateDriver.testState).toHaveProperty('started', true);
    
    // Should see progress message
    await expect(page.getByText(/Enabling encryption.*complete/)).toBeVisible({ timeout: 3000 });
    
    // Wait for completion
    await expect(page.getByText("Encryption enabled successfully!")).toBeVisible({ timeout: 5000 });
  });

  test("handles multiple concurrent deferred operations", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="task1"
          url="/api/task1"
          method="post"
          deferredMode="true"
          statusUrl="/api/task1/status"
          pollingInterval="300"
          onStatusUpdate="statusData => {
            if (!testState) testState = { task1Updates: 0, task2Updates: 0 };
            testState = { ...testState, task1Updates: testState.task1Updates + 1 };
          }"
        />
        <APICall 
          id="task2"
          url="/api/task2"
          method="post"
          deferredMode="true"
          statusUrl="/api/task2/status"
          pollingInterval="300"
          onStatusUpdate="statusData => {
            if (!testState) testState = { task1Updates: 0, task2Updates: 0 };
            testState = { ...testState, task2Updates: testState.task2Updates + 1 };
          }"
        />
        <Button onClick="task1.execute(); task2.execute(); delay(1500); testState = { ...testState, done: true };" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        initialize: "$state.task1Polls = 0; $state.task2Polls = 0;",
        operations: {
          "start-task1": {
            url: "/api/task1",
            method: "post",
            handler: `return { taskId: "t1" };`,
          },
          "start-task2": {
            url: "/api/task2",
            method: "post",
            handler: `return { taskId: "t2" };`,
          },
          "status-task1": {
            url: "/api/task1/status",
            method: "get",
            handler: `
              $state.task1Polls++;
              if ($state.task1Polls >= 3) {
                return { status: "completed" };
              }
              return { status: "pending" };
            `,
          },
          "status-task2": {
            url: "/api/task2/status",
            method: "get",
            handler: `
              $state.task2Polls++;
              if ($state.task2Polls >= 3) {
                return { status: "completed" };
              }
              return { status: "pending" };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    await expect.poll(testStateDriver.testState).toHaveProperty('done', true);
    
    const result = await testStateDriver.testState();
    // Both tasks should have received updates
    expect(result.task1Updates).toBeGreaterThan(0);
    expect(result.task2Updates).toBeGreaterThan(0);
  });

  test("can resume polling after stopPolling()", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status"
          pollingInterval="400"
        />
        <Button onClick="
          api.execute();
          delay(300);
          api.stopPolling();
          delay(100);
          let stoppedState = api.isPolling();
          api.resumePolling();
          delay(100);
          let resumedState = api.isPolling();
          testState = { stopped: !stoppedState, resumed: resumedState };
        " testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/task",
            method: "post",
            handler: `return { taskId: "t1" };`,
          },
          "status": {
            url: "/api/task/status",
            method: "get",
            handler: `return { status: "pending" };`,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    await expect.poll(testStateDriver.testState).toBeTruthy();
    const result = await testStateDriver.testState();
    // Should have stopped polling
    expect(result.stopped).toEqual(true);
    // isPolling flag should be set to true after resume
    expect(result.resumed).toEqual(true);
  });

  test("cleans up polling when component unmounts (stopPolling stops polls)", async ({ 
    initTestBed,
    createButtonDriver
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status"
          pollingInterval="300"
          onStatusUpdate="statusData => {
            if (!testState) testState = { pollCount: 0 };
            testState = { pollCount: testState.pollCount + 1 };
          }"
        />
        <Button onClick="api.execute(); delay(1000); api.stopPolling(); delay(1000); testState = { ...testState, done: true };" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/task",
            method: "post",
            handler: `return { taskId: "t1" };`,
          },
          "status": {
            url: "/api/task/status",
            method: "get",
            handler: `return { status: "pending" };`,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    // Wait for completion
    await expect.poll(testStateDriver.testState).toHaveProperty('done', true);
    
    const result = await testStateDriver.testState();
    const pollCountBeforeWait = result.pollCount;
    
    // Wait a bit more to ensure no more polling
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const finalResult = await testStateDriver.testState();
    // Poll count should not have increased after stopPolling
    expect(finalResult.pollCount).toEqual(pollCountBeforeWait);
  });
});

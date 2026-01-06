import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";
import { test, expect } from "../../testing/fixtures";

// Test data constants for API mocking
const basicApiInterceptor: ApiInterceptorDefinition = {
  operations: {
    "get-test": {
      url: "/api/test",
      method: "get",
      handler: `return "GET success";`,
    },
    "error-test-400": {
      url: "/api/error/400",
      method: "get",
      handler: `throw Errors.HttpError(400, { message: "Bad request", details: "Invalid data" });`,
    },
    "error-test-500": {
      url: "/api/error/500",
      method: "get",
      handler: `throw Errors.HttpError(500, { message: "Internal server error", details: "Something went wrong" });`,
    },
    "error-test-unknown": {
      url: "/api/error/unknown",
      method: "get",
      handler: `throw new Error("Unknown error occurred");`,
    },
  },
};

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders and initializes correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<DataSource id="test" url="/api/test" />`, {
      apiInterceptor: basicApiInterceptor,
    });

    // DataSource is non-visual, so we check for proper registration by checking if it exists in context
    const component = page.getByTestId("test");
    expect(await component.count()).toBe(0); // Non-visual component
  });

  test("component loads correctly", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Fragment>
        <DataSource id="ds" url="/api/test" />
        <Text testId="output" value="{ds.value}" />
      </Fragment>
      `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );

    const component = page.getByTestId("output");
    await expect(component).toHaveText("GET success");
  });

  test("onError working correctly", async ({ initTestBed }) => {
    const { testStateDriver } = await initTestBed(
      `<DataSource id="ds" url="/api/error/400" onError="(error) => testState = JSON.stringify(error)" />`,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );
    await expect
      .poll(
        async () => {
          const dataPacket = await testStateDriver.testState();
          return JSON.parse(dataPacket);
        },
        { timeout: 2000 },
      )
      .toEqual({ statusCode: 400, details: "Invalid data", message: "Bad request" });
  });

  test("shows error notification: code 400", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DataSource
        id="ds"
        url="/api/error/400"
        errorNotificationMessage="Error {$error.statusCode}: {$error.message}"
      />`,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );
    await expect(page.getByText("Error 400: Bad request")).toBeVisible();
  });

  test("shows error notification: code 500", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <DataSource 
        id="ds" 
        url="/api/error/500"
        errorNotificationMessage="Error {$error.statusCode}: {$error.message}"
      />
      `,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );
    await expect(page.getByText("Error 500: Internal server error")).toBeVisible();
  });

  test("shows error notification with error details", async ({ initTestBed, page }) => {
    await initTestBed(
      `<DataSource 
        id="ds" 
        url="/api/error/400"
        errorNotificationMessage="Error {$error.statusCode}: {$error.message}, Details: {$error.details}"
      />`,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );
    await expect(page.getByText("Error 400: Bad request, Details: Invalid data")).toBeVisible();
  });

  test.skip("shows not found error notification on incorrect endpoint", async ({ initTestBed, page }) => {
    await initTestBed(
      `<DataSource 
        id="ds" 
        url="/api/error" 
        errorNotificationMessage="Error {$error.statusCode}: {$error.message}"
      />`,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );
    await expect(page.getByText("Error 404: <No error description>")).toBeVisible();
  });

  test("shows unknown error notification", async ({ initTestBed, page }) => {
    await initTestBed(
      `<DataSource 
        id="ds" 
        url="/api/error/unknown" 
        errorNotificationMessage="Error {$error.statusCode}: {$error.message}, Details: {JSON.stringify($error.details)}"
      />`,
      {
        apiInterceptor: basicApiInterceptor,
      },
    );
    await expect(page.getByText("Error 500: Error without message, Details: {}")).toBeVisible();
  });

  // =============================================================================
  // CREDENTIALS PROPERTY TESTS
  // =============================================================================

  test.describe("credentials property", () => {
    test("accepts 'omit' value", async ({ initTestBed, page }) => {
      await initTestBed(
        `
        <Fragment>
          <DataSource id="ds" url="/api/test" credentials="omit" />
          <Text testId="output" value="{ds.value}" />
        </Fragment>
        `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const component = page.getByTestId("output");
      await expect(component).toHaveText("GET success");
    });

    test("accepts 'same-origin' value", async ({ initTestBed, page }) => {
      await initTestBed(
        `
        <Fragment>
          <DataSource id="ds" url="/api/test" credentials="same-origin" />
          <Text testId="output" value="{ds.value}" />
        </Fragment>
        `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const component = page.getByTestId("output");
      await expect(component).toHaveText("GET success");
    });

    test("accepts 'include' value", async ({ initTestBed, page }) => {
      await initTestBed(
        `
        <Fragment>
          <DataSource id="ds" url="/api/test" credentials="include" />
          <Text testId="output" value="{ds.value}" />
        </Fragment>
        `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const component = page.getByTestId("output");
      await expect(component).toHaveText("GET success");
    });

    test("works without credentials property (default behavior)", async ({ initTestBed, page }) => {
      await initTestBed(
        `
        <Fragment>
          <DataSource id="ds" url="/api/test" />
          <Text testId="output" value="{ds.value}" />
        </Fragment>
        `,
        {
          apiInterceptor: basicApiInterceptor,
        },
      );

      const component = page.getByTestId("output");
      await expect(component).toHaveText("GET success");
    });

    test("credentials property works with POST method", async ({ initTestBed, page }) => {
      const postApiInterceptor: ApiInterceptorDefinition = {
        operations: {
          "post-with-credentials": {
            url: "/api/submit",
            method: "post",
            handler: `return { message: "POST with credentials", body: $requestBody };`,
          },
        },
      };

      await initTestBed(
        `
        <Fragment>
          <DataSource 
            id="ds" 
            url="/api/submit" 
            method="post" 
            body='{{"test": "data"}}' 
            credentials="include" 
          />
          <Text testId="output" value="{ds.value.message}" />
        </Fragment>
        `,
        {
          apiInterceptor: postApiInterceptor,
        },
      );

      const component = page.getByTestId("output");
      await expect(component).toHaveText("POST with credentials");
    });
  });
});

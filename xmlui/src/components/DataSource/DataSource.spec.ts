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
      handler: `throw {statusCode: 500, message: $error.message, details: {}};`,
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

  // =============================================================================
  // REGRESSION TESTS
  // =============================================================================

  test.describe("Regression: Issue #2672 - URL encoding consistency", () => {
    // Regression test for: https://github.com/xmlui-org/xmlui/issues/2672
    // Issue: Inconsistent URL encoding between url and queryParams causes duplicate 
    // React Query keys and cache misses
    
    const pathWithSpecialChars = ":sh:Documents:/";
    const urlEncodingInterceptor: ApiInterceptorDefinition = {
      operations: {
        "list-folder-encoded": {
          url: "/ListFolder",
          method: "get",
          queryParamTypes: {
            path: "string",
          },
          handler: `return { method: "encoded", path: $queryParams.path };`,
        },
      },
    };

    test("queryParams encodes special characters", async ({ initTestBed, page }) => {
      // Using queryParams should encode special characters like : and /
      await initTestBed(
        `
        <Fragment>
          <DataSource 
            id="ds1" 
            url="/ListFolder" 
            queryParams="{{ path: ':sh:Documents:/' }}"
          />
          <Text testId="output1" value="{ds1.value.path}" />
        </Fragment>
        `,
        {
          apiInterceptor: urlEncodingInterceptor,
        },
      );

      const output = page.getByTestId("output1");
      await expect(output).toHaveText(pathWithSpecialChars);
    });

    test("direct URL interpolation does not encode special characters", async ({ initTestBed, page }) => {
      // Using direct URL interpolation should NOT encode special characters
      // This is the current behavior that causes the issue
      await initTestBed(
        `
        <Fragment>
          <DataSource 
            id="ds2" 
            url="/ListFolder?path=:sh:Documents:/"
          />
          <Text testId="output2" value="{ds2.value.path}" />
        </Fragment>
        `,
        {
          apiInterceptor: urlEncodingInterceptor,
        },
      );

      const output = page.getByTestId("output2");
      // This will likely fail initially because unencoded URL won't match the interceptor
      await expect(output).toHaveText(pathWithSpecialChars);
    });

    test("both methods should produce identical cache keys and data", async ({ initTestBed, page }) => {
      // REGRESSION TEST: Both methods should result in the same React Query cache key
      // and should not cause duplicate fetches
      
      await initTestBed(
        `
        <Fragment>
          <DataSource 
            id="dsWithQueryParams" 
            url="/ListFolder" 
            queryParams="{{ path: ':sh:Documents:/' }}"
          />
          <DataSource 
            id="dsWithDirectUrl" 
            url="/ListFolder?path=:sh:Documents:/"
          />
          <Text testId="outputQueryParams" value="{dsWithQueryParams.value.method}" />
          <Text testId="outputDirectUrl" value="{dsWithDirectUrl.value.method}" />
        </Fragment>
        `,
        {
          apiInterceptor: urlEncodingInterceptor,
        },
      );

      const outputQueryParams = page.getByTestId("outputQueryParams");
      const outputDirectUrl = page.getByTestId("outputDirectUrl");
      
      // Both should receive the same data from the same cache entry
      await expect(outputQueryParams).toHaveText("encoded");
      await expect(outputDirectUrl).toHaveText("encoded");
      
      // Both DataSource components should have fetched data successfully
      // If they have different cache keys, this demonstrates the bug
    });

    test("encoded URLs should match and share cache", async ({ initTestBed, page }) => {
      // When the fix is implemented, both approaches should:
      // 1. Generate the same encoded URL: /ListFolder?path=%3Ash%3ADocuments%3A%2F
      // 2. Use the same React Query cache key
      // 3. Result in only ONE network request, not two
      
      const interceptorWithCallCounter: ApiInterceptorDefinition = {
        initialize: "$state.callCount = 0;",
        operations: {
          "list-folder-encoded": {
            url: "/ListFolder",
            method: "get",
            queryParamTypes: {
              path: "string",
            },
            handler: `
              $state.callCount = $state.callCount + 1;
              return { 
                method: "encoded", 
                path: $queryParams.path,
                callCount: $state.callCount
              };
            `,
          },
        },
      };

      await initTestBed(
        `
        <Fragment>
          <DataSource 
            id="dsWithQueryParams" 
            url="/ListFolder" 
            queryParams="{{ path: ':sh:Documents:/' }}"
          />
          <DataSource 
            id="dsWithDirectUrl" 
            url="/ListFolder?path=:sh:Documents:/"
          />
          <Text testId="callCountQueryParams" value="{dsWithQueryParams.value.callCount}" />
          <Text testId="callCountDirectUrl" value="{dsWithDirectUrl.value.callCount}" />
        </Fragment>
        `,
        {
          apiInterceptor: interceptorWithCallCounter,
        },
      );

      const callCountQueryParams = page.getByTestId("callCountQueryParams");
      const callCountDirectUrl = page.getByTestId("callCountDirectUrl");
      
      // After the fix, both should show "1" indicating only one API call was made
      // because they share the same cache key
      await expect(callCountQueryParams).toHaveText("1");
      await expect(callCountDirectUrl).toHaveText("1");
      
      // If this test fails with different values (e.g., "1" and "2"), 
      // it confirms the bug: different cache keys cause duplicate fetches
    });
  });
});

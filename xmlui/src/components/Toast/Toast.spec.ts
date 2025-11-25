import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders toast using show API", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="show-btn" onClick="toastComponent.show('Basic toast message')">
          Show Toast
        </Button>
        <Toast id="toastComponent">
          <Text testId="toast-content">{$param}</Text>
        </Toast>
      </Fragment>
    `);

    await expect(page.getByTestId("toast-content")).not.toBeVisible();
    await page.getByTestId("show-btn").click();
    await expect(page.getByTestId("toast-content")).toBeVisible();
    await expect(page.getByTestId("toast-content")).toHaveText("Basic toast message");
  });

  test("renders success toast using success API", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="success-btn" onClick="toastComponent.success('Success message')">
          Show Success
        </Button>
        <Toast id="toastComponent">
          <property name="successTemplate">
            <Text testId="success-content">✓ {$param}</Text>
          </property>
        </Toast>
      </Fragment>
    `);

    await page.getByTestId("success-btn").click();
    await expect(page.getByTestId("success-content")).toBeVisible();
    await expect(page.getByTestId("success-content")).toHaveText("✓ Success message");
  });

  test("renders error toast using error API", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="error-btn" onClick="toastComponent.error('Error occurred')">
          Show Error
        </Button>
        <Toast id="toastComponent">
          <property name="errorTemplate">
            <Text testId="error-content">✗ {$param}</Text>
          </property>
        </Toast>
      </Fragment>
    `);

    await page.getByTestId("error-btn").click();
    await expect(page.getByTestId("error-content")).toBeVisible();
    await expect(page.getByTestId("error-content")).toHaveText("✗ Error occurred");
  });

  test("renders loading toast using loading API", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="loading-btn" onClick="toastComponent.loading('Loading...')">
          Show Loading
        </Button>
        <Toast id="toastComponent">
          <property name="loadingTemplate">
            <Text testId="loading-content">⏳ {$param}</Text>
          </property>
        </Toast>
      </Fragment>
    `);

    await page.getByTestId("loading-btn").click();
    await expect(page.getByTestId("loading-content")).toBeVisible();
    await expect(page.getByTestId("loading-content")).toHaveText("⏳ Loading...");
  });

  test("updates existing toast when called multiple times", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="first-btn" onClick="toastComponent.show('First message')">
          First
        </Button>
        <Button testId="second-btn" onClick="toastComponent.show('Second message')">
          Second
        </Button>
        <Toast id="toastComponent">
          <Text testId="toast-content">{$param}</Text>
        </Toast>
      </Fragment>
    `);

    // Show first toast
    await page.getByTestId("first-btn").click();
    await expect(page.getByTestId("toast-content")).toHaveText("First message");

    // Update to second toast
    await page.getByTestId("second-btn").click();
    await expect(page.getByTestId("toast-content")).toHaveText("Second message");
  });

  test("$param context variable passes data to default template", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="btn" onClick="toastComponent.show({ title: 'Test', count: 42 })">
          Show Toast
        </Button>
        <Toast id="toastComponent">
          <Text testId="title">{$param.title}</Text>
          <Text testId="count">{$param.count}</Text>
        </Toast>
      </Fragment>
    `);

    await page.getByTestId("btn").click();
    await expect(page.getByTestId("title")).toHaveText("Test");
    await expect(page.getByTestId("count")).toHaveText("42");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("toast has role='status' for screen readers", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="btn" onClick="toastComponent.show('Accessible message')">
          Show Toast
        </Button>
        <Toast id="toastComponent">
          <Text>{$param}</Text>
        </Toast>
      </Fragment>
    `);

    await page.getByTestId("btn").click();
    const toast = page.getByRole("status");
    await expect(toast).toBeVisible();
  });
});

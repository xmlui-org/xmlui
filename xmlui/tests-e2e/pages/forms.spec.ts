import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/forms.md"),
);

// display-only example — no interaction to test
test.describe("forms-b6ec", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "forms-b6ec");

  test("renders a Form with customer name and age fields", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Customer information")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Customer name" })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: "Age" })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("form-layouts-ea4e", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "form-layouts-ea4e");

  test("renders a single-column form layout with four fields", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Firstname" })).toHaveValue("Jake");
    await expect(page.getByRole("textbox", { name: "Lastname" })).toHaveValue("Hard");
    await expect(page.getByRole("textbox", { name: "Job Title" })).toHaveValue("janitor");
    await expect(page.getByRole("textbox", { name: "Experience" })).toHaveValue("broom");
  });
});

// display-only example — no interaction to test
test.describe("form-layouts-eab2", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "form-layouts-eab2");

  test("renders a two-column form layout", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Firstname" })).toHaveValue("Jake");
    await expect(page.getByRole("textbox", { name: "Lastname" })).toHaveValue("Hard");
    await expect(page.getByRole("textbox", { name: "Job Title" })).toHaveValue("janitor");
    await expect(page.getByRole("textbox", { name: "Experience" })).toHaveValue("broom");
  });
});

test.describe("form-layouts-eab0", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "form-layouts-eab0");

  test("renders the form with title, firstname, lastname, job title, and experience fields", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Title", exact: true })).toHaveValue("Mr.");
    await expect(page.getByRole("textbox", { name: "Firstname" })).toHaveValue("Jake");
    await expect(page.getByRole("textbox", { name: "Lastname" })).toHaveValue("Hard");
  });

  test("submitting the form triggers onSubmit with form data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"firstname":"Jake"/)).toBeVisible();
  });
});

test.describe("checkbox-163e", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "checkbox-163e");

  test("renders three checkboxes with initial checked states", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByLabel("Option #1")).toBeChecked();
    await expect(page.getByLabel("Option #2")).not.toBeChecked();
    await expect(page.getByLabel("Option #3")).toBeChecked();
  });

  test("submitting the form triggers onSubmit with checkbox values", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"option1":true/)).toBeVisible();
  });
});

test.describe("datepicker-1662", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "datepicker-1662");

  test("renders the date picker with initial birthdate value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByLabel("Birthdate")).toBeVisible();
  });

  test("submitting the form triggers onSubmit with date data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"birthDate"/)).toBeVisible();
  });
});

test.describe("fileinput-16a0", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "fileinput-16a0");

  test("renders the file input field", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Articles file")).toBeVisible();
  });

  test("submitting the form triggers onSubmit", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/\"articles\"/).or(page.getByText("articles"))).toBeVisible({ timeout: 10000 });
  });
});

test.describe("numberbox-integers-16e2", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "numberbox-integers-16e2",
  );

  test("renders the integer number box with initial value of 30", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("spinbutton", { name: "Age" })).toHaveValue("30");
  });

  test("submitting the form triggers onSubmit with integer age", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"age":30/)).toBeVisible();
  });
});

test.describe("numberbox-floating-point-1716", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "numberbox-floating-point-1716",
  );

  test("renders the floating-point number box with initial value 192.5", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("spinbutton", { name: "Distance in miles" })).toHaveValue("192.5");
  });

  test("submitting the form triggers onSubmit with float distance", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"distance":192.5/)).toBeVisible();
  });
});

test.describe("radiogroup-1744", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "radiogroup-1744");

  test("renders the radio group with four title options and Mr. selected", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByLabel("Mr.")).toBeChecked();
    await expect(page.getByLabel("Mrs.")).not.toBeChecked();
    await expect(page.getByLabel("Ms.")).not.toBeChecked();
    await expect(page.getByLabel("Dr.")).not.toBeChecked();
  });

  test("selecting a different option updates the selection", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByLabel("Dr.").click();
    await expect(page.getByLabel("Dr.")).toBeChecked();
    await expect(page.getByLabel("Mr.")).not.toBeChecked();
  });
});

test.describe("select-1792", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "select-1792");

  test("renders the select with initial value Extra small", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("combobox", { name: "Box size" })).toContainText("Extra small");
  });

  test("submitting the form triggers onSubmit with selected size", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"size":"xs"/)).toBeVisible();
  });
});

test.describe("switch-17d0", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "switch-17d0");

  test("renders three switches with initial checked states", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByLabel("Show border")).toBeChecked();
    await expect(page.getByLabel("Show text")).not.toBeChecked();
    await expect(page.getByLabel("Hide shadow")).toBeChecked();
  });

  test("toggling a switch changes its state", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByLabel("Show border").click();
    await expect(page.getByLabel("Show border")).not.toBeChecked();
  });
});

test.describe("textbox-17fe", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "textbox-17fe");

  test("renders the text box with initial value Joe", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Joe");
  });

  test("submitting the form triggers onSubmit with name value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"name":"Joe"/)).toBeVisible();
  });
});

test.describe("textarea-182c", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "textarea-182c");

  test("renders the text area with initial description value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Description" })).toHaveValue("This is a description");
  });

  test("submitting the form triggers onSubmit with description", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"description"/)).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("refer-to-data-1944", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "refer-to-data-1944",
  );

  test("renders the form with enable switch and name text box", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByLabel("Enable name")).toBeChecked();
    await expect(page.getByRole("textbox", { name: "Name" })).toBeEnabled();
  });
});

// display-only example — no interaction to test
test.describe("refer-to-data-1972", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "refer-to-data-1972",
  );

  test("renders the form with reactive full name display", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Firstname" })).toHaveValue("John");
    await expect(page.getByRole("textbox", { name: "Lastname" })).toHaveValue("Doe");
    await expect(page.getByText("Full name: John Doe")).toBeVisible();
  });
});

test.describe("refer-to-data-19a0", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "refer-to-data-19a0",
  );

  test("renders the form with nested address fields", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("John smith");
    await expect(page.getByRole("textbox", { name: "Street" })).toHaveValue("96th Ave N");
  });

  test("submitting the form triggers onSubmit with nested address data", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"name":"John smith"/)).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("validate-data-19ee", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "validate-data-19ee",
  );

  test("renders the minLength text box with initial value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "minLength" })).toHaveValue("Billy Bob");
  });
});

// display-only example — no interaction to test
test.describe("validate-data-1a1c", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "validate-data-1a1c",
  );

  test("renders the maxLength text box with initial value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "maxLength" })).toHaveValue("Billy Bob");
  });
});

// display-only example — no interaction to test
test.describe("validate-data-1a4a", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "validate-data-1a4a",
  );

  test("renders the minValue number box with initial value 30", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("spinbutton", { name: "minValue" })).toHaveValue("30");
  });
});

// display-only example — no interaction to test
test.describe("validate-data-1a78", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "validate-data-1a78",
  );

  test("renders the maxValue number box with initial value 30", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("spinbutton", { name: "maxValue" })).toHaveValue("30");
  });
});

// display-only example — no interaction to test
test.describe("compound-validation-1aa6", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "compound-validation-1aa6",
  );

  test("renders the form with phone, url, and email pattern fields", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "mobilePattern" })).toHaveValue("+13456123456");
    await expect(page.getByRole("textbox", { name: "websitePattern" })).toHaveValue("http://www.blogsite.com");
    await expect(page.getByRole("textbox", { name: "emailPattern" })).toHaveValue("myemail@mail.com");
  });
});

// display-only example — no interaction to test
test.describe("validation-specific-severity-1af4", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "validation-specific-severity-1af4",
  );

  test("renders the regex text box with initial value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "regex" })).toHaveValue("hello");
  });
});

// display-only example — no interaction to test
test.describe("validation-specific-messages-1b22", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "validation-specific-messages-1b22",
  );

  test("renders the compound validation text box with initial url value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Multiple Validations" })).toHaveValue(
      "http://www.example.com",
    );
  });
});

// display-only example — no interaction to test
test.describe("server-side-validation-1b50", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "server-side-validation-1b50",
  );

  test("renders the form with phone and url fields with severity settings", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "mobilePattern" })).toHaveValue("+13456123456");
    await expect(page.getByRole("textbox", { name: "websitePattern" })).toHaveValue("http://www.blogsite.com");
  });
});

// display-only example — no interaction to test
test.describe("submit-data-1b9e", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "submit-data-1b9e");

  test("renders the number box with invalid message configuration", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("spinbutton", { name: "Invalid Message" })).toHaveValue("20");
  });
});

test.describe("submit-data-1bec", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "submit-data-1bec");

  test("renders the form with a Save button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("clicking Save triggers the onSubmit handler", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved!")).toBeVisible();
  });
});

test.describe("submit-data-1c1a", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "submit-data-1c1a");

  test("renders the form with name and age fields", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "name" })).toHaveValue("Joe");
    await expect(page.getByRole("spinbutton", { name: "age" })).toHaveValue("43");
  });

  test("submitting the form shows the serialized form data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"name":"Joe"/)).toBeVisible();
    await expect(page.getByText(/"age":43/)).toBeVisible();
  });
});

test.describe("custom-inputs-with-formitem-1d7a", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "custom-inputs-with-formitem-1d7a",
  );

  test("renders the toggle button in red initial state (false)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Toggle" })).toBeVisible();
  });

  test("clicking Toggle changes the button color and value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Toggle" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/"userAvailable":true/)).toBeVisible();
  });
});

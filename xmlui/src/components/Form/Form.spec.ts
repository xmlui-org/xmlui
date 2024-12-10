import { labelPositionValues } from "@components/abstractions";
import { ComponentDriver, createTestWithDriver } from "@testing/fixtures";

// --- Setup

class FormDriver extends ComponentDriver {}

const test = createTestWithDriver(FormDriver);

// --- Testing

// --- --- buttonRowTemplate

test.skip("buttonRowTemplate can render buttons", async ({ createDriver }) => {});

test.skip("buttonRowTemplate replaces built-in buttons", async ({ createDriver }) => {});

test.skip("setting buttonRowTemplate without buttons still runs submit on Enter", async ({ createDriver }) => {});

// --- --- itemLabelPosition

labelPositionValues.forEach((pos) => {
  test.skip(`label position ${pos} is applied by default for all FormItems`, async ({ createDriver }) => {});  
  test.skip(`label position ${pos} is not applied if overridden in FormItem`, async ({ createDriver }) => {});  
});

// --- --- itemLabelWidth: Should we use this? Can we re-evaluate this?

// --- --- itemLabelBreak: We should talk about this

test.skip("FormItem labels break to next line", async ({ createDriver }) => {});

test.skip("no label breaks if overriden in FormItem", async ({ createDriver }) => {});

// --- --- enabled

test.skip("Form buttons and contained FormItems are enabled", async ({ createDriver }) => {});

test.skip("Form buttons and contained FormItems are disabled", async ({ createDriver }) => {});

// --- --- data

test.skip("data accepts an object", async ({ createDriver }) => {});

[
  //{ label: "null", value: null },
  { label: "empty array", value: [] },
  { label: "array", value: [] },
  { label: "function", value: () => {} }, // ?
].forEach((type) => {
  test.skip(`data does not accept ${type.label}`, async ({ createDriver }) => {});
});

// e.g. /api/endpoint
test.skip("data accepts relative URL endpoint", async ({ createDriver }) => {});

// e.g. https://example.com/api/endpoint
test.skip("data accepts external URL endpoint", async ({ createDriver }) => {});

// --- --- cancelLabel: In the future we need to have a test case for the hideCancel prop

test.skip("cancel button uses default label if cancelLabel is not set", async ({ createDriver }) => {});

test.skip("cancel button is rendered with cancelLabel", async ({ createDriver }) => {});

// saveLabel

test.skip("save button is rendered with default label if saveLabel is set to empty string", async ({ createDriver }) => {});

test.skip("save button is rendered with saveLabel", async ({ createDriver }) => {});

// saveInProgressLabel

test.skip("save in progress label shows up on submission", async ({ createDriver }) => {});

test.skip("save in progress label does not get stuck after submission is done", async ({ createDriver }) => {});

// swapCancelAndSave

test.skip("built-in button row order flips if swapCancelAndSave is true", async ({ createDriver }) => {});

// --- submitUrl

test.skip("form submits to correct url", async ({ createDriver }) => {});

// --- submitMethod

["get", "post", "put", "delete"].forEach((method) => {
  test.skip(`submitMethod uses the ${method} REST operation`, async ({ createDriver }) => {});
});

// --- submitting the Form

test.skip("submit only triggers when enabled", async ({ createDriver }) => {});

test.skip("submit triggers when clicking save/submit button", async ({ createDriver }) => {});

test.skip("submit triggers when pressing Enter", async ({ createDriver }) => {});

test.skip("user cannot submit with clientside errors present", async ({ createDriver }) => {});

// --- cancelling

test.skip("cancel only triggers when enabled", async ({ createDriver }) => {});

// --- reset: no actual control for reset added yet?

// --- $data: should these be in FormItem.spec.ts?

test.skip("$data is bound to form data", async ({ createDriver }) => {});

test.skip("$data is correctly undefined if data is not set in props", async ({ createDriver }) => {});

// --- backend validation summary

test.skip("submitting with errors shows validation summary", async ({ createDriver }) => {});

test.skip("submitting without errors does not show summary", async ({ createDriver }) => {});

test.skip("general error messages are rendered in the summary", async ({ createDriver }) => {});

test.skip("field-related errors are rendered at the correct FormItems", async ({ createDriver }) => {});

test.skip("field-related errors disappear if user updates FormItems", async ({ createDriver }) => {});

// NOTE: this could be multiple tests
test.skip("user can close all parts of the summary according to severity", async ({ createDriver }) => {});

test.skip("submitting with errors 2nd time after user close shows summary again", async ({ createDriver }) => {});

test.skip("Form shows confirmation dialog if warnings are present", async ({ createDriver }) => {});

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

["left", "right", "start", "end"].forEach((pos) => {
  test.skip(`label position ${pos} is applied by default for all FormItems`, async ({ createDriver }) => {});  
  test.skip(`label position ${pos} is not applied if overridden in FormItem`, async ({ createDriver }) => {});  
});

// --- --- itemLabelWidth: Should we use this? Can we re-evaluate this?

// --- --- itemLabelBreak

test.skip("FormItem labels break to next line", async ({ createDriver }) => {});

test.skip("no label breaks if overriden in FormItem", async ({ createDriver }) => {});

// --- --- enabled

test.skip("Form buttons and contained FormItems are enabled", async ({ createDriver }) => {});

test.skip("Form buttons and contained FormItems are disabled", async ({ createDriver }) => {});

// --- --- data

test.skip("data accepts an object", async ({ createDriver }) => {});

test.skip("data accepts URL endpoint", async ({ createDriver }) => {});

// --- --- cancelLabel

test.skip("cancel button not rendered if cancelLabel is set to empty string", async ({ createDriver }) => {});

// saveLabel

test.skip("save button is rendered with default label if saveLabel is set to empty string", async ({ createDriver }) => {});

// saveInProgressLabel

test.skip("save in progress label does not get stuck after submission is done", async ({ createDriver }) => {});

// swapCancelAndSave

test.skip("built-in button row order flips if swapCancelAndSave is true", async ({ createDriver }) => {});

// --- submitUrl

test.skip("form submits to submitUrl", async ({ createDriver }) => {});

// --- submitMethod

["get", "post", "put", /* "delete" */].forEach((method) => {
  test.skip(`submitMethod uses the ${method} REST operation`, async ({ createDriver }) => {});
})

// --- submitting the Form

test.skip("submit only triggers when enabled", async ({ createDriver }) => {});

test.skip("submit triggers when clicking save button", async ({ createDriver }) => {});

test.skip("submit triggers when pressing Enter", async ({ createDriver }) => {});

// --- cancelling

test.skip("cancel only triggers when enabled", async ({ createDriver }) => {});

test.skip("cancel triggers when pressing Esc", async ({ createDriver }) => {});

// --- reset: no actual control for reset added yet?

// --- $data

test.skip("$data is bound to form data", async ({ createDriver }) => {});

test.skip("$data is correctly undefined if data is not set in props", async ({ createDriver }) => {});

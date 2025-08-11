import type { Locator, Page } from "@playwright/test";
import { getPseudoStyles } from "./component-test-helpers";

export type ComponentDriverParams = {
  locator: Locator;
  page: Page;
};

type ClickOption = {
  button?: "left" | "right" | "middle";
  clickCount?: number;
  delay?: number;
  force?: boolean;
  modifiers?: Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift">;
  noWaitAfter?: boolean;
  position?: {
    x: number;
    y: number;
  };
  timeout?: number;
  trial?: boolean;
};

export class ComponentDriver {
  protected readonly locator: Locator;
  protected readonly page: Page;

  constructor({ locator, page }: ComponentDriverParams) {
    this.locator = locator;
    this.page = page;
  }

  get component() {
    return this.locator;
  }

  /**
   * Gets the html tag name of the final rendered component
   */
  async getComponentTagName() {
    return this.component.evaluate((el) => el.tagName.toLowerCase());
  }

  // NOTE: methods must be created using the arrow function notation.
  // Otherwise, the "this" will not be correctly bound to the class instance when destructuring.

  click = async (options?: ClickOption) => {
    await this.locator.click(options);
  };

  dblclick = async (options?: { timeout?: number }) => {
    await this.locator.dblclick(options);
  };

  focus = async (options?: { timeout?: number }) => {
    await this.locator.focus(options);
  };

  blur = async (options?: { timeout?: number }) => {
    await this.locator.blur(options);
  };

  hover = async (options?: { timeout?: number }) => {
    await this.locator.hover(options);
  };
}

export class InputComponentDriver extends ComponentDriver {
  get field() {
    return this.component.locator("input");
  }

  get label() {
    return this.component.locator("label");
  }

  get placeholder() {
    return this.field.getAttribute("placeholder");
  }

  get requiredIndicator() {
    return this.component.getByText("*");
  }
}

export class TestStateDriver {
  protected readonly testStateLocator: Locator;

  constructor(testStateLocator: Locator) {
    this.testStateLocator = testStateLocator;
  }

  /** returns an async function that can query the test state */
  get testState() {
    return async () => {
      const text = await this.testStateLocator.textContent();
      const testState = text === "undefined" ? undefined : JSON.parse(text!);
      return testState;
    };
  }
}

// --- Button

export class ButtonDriver extends ComponentDriver {
  // Ensure we either get rtl or ltr strings
  /* async getWritingDirection() {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
    const attribute = await this.locator.getAttribute("dir");
    if (attribute && attribute !== "auto") return attribute as "rtl" | "ltr";
    const style = await this.locator.evaluate(
      (element) => window.getComputedStyle(element).direction,
    );
    // Default is ltr: https://developer.mozilla.org/en-US/docs/Web/CSS/direction#values
    return style === "rtl" ? "rtl" : "ltr";
  } */

  // Unused as of yet
  /* async getTextNodes() {
    return await this.locator.evaluate((element) =>
      [...element.childNodes]
        .filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent.trim())
        .map((e) => e.textContent.trim()),
    );
  }
 */
  getFirstNonTextNode() {
    return this.locator.locator("> *").first();
  }

  // NOTE: Accounts for icons being passed as children as well
  getIcons() {
    return this.locator.locator("> svg").or(this.locator.locator("> img"));
  }
}

// --- ContentSeparator

export class ContentSeparatorDriver extends ComponentDriver {
  get separator() {
    return this.component;
  }

  async getOrientation() {
    const classList = await this.separator.evaluate((el) => el.className);

    if (classList.includes("horizontal")) return "horizontal";
    if (classList.includes("vertical")) return "vertical";
    return "unknown";
  }

  async getComputedHeight() {
    return await this.separator.evaluate((el) => {
      return window.getComputedStyle(el).height;
    });
  }

  async getComputedWidth() {
    return await this.separator.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });
  }

  async getBackgroundColor() {
    return await this.separator.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
  }
}

// --- Avatar

export class AvatarDriver extends ComponentDriver {}

// --- Splitter

export class SplitterDriver extends ComponentDriver {
  /**
   * Gets the resizer element (non-floating)
   */
  async getResizer() {
    // Look for the non-floating resizer element
    const allResizerCandidates = this.locator.locator('[class*="resizer"]');
    const resizerCount = await allResizerCandidates.count();

    for (let i = 0; i < resizerCount; i++) {
      const candidate = allResizerCandidates.nth(i);
      const className = await candidate.getAttribute("class");
      // Look for resizer that doesn't contain "floating" in its class
      if (className && className.includes("resizer") && !className.includes("floating")) {
        return candidate;
      }
    }

    // Fallback: return first resizer element
    return allResizerCandidates.first();
  }

  /**
   * Gets the floating resizer element
   */
  async getFloatingResizer() {
    // Look for the floating resizer element
    const allResizerCandidates = this.locator.locator('[class*="resizer"]');
    const resizerCount = await allResizerCandidates.count();

    for (let i = 0; i < resizerCount; i++) {
      const candidate = allResizerCandidates.nth(i);
      const className = await candidate.getAttribute("class");
      // Look for resizer that contains "floating" in its class
      if (className && className.includes("floating")) {
        return candidate;
      }
    }

    // If no floating resizer found, return null locator
    return this.locator.locator('[class*="floating"][class*="resizer"]').first();
  }

  /**
   * Hovers near the resizer area to trigger floating resizer visibility
   */
  async hoverNearResizer() {
    // Get the center of the splitter and hover there
    const bounds = await this.locator.boundingBox();
    if (bounds) {
      await this.page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      // Wait a bit for the hover effect to take place
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Drags the resizer by the specified offset
   * @param deltaX - Horizontal offset in pixels
   * @param deltaY - Vertical offset in pixels
   */
  async dragResizer(deltaX: number, deltaY: number) {
    // Try to get both types of resizers
    const resizer = await this.getResizer();
    const floatingResizer = await this.getFloatingResizer();

    // Determine which resizer to use based on visibility
    let targetResizer = resizer;

    try {
      const isResizerVisible = await resizer.isVisible();
      const isFloatingResizerVisible = await floatingResizer.isVisible();

      if (!isResizerVisible && isFloatingResizerVisible) {
        targetResizer = floatingResizer;
      } else if (!isResizerVisible) {
        // If neither is visible, try to hover to make floating resizer visible
        await this.hoverNearResizer();
        targetResizer = floatingResizer;
      }
    } catch (error) {
      // If there's any error checking visibility, use the regular resizer
      targetResizer = resizer;
    }

    // Get the resizer bounds
    const resizerBounds = await targetResizer.boundingBox();
    if (!resizerBounds) {
      throw new Error("Could not get resizer bounds for drag operation");
    }

    const startX = resizerBounds.x + resizerBounds.width / 2;
    const startY = resizerBounds.y + resizerBounds.height / 2;
    const endX = startX + deltaX;
    const endY = startY + deltaY;

    // Perform the drag operation
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 5 });
    await this.page.mouse.up();

    // Wait a bit for the component to update
    await this.page.waitForTimeout(100);
  }

  /**
   * Gets the primary panel element
   */
  async getPrimaryPanel() {
    return this.locator.locator('[class*="primaryPanel"]').first();
  }

  /**
   * Gets the secondary panel element
   */
  async getSecondaryPanel() {
    return this.locator.locator('[class*="secondaryPanel"]').first();
  }
}

// --- ExpandableItem

export class ExpandableItemDriver extends ComponentDriver {
  getSummary() {
    return this.component.locator('[class*="_summary_"]');
  }

  getSummaryContent() {
    return this.component.locator('[class*="_summaryContent_"]');
  }

  getContent() {
    return this.component.locator('[class*="_content_"]');
  }

  getIcon() {
    return this.component.locator('[class*="_icon_"] svg');
  }

  getSwitch() {
    // Get the actual switch input element, not the wrapper
    return this.component.getByRole("switch");
  }

  async isExpanded() {
    return await this.component.locator('[class*="_content_"]').isVisible();
  }

  async isDisabled() {
    return await this.component.evaluate((el) => el.className.includes("disabled"));
  }

  async expand() {
    if (!(await this.isExpanded())) {
      await this.getSummary().click();
    }
  }

  async collapse() {
    if (await this.isExpanded()) {
      await this.getSummary().click();
    }
  }

  async toggle() {
    await this.getSummary().click();
  }
}

// --- FileInput

export class FileInputDriver extends ComponentDriver {
  getTextBox() {
    return this.component.locator("input[readonly]");
  }

  getHiddenInput() {
    return this.component.locator('input[type="file"]');
  }

  getBrowseButton() {
    return this.component.locator('[class*="_button_"]');
  }

  getContainer() {
    return this.component;
  }

  async isEnabled() {
    const browseButton = this.getBrowseButton();
    return !(await browseButton.isDisabled());
  }

  async getSelectedFiles() {
    const textBox = this.getTextBox();
    const value = await textBox.inputValue();
    return value || "";
  }

  async openFileDialog() {
    await this.getBrowseButton().click();
  }

  async getPlaceholder() {
    const textBox = this.getTextBox();
    return (await textBox.getAttribute("placeholder")) || "";
  }

  async focusButton() {
    await this.getBrowseButton().focus();
  }

  async hasReadOnlyAttribute() {
    const textBox = this.getTextBox();
    return (await textBox.getAttribute("readonly")) !== null;
  }

  async getAcceptedFileTypes() {
    const hiddenInput = this.getHiddenInput();
    return (await hiddenInput.getAttribute("accept")) || "";
  }

  async isMultiple() {
    const hiddenInput = this.getHiddenInput();
    return (await hiddenInput.getAttribute("multiple")) !== null;
  }

  async isDirectory() {
    const hiddenInput = this.getHiddenInput();
    return (await hiddenInput.getAttribute("webkitdirectory")) !== null;
  }
}

// --- FileUploadDropZone

export class FileUploadDropZoneDriver extends ComponentDriver {
  getWrapper() {
    return this.component.locator('[class*="_wrapper_"]');
  }

  getHiddenInput() {
    return this.component.locator('input[type="file"]');
  }

  getDropPlaceholder() {
    return this.component.locator('[class*="_dropPlaceholder_"]');
  }

  getDropIcon() {
    return this.getDropPlaceholder().locator("svg");
  }

  async isDropPlaceholderVisible() {
    return await this.getDropPlaceholder().isVisible();
  }

  async isEnabled() {
    const input = this.getHiddenInput();
    const isDisabled = await input.isDisabled();
    return !isDisabled;
  }

  async getDropText() {
    return (await this.getDropPlaceholder().textContent()) || "";
  }

  async triggerDragEnter() {
    await this.component.dispatchEvent("dragenter");
  }

  async triggerDragLeave() {
    await this.component.dispatchEvent("dragleave");
  }

  async triggerDrop(files: string[] = ["test.txt"]) {
    // Simulate file drop event
    await this.component.dispatchEvent("drop", {
      dataTransfer: {
        files: files.map((name) => ({ name, type: "text/plain", size: 100 })),
      },
    });
  }

  async triggerPaste() {
    await this.component.dispatchEvent("paste", {
      clipboardData: {
        files: [{ name: "pasted.txt", type: "text/plain", size: 50 }],
        items: [{ kind: "file", getAsFile: () => ({ name: "pasted.txt" }) }],
      },
    });
  }

  async hasChildren() {
    const childrenCount = await this.component
      .locator('> *:not(input):not([class*="_dropPlaceholder_"])')
      .count();
    return childrenCount > 0;
  }
}

// --- Form

type SubmitTrigger = "click" | "keypress";
type MockExternalApiOptions = {
  status?: number;
  headers?: Record<string, string>;
  body?: Record<string, any>;
};

export class BackdropDriver extends ComponentDriver {
  getBackdrop() {
    return this.component.locator("> *").first();
  }

  getOverlay() {
    return this.component.locator("> *").nth(1);
  }

  getDefaultBackgroundColor() {
    return "rgb(0, 0, 0)"; // Default backdrop color
  }

  getDefaultOpacity() {
    return "0.1"; // Default backdrop opacity
  }
}

export class FormDriver extends ComponentDriver {
  async mockExternalApi(url: string, apiOptions: MockExternalApiOptions) {
    const { status = 200, headers = {}, body = {} } = apiOptions;
    await this.page.route(url, (route) =>
      route.fulfill({ status, headers, body: JSON.stringify(body) }),
    );
  }

  getSubmitButton() {
    return this.component.locator("button[type='submit']");
  }

  async hasSubmitButton() {
    return (await this.getSubmitButton().count()) > 0;
  }

  async submitForm(trigger: SubmitTrigger = "click") {
    if (trigger === "keypress") {
      if ((await this.hasSubmitButton()) && (await this.getSubmitButton().isEnabled())) {
        await this.getSubmitButton().focus();
      }
      await this.locator.locator("input").waitFor();
      const firstInputChild = this.locator.locator("input");
      if ((await firstInputChild.count()) > 0) {
        await firstInputChild.first().focus();
      }
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
        request.url().includes(endpoint) &&
        request.method().toLowerCase() === requestMethod.toLowerCase(),
      { timeout },
    );
    await this.submitForm(trigger);
    return requestPromise;
  }

  async getSubmitResponse(endpoint = "/entities", responseStatus = 200, timeout = 5000) {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes(endpoint) && response.status() === responseStatus,
      { timeout },
    );
    return responsePromise;
  }

  /**
   * Gets the validation summary component inside the Form.
   * Uses the 'data-validation-summary' attribute to find the component
   */
  async getValidationSummary() {
    return this.component.locator("[data-validation-summary='true']");
  }

  /**
   * Gets the validation display components inside the Form.
   * Uses the 'data-validation-display-severity' attribute to find the components.
   * The attribute contains the severity of the validation.
   */
  async getValidationDisplays() {
    return this.component
      .locator("[data-validation-summary='true']")
      .locator("[data-validation-display-severity]");
  }

  async getValidationDisplaysBySeverity(severity: string) {
    return this.component
      .locator("[data-validation-summary='true']")
      .locator(`[data-validation-display-severity="${severity}"]`);
  }

  // TODO: it would be a nice to have features to get validation displays and map them automatically
  /* async getValidationDisplaysAsDriver() {
    const displays = await this.getValidationDisplays();
    const displayList: ValidationDisplayDriver[] = [];

    const displayNum = await displays.count();
    for (let i = 0; i < displayNum; i++) {
      const element = displays.nth(i);
      displayList.push(new ValidationDisplayDriver({ locator: element, page: this.page }));
    }
    return displayList;
  } */
}

// --- ValidationSummary

export class ValidationSummaryDriver extends ComponentDriver {
  /**
   * Gets the validation display components inside the Form.
   * Uses the 'data-validation-display-severity' attribute to find the components.
   * The attribute contains the severity of the validation.
   */
  async getValidationDisplays() {
    return this.component
      .locator("[data-validation-summary='true']")
      .locator("[data-validation-display-severity]");
  }
}

// --- ValidationDisplay

export class ValidationDisplayDriver extends ComponentDriver {
  async getSeverity() {
    return this.component.getAttribute("data-validation-display-severity");
  }

  async getText() {
    return this.component.locator("li").textContent();
  }
}

// --- Markdown

export class MarkdownDriver extends ComponentDriver {
  async hasHtmlElement(elements: string | string[]) {
    const contents = await this.component.innerHTML();
    elements = typeof elements === "string" ? [elements] : elements;
    return elements.map((e) => `<${e}`).reduce((acc, curr) => acc && contents.includes(curr), true);
  }
}

// --- Items

export class ItemsDriver extends ComponentDriver {}

// --- Slider

export class SliderDriver extends ComponentDriver {}

// --- Range

export class RangeDriver extends ComponentDriver {}

// --- DatePicker

export class DatePickerDriver extends ComponentDriver {
  async toggleDropdownVisibility() {
    await this.component.click();
  }

  async pickADay(value: string) {
    await this.component
      .getByRole("gridcell", { name: value })
      .or(this.page.getByRole("gridcell", { name: value }))
      .first()
      .click({ force: true });
  }
}

// --- AutoComplete

export class AutoCompleteDriver extends ComponentDriver {
  async toggleOptionsVisibility() {
    await this.component.click();
  }

  async selectLabel(value: string) {
    await this.component
      .getByRole("option", { name: value })
      .or(this.page.getByRole("option", { name: value }))
      .first()
      .click({ force: true });
  }

  async searchFor(value: string) {
    await this.page.getByRole("combobox").fill(value);
  }

  async chooseIndex(index: number) {
    await this.locator
      .getByRole("option")
      .nth(index)
      .or(this.page.getByRole("option").nth(index))
      .first()
      .click();
  }
}

// --- Select

export class SelectDriver extends ComponentDriver {
  async toggleOptionsVisibility() {
    await this.component.click();
  }

  async selectLabel(value: string) {
    await this.component
      .getByRole("option", { name: value })
      .or(this.page.getByRole("option", { name: value }))
      .first()
      .click({ force: true });
  }

  async selectFirstLabelPostSearh(label: string) {
    await this.searchFor(label);
    await this.chooseIndex(0);
  }

  async searchFor(value: string) {
    await this.page.getByRole("combobox").fill(value);
  }

  async chooseIndex(index: number) {
    await this.locator
      .getByRole("option")
      .nth(index)
      .or(this.page.getByRole("option").nth(index))
      .first()
      .click();
  }

  async selectMultipleLabels(values: string[]) {
    for (const value of values) {
      await this.component
        .getByRole("option", { name: value })
        .or(this.page.getByRole("option", { name: value }))
        .first()
        .click();
    }
  }
}

// --- RadioGroup

export class RadioGroupDriver extends ComponentDriver {}

// --- NumberBox

export class NumberBoxDriver extends ComponentDriver {
  get field() {
    return this.component.locator("input");
  }

  get label() {
    return this.component.locator("label");
  }

  get placeholder() {
    return this.field.getAttribute("placeholder");
  }

  get spinnerUpButton() {
    return this.component.locator("button").and(this.component.locator("[data-spinner='up']"));
  }

  get spinnerDownButton() {
    return this.component.locator("button").and(this.component.locator("[data-spinner='down']"));
  }
}

// --- TextBox

export class TextBoxDriver extends InputComponentDriver {}

// --- TextArea

export class TextAreaDriver extends InputComponentDriver {
  get field() {
    return this.component.locator("textarea").or(this.component).last();
  }
}

// --- ProgressBar

export class ProgressBarDriver extends ComponentDriver {
  get bar() {
    return this.component.locator("> div");
  }

  async getProgressRatio() {
    const style = await this.bar.getAttribute("style");
    if (!style) return 0;

    const widthMatch = style.match(/width:\s*(\d+(?:\.\d+)?)%/);
    return widthMatch ? parseFloat(widthMatch[1]) / 100 : 0;
  }
}

// --- List

export class ListDriver extends ComponentDriver {
  /**
   * Gets all list item elements
   */
  get items() {
    return this.component
      .locator("[data-list-item]")
      .or(this.component.locator("div").filter({ hasText: /^(?!.*Loading).*/ }));
  }

  /**
   * Gets the loading spinner element
   */
  get loadingSpinner() {
    return this.component.locator('[class*="loadingWrapper"]');
  }

  /**
   * Checks if the loading state is visible
   */
  async isLoading() {
    return await this.loadingSpinner.isVisible().catch(() => false);
  }

  /**
   * Gets group header elements
   */
  get groupHeaders() {
    return this.component
      .locator("[data-group-header]")
      .or(this.component.locator("div").filter({ hasText: /^Category:|^Header:/ }));
  }

  /**
   * Gets group footer elements
   */
  get groupFooters() {
    return this.component
      .locator("[data-group-footer]")
      .or(this.component.locator("div").filter({ hasText: /^End of/ }));
  }

  /**
   * Gets the empty state element
   */
  get emptyState() {
    return this.component
      .locator("[data-empty-state]")
      .or(this.component.getByText("No items found!"));
  }

  /**
   * Scrolls the list to a specific position
   */
  async scrollTo(position: "top" | "bottom" | number) {
    if (position === "top") {
      await this.component.evaluate((el) => el.scrollTo({ top: 0 }));
    } else if (position === "bottom") {
      await this.component.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
    } else {
      await this.component.evaluate((el, pos) => el.scrollTo({ top: pos }), position);
    }
  }

  /**
   * Gets the number of visible items (for virtualization testing)
   */
  async getVisibleItemCount() {
    return await this.items.count();
  }

  /**
   * Gets item at specific index
   */
  getItemAt(index: number) {
    return this.items.nth(index);
  }

  /**
   * Gets item by text content
   */
  getItemByText(text: string) {
    return this.component.getByText(text);
  }

  /**
   * Checks if list is empty
   */
  async isEmpty() {
    // Check for the actual "No data available" text that appears when list is empty
    const noDataText = await this.component.textContent();
    const hasNoDataMessage =
      noDataText?.includes("No data available") || noDataText?.includes("No items found");

    // Also check if there are any actual data items
    const itemCount = await this.items.count();
    const hasDataItems = itemCount > 0 && !hasNoDataMessage;

    return hasNoDataMessage || !hasDataItems;
  }

  /**
   * Gets all text content from visible items
   */
  async getVisibleItemTexts() {
    const items = await this.items.all();
    const texts = await Promise.all(items.map((item) => item.textContent()));
    return texts.filter((text) => text !== null);
  }
}

// --- Text

export class TextDriver extends ComponentDriver {}

// --- Heading

export class HeadingDriver extends ComponentDriver {}

// --- Icon

export class IconDriver extends ComponentDriver {}

// --- Stack

export class StackDriver extends ComponentDriver {}

// --- HStack

export class HStackDriver extends StackDriver {}

// --- VStack

export class VStackDriver extends StackDriver {}

// --- Link

export class LinkDriver extends ComponentDriver {}

// --- NavLink

export class NavLinkDriver extends ComponentDriver {}

// --- NavGroup

export class NavGroupDriver extends ComponentDriver {
  getIcons() {
    return this.locator.locator("> svg").or(this.locator.locator("> img"));
  }
}

// --- NavPanel

export class NavPanelDriver extends ComponentDriver {}

// --- Card

export class CardDriver extends ComponentDriver {
  get avatar() {
    return this.component.getByRole("img", { name: "avatar" });
  }
}

// --- Accordion

export class AccordionDriver extends ComponentDriver {}

// --- AppHeader

export class AppHeaderDriver extends ComponentDriver {}

// --- AppFooter

export class AppFooterDriver extends ComponentDriver {}

// --- Badge

export class BadgeDriver extends ComponentDriver {}

// --- NoResult

export class NoResultDriver extends ComponentDriver {}

// --- Option

export class OptionDriver extends ComponentDriver {}

// --- FormItem

// NOTE (NEW): FormItem will be removed, delete this Driver
// NOTE: Do not delete these comments.
// This is an untested proposal to shorten code length.
// Now, you have to provide the .input element for a specific control driver:
//
// element = FormItemDriver().input -> TextBoxDriver(element)
//
// This can be shortened to FormItemDriver().input.as("TextBoxDriver") if we extend
// the locator object only for the return type of the "input" getter to support the "as" method
//
/* type DriverMap = {
  TextBoxDriver: TextBoxDriver;
  NumberBoxDriver: NumberBoxDriver;
};

const driverConstructors: {
  [K in keyof DriverMap]: new (obj: ComponentDriverParams) => DriverMap[K]
} = {
  TextBoxDriver,
  NumberBoxDriver
};

export interface ExtendedLocator extends Locator {
  as?: <K extends keyof DriverMap>(type: K) => DriverMap[K];
}

export const extendLocator = (
  locator: Locator,
): ExtendedLocator => ({
  ...locator,
  locator: (selector, options) =>
    extendLocator(locator.locator(selector, options)),
  as: (type) => { return new driverConstructors[type]({ locator, page: locator.page() }); }
}); */

export class FormItemDriver extends ComponentDriver {
  get input() {
    return this.component.locator(">input").or(this.component).first();
  }

  get textBox() {
    return this.input.getByRole("textbox");
  }

  get checkbox() {
    return this.input.getByRole("checkbox");
  }

  get label() {
    return this.component.locator("label");
  }

  get validationStatusTag() {
    return "data-validation-status";
  }

  async getValidationStatusIndicator() {
    return this.component.locator(`[${this.validationStatusTag}]`);
  }
}

// --- htmlTags

export class HtmlTagDriver extends ComponentDriver {}

// --- CodeBlock

export class CodeBlockDriver extends ComponentDriver {
  getHeader() {
    return this.component.locator('[class*="codeBlockHeader"]');
  }

  getContent() {
    return this.component.locator('[class*="codeBlockContent"]');
  }

  getCopyButton() {
    return this.component.locator('[class*="codeBlockCopyButton"] button');
  }

  getFilename() {
    return this.getHeader().locator("span");
  }

  async isCopyButtonVisible() {
    return await this.getCopyButton().isVisible();
  }

  async hasHeader() {
    return await this.getHeader().isVisible();
  }

  async getCodeText() {
    return await this.getContent().textContent();
  }

  async clickCopyButton() {
    await this.getCopyButton().click();
  }

  async hoverContent() {
    await this.getContent().hover();
  }
}

// --- Checkbox

export class CheckboxDriver extends InputComponentDriver {
  async getIndicatorColor() {
    const specifier = this.component.getByRole("checkbox").or(this.component).last();
    const { boxShadow } = await getPseudoStyles(specifier, "::before", "box-shadow");
    const colorMatch = boxShadow.match(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[a-fA-F0-9]{3,8})/);
    return colorMatch ? colorMatch[1] : null;
  }
}

// --- Label

export class LabelDriver extends ComponentDriver {}

// --- Spinner

export class SpinnerDriver extends ComponentDriver {
  /**
   * Gets the main spinner element (the one with the ring animation)
   */
  get spinnerElement() {
    // Filter for spinner elements and use the first one by default
    return this.page
      .locator('[data-testid="test-id-component"]')
      .filter({ has: this.page.locator("div") })
      .first();
  }

  /**
   * Gets a specific spinner element by index (for multiple spinners)
   */
  getSpinnerByIndex(index: number) {
    return this.page
      .locator('[data-testid="test-id-component"]')
      .filter({ has: this.page.locator("div") })
      .nth(index);
  }

  /**
   * Gets the fullscreen wrapper element (only exists when fullScreen=true)
   */
  get fullScreenWrapper() {
    return this.page.locator('div[class*="_fullScreenSpinnerWrapper_"]');
  }

  /**
   * Checks if the spinner is in fullscreen mode
   */
  async isFullScreen(): Promise<boolean> {
    try {
      const wrapper = this.fullScreenWrapper;
      return await wrapper.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Gets the computed style of the spinner element
   */
  async getSpinnerStyle() {
    const element = this.spinnerElement;
    return await element.evaluate((el: HTMLElement) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        position: styles.position,
        width: styles.width,
        height: styles.height,
        animationDuration: styles.animationDuration,
        className: el.className,
      };
    });
  }

  /**
   * Gets the animation duration from the child elements (where the actual animation occurs)
   */
  async getAnimationDuration(): Promise<string> {
    const element = this.spinnerElement;
    return await element.evaluate((el: HTMLElement) => {
      // Check the first child div for animation duration
      const firstChild = el.querySelector("div");
      if (firstChild) {
        const styles = window.getComputedStyle(firstChild);
        return styles.animationDuration;
      }
      return "0s";
    });
  }

  /**
   * Waits for the spinner to appear
   */
  async waitForSpinner(timeout: number = 5000): Promise<void> {
    await this.spinnerElement.waitFor({ state: "visible", timeout });
  }

  /**
   * Waits for the spinner to disappear
   */
  async waitForSpinnerToDisappear(timeout: number = 5000): Promise<void> {
    await this.spinnerElement.waitFor({ state: "hidden", timeout });
  }

  /**
   * Checks if the spinner is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.spinnerElement.isVisible();
  }

  /**
   * Gets the CSS class name to verify CSS modules are working
   */
  async getClassName(): Promise<string> {
    return (await this.spinnerElement.getAttribute("class")) || "";
  }

  /**
   * Gets the number of child div elements (should be 4 for the ring animation)
   */
  async getChildCount(): Promise<number> {
    return await this.spinnerElement.evaluate((el: HTMLElement) => {
      return el.querySelectorAll("div").length;
    });
  }

  /**
   * Gets the total number of spinner components on the page
   */
  async getSpinnerCount(): Promise<number> {
    return await this.page.locator('[data-testid="test-id-component"]').count();
  }

  /**
   * Gets a spinner by specific test ID
   */
  getSpinnerByTestId(testId: string) {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Checks if fullscreen mode has the correct wrapper structure
   */
  async getFullScreenWrapperInfo() {
    const wrapper = this.fullScreenWrapper;
    if (!(await wrapper.isVisible())) {
      return null;
    }

    return await wrapper.evaluate((el: HTMLElement) => {
      const parent = el.parentElement;
      const styles = window.getComputedStyle(el);
      return {
        position: styles.position,
        inset: styles.inset,
        parentClassName: parent?.className || "",
        hasSpinnerChild: !!el.querySelector('[class*="_lds-ring_"]'),
      };
    });
  }
}

// --- DropdownMenu

export class DropdownMenuDriver extends ComponentDriver {
  /**
   * Get the trigger button element
   * For DropdownMenu, we'll look for the button on the page level since Radix UI may render it separately
   */
  getTrigger() {
    return this.page.getByRole("button").first();
  }

  /**
   * Open the dropdown menu
   */
  async open() {
    const trigger = this.getTrigger();
    await trigger.click();
  }

  /**
   * Close the dropdown menu by clicking outside
   */
  async close() {
    // Try clicking on the trigger first to close, then fall back to clicking outside
    try {
      await this.page.keyboard.press("Escape");
    } catch {
      // If escape doesn't work, try clicking on a safe area
      await this.page.click("html");
    }
  }

  /**
   * Get all menu items
   */
  getMenuItems() {
    return this.page.getByRole("menuitem");
  }

  /**
   * Get a specific menu item by text
   */
  getMenuItem(text: string) {
    return this.page.getByRole("menuitem", { name: text });
  }

  /**
   * Click a menu item by text
   */
  async clickMenuItem(text: string) {
    await this.getMenuItem(text).click();
  }

  /**
   * Get submenu items
   */
  getSubMenuItems(parentText: string) {
    // First hover over the parent submenu to open it
    return this.page.getByText(parentText);
  }

  /**
   * Open a submenu by hovering over it
   */
  async openSubMenu(submenuText: string) {
    await this.page.getByText(submenuText).hover();
  }

  /**
   * Get menu separators
   */
  getMenuSeparators() {
    return this.page.locator('[class*="DropdownMenuSeparator"]');
  }

  /**
   * Get the menu content container
   */
  getMenuContent() {
    return this.page.locator('[class*="DropdownMenuContent"]');
  }

  /**
   * Check if the menu is open
   */
  async isOpen() {
    try {
      const content = this.getMenuContent();
      return await content.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Wait for menu to open
   */
  async waitForOpen() {
    await this.getMenuContent().waitFor({ state: "visible" });
  }

  /**
   * Wait for menu to close
   */
  async waitForClose() {
    await this.getMenuContent().waitFor({ state: "hidden" });
  }
}

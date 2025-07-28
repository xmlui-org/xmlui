import type { Locator, Page } from "@playwright/test";
import { mapObject, parseAsCssBorder, parseAsNumericCss } from "./component-test-helpers";

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

// --- Avatar

export class AvatarDriver extends ComponentDriver {}

// --- Splitter

export class SplitterDriver extends ComponentDriver {}

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

// --- List

export class ListDriver extends ComponentDriver {}

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

export class CodeBlockDriver extends ComponentDriver {}

// --- Checkbox

export class CheckboxDriver extends InputComponentDriver {}

// --- Label

export class LabelDriver extends ComponentDriver {}

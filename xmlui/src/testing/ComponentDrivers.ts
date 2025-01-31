import type { Locator, Page } from "@playwright/test";

export type ComponentDriverParams = {
  locator: Locator;
  page: Page;
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

  async getStyles(style: string | string[]) {
    style = Array.isArray(style) ? style : [style];
    return this.component.evaluate(
      (element, styles) =>
        Object.fromEntries(
          styles.map((styleName) => [
            styleName,
            window.getComputedStyle(element).getPropertyValue(styleName),
          ]),
        ),
      style,
    );
  }

  /**
   * Retrieves the bounding rectangle of the component including margins and padding
   * added to the dimensions.
   */
  async getComponentBounds() {
    const boundingRect = await this.component.evaluate((element) =>
      element.getBoundingClientRect(),
    );
    const margins = await this.getStyles([
      "margin-left",
      "margin-right",
      "margin-top",
      "margin-bottom",
    ]);
    const marginLeft = parseFloat(margins["margin-left"]);
    const marginRight = parseFloat(margins["margin-right"]);
    const marginTop = parseFloat(margins["margin-top"]);
    const marginBottom = parseFloat(margins["margin-bottom"]);

    const width = boundingRect.width + marginLeft + marginRight;
    const height = boundingRect.height + marginTop + marginBottom;
    const left = boundingRect.left - marginLeft;
    const right = boundingRect.right + marginRight;
    const top = boundingRect.top - marginTop;
    const bottom = boundingRect.bottom + marginBottom;

    return { width, height, left, right, top, bottom };
  }

  // NOTE: methods must be created using the arrow function notation.
  // Otherwise, the "this" will not be correctly bound to the class instance when destructuring.

  click = async (options?: { timeout?: number }) => {
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
  // Ensure we either get rtl or ltr strings - Pending approval
  /* async getWritingDirection() {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
    const attribute = await this.locator.getAttribute("dir");
    if (attribute && attribute !== "auto") return attribute as "rtl" | "ltr";
    const style = await this.locator.evaluate((element) => window.getComputedStyle(element).direction);
    // Default is ltr: https://developer.mozilla.org/en-US/docs/Web/CSS/direction#values
    return style === "rtl" ? "rtl" : "ltr";
  } */

  // NOTE: It may be prudent to target the text nodes and wrap them in a Locator-like, very basic class
  // to better handle them and provide supporting methods such as dimensions (via getClientRects?)
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects
  async getTextNodes() {
    return await this.locator.evaluate((element) =>
      [...element.childNodes]
        .filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent.trim())
        .map((e) => e.textContent.trim()),
    );
  }

  // NOTE: Accounts for the icon being passed as a child as well
  getIcons() {
    return this.locator.locator("> svg").or(this.locator.locator("> img"));
  }

  // NOTE: Added because we can set an icon via the icon prop as well as child
  getFirstIcon() {
    return this.locator.locator("> svg").or(this.locator.locator("> img")).first();
  }

  // NOTE: Added because we can set an icon via the icon prop as well as child
  getLastIcon() {
    return this.locator.locator("> svg").or(this.locator.locator("> img")).last();
  }

  getFirstNonTextNode() {
    return this.locator.locator("> *").first();
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
        request.url().endsWith(endpoint) &&
        request.method().toLowerCase() === requestMethod.toLowerCase(),
      { timeout },
    );
    await this.submitForm(trigger);
    return requestPromise;
  }

  async getSubmitResponse(
    endpoint = "/entities",
    requestMethod = "POST",
    trigger: SubmitTrigger = "click",
    timeout = 5000,
  ) {
    const request = await this.getSubmitRequest(endpoint, requestMethod, trigger, timeout);
    return request.response();
  }
}

// --- FormItem

export class FormItemDriver extends ComponentDriver {
  // TODO, TEMP: get input under FormItem
  get input() {
    return this.locator.locator("input");
  }

  // TODO: Need to check for input type
  // TODO: Remove this method and use input.fill directly
  async fillField(value: any) {
    await this.input.fill(value);
  }
}

// --- Markdown

export class MarkdownDriver extends ComponentDriver {
  // TODO: methods to handle text node content and applied styles
}

// --- Items

export class ItemsDriver extends ComponentDriver {}

// --- Slider

export class SliderDriver extends ComponentDriver {}

// --- Range

export class RangeDriver extends ComponentDriver {}

// --- Select

export class SelectDriver extends ComponentDriver {
  async selectOption(value: string) {
    await this.locator.click();
    await this.page.getByLabel(value).click();
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

export class TextBoxDriver extends ComponentDriver {
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

// --- TextArea

export class TextAreaDriver extends ComponentDriver {
  get field() {
    return this.component.locator("textarea").or(this.component).last();
  }

  get label() {
    return this.component.locator("label");
  }

  get placeholder() {
    return this.field.getAttribute("placeholder");
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

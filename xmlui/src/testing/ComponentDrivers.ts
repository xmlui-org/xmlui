import type { Locator, Page } from "@playwright/test";

async function getElementSize(locator: Locator) {
  const dimensions = await locator.evaluate((element) => [
    element.clientWidth,
    element.clientHeight,
  ]);
  return { width: dimensions[0] ?? 0, height: dimensions[1] ?? 0 } as const;
}

export type ComponentDriverParams = {
  locator: Locator;
  page: Page;
  // TODO: REMOVE
  testStateLocator: Locator
};

export class ComponentDriver {
  protected readonly locator: Locator;
  page: Page;
  
  // TODO: REMOVE
  protected readonly testStateLocator: Locator;

  constructor({ locator, page, testStateLocator }: ComponentDriverParams) {
    this.locator = locator;
    this.page = page;
    // TODO: REMOVE
    this.testStateLocator = testStateLocator;
  }

  get component() {
    return this.locator;
  }

  // NOTE: methods must be created using the arrow function notation.
  // Otherwise, the "this" will not be correctly bound to the class instance when destructuring.

  click = async (options?: { timeout?: number }) => {
    await this.locator.click(options);
  };

  focus = async (options?: { timeout?: number }) => {
    await this.locator.focus(options);
  };

  blur = async (options?: { timeout?: number }) => {
    await this.locator.blur(options);
  };

  getComponentSize = async () => {
    return getElementSize(this.locator);
  };

  // TODO: REMOVE
  get testState() {
    return async () => {
      const text = await this.testStateLocator.textContent();
      const testState = text === "undefined" ? undefined : JSON.parse(text!);
      return testState;
    };
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

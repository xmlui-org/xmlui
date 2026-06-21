import type { Locator, Page } from "@playwright/test";

export class ComponentDriver {
  constructor(
    protected readonly params: {
      locator: Locator;
      page: Page;
    },
  ) {}

  get component(): Locator {
    return this.params.locator;
  }

  getComponentTagName() {
    return this.component.evaluate((element) => element.tagName.toLowerCase());
  }

  click = async (options?: Parameters<Locator["click"]>[0]) => {
    await this.component.click(options);
  };

  dblclick = async (options?: Parameters<Locator["dblclick"]>[0]) => {
    await this.component.dblclick(options);
  };

  focus = async (options?: Parameters<Locator["focus"]>[0]) => {
    await this.component.focus(options);
  };

  blur = async (options?: Parameters<Locator["blur"]>[0]) => {
    await this.component.blur(options);
  };

  getIcons(): Locator {
    return this.component.locator('[data-xmlui-part="icon"], [data-icon], svg');
  }

  getByPartName(part: string): Locator {
    return this.component.locator(`[data-part-id="${part}"], [data-xmlui-part="${part}"]`).first();
  }
}

export class InputComponentDriver extends ComponentDriver {
  get field(): Locator {
    return this.getByPartName("input");
  }

  get label(): Locator {
    return this.getByPartName("label");
  }

  get requiredIndicator(): Locator {
    return this.component.getByText("*");
  }

  get placeholder(): Promise<string | null> {
    return this.field.getAttribute("placeholder");
  }
}

export class IconDriver extends ComponentDriver {
  get svgIcon() {
    return this.component.locator("svg");
  }
}

export class CardDriver extends ComponentDriver {
  get avatar() {
    return this.component.getByRole("img", { name: "avatar" });
  }
}

export class ContentSeparatorDriver extends ComponentDriver {
  get separator(): Locator {
    return this.component;
  }

  async getOrientation(): Promise<string> {
    const className = await this.separator.evaluate((element) => String(element.className));
    if (className.includes("horizontal")) {
      return "horizontal";
    }
    if (className.includes("vertical")) {
      return "vertical";
    }
    return "unknown";
  }

  getComputedHeight(): Promise<string> {
    return this.separator.evaluate((element) => window.getComputedStyle(element).height);
  }

  getComputedWidth(): Promise<string> {
    return this.separator.evaluate((element) => window.getComputedStyle(element).width);
  }

  getBackgroundColor(): Promise<string> {
    return this.separator.evaluate((element) => window.getComputedStyle(element).backgroundColor);
  }
}

export class CodeBlockDriver extends ComponentDriver {
  getContent(): Locator {
    return this.component.locator('[data-xmlui-part="content"]').first();
  }

  getCodeText(): Promise<string> {
    return this.getContent().textContent().then((text) => text ?? "");
  }
}

export class NoResultDriver extends ComponentDriver {}

export class LinkDriver extends ComponentDriver {}

export class TextBoxDriver extends InputComponentDriver {
  get input(): Locator {
    return this.component.locator("input").first();
  }

  get startAdornment(): Locator {
    return this.getByPartName("startAdornment");
  }

  get endAdornment(): Locator {
    return this.getByPartName("endAdornment");
  }

  get button(): Locator {
    return this.endAdornment;
  }
}

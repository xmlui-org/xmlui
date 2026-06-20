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

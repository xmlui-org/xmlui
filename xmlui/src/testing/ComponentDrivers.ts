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

export class TextAreaDriver extends InputComponentDriver {
  get textarea(): Locator {
    return this.component.locator("textarea").first();
  }
}

export class FileUploadDropZoneDriver extends ComponentDriver {
  get input(): Locator {
    return this.component.locator('input[type="file"]').first();
  }

  getHiddenInput(): Locator {
    return this.input;
  }

  get dropPlaceholder(): Locator {
    return this.getByPartName("dropPlaceholder");
  }

  getDropPlaceholder(): Locator {
    return this.dropPlaceholder;
  }

  getDropIcon(): Locator {
    return this.component.locator("[data-icon]").first();
  }

  async isEnabled(): Promise<boolean> {
    return (await this.component.getAttribute("data-drop-enabled")) === "true";
  }

  async hasChildren(): Promise<boolean> {
    const placeholderCount = await this.dropPlaceholder.count();
    const text = (await this.component.textContent())?.trim() ?? "";
    return placeholderCount === 0 && text.length > 0;
  }

  async triggerDragEnter(): Promise<void> {
    await this.component.evaluate((element) => {
      const transfer = new DataTransfer();
      element.dispatchEvent(new DragEvent("dragenter", {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
      }));
    });
  }

  async triggerDragLeave(): Promise<void> {
    await this.component.evaluate((element) => {
      const transfer = new DataTransfer();
      element.dispatchEvent(new DragEvent("dragleave", {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
      }));
    });
  }

  async triggerDrop(fileNames: string[]): Promise<void> {
    await this.component.evaluate((element, names) => {
      const transfer = new DataTransfer();
      names.forEach((name) => {
        transfer.items.add(new File(["test-file"], name, {
          type: testFileTypeInBrowser(name),
        }));
      });
      element.dispatchEvent(new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
      }));
      function testFileTypeInBrowser(name: string): string {
        const lowerName = name.toLowerCase();
        if (lowerName.endsWith(".pdf")) {
          return "application/pdf";
        }
        if (lowerName.endsWith(".png")) {
          return "image/png";
        }
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
          return "image/jpeg";
        }
        if (lowerName.endsWith(".json")) {
          return "application/json";
        }
        return "text/plain";
      }
    }, fileNames);
  }

  async triggerPaste(fileNames: string[], target?: Locator): Promise<void> {
    const pasteTarget = target ?? this.component;
    await pasteTarget.evaluate((element, names) => {
      const transfer = new DataTransfer();
      names.forEach((name) => {
        transfer.items.add(new File(["test-file"], name, {
          type: testFileTypeInBrowser(name),
        }));
      });
      const event = new Event("paste", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "clipboardData", {
        value: transfer,
      });
      element.dispatchEvent(event);
      function testFileTypeInBrowser(name: string): string {
        const lowerName = name.toLowerCase();
        if (lowerName.endsWith(".pdf")) {
          return "application/pdf";
        }
        if (lowerName.endsWith(".png")) {
          return "image/png";
        }
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
          return "image/jpeg";
        }
        if (lowerName.endsWith(".json")) {
          return "application/json";
        }
        return "text/plain";
      }
    }, fileNames);
  }
}

export class NumberBoxDriver extends InputComponentDriver {
  get input(): Locator {
    return this.component.getByRole("spinbutton").first();
  }

  get spinnerUp(): Locator {
    return this.getByPartName("spinnerUp");
  }

  get spinnerDown(): Locator {
    return this.getByPartName("spinnerDown");
  }

  increment = async () => {
    if (await this.spinnerUp.isEnabled()) {
      await this.spinnerUp.click();
    }
  };

  decrement = async () => {
    if (await this.spinnerDown.isEnabled()) {
      await this.spinnerDown.click();
    }
  };
}

export class DateInputDriver extends InputComponentDriver {
  get dayInput(): Locator {
    return this.getByPartName("day");
  }

  get monthInput(): Locator {
    return this.getByPartName("month");
  }

  get yearInput(): Locator {
    return this.getByPartName("year");
  }

  get clearButton(): Locator {
    return this.getByPartName("clearButton");
  }
}

export class TimeInputDriver extends InputComponentDriver {
  get hourInput(): Locator {
    return this.getByPartName("hour");
  }

  get minuteInput(): Locator {
    return this.getByPartName("minute");
  }

  get secondInput(): Locator {
    return this.getByPartName("second");
  }

  get amPmInput(): Locator {
    return this.getByPartName("ampm");
  }

  get clearButton(): Locator {
    return this.getByPartName("clearButton");
  }
}

export class CheckboxDriver extends InputComponentDriver {
  get input(): Locator {
    return this.component.locator("input").or(this.component).first();
  }

  get field(): Locator {
    return this.input;
  }

  getIndicatorColor(): Promise<string> {
    return this.input.evaluate((element) =>
      window.getComputedStyle(element, "::before").color,
    );
  }
}

export class SelectDriver extends ComponentDriver {
  get select(): Locator {
    return this.component.locator("select").or(this.component).first();
  }

  async selectOption(value: string): Promise<void> {
    await this.select.selectOption(value);
  }

  async value(): Promise<string | string[]> {
    return this.select.evaluate((element) => {
      const select = element as HTMLSelectElement;
      if (select.multiple) {
        return Array.from(select.selectedOptions).map((option) => option.value);
      }
      return select.value;
    });
  }
}

export class SliderDriver extends ComponentDriver {
  private async getActiveThumb(thumbNumber = 0): Promise<Locator> {
    const thumbs = this.params.page.getByRole("slider");
    const thumbCount = await thumbs.count();
    if (thumbCount === 0) {
      throw new Error("No slider thumb found.");
    }
    return thumbs.nth(Math.max(0, Math.min(thumbNumber, thumbCount - 1)));
  }

  async dragThumbByMouse(location: "start" | "end" | "middle", thumbNumber = 0) {
    const track = this.params.page.locator("[data-track]");
    await track.waitFor({ state: "visible" });
    const activeThumb = await this.getActiveThumb(thumbNumber);
    await activeThumb.waitFor({ state: "visible" });
    const trackBox = await track.boundingBox();
    if (!trackBox) {
      throw new Error("Could not get slider track bounds.");
    }
    const targetX = location === "start"
      ? trackBox.x
      : location === "end"
        ? trackBox.x + trackBox.width
        : trackBox.x + trackBox.width / 2;
    const targetY = trackBox.y + trackBox.height / 2;
    await activeThumb.hover();
    await this.params.page.mouse.down({ button: "left" });
    await this.params.page.mouse.move(targetX, targetY);
    await this.params.page.mouse.up();
  }

  async stepThumbByKeyboard(
    key: "ArrowLeft" | "ArrowRight" | "Home" | "End",
    thumbNumber = 0,
    repeat = 1,
  ) {
    const activeThumb = await this.getActiveThumb(thumbNumber);
    await activeThumb.focus();
    for (let i = 0; i < repeat; i += 1) {
      await this.params.page.keyboard.press(key);
    }
  }
}

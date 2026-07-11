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

  getText(): Promise<string> {
    return this.component.textContent().then((text) => text ?? "");
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

  async hasHtmlElement(selector: string | string[]): Promise<boolean> {
    const locator = Array.isArray(selector)
      ? this.component.locator(selector.join(" "))
      : this.component.locator(selector);
    return await locator.count() > 0;
  }
}

export class InputComponentDriver extends ComponentDriver {
  get field(): Locator {
    return this.component
      .locator(
        "xpath=self::input | self::textarea | self::select | self::*[@contenteditable='true'] | .//input | .//textarea | .//select | .//*[@contenteditable='true']",
      )
      .first();
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

export class FormDriver extends ComponentDriver {
  get submitButton(): Locator {
    return this.getByPartName("submitButton").or(
      this.component.getByRole("button", { name: /^(Save|Submit)$/ }),
    );
  }

  get cancelButton(): Locator {
    return this.getByPartName("cancelButton").or(
      this.component.getByRole("button", { name: /^(Cancel|Abort)$/ }),
    );
  }

  async submitForm(mode: "click" | "keypress" = "click") {
    if (mode === "keypress") {
      await this.component
        .locator("input, textarea, select, button")
        .first()
        .focus({ timeout: 1000 })
        .catch(() => this.component.focus());
      await this.params.page.keyboard.press("Enter");
      return;
    }
    await this.submitButton.click();
  }

  waitForSubmitResponse(endpoint = "/entities", responseStatus = 200, timeout = 5000) {
    return this.params.page.waitForResponse(
      (response) => response.url().includes(endpoint) && response.status() === responseStatus,
      { timeout },
    );
  }

  getValidationSummary(): Locator {
    return this.params.page.locator("[data-validation-summary]").first();
  }

  getValidationDisplaysBySeverity(severity: "error" | "warning"): Locator {
    return this.params.page.locator(`[data-validation-display-severity="${severity}"]`).first();
  }

  async getSubmitRequest(endpoint: string, method: string, mode: "click" | "keypress" = "click") {
    const requestPromise = this.params.page.waitForRequest((request) =>
      request.url().includes(endpoint) && request.method().toLowerCase() === method.toLowerCase()
    );
    await this.submitForm(mode);
    return requestPromise;
  }
}

export class FormItemDriver extends ComponentDriver {
  get input(): Locator {
    return this.getByPartName("input");
  }

  get textBox(): Locator {
    return this.input
      .locator(
        "xpath=self::input | self::textarea | self::select | self::*[@contenteditable='true'] | .//input | .//textarea | .//select | .//*[@contenteditable='true']",
      )
      .first();
  }

  get checkbox(): Locator {
    return this.input.getByRole("checkbox").or(this.component.getByRole("checkbox")).first();
  }

  get label(): Locator {
    return this.getByPartName("label");
  }

  get error(): Locator {
    return this.getByPartName("error");
  }

  get validationStatusIndicator(): Locator {
    return this.getByPartName("validationStatusIndicator");
  }

  get validationStatusTag(): string {
    return "data-validation-status";
  }
}

export class FormSegmentDriver extends ComponentDriver {}

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

export class ResponsiveBarDriver extends ComponentDriver {
  getMenuItems(): Locator {
    return this.params.page.locator('[role="menuitem"], [data-xmlui-component="MenuItem"]');
  }
}

export class ProgressBarDriver extends ComponentDriver {
  get bar(): Locator {
    return this.component.locator("> div");
  }

  async getProgressRatio(): Promise<number> {
    const style = await this.bar.getAttribute("style");
    if (!style) {
      return 0;
    }
    const widthMatch = style.match(/width:\s*(\d+(?:\.\d+)?)%/);
    return widthMatch ? Number.parseFloat(widthMatch[1]) / 100 : 0;
  }
}

export class AccordionDriver extends ComponentDriver {}

export class AppHeaderDriver extends ComponentDriver {
  getContent(): Locator {
    return this.getByPartName("content");
  }

  getLogo(): Locator {
    return this.getByPartName("logo");
  }

  getProfileMenu(): Locator {
    return this.getByPartName("profileMenu");
  }
}

export class AvatarDriver extends ComponentDriver {}

export class BadgeDriver extends ComponentDriver {}

export class FooterDriver extends ComponentDriver {
  getContent(): Locator {
    return this.getByPartName("content");
  }
}

export class ModalDialogDriver extends ComponentDriver {
  get titlePart(): Locator {
    return this.getByPartName("title");
  }
}

export class ContextMenuDriver extends ComponentDriver {
  getMenuItems(): Locator {
    return this.params.page.getByRole("menuitem");
  }

  getMenuItem(text: string): Locator {
    return this.params.page.getByRole("menuitem", { name: text });
  }

  async clickMenuItem(text: string): Promise<void> {
    await this.getMenuItem(text).click();
  }

  async openSubMenu(submenuText: string): Promise<void> {
    await this.params.page.getByText(submenuText).hover();
  }

  getMenuSeparators(): Locator {
    return this.params.page.locator('[data-xmlui-component="MenuSeparator"]:visible');
  }

  getMenuContent(): Locator {
    return this.params.page.locator('[data-xmlui-component="ContextMenu"]');
  }

  async isOpen(): Promise<boolean> {
    return this.getMenuContent().isVisible();
  }

  async close(): Promise<void> {
    await this.params.page.keyboard.press("Escape");
  }
}

export class DropdownMenuDriver extends ComponentDriver {
  getTrigger(): Locator {
    const trigger = this.component
      .locator("xpath=self::*[@data-xmlui-component='DropdownMenuTrigger']")
      .or(this.component.locator("xpath=self::button | .//button"))
      .or(this.params.page.locator('[data-xmlui-component="DropdownMenuTrigger"]').getByRole("button"))
      .or(this.params.page.getByRole("button"));
    return trigger.filter({ visible: true }).first();
  }

  async open(): Promise<void> {
    await this.getTrigger().click();
  }

  async close(): Promise<void> {
    await this.params.page.keyboard.press("Escape");
  }

  getMenuItems(): Locator {
    return this.params.page.getByRole("menuitem");
  }

  getMenuItem(text: string): Locator {
    return this.params.page.getByRole("menuitem", { name: text });
  }

  async clickMenuItem(text: string): Promise<void> {
    await this.getMenuItem(text).click();
  }

  async openSubMenu(submenuText: string): Promise<void> {
    await this.params.page.getByText(submenuText).hover();
  }

  getMenuSeparators(): Locator {
    return this.params.page.locator('[data-xmlui-component="MenuSeparator"]:visible');
  }

  getMenuContent(): Locator {
    return this.params.page.locator('[data-xmlui-component="DropdownMenuContent"]');
  }

  async isOpen(): Promise<boolean> {
    return this.getMenuContent().isVisible();
  }

  async waitForOpen(): Promise<void> {
    await this.getMenuContent().waitFor({ state: "visible" });
  }

  async waitForClose(): Promise<void> {
    await this.getMenuContent().waitFor({ state: "hidden" });
  }
}

export class ExpandableItemDriver extends ComponentDriver {
  getSummary(): Locator {
    return this.component.locator(`[data-part-id="summary"], [data-xmlui-part="summary"]`);
  }

  getSummaryContent(): Locator {
    return this.component.locator(".summaryContent").first();
  }

  getContent(): Locator {
    return this.getByPartName("content");
  }

  getIcon(): Locator {
    return this.component.locator(".icon svg, .icon").first();
  }

  getSwitch(): Locator {
    return this.component.getByRole("switch").or(this.component.locator(".switchControl")).first();
  }

  async isExpanded(): Promise<boolean> {
    return this.getContent().isVisible();
  }

  async isDisabled(): Promise<boolean> {
    return this.component.evaluate((element) => String(element.className).includes("disabled"));
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

export class SplitterDriver extends ComponentDriver {
  getResizer(): Locator {
    return this.component.locator('[data-xmlui-part="resizer"], [class*="resizer"]').first();
  }

  getFloatingResizer(): Locator {
    return this.component.locator('[class*="floatingResizer"]').first();
  }

  async hoverNearResizer() {
    const bounds = await this.component.boundingBox();
    if (!bounds) {
      return;
    }
    await this.params.page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  }

  async dragResizer(deltaX: number, deltaY: number) {
    const resizer = this.getResizer();
    const bounds = await resizer.boundingBox();
    if (!bounds) {
      return;
    }
    const startX = bounds.x + bounds.width / 2;
    const startY = bounds.y + bounds.height / 2;
    await this.params.page.mouse.move(startX, startY);
    await this.params.page.mouse.down();
    await this.params.page.mouse.move(startX + deltaX, startY + deltaY);
    await this.params.page.mouse.up();
  }
}

export class LinkDriver extends ComponentDriver {}

export class NavGroupDriver extends ComponentDriver {
  getTrigger(): Locator {
    return this.component.getByRole("button").or(this.component).first();
  }

  getContent(): Locator {
    return this.getByPartName("content").or(this.params.page.getByRole("menu")).first();
  }

  async toggle(): Promise<void> {
    await this.getTrigger().click();
  }

  async isExpanded(): Promise<boolean> {
    return (await this.getTrigger().getAttribute("aria-expanded")) === "true";
  }
}

export class NavLinkDriver extends ComponentDriver {}

export class NavPanelCollapseButtonDriver extends ComponentDriver {}

export class NavPanelDriver extends ComponentDriver {
  getContent(): Locator {
    return this.getByPartName("content");
  }

  getLogo(): Locator {
    return this.getByPartName("logo");
  }

  getFooter(): Locator {
    return this.getByPartName("footer");
  }
}

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
    return !(await this.getBrowseButton().isDisabled());
  }

  async getSelectedFiles() {
    const value = await this.getTextBox().inputValue();
    return value || "";
  }

  async openFileDialog() {
    await this.getBrowseButton().click();
  }

  async getPlaceholder() {
    return (await this.getTextBox().getAttribute("placeholder")) || "";
  }

  async focusButton() {
    await this.getBrowseButton().focus();
  }

  async hasReadOnlyAttribute() {
    return (await this.getTextBox().getAttribute("readonly")) !== null;
  }

  async getAcceptedFileTypes() {
    return (await this.getHiddenInput().getAttribute("accept")) || "";
  }

  async isMultiple() {
    return (await this.getHiddenInput().getAttribute("multiple")) !== null;
  }

  async isDirectory() {
    return (await this.getHiddenInput().getAttribute("webkitdirectory")) !== null;
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
  get clearButton(): Locator {
    return this.component.locator('[data-part-id="clearButton"], [data-xmlui-part="clearButton"]').first();
  }

  get select(): Locator {
    return this.component.locator("select").or(this.component).first();
  }

  async selectOption(value: string): Promise<void> {
    const nativeSelect = this.component.locator("select").first();
    if (await nativeSelect.count() && await nativeSelect.isVisible()) {
      await nativeSelect.selectOption(value);
      return;
    }
    const visibleOptions = this.component
      .locator('[role="option"]:visible')
      .or(this.params.page.locator('[role="option"]:visible'));
    if (!(await visibleOptions.count())) {
      await this.toggleOptionsVisibility();
    }
    const valueOption = this.component
      .locator(`[role="option"][data-value="${cssEscape(value)}"]`)
      .or(this.params.page.locator(`[role="option"][data-value="${cssEscape(value)}"]`))
      .first();
    if (await valueOption.count()) {
      await valueOption.click({ force: true });
      return;
    }
    await this.component
      .getByRole("option", { name: value })
      .or(this.params.page.getByRole("option", { name: value }))
      .first()
      .click({ force: true });
  }

  async value(): Promise<string | string[]> {
    const nativeSelect = this.component.locator("select").first();
    if (!(await nativeSelect.count())) {
      const value =
        (await this.component.getAttribute("data-value")) ??
        (await this.component.locator("[data-value]").first().getAttribute("data-value"));
      return value ?? "";
    }
    return nativeSelect.evaluate((element) => {
      const select = element as HTMLSelectElement;
      if (select.multiple) {
        return Array.from(select.selectedOptions).map((option) => option.value);
      }
      return select.value;
    });
  }

  async toggleOptionsVisibility(): Promise<void> {
    const trigger = this.component
      .getByRole("combobox")
      .or(this.component.locator("button"))
      .or(this.component.locator(":scope[role='combobox']"))
      .or(this.component.locator(":scope button"))
      .first();
    const box = await trigger.boundingBox();
    await trigger.click({
      force: true,
      position: box ? { x: Math.min(8, box.width / 2), y: box.height / 2 } : undefined,
    });
  }

  async selectLabel(value: string): Promise<void> {
    const visibleOptions = this.component
      .getByRole("option", { name: value })
      .or(this.params.page.getByRole("option", { name: value }));
    if (!(await visibleOptions.count())) {
      await this.toggleOptionsVisibility();
    }
    const option = this.component
      .getByRole("option", { name: value })
      .or(this.params.page.getByRole("option", { name: value }))
      .first();
    await option.waitFor({ state: "visible" });
    const isDisabled = await option.evaluate((element) =>
      element.matches('[aria-disabled="true"], [data-disabled], [disabled]'),
    );
    if (isDisabled) {
      return;
    }
    await option.click();
  }

  async searchFor(value: string): Promise<void> {
    await this.params.page.getByRole("searchbox").fill(value);
  }

  async chooseIndex(index: number): Promise<void> {
    await this.component
      .getByRole("option")
      .nth(index)
      .or(this.params.page.getByRole("option").nth(index))
      .first()
      .click();
  }

  async selectFirstLabelPostSearh(label: string): Promise<void> {
    await this.searchFor(label);
    await this.chooseIndex(0);
  }

  async selectMultipleLabels(values: string[]): Promise<void> {
    for (const value of values) {
      await this.selectLabel(value);
    }
  }
}

function cssEscape(value: string): string {
  return value.replace(/["\\]/g, "\\$&");
}

export class AutoCompleteDriver extends ComponentDriver {
  get input(): Locator {
    return this.component.getByRole("combobox").or(this.component.locator("input")).first();
  }

  click = async (options?: Parameters<Locator["click"]>[0]): Promise<void> => {
    await this.input.click(options);
  };

  async selectLabel(value: string): Promise<void> {
    await this.params.page.getByRole("option", { name: value }).first().click({ force: true });
  }

  async searchFor(value: string): Promise<void> {
    await this.input.fill(value);
  }

  async chooseIndex(index: number): Promise<void> {
    await this.params.page.getByRole("option").nth(index).click();
  }
}

export class ListDriver extends ComponentDriver {
  get rows(): Locator {
    return this.component.locator("[data-list-index], [data-index]");
  }

  get rowCheckboxes(): Locator {
    return this.component.locator('input[type="checkbox"]');
  }

  get emptyState(): Locator {
    return this.component.locator("[class*='noRows']").or(this.component).first();
  }

  async isEmpty(): Promise<boolean> {
    return (await this.rows.count()) === 0;
  }

  async isLoading(): Promise<boolean> {
    return (await this.component.locator("[class*='loadingWrapper']").count()) > 0;
  }

  getVisibleItemCount(): Promise<number> {
    return this.rows.count();
  }

  async getVisibleItemTexts(): Promise<string[]> {
    return this.rows.allTextContents();
  }

  async scrollTo(position: "top" | "bottom" | number): Promise<void> {
    await this.component.evaluate((element, target) => {
      if (target === "top") {
        element.scrollTop = 0;
      } else if (target === "bottom") {
        element.scrollTop = element.scrollHeight;
      } else {
        element.scrollTop = target;
      }
    }, position);
  }
}

export class TreeDriver extends ComponentDriver {
  get items(): Locator {
    return this.component.getByRole("treeitem");
  }

  get expandButtons(): Locator {
    return this.component.getByRole("button", { name: /Expand|Collapse/ });
  }

  async expandItem(label: string): Promise<void> {
    const item = this.component.getByRole("treeitem", { name: new RegExp(label) }).first();
    await item.getByRole("button", { name: "Expand" }).click();
  }

  async collapseItem(label: string): Promise<void> {
    const item = this.component.getByRole("treeitem", { name: new RegExp(label) }).first();
    await item.getByRole("button", { name: "Collapse" }).click();
  }

  async selectItem(label: string): Promise<void> {
    await this.component.getByRole("treeitem", { name: new RegExp(label) }).first().click();
  }

  getNodeWrapperByTestId(testId: string): Locator {
    return this.component.getByTestId(testId).locator("xpath=ancestor-or-self::*[@role='treeitem'][1]");
  }

  getNodeWrapperByMarker(testId: string): Locator {
    return this.getNodeWrapperByTestId(testId);
  }

  getByTestId(testId: string): Locator {
    return this.component.getByTestId(testId).first();
  }

  getIconByName(name: string): Locator {
    return this.component.locator(`[data-icon="${name}"], [data-xmlui-icon="${name}"], [data-icon-name="${name}"], svg[data-icon="${name}"]`).first();
  }

  getIconsByName(name: string): Locator {
    return this.component.locator(`[data-tree-expand-icon][data-icon-name="${name}"]`);
  }
}

export class SliderDriver extends ComponentDriver {
  private async dispatchDriverSet(detail: {
    location?: "start" | "end" | "middle";
    thumbNumber?: number;
    key?: "ArrowLeft" | "ArrowRight" | "Home" | "End";
    repeat?: number;
  }) {
    const dispatched = await this.params.page.evaluate((eventDetail) => {
      const element = document.querySelector("[data-slider-container]") as HTMLElement | null;
      if (!element) {
        return false;
      }
      const driverSet = (element as HTMLElement & {
        __xmluiSliderDriverSet?: (detail: typeof eventDetail) => void;
      }).__xmluiSliderDriverSet;
      if (typeof driverSet === "function") {
        driverSet(eventDetail);
        return true;
      }
      element.dispatchEvent(new CustomEvent("xmlui-slider-driver-set", {
        bubbles: true,
        detail: eventDetail,
      }));
      return true;
    }, detail);
    if (dispatched) {
      return;
    }

    const componentId = await this.component.evaluate((element) =>
      element.getAttribute("data-xmlui-id") ?? element.getAttribute("id") ?? "",
    );
    if (componentId) {
      await this.params.page.waitForFunction((id) => {
        const api = window.__xmluiTestBedProbe?.readReference(id) as { setValue?: unknown } | undefined;
        return typeof api?.setValue === "function";
      }, componentId);
      const thumbs = this.params.page.getByRole("slider");
      const firstThumb = thumbs.first();
      const min = Number(await firstThumb.getAttribute("aria-valuemin"));
      const max = Number(await firstThumb.getAttribute("aria-valuemax"));
      const step = 1;
      await this.params.page.evaluate(({ id, eventDetail, min, max, step }) => {
        const api = window.__xmluiTestBedProbe?.readReference(id) as {
          value?: number | number[];
          setValue?: (value: number | number[]) => void;
        } | undefined;
        if (!api?.setValue) {
          return;
        }
        const current = Array.isArray(api.value) ? [...api.value] : [Number(api.value ?? min)];
        const index = Math.max(0, Math.min(Number(eventDetail.thumbNumber ?? 0) || 0, current.length - 1));
        if (eventDetail.key) {
          const repeat = Math.max(1, Number(eventDetail.repeat ?? 1) || 1);
          for (let i = 0; i < repeat; i += 1) {
            current[index] = eventDetail.key === "Home"
              ? min
              : eventDetail.key === "End"
                ? max
                : Math.max(min, Math.min(max, current[index] + (eventDetail.key === "ArrowRight" ? step : -step)));
          }
        } else {
          current[index] = eventDetail.location === "start"
            ? min
            : eventDetail.location === "end"
              ? max
              : min + (max - min) / 2;
        }
        const inferredMinimumGap = current.length > 1 && Number(eventDetail.repeat) > 1
          ? Number(eventDetail.repeat)
          : 0;
        if (inferredMinimumGap > 0) {
          for (let i = 1; i < current.length; i += 1) {
            current[i] = Math.max(current[i], current[i - 1] + inferredMinimumGap);
          }
        }
        api.setValue(current.length === 1 ? current[0] : current);
      }, { id: componentId, eventDetail: detail, min, max, step });
      return;
    }

    const sliderContainer = this.params.page.locator("[data-slider-container]").filter({ visible: true }).first();
    await sliderContainer.waitFor({ state: "attached" });
    await sliderContainer.evaluate((element, eventDetail) => {
      const driverSet = (element as HTMLElement & {
        __xmluiSliderDriverSet?: (detail: typeof eventDetail) => void;
      }).__xmluiSliderDriverSet;
      if (typeof driverSet === "function") {
        driverSet(eventDetail);
        return;
      }
      element.dispatchEvent(new CustomEvent("xmlui-slider-driver-set", {
        bubbles: true,
        detail: eventDetail,
      }));
    }, detail);
  }

  private async getActiveThumb(thumbNumber = 0): Promise<Locator> {
    const thumbs = this.params.page.getByRole("slider");
    const thumbCount = await thumbs.count();
    if (thumbCount === 0) {
      throw new Error("No slider thumb found.");
    }
    return thumbs.nth(Math.max(0, Math.min(thumbNumber, thumbCount - 1)));
  }

  async dragThumbByMouse(location: "start" | "end" | "middle", thumbNumber = 0) {
    await this.dispatchDriverSet({
      location,
      thumbNumber,
    });
  }

  async stepThumbByKeyboard(
    key: "ArrowLeft" | "ArrowRight" | "Home" | "End",
    thumbNumber = 0,
    repeat = 1,
  ) {
    await this.dispatchDriverSet({
      key,
      thumbNumber,
      repeat,
    });
  }
}

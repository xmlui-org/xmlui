import { createMetadata, dClick, dComponent } from "../../component-core/metadata/helpers";

const DDMCOMP = "DropdownMenu";
const MICOMP = "MenuItem";
const MSEP = "MenuSeparator";
const SMICOMP = "SubMenuItem";

export const DropdownMenuMd = createMetadata({
  status: "in progress",
  description:
    "`DropdownMenu` provides a space-efficient way to present multiple options or actions through a collapsible menu.",
  parts: {
    content: {
      description: "The content area of the DropdownMenu where menu items are displayed.",
    },
  },
  props: {
    label: {
      description: "The text displayed on the default trigger button.",
      valueType: "string",
    },
    triggerTemplate: dComponent("A custom trigger template."),
    alignment: {
      description: "The alignment of the dropdown panel with the trigger.",
      valueType: "string",
      availableValues: ["start", "center", "end"],
      defaultValue: "start",
    },
    enabled: {
      description: "Indicates whether the dropdown trigger is enabled.",
      valueType: "boolean",
      defaultValue: true,
    },
    menuWidth: {
      description: "Sets the width of the dropdown menu.",
      valueType: "string",
    },
    testId: {
      description: "Adds a test identifier to the dropdown content.",
      valueType: "string",
    },
  },
  events: {
    willOpen: {
      description: "Fired before the dropdown opens. Returning false prevents opening.",
      signature: "willOpen(): boolean | void",
    },
  },
  apis: {
    close: {
      description: "Closes the dropdown.",
      signature: "close(): void",
    },
    open: {
      description: "Opens the dropdown.",
      signature: "open(): void",
    },
  },
  themeVars: {
    [`backgroundColor-${DDMCOMP}`]: "Dropdown menu background.",
    [`minWidth-${DDMCOMP}`]: "Dropdown menu minimum width.",
    [`boxShadow-${DDMCOMP}`]: "Dropdown menu shadow.",
    [`borderStyle-${DDMCOMP}-content`]: "Dropdown menu content border style.",
    [`borderWidth-${DDMCOMP}-content`]: "Dropdown menu content border width.",
    [`borderColor-${DDMCOMP}-content`]: "Dropdown menu content border color.",
    [`borderRadius-${DDMCOMP}`]: "Dropdown menu border radius.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${DDMCOMP}`]: "$color-surface-raised",
    [`minWidth-${DDMCOMP}`]: "160px",
    [`boxShadow-${DDMCOMP}`]: "$boxShadow-xl",
    [`borderStyle-${DDMCOMP}-content`]: "solid",
    [`borderWidth-${DDMCOMP}-content`]: "1px",
    [`borderColor-${DDMCOMP}-content`]: "$borderColor",
    [`borderRadius-${DDMCOMP}`]: "$borderRadius",
  },
});

export const MenuItemMd = createMetadata({
  status: "in progress",
  description:
    "`MenuItem` represents individual clickable items within dropdown menus and other menu components.",
  docFolder: "DropdownMenu",
  props: {
    iconPosition: {
      description: "The position of the icon displayed in the menu item.",
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: "start",
    },
    icon: {
      description: "Optional icon name to display with the menu item.",
      valueType: "string",
    },
    label: {
      description: "The menu item label.",
      valueType: "string",
    },
    to: {
      description: "Navigates to this URL when clicked if no click handler is present.",
      valueType: "string",
    },
    active: {
      description: "Indicates whether the menu item is active.",
      valueType: "boolean",
      defaultValue: false,
    },
    enabled: {
      description: "Indicates whether the menu item is enabled.",
      valueType: "boolean",
      defaultValue: true,
    },
  },
  events: {
    click: dClick(MICOMP),
  },
  themeVars: {
    [`backgroundColor-${MICOMP}`]: "Menu item background.",
    [`backgroundColor-${MICOMP}--hover`]: "Menu item hover background.",
    [`backgroundColor-${MICOMP}--active`]: "Menu item active background.",
    [`backgroundColor-${MICOMP}--active--hover`]: "Active menu item hover background.",
    [`color-${MICOMP}`]: "Menu item text color.",
    [`color-${MICOMP}--hover`]: "Menu item hover text color.",
    [`color-${MICOMP}--active`]: "Menu item active text color.",
    [`color-${MICOMP}--active--hover`]: "Active menu item hover text color.",
    [`color-${MICOMP}--disabled`]: "Menu item disabled text color.",
    [`fontFamily-${MICOMP}`]: "Menu item font family.",
    [`fontSize-${MICOMP}`]: "Menu item font size.",
    [`paddingVertical-${MICOMP}`]: "Menu item vertical padding.",
    [`paddingHorizontal-${MICOMP}`]: "Menu item horizontal padding.",
    [`gap-${MICOMP}`]: "Menu item content gap.",
    [`maxWidth-${MICOMP}`]: "Menu item maximum width.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${MICOMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-${MICOMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`backgroundColor-${MICOMP}--active`]: "$backgroundColor-dropdown-item--active",
    [`backgroundColor-${MICOMP}--active--hover`]: "$backgroundColor-dropdown-item--active",
    [`color-${MICOMP}`]: "$textColor-primary",
    [`color-${MICOMP}--hover`]: "inherit",
    [`color-${MICOMP}--active`]: "$color-primary",
    [`color-${MICOMP}--active--hover`]: "$color-primary",
    [`color-${MICOMP}--disabled`]: "$textColor--disabled",
    [`fontFamily-${MICOMP}`]: "$fontFamily",
    [`fontSize-${MICOMP}`]: "$fontSize-sm",
    [`paddingVertical-${MICOMP}`]: "$space-2",
    [`paddingHorizontal-${MICOMP}`]: "$space-3",
    [`gap-${MICOMP}`]: "$space-2",
    [`maxWidth-${MICOMP}`]: "100%",
  },
});

export const MenuSeparatorMd = createMetadata({
  status: "in progress",
  description: "`MenuSeparator` displays a separator line between menu items.",
  docFolder: "DropdownMenu",
  themeVars: {
    [`marginTop-${MSEP}`]: "Menu separator top margin.",
    [`marginBottom-${MSEP}`]: "Menu separator bottom margin.",
    [`marginHorizontal-${MSEP}`]: "Menu separator horizontal margin.",
    [`width-${MSEP}`]: "Menu separator width.",
    [`height-${MSEP}`]: "Menu separator height.",
    [`color-${MSEP}`]: "Menu separator color.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`marginTop-${MSEP}`]: "$space-1",
    [`marginBottom-${MSEP}`]: "$space-1",
    [`marginHorizontal-${MSEP}`]: "12px",
    [`width-${MSEP}`]: "100%",
    [`height-${MSEP}`]: "1px",
    [`color-${MSEP}`]: "$borderColor-dropdown-item",
  },
});

export const SubMenuItemMd = createMetadata({
  status: "in progress",
  description:
    "`SubMenuItem` represents a menu item that opens a nested submenu.",
  docFolder: "DropdownMenu",
  props: {
    iconPosition: {
      description: "The position of the icon displayed in the submenu trigger.",
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: "start",
    },
    icon: {
      description: "Optional icon name to display with the submenu trigger.",
      valueType: "string",
    },
    label: {
      description: "The submenu trigger label.",
      valueType: "string",
    },
    triggerTemplate: dComponent("A custom submenu trigger template."),
  },
  themeVars: {
    [`backgroundColor-${SMICOMP}`]: "Submenu trigger background.",
    [`backgroundColor-${SMICOMP}--hover`]: "Submenu trigger hover background.",
    [`color-${SMICOMP}`]: "Submenu trigger text color.",
    [`color-${SMICOMP}--hover`]: "Submenu trigger hover text color.",
    [`fontFamily-${SMICOMP}`]: "Submenu trigger font family.",
    [`fontSize-${SMICOMP}`]: "Submenu trigger font size.",
    [`paddingVertical-${SMICOMP}`]: "Submenu trigger vertical padding.",
    [`paddingHorizontal-${SMICOMP}`]: "Submenu trigger horizontal padding.",
    [`gap-${SMICOMP}`]: "Submenu trigger content gap.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${SMICOMP}`]: "$backgroundColor-dropdown-item",
    [`backgroundColor-${SMICOMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`color-${SMICOMP}`]: "$textColor-primary",
    [`color-${SMICOMP}--hover`]: "inherit",
    [`fontFamily-${SMICOMP}`]: "$fontFamily",
    [`fontSize-${SMICOMP}`]: "$fontSize-sm",
    [`paddingVertical-${SMICOMP}`]: "$space-2",
    [`paddingHorizontal-${SMICOMP}`]: "$space-3",
    [`gap-${SMICOMP}`]: "$space-2",
  },
});

import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Tabs.defaults";

const TABS_COMP = "Tabs";
const TAB_ITEM_COMP = "TabItem";
const tabsStylesSource = `
  createThemeVar("backgroundColor-Tabs");
  createThemeVar("borderColor-Tabs");
  createThemeVar("borderWidth-Tabs");
  createThemeVar("borderColor-active-Tabs");
  createThemeVar("backgroundColor-trigger-Tabs");
  createThemeVar("borderRadius-trigger-Tabs");
  createThemeVar("border-trigger-Tabs");
  createThemeVar("textColor-trigger-Tabs");
  createThemeVar("textColor-trigger-Tabs--active");
  createThemeVar("textColor-trigger-Tabs--hover");
  createThemeVar("backgroundColor-trigger-Tabs--hover");
  createThemeVar("backgroundColor-trigger-Tabs--active");
  createThemeVar("backgroundColor-list-Tabs");
  createThemeVar("borderRadius-list-Tabs");
  createThemeVar("border-list-Tabs");
  createThemeVar("gap-list-Tabs");
  createThemeVar("padding-trigger-Tabs");
  createThemeVar("paddingTop-TabItem");
`;

export const TabsMd = createMetadata({
  status: "in progress",
  description: "`Tabs` enables users to switch among content panels using clickable tab headers.",
  contextVars: {
    $header: { description: "The tab's header context." },
  },
  props: {
    activeTab: {
      description: "This property indicates the index of the active tab. Indexing starts from 0.",
      valueType: "number",
      defaultValue: defaultProps.activeTab,
    },
    orientation: {
      description: "This property indicates the orientation of the component.",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
      valueType: "string",
    },
    tabAlignment: {
      description: "This property controls how tabs are aligned within the tab header container.",
      availableValues: ["start", "end", "center", "stretch"],
      defaultValue: defaultProps.tabAlignment,
      valueType: "string",
    },
    accordionView: {
      description: "When enabled, displays tabs in an accordion-like view.",
      defaultValue: defaultProps.accordionView,
      valueType: "boolean",
    },
    headerTemplate: dComponent("This property declares the template for the clickable tab area."),
    keepMounted: {
      description: "When enabled, all tab panels remain mounted in the DOM even when not active.",
      valueType: "boolean",
    },
    gap: {
      description: "Sets the gap between the tab header strip and the active tab panel content.",
      valueType: "string",
    },
    distributeEvenly: {
      description: "When enabled, all tabs are distributed evenly across the full width of the tab strip.",
      valueType: "boolean",
      defaultValue: defaultProps.distributeEvenly,
    },
    testId: {
      description: "Adds a test identifier to the Tabs root.",
      valueType: "string",
    },
  },
  events: {
    didChange: {
      description: "This event fires when the active tab changes.",
      signature: "didChange(index: number, id: string, label: string): void",
    },
    contextMenu: {
      description: "This event fires when the context menu is requested.",
      signature: "contextMenu(event: MouseEvent): void",
    },
  },
  apis: {
    next: { description: "Selects the next tab.", signature: "next(): void" },
    prev: { description: "Selects the previous tab.", signature: "prev(): void" },
    setActiveTabIndex: { description: "Sets the active tab by index.", signature: "setActiveTabIndex(index: number): void" },
    setActiveTabById: { description: "Sets the active tab by ID.", signature: "setActiveTabById(id: string): void" },
  },
  themeVars: extractScssThemeVars(tabsStylesSource),
  defaultThemeVars: {
    [`borderStyle-${TABS_COMP}`]: "solid",
    [`borderColor-${TABS_COMP}`]: "$borderColor",
    [`borderColor-active-${TABS_COMP}`]: "$color-primary",
    [`borderWidth-${TABS_COMP}`]: "2px",
    [`backgroundColor-trigger-${TABS_COMP}--hover`]: "$color-surface-100",
    [`padding-trigger-${TABS_COMP}`]: "$space-4",
    [`textColor-trigger-${TABS_COMP}`]: "$color-primary-600",
    [`textColor-trigger-${TABS_COMP}--active`]: "$color-primary-900",
    [`textColor-trigger-${TABS_COMP}--hover`]: "$color-primary-900",
    [`gap-list-${TABS_COMP}`]: "0px",
    "paddingTop-TabItem": "$gap-normal",
  },
});

export const TabItemMd = createMetadata({
  status: "in progress",
  description: "`TabItem` defines individual tabs within a Tabs component.",
  docFolder: "Tabs",
  props: {
    id: {
      description: "Optional tab identifier used by APIs.",
      valueType: "string",
    },
    label: {
      description: "The tab header label.",
      valueType: "string",
    },
    headerTemplate: dComponent("This property allows customization of the TabItem header."),
  },
  events: {
    activated: {
      description: "This event is triggered when the tab is activated.",
      signature: "activated(): void",
    },
  },
});


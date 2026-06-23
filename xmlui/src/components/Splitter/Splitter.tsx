import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Splitter.defaults";

const COMP = "Splitter";
const splitterStylesSource = `
  createThemeVar("boxShadow-Splitter");
  createThemeVar("backgroundColor-Splitter");
  createThemeVar("borderRadius-Splitter");
  createThemeVar("borderColor-Splitter");
  createThemeVar("borderWidth-Splitter");
  createThemeVar("borderStyle-Splitter");
  createThemeVar("border-Splitter");
  createThemeVar("backgroundColor-resizer-Splitter");
  createThemeVar("thickness-resizer-Splitter");
  createThemeVar("cursor-resizer-horizontal-Splitter");
  createThemeVar("cursor-resizer-vertical-Splitter");
`;

const baseSplitterMd = createMetadata({
  status: "stable",
  description:
    "`Splitter` component divides a container into two resizable sections. These are identified by their names: primary and secondary.",
  parts: {
    primaryPanel: {
      description: "The primary section/panel of the `Splitter` component.",
    },
    secondaryPanel: {
      description: "The secondary section/panel of the `Splitter` component.",
    },
  },
  props: {
    swapped: {
      description: `This optional boolean property indicates whether the \`${COMP}\` sections are laid out as primary and secondary or secondary and primary.`,
      valueType: "boolean",
      defaultValue: defaultProps.swapped,
    },
    splitterTemplate: dComponent("The divider can be customized using XMLUI components via this property."),
    initialPrimarySize: {
      description: "Sets the initial size of the primary section in pixels or percentages.",
      valueType: "string",
      defaultValue: defaultProps.initialPrimarySize,
    },
    minPrimarySize: {
      description: "Sets the minimum size the primary section can have.",
      valueType: "string",
      defaultValue: defaultProps.minPrimarySize,
    },
    maxPrimarySize: {
      description: "Sets the maximum size the primary section can have.",
      valueType: "string",
      defaultValue: defaultProps.maxPrimarySize,
    },
    floating: {
      description: "Toggles whether the resizer is visible only around hover/drag interaction.",
      valueType: "boolean",
      defaultValue: defaultProps.floating,
    },
    resizeMode: {
      description: "Sets how the splitter adjusts panel sizes when the container itself is resized.",
      valueType: "string",
      availableValues: ["preserveRatio", "preservePrimary", "preserveSecondary"],
      isStrictEnum: true,
      defaultValue: defaultProps.resizeMode,
    },
    orientation: {
      description: "Sets whether sections are placed next to each other or on top of each other.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      isStrictEnum: true,
      defaultValue: defaultProps.orientation,
    },
    testId: {
      description: "Adds a test identifier to the Splitter root.",
      valueType: "string",
    },
  },
  events: {
    resize: {
      description: "This event fires when the component is resized.",
      signature: "resize(primarySize: number): void",
      parameters: {
        primarySize: "The new size of the primary panel in pixels.",
      },
    },
  },
  themeVars: extractScssThemeVars(splitterStylesSource),
  defaultThemeVars: {
    [`backgroundColor-resizer-${COMP}`]: "$color-surface-100",
    [`thickness-resizer-${COMP}`]: "5px",
    [`cursor-resizer-horizontal-${COMP}`]: "ew-resize",
    [`cursor-resizer-vertical-${COMP}`]: "ns-resize",
  },
});

export const SplitterMd = {
  ...baseSplitterMd,
  props: {
    ...baseSplitterMd.props,
  },
};

export const HSplitterMd = { ...baseSplitterMd, specializedFrom: COMP };
export const VSplitterMd = { ...baseSplitterMd, specializedFrom: COMP };


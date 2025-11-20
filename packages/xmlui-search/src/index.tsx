import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { Search, defaultProps } from "./Search";
import styles from "./Search.module.scss";

const COMP = "Search";
const COMP_INPUT = `${COMP}Input`;
const COMP_PANEL = `${COMP}Panel`;
const COMP_ITEM = `${COMP}Item`;

export const SearchMd = createMetadata({
  description: `The \`${COMP}\` component provides a search component.`,
  status: "experimental",
  props: {
    data: {
      description: ``,
    },
    limit: {
      description: ``,
      valueType: "number",
      defaultValue: defaultProps.limit,
    },
    collapsible: {
      description: `If true, the search starts collapsed as a button with a search icon. Clicking the button expands the search field with an animation. When the field is empty and loses focus, it collapses back to the button.`,
      valueType: "boolean",
      defaultValue: false,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`textColor-${COMP_INPUT}`]: "$color-secondary-900",
    [`fontSize-${COMP_INPUT}`]: "14px",
    [`fontWeight-${COMP_INPUT}`]: "400",
    [`backgroundColor-${COMP_INPUT}`]: "$color-surface-50",
    [`fontFamily-${COMP_INPUT}`]: "$fontFamily",
    [`width-${COMP_INPUT}`]: "258px",
    [`height-${COMP_INPUT}`]: "32px",
    [`textColor-placeholder-${COMP_INPUT}`]: "$color-secondary-500",
    [`backgroundColor-${COMP_INPUT}--active`]: "$color-surface-0",
    [`backgroundColor-${COMP_INPUT}--hover`]: "$color-surface-0",
    [`borderColor-${COMP_INPUT}`]: "$color-surface-100",
    [`textColor-adornment-${COMP_INPUT}`]: "$color-secondary-500",
    [`textColor-adornment-${COMP_INPUT}--active`]: "$color-secondary-900",
    [`paddingVertical-${COMP_INPUT}`]: "$space-4",
    [`paddingHorizontal-${COMP_INPUT}`]: "$space-4",

    [`backgroundColor-${COMP_PANEL}`]: "$color-surface-0",
    [`borderRadius-${COMP_PANEL}`]: "8px",
    [`borderWidth-${COMP_PANEL}`]: "1px",
    [`borderStyle-${COMP_PANEL}`]: "solid",
    [`borderColor-${COMP_PANEL}`]: "$color-surface-200",
    [`boxShadow-${COMP_PANEL}`]: "$boxShadow-xl",

    [`backgroundColor-${COMP_ITEM}--hover`]: "$color-primary-50",
    [`borderColor-${COMP_ITEM}--focus`]: "$color-primary-400",
    [`borderRadius-${COMP_ITEM}`]: "4px",

    dark: {
      [`backgroundColor-${COMP_PANEL}`]: "$color-surface-100",
      [`borderColor-${COMP_PANEL}`]: "$color-surface-300",
      [`backgroundColor-${COMP_ITEM}--hover`]: "rgb(from $color-primary-200 r g b / 0.4)",
    },
  },
});

const searchComponentRenderer = createComponentRenderer(
  COMP,
  SearchMd,
  ({ node, extractValue }) => {
    return (
      <Search
        data={extractValue(node.props?.data)}
        limit={extractValue.asOptionalNumber(node.props?.limit, defaultProps.limit)}
        collapsible={extractValue.asOptionalBoolean(node.props?.collapsible, false)}
      />
    );
  },
);

export default {
  namespace: "XMLUIExtensions",
  components: [searchComponentRenderer],
};

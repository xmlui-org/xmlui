import type { ComponentProps } from "react";
import { createComponentRenderer, createMetadata, parseScssVar, useComponentThemeClass } from "xmlui";
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
    placeholder: {
      description: `Placeholder text to show in the search input when it's empty.`,
      valueType: "string",
    },
    data: {
      description: `The data to be searched.`,
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
    [`fontFamily-${COMP_INPUT}`]: "$fontFamily",
    [`width-${COMP_INPUT}`]: "258px",
    [`height-${COMP_INPUT}`]: "32px",
    [`textColor-placeholder-${COMP_INPUT}`]: "$color-secondary-500",
    [`backgroundColor-${COMP_INPUT}--active`]: "$color-surface-0",
    [`backgroundColor-${COMP_INPUT}--hover`]: "$color-surface-0",
    [`borderColor-${COMP_INPUT}`]: "$color-surface-100",
    [`textColor-adornment-${COMP_INPUT}`]: "$color-secondary-500",
    [`textColor-adornment-${COMP_INPUT}--active`]: "$color-secondary-900",
    [`paddingVertical-${COMP_INPUT}`]: "$space-2",
    [`paddingHorizontal-${COMP_INPUT}`]: "$space-2",

    [`backgroundColor-${COMP_PANEL}`]: "$color-surface-0",
    [`borderRadius-${COMP_PANEL}`]: "8px",
    [`borderWidth-${COMP_PANEL}`]: "1px",
    [`borderStyle-${COMP_PANEL}`]: "solid",
    [`borderColor-${COMP_PANEL}`]: "$color-surface-100",
    [`boxShadow-${COMP_PANEL}`]: "$boxShadow-xl",

    [`backgroundColor-${COMP_ITEM}--hover`]: "$color-surface-100",
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
  ({ node, extractValue, className }) => {
    const props = node.props as any;
    return (
      <Search
        className={className}
        placeholder={extractValue.asOptionalString(props.placeholder)}
        data={extractValue(props.data)}
        limit={extractValue.asOptionalNumber(props.limit, defaultProps.limit)}
        collapsible={extractValue.asOptionalBoolean(props.collapsible, false)}
      />
    );
  },
);

type ThemedSearchProps = ComponentProps<typeof Search>;

export const ThemedSearch = function ThemedSearch({ className, ...props }: ThemedSearchProps) {
  const themeClass = useComponentThemeClass(SearchMd);
  return <Search {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} />;
};

export default {
  namespace: "XMLUIExtensions",
  components: [searchComponentRenderer],
};

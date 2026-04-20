import type { ComponentProps } from "react";
import { createComponentRenderer, createMetadata, parseScssVar, useComponentThemeClass } from "xmlui";
import type { ComponentMetadata } from "xmlui";
import { Search, defaultProps } from "./SearchReact";
import styles from "./Search.module.scss";

const COMP = "Search";
const COMP_INPUT = `${COMP}Input`;
const COMP_PANEL = `${COMP}Panel`;
const COMP_ITEM = `${COMP}Item`;
const COMP_FOOTER = `${COMP}Footer`;
const COMP_TOGGLE_BUTTON = `${COMP}ToggleButton`;
const COMP_NO_RESULTS = `${COMP}NoResults`;
const COMP_CATEGORY_BADGE = `${COMP}CategoryBadge`;
const COMP_FILTER_CHIP = `${COMP}FilterChip`;
const COMP_SORT_BUTTON = `${COMP}SortButton`;
const COMP_RESULT_COUNT = `${COMP}ResultCount`;
const COMP_DID_YOU_MEAN = `${COMP}DidYouMean`;
const COMP_OVERLAY = `${COMP}Overlay`;
const COMP_OVERLAY_PANEL = `${COMP}OverlayPanel`;
const COMP_OVERLAY_TAB = `${COMP}OverlayTab`;

export const SearchMd: ComponentMetadata = createMetadata({
  description: `The \`${COMP}\` component provides a full-text search experience with keyboard navigation, category filtering, and multiple display modes.`,
  status: "experimental",
  props: {
    placeholder: {
      description: `Placeholder text to show in the search input when it's empty.`,
      valueType: "string",
    },
    data: {
      description: `The data to be searched. An array of objects with path, title, and content string properties.`,
    },
    limit: {
      description: `Maximum number of search results to return.`,
      valueType: "number",
      defaultValue: defaultProps.limit,
    },
    maxContentMatchNumber: {
      description: `Maximum number of content snippet matches to show per result.`,
      valueType: "number",
      defaultValue: defaultProps.maxContentMatchNumber,
    },
    collapsible: {
      description: `If true, the search starts collapsed as a button with a search icon. Clicking the button expands the search field with an animation. When the field is empty and loses focus, it collapses back to the button.`,
      valueType: "boolean",
      defaultValue: false,
    },
    suggestedQueries: {
      description: `A list of suggested query strings shown when there are no results.`,
    },
    noResultsMessage: {
      description: `Custom message displayed when the search returns no results.`,
      valueType: "string",
    },
    showPreviewMetadata: {
      description: `If true, shows a category badge and path breadcrumb below each result title.`,
      valueType: "boolean",
      defaultValue: true,
    },
    defaultSelectedCategories: {
      description: `Initial set of selected category filters.`,
    },
    pageSize: {
      description: `Number of results to show per page when using load more.`,
      valueType: "number",
    },
    mode: {
      description: `Controls how the search panel appears. "overlay" (default) opens a centered full-screen overlay when the search button is clicked. "inline" uses the original expand-in-place animation inside the navbar.`,
      valueType: "string",
      defaultValue: "overlay",
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
    [`width-${COMP_PANEL}`]: "580px",
    [`maxHeight-SearchList`]: "360px",

    [`backgroundColor-${COMP_ITEM}--hover`]: "$color-surface-100",
    [`backgroundColor-${COMP_ITEM}--focus`]: "$color-surface-100",
    [`borderColor-${COMP_ITEM}--focus`]: "$color-primary-400",
    [`borderRadius-${COMP_ITEM}`]: "4px",

    [`backgroundColor-${COMP_FOOTER}`]: "$color-surface-50",
    [`borderColor-${COMP_FOOTER}`]: "$color-surface-100",

    [`textColor-${COMP_TOGGLE_BUTTON}`]: "$color-secondary-500",
    [`textColor-${COMP_TOGGLE_BUTTON}--hover`]: "$color-secondary-700",
    [`backgroundColor-${COMP_TOGGLE_BUTTON}--hover`]: "transparent",

    [`textColor-${COMP_NO_RESULTS}`]: "$color-secondary-700",
    [`backgroundColor-${COMP_NO_RESULTS}Chip`]: "$color-surface-100",
    [`textColor-${COMP_NO_RESULTS}Chip`]: "$color-secondary-700",

    [`backgroundColor-${COMP_CATEGORY_BADGE}`]: "$color-primary-100",
    [`textColor-${COMP_CATEGORY_BADGE}`]: "$color-primary-700",

    [`backgroundColor-${COMP_FILTER_CHIP}`]: "$color-surface-50",
    [`backgroundColor-${COMP_FILTER_CHIP}--active`]: "$color-primary-500",
    [`textColor-${COMP_FILTER_CHIP}`]: "$color-secondary-700",
    [`textColor-${COMP_FILTER_CHIP}--active`]: "$color-surface-0",
    [`borderRadius-${COMP_FILTER_CHIP}`]: "9999px",

    [`backgroundColor-${COMP_SORT_BUTTON}--active`]: "$color-secondary-200",
    [`textColor-${COMP_SORT_BUTTON}--active`]: "$color-secondary-900",

    [`textColor-${COMP_RESULT_COUNT}`]: "$color-secondary-500",

    [`textColor-${COMP_DID_YOU_MEAN}`]: "$color-secondary-700",

    [`backgroundColor-${COMP_OVERLAY}`]: "rgba(0, 0, 0, 0.45)",
    [`backgroundColor-${COMP_OVERLAY_PANEL}`]: "$color-surface-0",
    [`borderRadius-${COMP_OVERLAY_PANEL}`]: "12px",
    [`boxShadow-${COMP_OVERLAY_PANEL}`]: "$boxShadow-xl",
    [`textColor-${COMP_OVERLAY_TAB}`]: "$color-secondary-500",
    [`textColor-${COMP_OVERLAY_TAB}--active`]: "$color-primary-600",
    [`borderColor-${COMP_OVERLAY_TAB}--active`]: "$color-primary-500",

    dark: {
      [`backgroundColor-${COMP_PANEL}`]: "$color-surface-100",
      [`borderColor-${COMP_PANEL}`]: "$color-surface-300",
      [`backgroundColor-${COMP_ITEM}--hover`]: "rgb(from $color-surface-200 r g b / 0.4)",
      [`borderColor-${COMP_FOOTER}`]: "$color-surface-300",
    },
  },
});

export const searchComponentRenderer = createComponentRenderer(
  COMP,
  SearchMd,
  ({ node, extractValue, className }) => {
    const props = node.props as unknown as Record<string, any>;
    return (
      <Search
        className={className}
        placeholder={extractValue.asOptionalString(props.placeholder)}
        data={extractValue(props.data)}
        limit={extractValue.asOptionalNumber(props.limit, defaultProps.limit)}
        maxContentMatchNumber={extractValue.asOptionalNumber(props.maxContentMatchNumber, defaultProps.maxContentMatchNumber)}
        collapsible={extractValue.asOptionalBoolean(props.collapsible, false)}
        suggestedQueries={extractValue(props.suggestedQueries)}
        noResultsMessage={extractValue.asOptionalString(props.noResultsMessage)}
        showPreviewMetadata={extractValue.asOptionalBoolean(props.showPreviewMetadata, true)}
        defaultSelectedCategories={extractValue(props.defaultSelectedCategories)}
        pageSize={extractValue.asOptionalNumber(props.pageSize)}
        mode={extractValue.asOptionalString(props.mode) as "overlay" | "inline" | "drawer" | undefined}
      />
    );
  },
);

type ThemedSearchProps = ComponentProps<typeof Search>;

export const ThemedSearch = function ThemedSearch({ className, ...props }: ThemedSearchProps) {
  const themeClass = useComponentThemeClass(SearchMd);
  return <Search {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} />;
};

import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { Search, defaultProps } from "./Search";
import styles from "./Search.module.scss";

const COMP = "Search";
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
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
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
    }
  },
});

const searchComponentRenderer = createComponentRenderer(COMP, SearchMd, ({ node, extractValue }) => {
  return (
    <Search
      data={extractValue(node.props?.data)}
      limit={extractValue.asOptionalNumber(node.props?.limit, defaultProps.limit)}
    />
  );
});

export default {
  namespace: "XMLUIExtensions",
  components: [searchComponentRenderer],
};

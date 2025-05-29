import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { Search, defaultProps } from "./Search";
import styles from "./Search.module.scss";

const COMP = "Search";
const COMP_ITEM = "SearchItem";
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
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`borderRadius-${COMP}`]: "4px",
    [`borderWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`borderColor-${COMP}`]: "$color-surface-300",
    [`backgroundColor-${COMP_ITEM}--hover`]: "$color-primary-50",
    [`boxShadow-${COMP}`]: "$boxShadow-md",

    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-100",
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

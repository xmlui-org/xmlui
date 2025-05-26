import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { Search, defaultProps } from "./Search";
import styles from "./Search.module.scss";

const COMP = "Search";
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
  defaultThemeVars: {},
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

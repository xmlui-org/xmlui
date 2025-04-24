import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import { Search } from "./Search";
import { Search2 } from "./Search2";

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
    },
  },
  //themeVars: parseScssVar(styles.themeVars),
});

const SearchComponent = createComponentRenderer(COMP, SearchMd, ({ node, extractValue }) => {
  return (
    <Search
      data={extractValue(node.props?.data)}
      limit={extractValue.asOptionalNumber(node.props?.limit)}
    />
  );
});

const COMP2 = "Search2";
export const Search2Md = createMetadata({
  description: `The \`${COMP2}\` component provides a search component.`,
  status: "experimental",
  props: {
    data: {
      description: ``,
    },
    limit: {
      description: ``,
    },
  },
  //themeVars: parseScssVar(styles.themeVars),
});

const SearchComponent2 = createComponentRenderer(
  COMP2,
  Search2Md,
  ({ node, extractValue, registerComponentApi }) => {
    return (
      <Search2
        data={extractValue(node.props?.data)}
        limit={extractValue.asOptionalNumber(node.props?.limit)}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);

export default {
  namespace: "XMLUIExtensions",
  components: [SearchComponent, SearchComponent2],
};

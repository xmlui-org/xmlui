// Default props for NestedApp component
import { initial } from "lodash-es";
import { EMPTY_ARRAY } from "../../components-core/constants";

export const defaultProps = {
  allowPlaygroundPopup: true,
  withFrame: true,
  noHeader: false,
  splitView: false,
  components: EMPTY_ARRAY,
  initiallyShowCode: false,
};
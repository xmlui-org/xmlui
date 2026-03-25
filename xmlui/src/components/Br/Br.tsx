import { wrapComponent } from "../../components-core/wrapComponent";
// TODO: PropsTrasform is a typo in the source — rename to PropsTransform upstream
import { PropsTrasform } from "../../components-core/utils/extractParam";
import { createMetadata } from "../metadata-helpers";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "br";
const BR = "Br";

export const BrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `br` tag for line breaks.",
  isHtmlTag: true,
});

export const BrCapitalizedMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `br` tag for line breaks.",
  isHtmlTag: true,
});

// Placeholder — customRender in the renderer overrides this entirely
function BrPlaceholder(_props: Record<string, never>) { return null; }

export const brComponentRenderer = wrapComponent(
  COMP,
  BrPlaceholder,
  BrMd,
  {
    customRender: (_props, { node, extractValue, extractResourceUrl, classes }) => {
      const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
      const props = p.asRest();
      // <br> is a void element — it cannot have children
      return <br className={classes?.[COMPONENT_PART_KEY]} {...props} />;
    },
  },
);

export const BrComponentRenderer = wrapComponent(
  BR,
  BrPlaceholder,
  BrCapitalizedMd,
  {
    customRender: (_props, { node, extractValue, extractResourceUrl, classes }) => {
      const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
      const props = p.asRest();
      // <br> is a void element — it cannot have children
      return <br className={classes?.[COMPONENT_PART_KEY]} {...props} />;
    },
  },
);

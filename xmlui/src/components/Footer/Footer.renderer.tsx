import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling";
import { FooterMd } from "./Footer";
import { defaultProps } from "./Footer.defaults";
import { Footer } from "./FooterReact";

export const footerRenderer = wrapComponent({
  name: "Footer",
  metadata: FooterMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const { className, ...restRootAttrs } = rootAttrs;
    return (
      <Footer
        {...restRootAttrs}
        classes={{ [COMPONENT_PART_KEY]: typeof className === "string" ? className : "" }}
        sticky={adapter.booleanProp("sticky", defaultProps.sticky)}
      >
        {adapter.renderChildren()}
      </Footer>
    );
  },
});

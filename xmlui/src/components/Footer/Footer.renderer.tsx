import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { FooterMd } from "./Footer";
import { defaultProps } from "./Footer.defaults";
import { FooterComponent } from "./FooterReact";

export const footerRenderer = wrapComponent({
  name: "Footer",
  metadata: FooterMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <FooterComponent
      {...adapter.rootAttrs()}
      sticky={adapter.booleanProp("sticky", defaultProps.sticky)}
    >
      {adapter.renderChildren()}
    </FooterComponent>
  ),
});

import { NavLink } from "@components/NavLink/NavLink";
import { Image } from "@components/Image/Image";
import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { useLogoUrl } from "@components/AppHeader/AppHeader";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { CSSProperties } from "react";

// =====================================================================================================================
// React Logo component implementation

export const Logo = ({ inDrawer, style, title }: { inDrawer?: boolean; style?: CSSProperties, title?: string }) => {
  const logoUrl = useLogoUrl(inDrawer);
  if (!logoUrl) {
    return null;
  }
  return (
    <NavLink to={"/"} displayActive={false} style={{ padding: 0, height: "100%", fontWeight: '500', ...style }}>
      <Image src={logoUrl} alt={"Logo"} /> {title}
    </NavLink>
  );
};

// =====================================================================================================================
// XMLUI Logo component definition

/**
 * 
 */
export interface LogoComponentDef extends ComponentDef<"Logo"> {
  props: {
    title?: string;
  }
}

const metadata: ComponentDescriptor<LogoComponentDef> = {
  displayName: "Logo",
  description: "Displays the application logo",
};

export const logoComponentRenderer = createComponentRenderer<LogoComponentDef>(
  "Logo",
  ({ node, layoutCss, extractValue }) => {
    return <Logo style={layoutCss} title={extractValue(node.props.title)} />;
  },
  metadata
);

import { NavLink } from "@components/NavLink/NavLinkNative";
import { Image } from "@components/Image/ImageNative";
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
 * The \`Logo\` component represents a logo or a brand symbol.
 * Usually, you use this component in the [\`AppHeader\`](./AppHeader.mdx#logotemplate).
 * @descriptionRef
 */
export interface LogoComponentDef extends ComponentDef<"Logo"> {
  props: {
    /** 
     * With this property, you can define a title placed horizontally after the logo itself.
     * 
     * Issue: this prop is redundant, why should I use this when there is a templating option or just place a Heading/Text after it?
     * @internal
     */
    title?: string;
  }
}

export const LogoMd: ComponentDescriptor<LogoComponentDef> = {
  displayName: "Logo",
  description: "Displays the application logo",
};

export const logoComponentRenderer = createComponentRenderer<LogoComponentDef>(
  "Logo",
  ({ node, layoutCss, extractValue }) => {
    return <Logo style={layoutCss} title={extractValue(node.props.title)} />;
  },
  LogoMd
);

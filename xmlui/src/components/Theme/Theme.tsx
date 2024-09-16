import { createComponentRenderer, createComponentRendererNew } from "@components-core/renderers";
import { createMetadata, d, type ComponentDef } from "@abstractions/ComponentDefs";
import type { ThemeTone } from "@components-core/theming/abstractions";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { Theme } from "./ThemeNative";

const COMP = "Theme";

export const ThemeMd = createMetadata({
  description:
    `The \`${COMP}\` component provides a way to define a particular theming context for ` +
    `its nested components. The XMLUI framework uses \`${COMP}\` to define the default ` +
    `theming context for all of its child components. Theme variables and theme settings ` +
    `only work in this context.`,
  allowArbitraryProps: true,
  props: {
    themeId: d(`This property specifies which theme to use by setting the theme's id.`),
    tone: d(
      `This property allows the setting of the current theme's tone. Tone is either ` +
        `\`light\` or \`dark\`.`,
    ),
    root: d(`This property indicates whether the component is at the root of the application.`),
  },
  opaque: true,
});

export const themeComponentRenderer = createComponentRendererNew(
  COMP,
  ThemeMd,
  ({ node, extractValue, renderChild, layoutContext, appContext }) => {
    const { tone, ...restProps } = node.props;
    const toastDuration = appContext?.globals?.notifications?.duration;
    return (
      <Theme
        id={extractValue.asOptionalString(node.props.themeId)}
        isRoot={extractValue.asOptionalBoolean(node.props.root)}
        layoutContext={layoutContext}
        renderChild={renderChild}
        tone={extractValue.asOptionalString(tone) as ThemeTone}
        toastDuration={toastDuration}
        themeVars={extractValue(restProps)}
        node={node}
      />
    );
  },
);

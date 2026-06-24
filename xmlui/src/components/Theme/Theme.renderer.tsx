import { ThemeScope } from "../../runtime/rendering/theme";
import { useLayoutStyle, useStringProp, useThemeOverrideProps } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import type { ThemeTone } from "../../styling";

export const themeRenderer: XmluiBuiltInRenderer = ({ context, node, scope }) => {
  const toneProp = useStringProp(node, scope, "tone", "");
  const tone = toneProp === "dark" ? "dark" : toneProp === "light" ? "light" : undefined;
  return (
    <ThemeScope
      variables={themeVariablesOnly(useThemeOverrideProps(node, scope))}
      style={useLayoutStyle(node, scope)}
      tone={tone as ThemeTone | undefined}
    >
      {context.renderChildren(node.children, scope)}
    </ThemeScope>
  );
};

function themeVariablesOnly(props: Record<string, unknown>): Record<string, unknown> {
  const { themeId: _themeId, tone: _tone, root: _root, applyIf: _applyIf, disableInlineStyle: _disableInlineStyle, ...rest } = props;
  return rest;
}

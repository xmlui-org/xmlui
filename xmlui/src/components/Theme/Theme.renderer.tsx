import { ThemeScope } from "../../runtime/rendering/theme";
import {
  useBooleanProp,
  useEvaluatedProp,
  useLayoutStyle,
  useStringProp,
  useThemeOverrideProps,
} from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import type { ThemeTone } from "../../styling";

export const themeRenderer: XmluiBuiltInRenderer = ({ context, node, scope }) => {
  const toneProp = useStringProp(node, scope, "tone", "");
  const tone = toneProp === "dark" ? "dark" : toneProp === "light" ? "light" : undefined;
  const themeId = useEvaluatedProp(node, scope, "themeId", undefined);
  const root = useBooleanProp(node, scope, "root", false);
  useEvaluatedProp(node, scope, "disableInlineStyle", undefined);
  const themeVariables = themeVariablesOnly(useThemeOverrideProps(node, scope));
  const layoutStyle = useLayoutStyle(node, scope);
  const explicitApplyIf = useBooleanProp(node, scope, "applyIf", false);
  const hasExplicitApplyIf = Object.prototype.hasOwnProperty.call(node.props, "applyIf");
  const applyIf = hasExplicitApplyIf
    ? explicitApplyIf
    : !!themeId || !!tone || root || Object.keys(themeVariables).length > 0 ||
      Object.prototype.hasOwnProperty.call(node.props, "disableInlineStyle");

  if (!applyIf) {
    return <>{context.renderChildren(node.children, scope)}</>;
  }

  return (
    <ThemeScope
      variables={themeVariables}
      style={layoutStyle}
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

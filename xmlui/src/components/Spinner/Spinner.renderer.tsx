import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { COMPONENT_PART_KEY } from "../../styling";
import {
  collectComponentThemeDefaults,
  mergeThemeVariableLayers,
  resolveThemeReferences,
  resolveThemeVariable,
} from "../../styling/theme";
import { SpinnerMd } from "./Spinner";
import { defaultProps } from "./Spinner.defaults";
import { Spinner } from "./SpinnerReact";

export const spinnerRenderer = wrapComponent({
  name: "Spinner",
  metadata: SpinnerMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const themeVariables = useThemeVariables();
    const mergedThemeVariables = mergeThemeVariableLayers([
      collectComponentThemeDefaults(SpinnerMd),
      themeVariables,
    ]);
    const variant = adapter.stringProp("variant");
    const rootAttrs = adapter.rootAttrs();
    const { className, style, ...restRootAttrs } = rootAttrs;
    const componentClassName = typeof className === "string" ? className : "";

    return (
      <Spinner
        {...restRootAttrs}
        classes={{ [COMPONENT_PART_KEY]: componentClassName }}
        delay={adapter.prop("delay", defaultProps.delay)}
        fullScreen={adapter.booleanProp("fullScreen", defaultProps.fullScreen)}
        style={{
          ...(style as CSSProperties | undefined),
          ...currentVariantCssVariables(variant, mergedThemeVariables),
        }}
      />
    );
  },
});

function currentVariantCssVariables(
  variant: string | undefined,
  themeVariables: Record<string, unknown>,
): CSSProperties {
  if (!variant) {
    return {};
  }
  const borderColor = resolveThemeVariable(`borderColor-Spinner-${variant}`, [themeVariables]);
  if (borderColor === undefined || borderColor === null || borderColor === "") {
    return {};
  }
  return {
    "--xmlui-current-borderColor-Spinner": String(resolveThemeReferences(borderColor)),
  } as CSSProperties;
}

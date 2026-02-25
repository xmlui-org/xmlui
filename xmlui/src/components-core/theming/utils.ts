import { ComponentMetadata } from "../../abstractions/ComponentDefs";
import { useTheme } from "./ThemeContext";
import { useMemo } from "react";
import { useStyles } from "./StyleContext";

/**
 * Each theme can have a light or a dark tone.
 */
export const ThemeToneKeys = ["light", "dark"] as const;

export const SizeScaleKeys = {
  // small scale
  none: "none",
  xs: "xs",
  sm: "sm",
  md: "md",
  // large scale
  lg: "lg",
  xl: "xl",
  "2xl": "2xl",
  "3xl": "3xl",
} as const;

export const SizeScaleReadableKeys = {
  // small scale
  none: "None",
  xs: "Extra Small",
  sm: "Small",
  md: "Medium",
  // large scale
  lg: "Large",
  xl: "Extra Large",
  "2xl": "Double Extra Large",
  "3xl": "Triple Extra Large",
} as const;


export function useComponentThemeClass(descriptor: ComponentMetadata) {
  let themeScope = useTheme();
  console.log({ descriptor, themeScope });

  const themeVars = useMemo(()=>{
    const ret = {};
    Object.entries({...(descriptor?.themeVars || {}), ...(descriptor?.defaultThemeVars || {})}).forEach(([key, value])=>{
      let keyWithoutClass = key.replace("Input:", "").replace("Heading:", "");
      let themeVar = themeScope.getThemeVar(keyWithoutClass);
      if (themeVar !== undefined) {

        ret["--xmlui-" + keyWithoutClass] = themeVar;
      }
    });

    return ret;
  }, [descriptor?.defaultThemeVars, descriptor?.themeVars, themeScope]);

  console.log("resolved tehemvar", themeVars);
  console.log("theem styles", themeScope.themeStyles);

  return useStyles(themeVars);
}

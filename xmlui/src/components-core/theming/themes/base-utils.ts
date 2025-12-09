type PaddingValue = {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  horizontal?: string;
  vertical?: string;
  all?: string;
};

export function paddingSubject(name: string, valueSpec?: PaddingValue): Record<string, string> {
  return {
    [`paddingLeft-${name}`]: valueSpec?.left ?? `$paddingHorizontal-${name}`,
    [`paddingRight-${name}`]: valueSpec?.right ?? `$paddingHorizontal-${name}`,
    [`paddingTop-${name}`]: valueSpec?.top ?? `$paddingVertical-${name}`,
    [`paddingBottom-${name}`]: valueSpec?.bottom ?? `$paddingVertical-${name}`,
    [`paddingHorizontal-${name}`]: valueSpec?.horizontal ?? "",
    [`paddingVertical-${name}`]: valueSpec?.vertical ?? "",
    [`padding-${name}`]:
      valueSpec?.all ??
      `$paddingTop-${name} $paddingRight-${name} $paddingBottom-${name} $paddingLeft-${name}`,
  };
}

type TextValue = {
  color?: string;
  family?: string;
  size?: string;
  style?: string;
  variant?: string;
  weight?: string;
  stretch?: string;
  decorationLine?: string;
  decorationColor?: string;
  decorationStyle?: string;
  decorationThickness?: string;
  underlineOffset?: string;
  lineHeight?: string;
  backgroundColor?: string;
  transform?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  shadow?: string;
};

export function textSubject(name: string, valueSpec?: TextValue): Record<string, string> {
  return {
    [`textColor-${name}`]: valueSpec?.color ?? "",
    [`fontFamily-${name}`]: valueSpec?.family ?? "",
    [`fontSize-${name}`]: valueSpec?.size ?? "",
    [`fontStyle-${name}`]: valueSpec?.style ?? "",
    [`fontVariant-${name}`]: valueSpec?.variant ?? "",
    [`fontWeight-${name}`]: valueSpec?.weight ?? "",
    [`fontStretch-${name}`]: valueSpec?.stretch ?? "",
    [`textDecorationLine-${name}`]: valueSpec?.decorationLine ?? "",
    [`textDecorationColor-${name}`]: valueSpec?.decorationColor ?? "",
    [`textDecorationStyle-${name}`]: valueSpec?.decorationStyle ?? "",
    [`textDecorationThickness-${name}`]: valueSpec?.decorationThickness ?? "",
    [`textUnderlineOffset-${name}`]: valueSpec?.underlineOffset ?? "",
    [`lineHeight-${name}`]: valueSpec?.lineHeight ?? "",
    [`backgroundColor-${name}`]: valueSpec?.backgroundColor ?? "",
    [`textTransform-${name}`]: valueSpec?.transform ?? "",
    [`letterSpacing-${name}`]: valueSpec?.letterSpacing ?? "",
    [`wordSpacing-${name}`]: valueSpec?.wordSpacing ?? "",
    [`textShadow-${name}`]: valueSpec?.shadow ?? "",
  };
}

export const validationStatusStyleNames = ["default", "success", "error", "warning"] as const;

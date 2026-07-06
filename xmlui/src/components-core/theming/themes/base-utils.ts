type PaddingValue = {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  horizontal?: string;
  vertical?: string;
  all?: string;
};

export function paddingSubject(subject: string, valueSpec?: PaddingValue): Record<string, string> {
  return {
    [`paddingLeft-${subject}`]: valueSpec?.left ?? `$paddingHorizontal-${subject}`,
    [`paddingRight-${subject}`]: valueSpec?.right ?? `$paddingHorizontal-${subject}`,
    [`paddingTop-${subject}`]: valueSpec?.top ?? `$paddingVertical-${subject}`,
    [`paddingBottom-${subject}`]: valueSpec?.bottom ?? `$paddingVertical-${subject}`,
    [`paddingHorizontal-${subject}`]: valueSpec?.horizontal ?? "",
    [`paddingVertical-${subject}`]: valueSpec?.vertical ?? "",
    [`padding-${subject}`]:
      valueSpec?.all ??
      `$paddingTop-${subject} $paddingRight-${subject} $paddingBottom-${subject} $paddingLeft-${subject}`,
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

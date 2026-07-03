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

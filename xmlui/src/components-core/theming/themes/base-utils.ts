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

export const validationStatusStyleNames = ["default", "success", "error", "warning"] as const;

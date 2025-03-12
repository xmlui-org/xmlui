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
      valueSpec?.all ?? `$paddingTop-${name} $paddingRight-${name} $paddingBottom-${name} $paddingLeft-${name}`,
  };
}

type BorderEdgeValue = {
  color?: string;
  thickness?: string;
  style?: string;
  all?: string;
};

type BorderValue = {
  left?: BorderEdgeValue;
  right?: BorderEdgeValue;
  top?: BorderEdgeValue;
  bottom?: BorderEdgeValue;
  horizontal?: BorderEdgeValue;
  vertical?: BorderEdgeValue;
  all?: BorderEdgeValue;
};

export function borderSubject(name: string, valueSpec?: BorderValue): Record<string, string> {
  return {
    [`borderRadius-${name}`]: "$borderRadius",
    ...borderEdgeSubject("left", valueSpec?.left ?? valueSpec?.horizontal ?? valueSpec?.all),
    ...borderEdgeSubject("right", valueSpec?.right ?? valueSpec?.horizontal ?? valueSpec?.all),
    ...borderEdgeSubject("top", valueSpec?.top ?? valueSpec?.vertical ?? valueSpec?.all),
    ...borderEdgeSubject("bottom", valueSpec?.bottom ?? valueSpec?.vertical ?? valueSpec?.all),
    ...borderEdgeSubject("horizontal", valueSpec?.horizontal ?? valueSpec?.all),
    ...borderEdgeSubject("vertical", valueSpec?.vertical ?? valueSpec?.all),
    [`borderColor-${name}`]: valueSpec?.all?.color ?? "",
    [`borderWidth-${name}`]: valueSpec?.all?.thickness ?? "",
    [`borderStyle-${name}`]: valueSpec?.all?.style ?? "",
    [`border-${name}`]:
      `${valueSpec?.all?.thickness ?? `$borderWidth-${name}`} ` +
      `${valueSpec?.all?.style ?? `$borderStyle-${name}`} ` +
      `${valueSpec?.all?.color ?? `$borderColor-${name}`} `,
  };

  function borderEdgeSubject(edge: string, edgeSpec?: BorderEdgeValue): Record<string, string> {
    return {
      [`borderColor-${edge}-${name}`]: edgeSpec?.color ?? "",
      [`borderWidth-${edge}-${name}`]: edgeSpec?.thickness ?? "",
      [`borderStyle-${edge}-${name}`]: edgeSpec?.style ?? "",
      [`border-${edge}-${name}`]:
        edgeSpec?.all ??
        `$borderWidth-${edge}-${name} $borderStyle-${edge}-${name} $borderColor-${edge}-${name}`,
    };
  }
}

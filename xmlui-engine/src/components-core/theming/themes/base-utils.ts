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
    [`padding-left-${name}`]: valueSpec?.left ?? `$padding-horizontal-${name}`,
    [`padding-right-${name}`]: valueSpec?.right ?? `$padding-horizontal-${name}`,
    [`padding-top-${name}`]: valueSpec?.top ?? `$padding-vertical-${name}`,
    [`padding-bottom-${name}`]: valueSpec?.bottom ?? `$padding-vertical-${name}`,
    [`padding-horizontal-${name}`]: valueSpec?.horizontal ?? "",
    [`padding-vertical-${name}`]: valueSpec?.vertical ?? "",
    [`padding-${name}`]:
      valueSpec?.all ?? `$padding-top-${name} $padding-right-${name} $padding-bottom-${name} $padding-left-${name}`,
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
    [`radius-${name}`]: "$radius",
    ...borderEdgeSubject("left", valueSpec?.left ?? valueSpec?.horizontal ?? valueSpec?.all),
    ...borderEdgeSubject("right", valueSpec?.right ?? valueSpec?.horizontal ?? valueSpec?.all),
    ...borderEdgeSubject("top", valueSpec?.top ?? valueSpec?.vertical ?? valueSpec?.all),
    ...borderEdgeSubject("bottom", valueSpec?.bottom ?? valueSpec?.vertical ?? valueSpec?.all),
    ...borderEdgeSubject("horizontal", valueSpec?.horizontal ?? valueSpec?.all),
    ...borderEdgeSubject("vertical", valueSpec?.vertical ?? valueSpec?.all),
    [`color-border-${name}`]: valueSpec?.all?.color ?? "",
    [`thickness-border-${name}`]: valueSpec?.all?.thickness ?? "",
    [`style-border-${name}`]: valueSpec?.all?.style ?? "",
    [`border-${name}`]:
      `${valueSpec?.all?.thickness ?? `$thickness-border-${name}`} ` +
      `${valueSpec?.all?.style ?? `$style-border-${name}`} ` +
      `${valueSpec?.all?.color ?? `$color-border-${name}`} `,
  };

  function borderEdgeSubject(edge: string, edgeSpec?: BorderEdgeValue): Record<string, string> {
    return {
      [`color-border-${edge}-${name}`]: edgeSpec?.color ?? "",
      [`thickness-border-${edge}-${name}`]: edgeSpec?.thickness ?? "",
      [`style-border-${edge}-${name}`]: edgeSpec?.style ?? "",
      [`border-${edge}-${name}`]:
        edgeSpec?.all ??
        `$thickness-border-${edge}-${name} $style-border-${edge}-${name} $color-border-${edge}-${name}`,
    };
  }
}

import type { ValueExtractor } from "../../abstractions/RendererDefs";

export function resolveAndCleanProps<T extends Record<string, any>>(
  props: Record<string, any>,
  extractValue: ValueExtractor,
  resourceExtraction?: {
    extractResourceUrl: (url?: string) => string | undefined;
    resourceProps?: string[];
  },
): T {
  const { extractResourceUrl, resourceProps } = resourceExtraction ?? {};
  const resultProps = Object.keys(removeStylesFromProps({ ...props })).reduce<Record<string, any>>(
    (acc, propName) => {
      if (resourceProps && extractResourceUrl && resourceProps.includes(propName)) {
        acc[propName] = extractResourceUrl(props[propName]);
      } else {
        acc[propName] = extractValue(props[propName]);
      }
      return acc;
    },
    {},
  );

  delete resultProps.canShrink;
  delete resultProps.radiusTopLeft;
  delete resultProps.radiusTopRight;
  delete resultProps.radiusBottomLeft;
  delete resultProps.radiusBottomRight;
  delete resultProps.paddingHorizontal;
  delete resultProps.paddingVertical;
  delete resultProps.marginHorizontal;
  delete resultProps.marginVertical;
  delete resultProps.borderHorizontal;
  delete resultProps.borderVertical;

  return resultProps as T;
}

export function removeStylesFromProps(nodeProps: Record<string, any>) {
  delete nodeProps.style;
  delete nodeProps.class;
  return nodeProps;
}

export class PropsTrasform {
  constructor(
    private readonly extractValue: ValueExtractor,
    private readonly extractResourceUrl: (url?: string) => string | undefined,
    private readonly props: Record<string, any> = {},
  ) {}

  asRest(): Record<string, any> {
    return resolveAndCleanProps(this.props, this.extractValue, {
      extractResourceUrl: this.extractResourceUrl,
    });
  }
}

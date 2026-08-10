import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { memo, useMemo } from "react";
import classnames from "classnames";

import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useLocaleProfile, type LocaleProfile } from "../../components-core/i18n";
import { ThemedIcon } from "../Icon/Icon";
import { formatValue, type ValueRenderModel } from "./value-formatting";
import { normalizeValueType, type NormalizedValueType } from "./value-types";
import styles from "./Value.module.scss";

type Props = Omit<HTMLAttributes<HTMLElement>, "type"> & {
  value: unknown;
  type?: string;
  typeOptions?: unknown;
  valueType?: NormalizedValueType;
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
  localeProfile?: LocaleProfile;
  withColumnKindAttribute?: boolean;
};

export const Value = memo(function Value({
  value,
  type,
  typeOptions,
  valueType,
  className,
  classes,
  style,
  localeProfile,
  withColumnKindAttribute,
  ...rest
}: Props) {
  const contextLocaleProfile = useLocaleProfile();
  const effectiveLocaleProfile = localeProfile ?? contextLocaleProfile;
  const normalizedType = useMemo(
    () => valueType ?? normalizeValueType(type, typeOptions).type,
    [type, typeOptions, valueType],
  );
  const model = formatValue(value, normalizedType, { localeProfile: effectiveLocaleProfile });

  return renderValueModel(model, normalizedType, {
    className: classnames(classes?.[COMPONENT_PART_KEY], className),
    style,
    rest,
    withColumnKindAttribute,
  });
});

type RenderOptions = {
  className?: string;
  style?: CSSProperties;
  rest?: HTMLAttributes<HTMLElement>;
  withColumnKindAttribute?: boolean;
};

function renderValueModel(
  model: ValueRenderModel,
  valueType: NormalizedValueType,
  options: RenderOptions,
): ReactNode {
  const longTextClampStyle = getLongTextClampStyle(valueType);
  const longTextTitle = longTextClampStyle && shouldShowClampedTitle(valueType) ? model.text : undefined;
  const className = options.className;
  const style = options.style;
  const rest = options.rest;

  switch (model.kind) {
    case "empty":
      return null;
    case "link":
      return (
        <a
          {...rest}
          href={model.href}
          title={model.href}
          {...kindAttributes(model.kind, options)}
          className={classnames(styles.value, className)}
          style={style}
        >
          {model.text}
        </a>
      );
    case "number":
      return (
        <span
          {...rest}
          {...kindAttributes(model.kind, options)}
          className={classnames(styles.value, styles.number, className)}
          style={style}
        >
          <span data-number-part="integer">{model.integerPart}</span>
          {model.decimalSeparator && (
            <span data-number-part="decimal">{model.decimalSeparator}</span>
          )}
          {model.fractionPart && <span data-number-part="fraction">{model.fractionPart}</span>}
          {model.suffixPart && <span data-number-part="suffix">{model.suffixPart}</span>}
        </span>
      );
    case "checkbox":
      return (
        <span
          {...rest}
          {...kindAttributes(model.kind, options)}
          className={classnames(styles.value, styles.checkbox, className)}
          role="checkbox"
          aria-checked={!!model.text}
          style={style}
        >
          {model.text}
        </span>
      );
    case "markdown":
      return (
        <span
          {...rest}
          {...kindAttributes(model.kind, options)}
          className={classnames(styles.value, styles.longText, className)}
          style={{ ...style, ...longTextClampStyle }}
          title={longTextTitle}
        >
          {renderInlineMarkdown(model.text)}
        </span>
      );
    case "color":
      return (
        <span
          {...rest}
          {...kindAttributes(model.kind, options)}
          className={classnames(styles.value, styles.color, className)}
          style={style}
        >
          <span
            data-color-swatch
            className={styles.colorSwatch}
            style={{ backgroundColor: model.color }}
            aria-hidden
          />
          <span>{model.text}</span>
        </span>
      );
    case "image":
    case "avatar":
      return (
        <img
          {...rest}
          {...kindAttributes(model.kind, options)}
          className={classnames(styles.image, className, {
            [styles.avatar]: model.kind === "avatar",
          })}
          src={model.src}
          alt={model.alt}
          style={style}
        />
      );
    case "icon":
      return (
        <span
          {...rest}
          {...kindAttributes(model.kind, options)}
          className={classnames(styles.value, styles.icon, className)}
          style={style}
        >
          <ThemedIcon name={model.iconName} fallback={model.iconName} aria-label={model.text} />
          <span className={styles.iconLabel}>{model.text}</span>
        </span>
      );
    default:
      return (
        <span
          {...rest}
          {...kindAttributes(model.kind, options)}
          className={classnames(styles.value, getValueClassName(model.kind), className)}
          style={isLongTextLikeModel(model.kind) ? { ...style, ...longTextClampStyle } : style}
          title={isLongTextLikeModel(model.kind) ? longTextTitle : undefined}
        >
          {model.text}
        </span>
      );
  }
}

function kindAttributes(kind: ValueRenderModel["kind"], options: RenderOptions) {
  return {
    "data-value-kind": kind,
    ...(options.withColumnKindAttribute ? { "data-column-cell-kind": kind } : {}),
  };
}

function getLongTextClampStyle(valueType?: NormalizedValueType): CSSProperties | undefined {
  if (!valueType) {
    return undefined;
  }
  const maxLines = positiveIntegerOption(valueType, "maxLines") ?? positiveIntegerOption(valueType, "lines");
  if (maxLines === undefined) {
    return undefined;
  }
  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: maxLines,
    overflow: "hidden",
  } as CSSProperties;
}

function shouldShowClampedTitle(valueType?: NormalizedValueType): boolean {
  return valueType?.options?.tooltip !== false;
}

function isLongTextLikeModel(kind: ValueRenderModel["kind"]): boolean {
  return kind === "long-text" || kind === "address";
}

function positiveIntegerOption(
  valueType: NormalizedValueType,
  optionName: string,
): number | undefined {
  const value = valueType.options?.[optionName];
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined;
}

function getValueClassName(kind: ValueRenderModel["kind"]): string | undefined {
  switch (kind) {
    case "long-text":
    case "address":
      return styles.longText;
    case "code":
    case "json":
      return styles.code;
    case "tag":
    case "tags":
      return styles.tag;
    case "short-text":
    case "id":
    case "uuid":
      return styles.compactText;
    default:
      return undefined;
  }
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      match[2] ? (
        <strong key={match.index}>{match[2]}</strong>
      ) : (
        <em key={match.index}>{match[3]}</em>
      ),
    );
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

import {
  forwardRef,
  memo,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import styles from "./Icon.module.scss?xmlui-css-module";

export type IconProps = {
  name?: unknown;
  fallback?: unknown;
  size?: unknown;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<SVGSVGElement>) => void | Promise<void>;
  onKeyDown?: (event: KeyboardEvent<SVGSVGElement>) => void | Promise<void>;
} & Omit<HTMLAttributes<HTMLSpanElement>, "onClick" | "onKeyDown">;

type IconDefinition = {
  viewBox: string;
  children: ReactNode;
};

export const Icon = memo(forwardRef(function Icon(
  {
    name,
    fallback,
    size,
    className,
    style,
    onClick,
    onKeyDown,
    ...rest
  }: IconProps,
  ref: ForwardedRef<SVGSVGElement>,
) {
  const {
    tabIndex,
    role,
    "aria-label": ariaLabel,
    ...wrapperAttrs
  } = rest;
  const resolved = resolveIcon(name, fallback);
  if (!resolved) {
    return null;
  }
  const iconSize = resolveIconSize(size);
  if (iconSize === null) {
    return null;
  }
  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      void onClick(event);
    }
    void onKeyDown?.(event);
  };

  return (
    <span
      {...wrapperAttrs}
      className={cx(styles.xmluiIconRoot, className)}
      style={{
        ...style,
        ...iconCssVariables(iconSize),
      }}
      onClick={onClick}
    >
      <span className={styles.xmluiIconWrapper}>
        <svg
          ref={ref}
          viewBox={resolved.definition.viewBox}
          aria-label={ariaLabel}
          aria-hidden={ariaLabel ? undefined : "true"}
          data-icon-name={resolved.name}
          className={cx(styles.xmluiIcon, onClick ? styles.xmluiIconClickable : undefined)}
          onKeyDown={handleKeyDown}
          tabIndex={onClick ? tabIndex ?? 0 : tabIndex}
          role={onClick ? "button" : role}
          strokeWidth="2"
        >
          {resolved.definition.children}
        </svg>
      </span>
    </span>
  );
}));

function resolveIcon(
  name: unknown,
  fallback: unknown,
): { name: string; definition: IconDefinition } | undefined {
  const primaryName = stringValue(name);
  const primary = iconByName(primaryName);
  if (primary) {
    return primary;
  }
  const fallbackName = stringValue(fallback);
  return iconByName(fallbackName);
}

function iconByName(name: string | undefined): { name: string; definition: IconDefinition } | undefined {
  if (!name) {
    return undefined;
  }
  const normalized = name.includes(":") ? name.toLowerCase() : name;
  const definition = icons[normalized];
  return definition ? { name, definition } : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function resolveIconSize(size: unknown): string | undefined | null {
  if (size === undefined || size === null) {
    return undefined;
  }
  if (typeof size !== "string") {
    return null;
  }
  if (size === "") {
    return undefined;
  }
  if (size.startsWith("$")) {
    return `var(--xmlui-${size.slice(1)})`;
  }
  return ({
    xs: "12px",
    sm: "16px",
    md: "24px",
    lg: "32px",
  } as Record<string, string>)[size] ?? normalizedCssLength(size);
}

function normalizedCssLength(value: string): string | null {
  const match = /^(-?(?:\d+|\d*\.\d+))(px|em|rem|%)$/.exec(value);
  if (!match) {
    return null;
  }
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit === "em" || unit === "rem") {
    return `${amount * 16}px`;
  }
  return value;
}

function iconCssVariables(size: string | undefined): CSSProperties {
  if (!size) {
    return {};
  }
  return {
    "--xmlui-icon-width": size,
    "--xmlui-icon-height": size,
  } as CSSProperties;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

const icons: Record<string, IconDefinition> = {
  home: {
    viewBox: "0 0 24 24",
    children: (
      <>
        <path d="M3 10.5 12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v10h5v-6h4v6h5V10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  trash: {
    viewBox: "0 0 24 24",
    children: (
      <>
        <path d="M3 6h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 6V4h8v2m-9 3 1 11h8l1-11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 11v6m4-6v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  info: {
    viewBox: "0 0 24 24",
    children: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 10v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="7" r="1" fill="currentColor" />
      </>
    ),
  },
};

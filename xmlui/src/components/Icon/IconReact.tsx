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

import styles from "./Icon.module.scss";

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
  error: {
    viewBox: "0 0 24 24",
    children: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </>
    ),
  },
  checkmark: {
    viewBox: "0 0 24 24",
    children: (
      <path d="m5 12 4 4 10-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  chevronright: {
    viewBox: "0 0 24 24",
    children: (
      <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  star: {
    viewBox: "0 0 24 24",
    children: (
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    ),
  },
  search: {
    viewBox: "0 0 24 24",
    children: (
      <>
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m16 16 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  phone: {
    viewBox: "0 0 24 24",
    children: (
      <path d="M6.5 4.5 9 4l2 4-1.5 1.5a10 10 0 0 0 5 5L16 13l4 2-.5 2.5c-.2 1-1 1.7-2 1.7A13.7 13.7 0 0 1 4.8 6.5c0-1 .7-1.8 1.7-2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  email: {
    viewBox: "0 0 24 24",
    children: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m5 8 7 5 7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  folder: {
    viewBox: "0 0 24 24",
    children: (
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H9l2 2h7.5A2.5 2.5 0 0 1 21 8.5v7A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    ),
  },
  "folder-open": {
    viewBox: "0 0 24 24",
    children: (
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H9l2 2h7.5A2.5 2.5 0 0 1 21 10.5v1H7l-2 6H3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    ),
  },
  "folder-closed": {
    viewBox: "0 0 24 24",
    children: (
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v6A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    ),
  },
};

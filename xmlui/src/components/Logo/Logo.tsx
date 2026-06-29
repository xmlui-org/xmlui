import { wrapComponent } from "../../runtime/rendering/adapter";
import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { Logo } from "./LogoReact";
import { defaultProps } from "./Logo.defaults";
import { COMPONENT_PART_KEY } from "../../styling";

const COMP = "Logo";

export const LogoMd = createMetadata({
  status: "stable",
  description:
    "`Logo` displays your application's brand symbol by loading a configured or explicit logo resource.",
  props: {
    src: {
      description:
        "Explicit logo source. The full old App manifest logo lookup is part of the App shell migration.",
      valueType: "string",
      isResourceUrl: true,
    },
    alt: {
      description: "Alternative text for the logo image for accessibility.",
      valueType: "string",
      defaultValue: defaultProps.alt,
    },
    inline: {
      description: "When true, renders the logo image as an inline element.",
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    testId: {
      description: "Adds a test identifier to the logo image.",
      valueType: "string",
    },
  },
});

export const logoRenderer = wrapComponent({
  name: COMP,
  metadata: LogoMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const { className, ...restRootAttrs } = rootAttrs;
    return (
      <Logo
        {...restRootAttrs}
        classes={{ [COMPONENT_PART_KEY]: typeof className === "string" ? className : "" }}
        data-testid={adapter.stringProp("testId", "test-id-component")}
        src={adapter.resourceUrl(adapter.prop("src"))}
        alt={adapter.stringProp("alt", defaultProps.alt)}
        inline={toBoolean(
          adapter.prop("inline") ?? rootAttrs.inline ?? adapter.node.props.inline,
          defaultProps.inline,
        )}
      />
    );
  },
});

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
}

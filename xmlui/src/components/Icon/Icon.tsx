import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import {
  createMetadata,
  dClick,
} from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { Icon } from "./IconReact";
import iconStylesSource from "./Icon.module.scss?xmlui-theme-vars";

const COMP = "Icon";

export const IconMd = createMetadata({
  status: "stable",
  description:
    "`Icon` displays scalable vector icons from XMLUI's built-in icon registry using simple name references.",
  props: {
    name: {
      description: "The name of the icon to display.",
      valueType: "string",
    },
    size: {
      description: "The size of the icon. Supports `xs`, `sm`, `md`, `lg`, CSS lengths, and theme references.",
      valueType: "string",
      availableValues: ["xs", "sm", "md", "lg"],
    },
    fallback: {
      description: "Icon name to use when `name` cannot be resolved.",
      valueType: "string",
    },
    testId: {
      description: "Adds a test identifier to the icon element.",
      valueType: "string",
    },
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: extractScssThemeVars(iconStylesSource),
  defaultThemeVars: {
    [`size-${COMP}`]: "1.2em",
  },
});

export const iconRenderer = wrapComponent({
  name: COMP,
  metadata: IconMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <Icon
      {...adapter.rootAttrs()}
      data-testid={adapter.stringProp("testId", "test-id-component")}
      name={adapter.prop("name")}
      fallback={adapter.prop("fallback")}
      size={adapter.prop("size")}
      onClick={adapter.node.events.click ? (event) => void adapter.event("click")(event) : undefined}
    />
  ),
});

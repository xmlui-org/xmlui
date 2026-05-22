import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import type { ComponentMetadata } from "xmlui";
import { AiConversation, defaultProps } from "./AiConversationNative";
import styles from "./AiConversation.module.scss";

const COMP = "AiConversation";

export const AiConversationMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`AiConversation` is a placeholder chat surface for AI-assisted XMLUI app building. " +
    "It does not call an AI provider yet; it gives applications a stable preview target " +
    "while the real AI blocks are designed.",
  props: {
    title: {
      description: "Heading displayed at the top of the placeholder conversation surface.",
      valueType: "string",
      defaultValue: defaultProps.title,
    },
    provider: {
      description: "Name of the selected AI provider to display.",
      valueType: "string",
      defaultValue: defaultProps.provider,
    },
    model: {
      description: "Name of the selected model to display.",
      valueType: "string",
      defaultValue: defaultProps.model,
    },
    status: {
      description: "Short status text displayed in the header.",
      valueType: "string",
      defaultValue: defaultProps.status,
    },
    placeholder: {
      description: "Text displayed in the empty message area.",
      valueType: "string",
      defaultValue: defaultProps.placeholder,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`boxShadow-${COMP}`]: "$boxShadow-sm",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`textColor-subtitle-${COMP}`]: "$textColor-subtitle",
    [`backgroundColor-${COMP}-header`]: "$color-surface-raised",
    [`backgroundColor-${COMP}-body`]: "$color-surface-50",
    [`backgroundColor-${COMP}-composer`]: "$color-surface-0",
    [`backgroundColor-${COMP}-pill`]: "$color-primary-100",
    [`textColor-${COMP}-pill`]: "$color-primary-700",
  },
});

export const aiConversationComponentRenderer = createComponentRenderer(
  COMP,
  AiConversationMd,
  ({ node, extractValue, className }) => {
    const props = node.props as Record<string, unknown>;

    return (
      <AiConversation
        className={className}
        title={extractValue.asOptionalString(props.title, defaultProps.title)}
        provider={extractValue.asOptionalString(props.provider, defaultProps.provider)}
        model={extractValue.asOptionalString(props.model, defaultProps.model)}
        status={extractValue.asOptionalString(props.status, defaultProps.status)}
        placeholder={extractValue.asOptionalString(props.placeholder, defaultProps.placeholder)}
      />
    );
  },
);

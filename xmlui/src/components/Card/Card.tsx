import styles from "./Card.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dClick } from "../metadata-helpers";
import { orientationOptionMd } from "../abstractions";
import { Card, defaultProps } from "./CardNative";

const COMP = "Card";

export const CardMd = createMetadata({
  description: `The \`${COMP}\` component is a container for cohesive elements, often rendered visually as a card.`,
  props: {
    avatarUrl: {
      description: `Show the avatar (\`true\`) or not (\`false\`). If not specified, the ${COMP} will show the ` +
        `first letters of the [\`title\`](#title).`,
      type: "string",
    },
    showAvatar: {
      description: `Indicates whether the ${COMP} should be displayed`,
      valueType: "boolean",
      defaultValue: defaultProps.showAvatar,
    },
    avatarSize: {
      description: `This prop sets the size of the avatar. The default value is \`sm\`.`,
      availableValues: ["xs", "sm", "md", "lg"],
      valueType: "string",
    },
    title: {
      description: `This prop sets the prestyled title.`,
      valueType: "string",
    },
    subtitle: {
      description: `This prop sets the prestyled subtitle.`,
      valueType: "string",
    },
    linkTo: {
      description: `This property wraps the title in a \`Link\` component that is clickable to navigate.`,
      valueType: "string",
    },
    orientation: {
      description: `An optional property that governs the ${COMP}'s orientation ` +
        `(whether the ${COMP} lays out its children in a row or a column). ` +
        `If the orientation is set to \`horizontal\`, the ${COMP} will display `+
        `its children in a row, except for its [\`title\`](#title) and [\`subtitle\`](#subtitle).`,
      availableValues: orientationOptionMd,
      valueType: "string",
      defaultValue: defaultProps.orientation,
    },
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-${COMP}`]: "$space-4",
    [`border-${COMP}`]: "1px solid $borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`boxShadow-${COMP}`]: "none",
    [`backgroundColor-${COMP}`]: "$color-surface-raised",
    [`gap-${COMP}`]: "var(--stack-gap-default)",
    [`gap-title-${COMP}`]: "$gap-normal",
    [`gap-avatar-${COMP}`]: "$gap-normal",
    [`verticalAlignment-title-${COMP}`]: "center",
  },
  themeVarDescriptions: {
    [`gap-${COMP}`]: "The gap between the component's children.",
    [`gap-title-${COMP}`]: "The gap between the title and the subtitle",
    [`gap-avatar-${COMP}`]: "The gap between the avatar and the title panel",
    [`horizontalAlignment-title-${COMP}`]: "The horizontal alignment of panel with the title and subtitle",
    [`verticalAlignment-title-${COMP}`]: "The vertical alignment of the title and subtitle to the avatar",
  }
});

export const cardComponentRenderer = createComponentRenderer(
  "Card",
  CardMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <Card
        style={layoutCss}
        title={extractValue.asOptionalString(node.props.title)}
        linkTo={extractValue.asOptionalString(node.props.linkTo)}
        subtitle={extractValue.asOptionalString(node.props.subtitle)}
        avatarUrl={extractValue.asOptionalString(node.props.avatarUrl)}
        showAvatar={extractValue.asOptionalBoolean(node.props.showAvatar)}
        avatarSize={extractValue.asOptionalString(node.props.avatarSize)}
        orientation={extractValue.asOptionalString(node.props.orientation)}
      >
        {renderChild(node.children, {
          type: "Stack",
          orientation: "vertical",
        })}
      </Card>
    );
  },
);

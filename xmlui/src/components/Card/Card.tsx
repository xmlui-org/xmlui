import styles from "./Card.module.scss";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Card } from "./CardNative";
import { dClick } from "@components/metadata-helpers";

const COMP = "Card";

export const CardMd = createMetadata({
  description: `The \`${COMP}\` component is a container for cohesive elements, often rendered visually as a card.`,
  props: {
    avatarUrl: d(
      `Show the avatar (\`true\`) or not (\`false\`). If not specified, the ${COMP} will show the ` +
        `first letters of the [\`title\`](#title).`,
    ),
    showAvatar: d(`Indicates whether the ${COMP} should be displayed`, null, "boolean"),
    title: d(`This prop sets the prestyled title.`),
    subTitle: d(`This prop sets the prestyled subtitle.`),
    linkTo: d(
      `This property wraps the title in a \`Link\` component that is clickable to navigate.`,
    ),
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-horizontal-${COMP}`]: "$space-4",
    [`padding-vertical-${COMP}`]: "$space-4",
    [`padding-${COMP}`]: "$padding-vertical-${COMP} $padding-horizontal-${COMP}",
    [`color-border-${COMP}`]: "$color-border",
    [`thickness-border-${COMP}`]: "1px",
    [`style-border-${COMP}`]: "solid",
    [`border-${COMP}`]: "$thickness-border-${COMP} $style-border-${COMP} $color-border-${COMP}",
    [`radius-${COMP}`]: "$radius",
    [`shadow-${COMP}`]: "none",
    light: {
      [`color-bg-${COMP}`]: "white",
    },
    dark: {
      [`color-bg-${COMP}`]: "$color-surface-900",
    },
  },
});

export const cardComponentRenderer = createComponentRendererNew(
  "Card",
  CardMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <Card
        style={layoutCss}
        title={extractValue.asOptionalString(node.props.title)}
        linkTo={extractValue.asOptionalString(node.props.linkTo)}
        subTitle={extractValue.asOptionalString(node.props.subTitle)}
        avatarUrl={extractValue.asOptionalString(node.props.avatarUrl)}
        showAvatar={extractValue.asOptionalBoolean(node.props.showAvatar)}
      >
        {renderChild(node.children, {
          type: "Stack",
          orientation: "vertical",
        })}
      </Card>
    );
  },
);

import { createMetadata, dClick, dContextMenu } from "../../component-core/metadata/helpers";
import { defaultProps } from "./Card.defaults";

const COMP = "Card";

export const CardMd = createMetadata({
  status: "stable",
  description:
    "`Card` is a versatile container that groups related content with a visual boundary, typically featuring background color, padding, borders, and rounded corners.",
  parts: {
    avatar: { description: "The avatar displayed within the card, if any." },
    title: { description: "The title of the card." },
    subtitle: { description: "The subtitle of the card." },
  },
  props: {
    id: {
      description: "Defines a component instance identifier used for references and APIs.",
      valueType: "string",
    },
    avatarUrl: {
      description: "The URL for an avatar image.",
      valueType: "string",
    },
    showAvatar: {
      description: "Indicates whether the avatar should be displayed.",
      valueType: "boolean",
      defaultValue: defaultProps.showAvatar,
    },
    avatarSize: {
      description: "Sets the avatar size.",
      availableValues: ["xs", "sm", "md", "lg"],
      valueType: "string",
    },
    title: {
      description: "This prop sets the pre-styled title. If unset, no title is displayed.",
      valueType: "string",
    },
    subtitle: {
      description: "This prop sets the pre-styled subtitle. If unset, no subtitle is displayed.",
      valueType: "string",
    },
    linkTo: {
      description: "Wraps the title in a Link component that is clickable to navigate.",
      valueType: "string",
    },
    orientation: {
      description: "Controls whether Card children are laid out horizontally or vertically.",
      availableValues: ["horizontal", "vertical"],
      valueType: "string",
      defaultValue: defaultProps.orientation,
    },
    horizontalAlignment: {
      description: "Manages the horizontal content alignment for each child element in the Card.",
      availableValues: ["start", "center", "end", "stretch"],
      valueType: "string",
      defaultValue: "start",
    },
    verticalAlignment: {
      description: "Manages the vertical content alignment for each child element in the Card.",
      availableValues: ["start", "center", "end", "stretch", "baseline"],
      valueType: "string",
      defaultValue: "start",
    },
    testId: {
      description: "Adds a test identifier to the card root.",
      valueType: "string",
    },
  },
  events: {
    click: dClick(COMP),
    doubleClick: {
      description: `This event is triggered when the ${COMP} is double-clicked.`,
      signature: "doubleClick(event: MouseEvent): void",
      parameters: {
        event: "The mouse event object.",
      },
    },
    contextMenu: dContextMenu(COMP),
  },
  apis: {
    scrollToTop: {
      description: "Scrolls the Card container to the top.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description: "Scrolls the Card container to the bottom.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToStart: {
      description: "Scrolls the Card container to the start.",
      signature: "scrollToStart(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToEnd: {
      description: "Scrolls the Card container to the end.",
      signature: "scrollToEnd(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: {
    [`padding-${COMP}`]: "Card padding.",
    [`border-${COMP}`]: "Card border.",
    [`borderRadius-${COMP}`]: "Card border radius.",
    [`boxShadow-${COMP}`]: "Card box shadow.",
    [`backgroundColor-${COMP}`]: "Card background color.",
    [`backgroundColor-${COMP}--hover`]: "Card background color when hovered.",
    [`gap-${COMP}`]: "The gap between the component's children.",
    [`gap-title-${COMP}`]: "The gap between the title and subtitle.",
    [`gap-avatar-${COMP}`]: "The gap between the avatar and title panel.",
    [`horizontalAlignment-title-${COMP}`]: "The horizontal alignment of the title panel.",
    [`verticalAlignment-title-${COMP}`]: "The vertical alignment of the title and subtitle to the avatar.",
  },
  defaultThemeVars: {
    [`padding-${COMP}`]: "$space-4",
    [`border-${COMP}`]: "1px solid $borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`boxShadow-${COMP}`]: "none",
    [`backgroundColor-${COMP}`]: "$color-surface-raised",
    [`backgroundColor-${COMP}--hover`]: "$color-surface-raised",
    [`gap-${COMP}`]: "$gap-layout",
    [`gap-title-${COMP}`]: "$gap-none",
    [`gap-avatar-${COMP}`]: "$gap-normal",
    [`horizontalAlignment-title-${COMP}`]: "stretch",
    [`verticalAlignment-title-${COMP}`]: "center",
  },
});


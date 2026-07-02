import type {
  SizeType,
  AlignmentOptions,
  ButtonThemeColor,
  ButtonType,
  ButtonVariant,
  IconPosition,
  OrientationOptions,
} from "../abstractions";

export const defaultProps: {
  type: ButtonType;
  iconPosition: IconPosition;
  contentPosition: AlignmentOptions;
  orientation: OrientationOptions;
  variant: ButtonVariant;
  themeColor: ButtonThemeColor;
  size: SizeType;
  autoFocus: boolean;
  enabled: boolean;
} = {
  type: "button",
  iconPosition: "start",
  contentPosition: "center",
  orientation: "horizontal",
  variant: "solid",
  themeColor: "primary",
  size: "sm",
  autoFocus: false,
  enabled: true,
};

export const defaultProps = {
  type: "text" as "text" | "password" | "search",
  value: "",
  initialValue: "",
  enabled: true,
  validationStatus: "none",
  invalidMessages: [] as string[],
  passwordVisibleIcon: "eye",
  passwordHiddenIcon: "eye-off",
  autoComplete: "off" as string | boolean,
};

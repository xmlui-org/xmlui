import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./ThemeSwitcher.xmlui";

const COMP = "ThemeSwitcher";

export const ThemeSwitcherMd = createMetadata({
  status: "internal",
  description: "ThemeSwitcher component",
  props: {},
});

export const themeSwitcherRenderer = createUserDefinedComponentRenderer(
  ThemeSwitcherMd,
  componentSource,
);

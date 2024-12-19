import { createComponentRenderer } from "xmlui";
import { WindowsAppFrame } from "./WindowsAppFrame";
import { MacOSAppFrame } from "./MacOSAppFrame";
import { IPhoneFrame } from "./IPhoneFrame";
import windowsStyles from "./WindowsAppFrame.module.scss";
import macStyles from "./MacOSAppFrame.module.scss";
import iphoneStyles from "./IPhoneFrame.module.scss";

export default [
  createComponentRenderer(
    "WindowsAppFrame",
    {
      themeVars: windowsStyles.themeVars,
      defaultThemeVars: {
        "color-bg-content-WindowsAppFrame": "$color-bg",
        light: {
          "color-bg-content-WindowsAppFrame": "white",
        },
      },
    },
    ({ node, renderChild }) => {
      return <WindowsAppFrame>{renderChild(node.children)}</WindowsAppFrame>;
    },
  ),
  createComponentRenderer(
    "MacOSAppFrame",
    {
      themeVars: macStyles.themeVars,
      defaultThemeVars: {},
    },
    ({ node, renderChild }) => {
      return <MacOSAppFrame>{renderChild(node.children)}</MacOSAppFrame>;
    },
  ),
  createComponentRenderer(
    "IPhoneFrame",
    {
      themeVars: iphoneStyles.themeVars,
      defaultThemeVars: {},
    },
    ({ node, renderChild }) => {
      return <IPhoneFrame>{renderChild(node.children)}</IPhoneFrame>;
    },
  ),
];

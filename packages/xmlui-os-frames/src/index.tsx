import { createComponentRenderer, createMetadata } from "xmlui";
import { WindowsAppFrame } from "./WindowsAppFrame";
import { MacOSAppFrame } from "./MacOSAppFrame";
import { IPhoneFrame } from "./IPhoneFrame";
import windowsStyles from "./WindowsAppFrame.module.scss";
import macStyles from "./MacOSAppFrame.module.scss";
import iphoneStyles from "./IPhoneFrame.module.scss";

export const windowsAppFrameMd = createMetadata({
  name: "WindowsAppFrame",
  description: `App Frame for Windows.`,
  status: "experimental",
  themeVars: windowsStyles.themeVars,
  defaultThemeVars: {
    "color-bg-content-WindowsAppFrame": "$color-bg",
    light: {
      "color-bg-content-WindowsAppFrame": "white"
    }
  }
});

export const macAppFrameMd = createMetadata({
  name: "MacOSAppFrame",
  description: `App Frame for MacOS.`,
  status: "experimental",
  themeVars: macStyles.themeVars,
  defaultThemeVars: {}
});

export const iphoneFrameMd = createMetadata({
  name: "IPhoneFrame",
  description: `App Frame for IPhone.`,
  status: "experimental",
  themeVars: iphoneStyles.themeVars,
  defaultThemeVars: {}
});

export default {
  namespace: "XMLUIExtensions",
  components: [
    createComponentRenderer(
      "WindowsAppFrame",
      windowsAppFrameMd,
      ({ node, renderChild }: any) => {
        return <WindowsAppFrame>{renderChild(node.children)}</WindowsAppFrame>;
      }
    ),
    createComponentRenderer(
      "MacOSAppFrame",
      macAppFrameMd,
      ({ node, renderChild }: any) => {
        return <MacOSAppFrame>{renderChild(node.children)}</MacOSAppFrame>;
      }
    ),
    createComponentRenderer(
      "IPhoneFrame",
      iphoneFrameMd,
      ({ node, renderChild }: any) => {
        return <IPhoneFrame>{renderChild(node.children)}</IPhoneFrame>;
      }
    )
  ]
};

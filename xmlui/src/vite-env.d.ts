/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly NODE_ENV: string;
  // Framework-level: baked in at lib-build time
  readonly VITE_XMLUI_VERSION: string;
  // Application-level: mode flags set by xmlui CLI or app's Vite config
  readonly VITE_XMLUI_BUILD_MODE: string;
  readonly VITE_XMLUI_DEV_MODE: boolean;
  // Application-level: runtime flags
  readonly VITE_MOCK_ENABLED: boolean | string;
  readonly VITE_MOCK_WORKER_LOCATION: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_INCLUDE_ALL_COMPONENTS: string;
  readonly VITE_INCLUDE_HTML_COMPONENTS: string;
  readonly VITE_INCLUDE_REST_COMPONENTS: string;
  readonly VITE_USER_COMPONENTS_Inspect: string;
  // Application-level: component tree-shaking flags
  readonly VITE_USED_COMPONENTS_AccordionItem: string;
  readonly VITE_USED_COMPONENTS_App: string;
  readonly VITE_USED_COMPONENTS_AppHeader: string;
  readonly VITE_USED_COMPONENTS_Avatar: string;
  readonly VITE_USED_COMPONENTS_Badge: string;
  readonly VITE_USED_COMPONENTS_Button: string;
  readonly VITE_USED_COMPONENTS_Card: string;
  readonly VITE_USED_COMPONENTS_Chart: string;
  readonly VITE_USED_COMPONENTS_Charts: string;
  readonly VITE_USED_COMPONENTS_Checkbox: string;
  readonly VITE_USED_COMPONENTS_ColorPicker: string;
  readonly VITE_USED_COMPONENTS_ContentSeparator: string;
  readonly VITE_USED_COMPONENTS_DatePicker: string;
  readonly VITE_USED_COMPONENTS_DotMenu: string;
  readonly VITE_USED_COMPONENTS_EmojiSelector: string;
  readonly VITE_USED_COMPONENTS_FileUploadDropZone: string;
  readonly VITE_USED_COMPONENTS_FlowLayout: string;
  readonly VITE_USED_COMPONENTS_Footer: string;
  readonly VITE_USED_COMPONENTS_Form: string;
  readonly VITE_USED_COMPONENTS_Fragment: string;
  readonly VITE_USED_COMPONENTS_Heading: string;
  readonly VITE_USED_COMPONENTS_Icon: string;
  readonly VITE_USED_COMPONENTS_IFrame: string;
  readonly VITE_USED_COMPONENTS_Image: string;
  readonly VITE_USED_COMPONENTS_Items: string;
  readonly VITE_USED_COMPONENTS_Link: string;
  readonly VITE_USED_COMPONENTS_List: string;
  readonly VITE_USED_COMPONENTS_Logo: string;
  readonly VITE_USED_COMPONENTS_Markdown: string;
  readonly VITE_USED_COMPONENTS_MessageListener: string;
  readonly VITE_USED_COMPONENTS_ModalDialog: string;
  readonly VITE_USED_COMPONENTS_NavGroup: string;
  readonly VITE_USED_COMPONENTS_NavLink: string;
  readonly VITE_USED_COMPONENTS_NavPanel: string;
  readonly VITE_USED_COMPONENTS_NoResult: string;
  readonly VITE_USED_COMPONENTS_Option: string;
  readonly VITE_USED_COMPONENTS_Pagination: string;
  readonly VITE_USED_COMPONENTS_Pages: string;
  readonly VITE_USED_COMPONENTS_Pdf: string;
  readonly VITE_USED_COMPONENTS_Redirect: string;
  readonly VITE_USED_COMPONENTS_ResponsiveBar: string;
  readonly VITE_USED_COMPONENTS_ScrollViewer: string;
  readonly VITE_USED_COMPONENTS_SelectionStore: string;
  readonly VITE_USED_COMPONENTS_SimpleTooltip: string;
  readonly VITE_USED_COMPONENTS_SpaceFiller: string;
  readonly VITE_USED_COMPONENTS_Stack: string;
  readonly VITE_USED_COMPONENTS_Step: string;
  readonly VITE_USED_COMPONENTS_StepperForm: string;
  readonly VITE_USED_COMPONENTS_StickyBox: string;
  readonly VITE_USED_COMPONENTS_StickySection: string;
  readonly VITE_USED_COMPONENTS_Switch: string;
  readonly VITE_USED_COMPONENTS_Table: string;
  readonly VITE_USED_COMPONENTS_TableEditor: string;
  readonly VITE_USED_COMPONENTS_TabItem: string;
  readonly VITE_USED_COMPONENTS_TabsForm: string;
  readonly VITE_USED_COMPONENTS_Textarea: string;
  readonly VITE_USED_COMPONENTS_Text: string;
  readonly VITE_USED_COMPONENTS_TileGrid: string;
  readonly VITE_USED_COMPONENTS_Tree: string;
  readonly VITE_USED_COMPONENTS_TreeDisplay: string;
  readonly VITE_USED_COMPONENTS_XmluiCodeHightlighter: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declarations for XMLUI files
declare module "*.xmlui" {
  interface XmluiModule {
    component: any;
    src: string;
    file: string;
  }
  const content: XmluiModule;
  export default content;
}

declare module "*.xmlui.xs" {
  interface XmluiCodeBehindModule {
    [key: string]: any;
    src: string;
  }
  const content: XmluiCodeBehindModule;
  export default content;
}

declare module "*.xs" {
  interface XmluiScriptModule {
    [key: string]: any;
    src: string;
  }
  const content: XmluiScriptModule;
  export default content;
}

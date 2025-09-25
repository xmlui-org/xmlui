/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

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

/// <reference types="vite/client" />

declare module "*.css";

declare module "*.module.scss?xmlui-theme-vars" {
  const source: string;
  export default source;
}

declare module "*?url" {
  const url: string;
  export default url;
}

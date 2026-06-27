/// <reference types="vite/client" />

declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.css";
declare module "smart-webcomponents-react/source/modules/smart.gauge.js";

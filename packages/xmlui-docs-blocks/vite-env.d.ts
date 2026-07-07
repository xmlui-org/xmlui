/// <reference types="vite/client" />

declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.xmlui" {
  const source: string;
  export default source;
}

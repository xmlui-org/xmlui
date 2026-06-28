/// <reference types="vite/client" />

declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.module.scss?xmlui-theme-vars" {
  const source: string;
  export default source;
}

declare module "*.module.scss?xmlui-css-module" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.svg?react" {
  import type { FunctionComponent, SVGProps } from "react";

  const Component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default Component;
}

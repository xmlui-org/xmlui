/// <reference types="next-plugin-svgr/types/svg" />

declare module '*.svg?react' {
    import { FC, SVGProps } from 'react';
    const ReactComponent: FC<SVGProps<SVGSVGElement>>;
    //
    // const src: string;
    export default ReactComponent;
}

declare module '*?url' {
    const src: string;
    export default src;
}

declare module '*.xmlui' {
    const src: string;
    export default src;
}

/// <reference types="vite/client" />

declare module '*?raw' {
    const content: string;
    export default content;
}

declare module '*?worker&url' {
    const content: string;
    export default content;
}

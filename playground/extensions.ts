import playground from "./src/extension";

const extensionGlobs = import.meta.glob<any>("../packages/xmlui-*/src/index.tsx", { eager: true });

const allExtensions = Object.values(extensionGlobs).map((mod) => mod.default);

export default [playground, ...allExtensions];

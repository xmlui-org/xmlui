import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { default as ViteYaml } from "@modyfi/vite-plugin-yaml";
import { default as ViteUeml } from "./vite-ueml-plugin";
import * as path from "path";

type ViteConfigData = {
  flatDist?: boolean;
  withRelativeRoot?: boolean;
  flatDistUiPrefix?: string;
  withLegacyParser?: boolean;
};

export function getViteConfig({
  flatDist = false,
  withRelativeRoot = false,
  flatDistUiPrefix = "",
  withLegacyParser = false,
}: ViteConfigData = {}) {
  return defineConfig({
    plugins: [react(), svgr(), ViteYaml(), ViteUeml({ withLegacyParser })],
    resolve: {
      alias: {
        "@abstractions": path.resolve(__dirname, "../src/abstractions"),
        "@core": path.resolve(__dirname, "../src/core"),
        "@components-core": path.resolve(__dirname, "../src/components-core"),
        "@components": path.resolve(__dirname, "../src/components"),
      },
    },
    base: withRelativeRoot ? "" : undefined,
    // experimental: {
    //   renderBuiltUrl: (filename, {type, hostType, hostId}) =>{
    //     if (type === 'asset') {
    //       // return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
    //       return 'https://static.themohoz.com/xmlui/v0.31/' + filename
    //     } else {
    //       return { relative: true }
    //     }
    //   }
    // },
    build: {
      rollupOptions: {
        input: path.resolve(process.cwd(), "index.html"),
        output: {
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split(".").pop();
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
              return flatDist
                ? `${flatDistUiPrefix}internal_img_[name].[hash][extname]`
                : `internal/img/[name].[hash][extname]`;
            }
            if (assetInfo.name === "index.css") {
              return flatDist
                ? `${flatDistUiPrefix}internal_[name].[hash][extname]`
                : `internal/[name].[hash][extname]`;
            }
            return flatDist
              ? `${flatDistUiPrefix}internal_chunks_[name].[hash][extname]`
              : `internal/chunks/[name].[hash][extname]`;
          },
          chunkFileNames: flatDist
            ? `${flatDistUiPrefix}internal_chunks_[name].[hash].js`
            : "internal/chunks/[name].[hash].js",
          entryFileNames: flatDist ? `${flatDistUiPrefix}internal_[name].[hash].js` : "internal/[name].[hash].js",
        },
        // treeshake: {
        //   preset: "recommended",
        //   moduleSideEffects: (id: string, external: boolean)=>{
        //     if(id.includes(path.resolve(process.cwd(), 'index.html'))){   //otherwise tree shaking doesn't work
        //       return true;
        //     }
        //     if(id.includes(path.resolve(process.cwd(), "src", 'main.tsx'))){   //otherwise tree shaking doesn't work
        //       return true;
        //     }
        //     return false;
        //   }
        // }
        //   assetFileNames: (assetInfo) => {
        //     let extType = assetInfo.name?.split(".").pop();
        //     if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
        //       return `img/[name][extname]`;
        //     }
        //     if (assetInfo.name === "index.css") {
        //       return `[name][extname]`;
        //     }
        //     return `chunks/[name][extname]`;
        //   },
        //   chunkFileNames: "chunks/[name].js",
        //   entryFileNames: "[name].js",
        // },
      },
    },
  });
}

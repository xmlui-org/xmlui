import {vitePlugin as remix} from "@remix-run/dev";
import {installGlobals} from "@remix-run/node";
import {defineConfig, loadEnv} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import viteXmluiPlugin from "xmlui/vite-xmlui-plugin";
// import { analyzer } from 'vite-bundle-analyzer'
import * as path from "node:path";

installGlobals();

export default defineConfig((env)=>{
    const envVars = {...process.env, ...loadEnv(env.mode, process.cwd())};
    const usedComponentsEnvVars = {};
    Object.entries(envVars).forEach(([key, value]) => {
        if(key.startsWith("VITE_USED_COMPONENTS")){
            usedComponentsEnvVars[`process.env.${key}`] =  JSON.stringify(value);
        }
    });
    // console.log(usedComponentsEnvVars);
    return {
        // plugins: [remix(), svgr(), viteXmluiPlugin(), tsconfigPaths(), analyzer()],
        plugins: [remix(), svgr(), viteXmluiPlugin(), tsconfigPaths()],
        ssr: {
            noExternal: ["react-icons", "react-dropzone", "xmlui", "react-remove-scroll-bar", "xmlui-charts", "xmlui-search", "xmlui-playground"],
            // noExternal: ["xmlui"],
        },
        esbuild: {
            supported: {
                "top-level-await": true, //browsers can handle top-level-await features
            },
        },
        build: {
            // minify: false,
            rollupOptions: {
                treeshake: "smallest",
                output: {
                    /**
                     * The magic happens here. This function is called for every module Vite processes.
                     * 'id' is the absolute path to the module.
                     */
                    manualChunks(id) {
                        // If the module's path includes 'node_modules' and either 'react' or 'react-dom'
                        if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                            // Return the name of the chunk you want to create.
                            return 'react-vendor';
                        }
                        if (id.toLowerCase().endsWith('.xmlui')) {
                            // Return the name of the chunk you want to create.
                            return 'xmlui-content';
                        }
                        //temp, until we can get rid of tiptap, or make it behave nice with tree-shaking
                        if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror')) {
                            return 'tiptap-vendor';
                        }
                    },
                },
            },
        },
        resolve: {
            alias: {
                // "react-dom/client": "react-dom/profiling",
                // "@components": path.resolve(__dirname, "../ui-engine/src/components"),
                // "@components-core": "xmlui/src/components-core",
                // "@parsers/*": ["./src/parsers/*"],
                // "react": path.resolve(__dirname, "../../../xmlui/node_modules/react"),

                // uncomment for linked xmlui
                "fs": path.resolve(__dirname, "./node_modules/rollup-plugin-node-polyfills/polyfills/browserify-fs"),
            },
        },
        define: {
            "process.env.VITE_BUILD_MODE": "'INLINE_ALL'",
            // "process.env.VITE_DEV_MODE": true,
            "process.env.VITE_MOCK_ENABLED": true,
            "process.env.VITE_REMIX": true,
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
            ...usedComponentsEnvVars,
            "process.env.VITE_APP_VERSION": JSON.stringify(process.env.VITE_APP_VERSION),
        },
    }
});

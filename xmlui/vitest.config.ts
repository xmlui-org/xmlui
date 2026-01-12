import viteConfig from "./vite.config";
import { defineConfig, mergeConfig } from "vitest/config";

export default defineConfig(configEnv => mergeConfig(
    viteConfig({ mode: configEnv.mode || "lib" }) as any,
    defineConfig({
      test: {
        include: ["**/tests/**/*.test.{ts,tsx}"],
        environment: "jsdom",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
      },
    })
));
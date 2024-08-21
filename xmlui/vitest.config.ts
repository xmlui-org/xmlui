import viteConfig from "./vite.config";
import { defineConfig, mergeConfig } from "vitest/config";

export default defineConfig(configEnv => mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        include: ["**/tests/**/*.test.ts"],
      },
    })
));
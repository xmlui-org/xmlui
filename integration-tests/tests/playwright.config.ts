import { defineConfig, devices } from "@playwright/test";
import path from "path";

const testAppDir = path.resolve(__dirname, "../test-app");

const portStandalone = 3212;
const portViteStart = 3213;
const portViteBuild = 3214;
const portViteSSG = 3215;

export default defineConfig({
  use: { ...devices["Desktop Chrome"], channel: "chromium" },
  webServer: [
    {
      command: `npx serve . -l ${portStandalone} --no-port-switching -s`,
      port: portStandalone,
      cwd: testAppDir,
      reuseExistingServer: true,
    },
    {
      command: `npx serve dist -l ${portViteBuild} --no-port-switching -s`,
      port: portViteBuild,
      cwd: testAppDir,
      reuseExistingServer: true,
    },
    {
      command: `npx preview-ssg dist-ssg --port ${portViteSSG}`,
      port: portViteSSG,
      cwd: testAppDir,
      reuseExistingServer: true,
    },
    {
      command: `npx xmlui start --port ${portViteStart} --withMock false`,
      port: portViteStart,
      cwd: testAppDir,
      reuseExistingServer: true,
    },
  ],
  projects: [
    {
      name: "standalone",
      use: { baseURL: `http://localhost:${portStandalone}` },
    },
    {
      name: "vite-build",
      use: { baseURL: `http://localhost:${portViteBuild}` },
    },
    {
      name: "vite-ssg",
      use: { baseURL: `http://localhost:${portViteSSG}` },
    },
    {
      name: "vite-start",
      expect: { timeout: 15_000 },
      use: { baseURL: `http://localhost:${portViteStart}` },
    },
  ],
});

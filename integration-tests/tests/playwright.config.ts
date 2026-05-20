import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { projectNames } from "./fixtures";

const testAppDir = path.resolve(__dirname, "../test-app");

const portStandalone = 3212;
const portViteStart = 3213;
const portViteBuild = 3214;
const portViteSSG = 3215;
const portViteBuildPlugin = 3216;

const allServers = [
  {
    name: "standalone",
    port: portStandalone,
    command: `npx serve . -l ${portStandalone} --no-port-switching -s`,
    cwd: testAppDir,
    reuseExistingServer: true,
  },
  {
    name: "vite-build",
    port: portViteBuild,
    command: `npx serve dist -l ${portViteBuild} --no-port-switching -s`,
    cwd: testAppDir,
    reuseExistingServer: true,
  },
  {
    name: "vite-ssg",
    port: portViteSSG,
    command: `npx preview-ssg dist-ssg --port ${portViteSSG}`,
    cwd: testAppDir,
    reuseExistingServer: true,
  },
  {
    name: "vite-start",
    port: portViteStart,
    command: `npx xmlui start --port ${portViteStart} --withMock false`,
    cwd: testAppDir,
    reuseExistingServer: true,
  },
  {
    name: "vite-build-plugin",
    port: portViteBuildPlugin,
    command: `npx serve dist-vite-plugin -l ${portViteBuildPlugin} --no-port-switching -s`,
    cwd: testAppDir,
    reuseExistingServer: true,
  },
];

const allProjects = [
  { name: "standalone", baseURL: `http://localhost:${portStandalone}` },
  { name: "vite-build", baseURL: `http://localhost:${portViteBuild}` },
  { name: "vite-ssg", baseURL: `http://localhost:${portViteSSG}` },
  { name: "vite-start", timeout: 15_000, baseURL: `http://localhost:${portViteStart}` },
  { name: "vite-build-plugin", baseURL: `http://localhost:${portViteBuildPlugin}` },
];

export default defineConfig({
  use: { ...devices["Desktop Chrome"], channel: "chromium" },
  webServer: allServers,
  projects: [
    {
      name: projectNames.STANDALONE,
      use: { baseURL: `http://localhost:${portStandalone}` },
    },
    {
      name: projectNames.VITE_BUILD,
      use: { baseURL: `http://localhost:${portViteBuild}` },
    },
    {
      name: projectNames.VITE_SSG,
      use: { baseURL: `http://localhost:${portViteSSG}` },
    },
    {
      name: projectNames.VITE_START,
      expect: { timeout: 15_000 },
      use: { baseURL: `http://localhost:${portViteStart}` },
    },
    {
      name: projectNames.VITE_BUILD_PLUGIN,
      use: { baseURL: `http://localhost:${portViteBuildPlugin}` },
    },
  ],
});

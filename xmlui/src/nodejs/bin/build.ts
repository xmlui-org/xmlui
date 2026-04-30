#!/usr/bin/env node
import "tsx";
import { cp, mkdir, rm, writeFile } from "fs/promises";
import * as dotenv from "dotenv";
import { existsSync } from "fs";
import { glob } from "glob";
import type { InlineConfig } from "vite";
import { build as viteBuild } from "vite";
import { createXmluiAppDefines } from "./xmluiEnv";
import { getViteConfig } from "./viteConfig";
import * as fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

type ApiInterceptorDefinition = any;
type ThemeDefinition = any;

// --- Set up the configuration
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true });

type StandaloneJsonConfig = {
  name: string;
  appGlobals?: Record<string, any>;
  entryPoint?: string;
  components?: string[];
  themes?: string[];
  defaultTheme?: string;
  resources?: Record<string, string>;
  apiInterceptor?: ApiInterceptorDefinition;
  resourceMap?: Record<string, string>;
};

async function getExportedJsObjects<T>(globPattern: string): Promise<Array<T>> {
  const matches = await glob(path.join(process.cwd(), globPattern).replaceAll("\\", "/"));
  const modules = await Promise.all(
    matches.map(async (file: string) => {
      return (await import(pathToFileURL(file).href)).default;
    }),
  );
  return modules;
}

async function convertResourcesDir(distRoot: string, flatDist: boolean, filePrefix: string) {
  if (!flatDist) {
    return undefined;
  }
  const resourcesDir = path.join(distRoot, "resources");
  if (!existsSync(resourcesDir)) {
    return undefined;
  }
  const files = await glob(`${resourcesDir.replaceAll("\\", "/")}/**/*`);

  const ret: Record<string, string> = {};
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (fs.statSync(file).isDirectory()) {
      continue;
    }
    const relativePath = path.relative(distRoot, file).replaceAll("\\", "/");
    const convertedResource = `${filePrefix}${relativePath.replaceAll("/", "_")}`;

    await cp(file, path.join(distRoot, convertedResource));
    ret[relativePath] = convertedResource;
  }
  return ret;
}

export function removeLeadingSlashForPath(path: string): string {
  if (path.startsWith("/")) {
    return path.substring(1);
  }
  return path;
}

type UEBuildOptions = {
  buildMode?: "CONFIG_ONLY" | "INLINE_ALL";
  flatDist?: boolean;
  withMock?: boolean;
  withHostingMetaFiles?: boolean;
  withRelativeRoot?: boolean;
};

export const build = async ({
  buildMode = "CONFIG_ONLY",
  flatDist = false,
  withMock = false,
  withHostingMetaFiles = false,
  withRelativeRoot = false,
}: UEBuildOptions) => {
  const flatDistUiPrefix = "ui_";
  console.log("Building with options:", {
    buildMode,
    flatDist,
    withMock,
    withHostingMetaFiles,
    withRelativeRoot,
  });

  await viteBuild({
    ...(await getViteConfig({
      flatDist,
      withRelativeRoot,
      flatDistUiPrefix,
    })),
    define: {
      ...createXmluiAppDefines({
        buildMode,
        mockEnabled: withMock,
        appVersion: process.env.VITE_APP_VERSION,
      }),

      "import.meta.env.VITE_USED_COMPONENTS_App": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_App,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Chart": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Chart,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_AppHeader": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_AppHeader,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Stack": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Stack,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Link": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Link,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Text": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Text,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Button": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Button,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Card": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Card,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Image": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Image,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Footer": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Footer,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_SpaceFiller": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_SpaceFiller,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Pdf": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Pdf,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Textarea": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Textarea,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Logo": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Logo,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_NavLink": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_NavLink,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_NavGroup": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_NavGroup,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Form": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Form,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Tree": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Tree,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Checkbox": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Checkbox,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Switch": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Switch,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_DotMenu": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_DotMenu,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Heading": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Heading,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Fragment": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Fragment,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Table": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Table,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_List": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_List,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_XmluiCodeHightlighter": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_XmluiCodeHightlighter,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Charts": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Charts,
      ),
      "import.meta.env.VITE_INCLUDE_HTML_COMPONENTS": JSON.stringify(
        process.env.VITE_INCLUDE_HTML_COMPONENTS,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_DatePicker": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_DatePicker,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_NavPanel": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_NavPanel,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Pages": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Pages,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_StickyBox": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_StickyBox,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Badge": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Badge,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Avatar": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Avatar,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_ContentSeparator": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_ContentSeparator,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_FlowLayout": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_FlowLayout,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_ModalDialog": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_ModalDialog,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_NoResult": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_NoResult,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Option": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Option,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_FileUploadDropZone": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_FileUploadDropZone,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Icon": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Icon,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_Items": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_Items,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_SelectionStore": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_SelectionStore,
      ),
      "import.meta.env.VITE_INCLUDE_REST_COMPONENTS": JSON.stringify(
        process.env.VITE_INCLUDE_REST_COMPONENTS,
      ),
      "import.meta.env.VITE_USED_COMPONENTS_EmojiSelector": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_EmojiSelector,
      ),
    },
  } as InlineConfig);

  if (buildMode === "INLINE_ALL") {
    return;
  }
  const distPath = "/dist";
  const themesFolder = flatDist ? "" : "themes";
  const themesFolderPath = flatDist ? distPath : path.join(distPath, themesFolder);

  function getThemeFileName(theme: ThemeDefinition) {
    return flatDist ? `${flatDistUiPrefix}theme_${theme.id}` : theme.id;
  }

  if (buildMode === "CONFIG_ONLY") {
    let appDef;
    try {
      const configPath = path.join(process.cwd(), "src", "config");
      appDef = (await import(pathToFileURL(configPath).href)).default;
    } catch (e) {
      console.log("couldn't find config");
    }

    const themePaths: string[] = [];
    const themes = await getExportedJsObjects<ThemeDefinition>("/src/themes/**.*");
    const fullDistPath = path.join(process.cwd(), distPath);
    if (themes) {
      for (const theme of themes) {
        if (!existsSync(path.join(process.cwd(), themesFolderPath))) {
          await mkdir(path.join(process.cwd(), themesFolderPath), { recursive: true });
        }
        await writeFile(
          path.join(process.cwd(), themesFolderPath, `${getThemeFileName(theme)}.json`),
          JSON.stringify(theme, null, 4),
        );
        themePaths.push(
          removeLeadingSlashForPath(path.join(themesFolder, `${getThemeFileName(theme)}.json`)),
        );
      }
    }

    const configJson: StandaloneJsonConfig = {
      ...appDef,
      resourceMap: await convertResourcesDir(fullDistPath, flatDist, flatDistUiPrefix),
      themes: themePaths,
    };
    delete configJson["components"];
    delete configJson["entryPoint"];
    if (!withMock) {
      delete configJson.apiInterceptor;
    }
    await writeFile(
      path.join(process.cwd(), distPath, "config.json"),
      JSON.stringify(configJson, null, 4),
    );
  }

  //TODO temp, we should enforce user(who writes the metadata)-added-resources to be put in the resources folder
  if (flatDist) {
    await rm(path.join(process.cwd(), distPath, "resources"), { recursive: true, force: true });
  }
  if (!withMock) {
    try {
      await rm(path.join(process.cwd(), distPath, "mockServiceWorker.js"));
    } catch (ignored) {}
  }
  if (!withHostingMetaFiles) {
    try {
      await rm(path.join(process.cwd(), distPath, "serve.json"));
    } catch (ignored) {}

    try {
      await rm(path.join(process.cwd(), distPath, "web.config"));
    } catch (ignored) {}
    try {
      await rm(path.join(process.cwd(), distPath, "_redirects"));
    } catch (ignored) {}
  }
};

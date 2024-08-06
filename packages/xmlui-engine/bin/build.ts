#!/usr/bin/env node

import { cp, mkdir, rm, writeFile } from "fs/promises";
import * as dotenv from "dotenv";
import { existsSync } from "fs";
import * as glob from "glob";
import type { InlineConfig } from "vite";
import { build as viteBuild } from "vite";
import { getViteConfig } from "./viteConfig";
import * as fs from "node:fs";

type ApiInterceptorDefinition = any;
type CompoundComponentDef = any;
type ThemeDefinition = any;

// --- Set up the configuration
dotenv.config({ path: `${process.cwd()}/.env` });
dotenv.config({ path: `${process.cwd()}/.env.local`, override: true });

type StandaloneJsonConfig = {
  name: string;
  globals?: Record<string, any>;
  entryPoint?: string;
  components?: string[];
  themes?: string[];
  defaultTheme?: string;
  resources?: Record<string, string>;
  apiInterceptor?: ApiInterceptorDefinition;
  resourceMap?: Record<string, string>;
};

async function getExportedJsObjects<T>(path: string): Promise<Array<T>> {
  return await new Promise((resolve, reject) => {
    glob.glob(`${process.cwd()}/${path}`, (err: any, matches = []) => {
      const modules = Promise.all(
        matches.map(async (file: string) => {
          return (await import(file)).default;
        })
      );
      resolve(modules);
    });
  });
}

async function convertResourcesDir(distRoot: string, flatDist: boolean, filePrefix: string) {
  if (!flatDist) {
    return undefined;
  }
  distRoot = distRoot.replaceAll("\\", "/");
  const resourcesDir = `${distRoot}/resources`;
  if (!existsSync(resourcesDir)) {
    return undefined;
  }
  const files = await new Promise<string[]>((resolve, reject) => {
    glob.glob(`${resourcesDir}/**/*`, (err: any, matches = []) => {
      resolve(matches);
    });
  });

  const ret: Record<string, string> = {};
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (fs.statSync(file).isDirectory()) {
      continue;
    }
    const relativePath = file.replace(`${distRoot}/`, "");
    const convertedResource = `${filePrefix}${relativePath.replaceAll("/", "_")}`;

    await cp(file, `${distRoot}/${convertedResource}`);
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
  buildMode?: "CONFIG_ONLY" | "INLINE_ALL" | "ALL";
  flatDist?: boolean;
  withMock?: boolean;
  withHostingMetaFiles?: boolean;
  withRelativeRoot?: boolean;

  // --- Experimental options
  withLegacyParser?: boolean;
};

export const build = async ({
  buildMode = "CONFIG_ONLY",
  flatDist = false,
  withMock = false,
  withHostingMetaFiles = false,
  withRelativeRoot = false,
  withLegacyParser = false,
}: UEBuildOptions) => {
  const flatDistUiPrefix = "ui_";
  console.log("Building with options:", {
    buildMode,
    flatDist,
    withMock,
    withHostingMetaFiles,
    withRelativeRoot,
    withLegacyParser
  });

  await viteBuild({
    ...getViteConfig({
      flatDist,
      withRelativeRoot,
      flatDistUiPrefix,
      withLegacyParser,
    }),
    define: {
      "process.env.VITE_BUILD_MODE": JSON.stringify(buildMode),
      "process.env.VITE_DEV_MODE": false,
      "process.env.VITE_MOCK_ENABLED": withMock,
      "process.env.VITE_LEGACY_PARSER": withLegacyParser,
      "process.env.VITE_APP_VERSION": JSON.stringify(process.env.VITE_APP_VERSION),

      "process.env.VITE_USED_COMPONENTS_App": JSON.stringify(process.env.VITE_USED_COMPONENTS_App),
      "process.env.VITE_USED_COMPONENTS_Chart": JSON.stringify(process.env.VITE_USED_COMPONENTS_Chart),
      "process.env.VITE_USED_COMPONENTS_AppHeader": JSON.stringify(process.env.VITE_USED_COMPONENTS_AppHeader),
      "process.env.VITE_USED_COMPONENTS_Stack": JSON.stringify(process.env.VITE_USED_COMPONENTS_Stack),
      "process.env.VITE_USED_COMPONENTS_Link": JSON.stringify(process.env.VITE_USED_COMPONENTS_Link),
      "process.env.VITE_USED_COMPONENTS_Text": JSON.stringify(process.env.VITE_USED_COMPONENTS_Text),
      "process.env.VITE_USED_COMPONENTS_Button": JSON.stringify(process.env.VITE_USED_COMPONENTS_Button),
      "process.env.VITE_USED_COMPONENTS_Card": JSON.stringify(process.env.VITE_USED_COMPONENTS_Card),
      "process.env.VITE_USED_COMPONENTS_Image": JSON.stringify(process.env.VITE_USED_COMPONENTS_Image),
      "process.env.VITE_USED_COMPONENTS_Footer": JSON.stringify(process.env.VITE_USED_COMPONENTS_Footer),
      "process.env.VITE_USED_COMPONENTS_SpaceFiller": JSON.stringify(process.env.VITE_USED_COMPONENTS_SpaceFiller),
      "process.env.VITE_USED_COMPONENTS_Pdf": JSON.stringify(process.env.VITE_USED_COMPONENTS_Pdf),
      "process.env.VITE_USED_COMPONENTS_Textarea": JSON.stringify(process.env.VITE_USED_COMPONENTS_Textarea),
      "process.env.VITE_USED_COMPONENTS_Logo": JSON.stringify(process.env.VITE_USED_COMPONENTS_Logo),
      "process.env.VITE_USED_COMPONENTS_NavLink": JSON.stringify(process.env.VITE_USED_COMPONENTS_NavLink),
      "process.env.VITE_USED_COMPONENTS_NavGroup": JSON.stringify(process.env.VITE_USED_COMPONENTS_NavGroup),
      "process.env.VITE_USED_COMPONENTS_Form": JSON.stringify(process.env.VITE_USED_COMPONENTS_Form),
      "process.env.VITE_USED_COMPONENTS_Tree": JSON.stringify(process.env.VITE_USED_COMPONENTS_Tree),
      "process.env.VITE_USED_COMPONENTS_Checkbox": JSON.stringify(process.env.VITE_USED_COMPONENTS_Checkbox),
      "process.env.VITE_USED_COMPONENTS_Switch": JSON.stringify(process.env.VITE_USED_COMPONENTS_Switch),
      "process.env.VITE_USED_COMPONENTS_DotMenu": JSON.stringify(process.env.VITE_USED_COMPONENTS_DotMenu),
      "process.env.VITE_USED_COMPONENTS_Heading": JSON.stringify(process.env.VITE_USED_COMPONENTS_Heading),
      "process.env.VITE_USED_COMPONENTS_Fragment": JSON.stringify(process.env.VITE_USED_COMPONENTS_Fragment),
      "process.env.VITE_USED_COMPONENTS_Table": JSON.stringify(process.env.VITE_USED_COMPONENTS_Table),
      "process.env.VITE_USED_COMPONENTS_List": JSON.stringify(process.env.VITE_USED_COMPONENTS_List),
      "process.env.VITE_USED_COMPONENTS_DateRangePicker": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_DateRangePicker
      ),
      "process.env.VITE_USED_COMPONENTS_DatePicker": JSON.stringify(process.env.VITE_USED_COMPONENTS_DatePicker),
      "process.env.VITE_USED_COMPONENTS_NavPanel": JSON.stringify(process.env.VITE_USED_COMPONENTS_NavPanel),
      "process.env.VITE_USED_COMPONENTS_Pages": JSON.stringify(process.env.VITE_USED_COMPONENTS_Pages),
      "process.env.VITE_USED_COMPONENTS_StickyBox": JSON.stringify(process.env.VITE_USED_COMPONENTS_StickyBox),
      "process.env.VITE_USED_COMPONENTS_Badge": JSON.stringify(process.env.VITE_USED_COMPONENTS_Badge),
      "process.env.VITE_USED_COMPONENTS_Avatar": JSON.stringify(process.env.VITE_USED_COMPONENTS_Avatar),
      "process.env.VITE_USED_COMPONENTS_ContentSeparator": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_ContentSeparator
      ),
      "process.env.VITE_USED_COMPONENTS_FlowLayout": JSON.stringify(process.env.VITE_USED_COMPONENTS_FlowLayout),
      "process.env.VITE_USED_COMPONENTS_ModalDialog": JSON.stringify(process.env.VITE_USED_COMPONENTS_ModalDialog),
      "process.env.VITE_USED_COMPONENTS_NoResult": JSON.stringify(process.env.VITE_USED_COMPONENTS_NoResult),
      "process.env.VITE_USED_COMPONENTS_Option": JSON.stringify(process.env.VITE_USED_COMPONENTS_Option),
      "process.env.VITE_USED_COMPONENTS_FileUploadDropZone": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_FileUploadDropZone
      ),
      "process.env.VITE_USED_COMPONENTS_Icon": JSON.stringify(process.env.VITE_USED_COMPONENTS_Icon),
      "process.env.VITE_USED_COMPONENTS_Items": JSON.stringify(process.env.VITE_USED_COMPONENTS_Items),
      "process.env.VITE_USED_COMPONENTS_SelectionStore": JSON.stringify(
        process.env.VITE_USED_COMPONENTS_SelectionStore
      ),
      "process.env.VITE_INCLUDE_REST_COMPONENTS": JSON.stringify(process.env.VITE_INCLUDE_REST_COMPONENTS),
    },
  } as InlineConfig);

  if (buildMode === "INLINE_ALL") {
    return;
  }
  const distPath = "/dist";
  const themesFolder = flatDist ? "" : "themes";
  const componentsFolder = flatDist ? "" : "components";
  const themesFolderPath = flatDist ? distPath : `${distPath}/${themesFolder}`;
  const componentsFolderPath = flatDist ? distPath : `${distPath}/${componentsFolder}`;

  function getThemeFileName(theme: ThemeDefinition) {
    return flatDist ? `${flatDistUiPrefix}theme_${theme.id}` : theme.id;
  }

  function getComponentFileName(component: CompoundComponentDef) {
    return flatDist ? `${flatDistUiPrefix}component_${component.name}` : component.name;
  }

  function getEntrypointFileName() {
    return flatDist ? `${flatDistUiPrefix}entrypoint` : `app`;
  }

  if (buildMode === "CONFIG_ONLY") {
    let appDef;
    try {
      appDef = (await import(process.cwd() + "/src/config")).default;
    } catch (e) {
      console.log("couldn't find config");
    }

    const themePaths: string[] = [];
    const themes = await getExportedJsObjects<ThemeDefinition>("/src/themes/**.*");
    const fullDistPath = `${process.cwd()}${distPath}`;
    if (themes) {
      for (const theme of themes) {
        if (!existsSync(process.cwd() + themesFolderPath)) {
          await mkdir(process.cwd() + themesFolderPath, { recursive: true });
        }
        await writeFile(
          `${process.cwd()}${themesFolderPath}/${getThemeFileName(theme)}.json`,
          JSON.stringify(theme, null, 4)
        );
        themePaths.push(removeLeadingSlashForPath(`${themesFolder}/${getThemeFileName(theme)}.json`));
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
    await writeFile(`${process.cwd()}${distPath}/config.json`, JSON.stringify(configJson, null, 4));
  } else if (buildMode === "ALL") {
    // const componentPaths: string[] = [];
    //   const components = await getExportedJsObjects<CompoundComponentDef>("/src/components/**.*");
    //   if (components) {
    //     for (const component of components) {
    //       if (!existsSync(`${process.cwd()}${componentsFolderPath}`)) {
    //         await mkdir(`${process.cwd()}${componentsFolderPath}`, { recursive: true });
    //       }
    //       await writeFile(
    //           `${process.cwd()}${componentsFolderPath}/${getComponentFileName(component)}.json`,
    //           JSON.stringify(component, null, 4)
    //       );
    //       componentPaths.push(removeLeadingSlashForPath(`${componentsFolder}/${getComponentFileName(component)}.json`));
    //     }
    //   }
    //
    // await writeFile(
    //   `${process.cwd()}${distPath}/${getEntrypointFileName()}.json`,
    //   JSON.stringify(appDef.entryPoint, null, 4)
    // );
    //
    // configJson = {
    //   ...configJson,
    //   entryPoint: `${getEntrypointFileName()}.json`,
    //   components: componentPaths,
    // };
  }

  //TODO temp, we should enforce user(who writes the metadata)-added-resources to be put in the resources folder
  if (flatDist) {
    await rm(`${process.cwd()}${distPath}/resources`, { recursive: true, force: true });
  }
  if (!withMock) {
    try {
      await rm(`${process.cwd()}${distPath}/mockServiceWorker.js`);
    } catch (ignored) {}
  }
  if (!withHostingMetaFiles) {
    try {
      await rm(`${process.cwd()}${distPath}/serve.json`);
    } catch (ignored) {}

    try {
      await rm(`${process.cwd()}${distPath}/web.config`);
    } catch (ignored) {}
    try {
      await rm(`${process.cwd()}${distPath}/_redirects`);
    } catch (ignored) {}
  }
};

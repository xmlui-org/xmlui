import { access, copyFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const ssgDir = path.resolve(rootDir, "dist-ssg");
const ssgStaticWebAppConfig = path.join(ssgDir, "ssg-staticwebapp.config.json");
const staticWebAppConfig = path.join(ssgDir, "staticwebapp.config.json");

try {
  await access(ssgStaticWebAppConfig);
  await copyFile(ssgStaticWebAppConfig, staticWebAppConfig);
  console.log("Prepared SSG staticwebapp.config.json from ssg-staticwebapp.config.json");
} catch (error) {
  throw new Error(
    `Expected SSG Static Web Apps config was not found: ${path.relative(rootDir, ssgStaticWebAppConfig)}`,
    { cause: error },
  );
}

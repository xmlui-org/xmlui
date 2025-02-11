import { join, dirname } from "path";
import { fileURLToPath } from "url";

export const FOLDERS = {
  script: import.meta.dirname,
  projectRoot: join(dirname(fileURLToPath(import.meta.url)), "../../../"),
  docsRoot: join(dirname(fileURLToPath(import.meta.url)), "../../../", "docs"),
  pages: join(dirname(fileURLToPath(import.meta.url)), "../../../", "docs", "pages"),
  docsMeta: join(dirname(fileURLToPath(import.meta.url)), "../../../", "docs", "meta"),
}

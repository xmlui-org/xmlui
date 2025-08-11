import { join, dirname } from "path";
import { fileURLToPath } from "url";

export const FOLDERS = {
  // import.meta.dirname only works in with ES Modules (Node.js 20.11+)
  // fallback used for older Node versions (support Node.js 15+)
  script: import.meta.dirname ?? fileURLToPath(new URL('.', import.meta.url)),
  xmluiDist: join(dirname(fileURLToPath(import.meta.url)), "../../", "dist"),
  projectRoot: join(dirname(fileURLToPath(import.meta.url)), "../../../"),
  docsRoot: join(dirname(fileURLToPath(import.meta.url)), "../../../", "docs"),
  pages: join(dirname(fileURLToPath(import.meta.url)), "../../../", "docs", "pages"),
  docsMeta: join(dirname(fileURLToPath(import.meta.url)), "../../../", "docs", "meta"),
}

export const XMLUI_SSG_DATA_ATTRIBUTES = {
  searchIndexFile: "data-xmlui-ssg-search-index-file",
} as const;

export type SsgEnv = {
  searchIndexFile: string;
};

export function extractSsgEnvFromRoot(root: HTMLElement | null): SsgEnv | undefined {
  if (!root) {
    return undefined;
  }

  const searchIndexFile = root.getAttribute(XMLUI_SSG_DATA_ATTRIBUTES.searchIndexFile);
  if (!searchIndexFile) {
    return undefined;
  }

  return { searchIndexFile };
}

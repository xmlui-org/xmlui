import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./ReleaseList.xmlui";

export const ReleaseListMd = createMetadata({
  status: "experimental",
  description:
    "Release list. Items: tag_name or version, published_at, changes[{ description, commit_sha }], optional assets[{ name, browser_download_url }].",
  props: {
    items: { description: "Array of release entries." },
    title: { description: "Page title. Default: 'Change Log'." },
    commitBaseUrl: {
      description:
        "Base URL for commit links (e.g. 'https://github.com/org/repo/commit'). If set, each change shows a link using commit_sha.",
    },
    showLatestBadge: {
      description: "Show 'Latest' badge on first item. Default: true.",
    },
    downloadLabel: { description: "Label for download button. Default: 'Download'." },
  },
});

export const releaseListRenderer = createUserDefinedComponentRenderer(
  ReleaseListMd,
  componentSource,
);

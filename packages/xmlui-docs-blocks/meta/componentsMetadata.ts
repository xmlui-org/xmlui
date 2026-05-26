import { BasicLayoutMd } from "../src/layouts/BasicLayout";
import { FeaturedWithTabsLayoutMd } from "../src/layouts/FeaturedWithTabsLayout";
import { OverviewCardMd } from "../src/docs/OverviewCard";
import { BreadcrumbsMd } from "../src/docs/Breadcrumbs/Breadcrumbs";
import { SeparatorMd } from "../src/docs/Separator";
import { LinkButtonMd } from "../src/docs/LinkButton";
import { DocumentLinksMd } from "../src/docs/DocumentLinks";
import { DocumentPageMd } from "../src/docs/DocumentPage";
import { DocumentPageNoTOCMd } from "../src/docs/DocumentPageNoTOC";
import { TBDMd } from "../src/docs/TBD";
import { SectionHeaderMd } from "../src/docs/SectionHeader";
import { OverviewMd } from "../src/docs/Overview";
import { TwoColumnCodeMd } from "../src/docs/TwoColumnCode";
import { PageNotFoundMd } from "../src/docs/PageNotFound";
import { ReleaseListMd } from "../src/docs/ReleaseList";
import { ReadingTimeMd } from "../src/blog/ReadingTime";
import { ShareMd } from "../src/blog/Share";

export const componentMetadata = {
  name: "Docs",
  state: "experimental",
  description: "This package contains components for building documentation websites with XMLUI.",
  metadata: {
    BasicLayout: BasicLayoutMd,
    FeaturedWithTabsLayout: FeaturedWithTabsLayoutMd,
    OverviewCard: OverviewCardMd,
    Breadcrumbs: BreadcrumbsMd,
    Separator: SeparatorMd,
    LinkButton: LinkButtonMd,
    DocumentLinks: DocumentLinksMd,
    DocumentPage: DocumentPageMd,
    DocumentPageNoTOC: DocumentPageNoTOCMd,
    TBD: TBDMd,
    SectionHeader: SectionHeaderMd,
    Overview: OverviewMd,
    TwoColumnCode: TwoColumnCodeMd,
    PageNotFound: PageNotFoundMd,
    ReleaseList: ReleaseListMd,
    ReadingTime: ReadingTimeMd,
    Share: ShareMd,
  },
};

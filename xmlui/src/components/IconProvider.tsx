import type { ForwardedRef, ReactNode } from "react";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FiAlertOctagon,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClipboard,
  FiDownload,
  FiFolder,
  FiGrid,
  FiHardDrive,
  FiHelpCircle,
  FiKey,
  FiLock,
  FiRefreshCcw,
  FiSlash,
  FiStar,
  FiUpload,
  FiUser,
  FiUserMinus,
  FiUserPlus,
  FiUsers,
  FiX,
  FiChevronsRight,
  FiChevronsLeft,
  FiChevronsDown,
  FiChevronsUp,
} from "react-icons/fi";
import { AiOutlineLike, AiOutlineMenu, AiOutlinePlusCircle, AiOutlineSend } from "react-icons/ai";
import {
  BsArrowDownShort,
  BsPause,
  BsPlay,
  BsArrowLeftShort,
  BsArrowRightShort,
  BsArrowUpShort,
  BsChatDots,
  BsHash,
  BsReply,
  BsSquare,
  BsSquareFill,
  BsSquareHalf,
} from "react-icons/bs";
import { GrDocumentConfig, GrEmoji, GrNext, GrPrevious } from "react-icons/gr";
import {
  IoChatboxOutline,
  IoCubeOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoPencil,
  IoSwapVertical,
} from "react-icons/io5";
import { MdOutlineDriveFileRenameOutline, MdOutlinePalette } from "react-icons/md";
import { RiAttachment2, RiMessage2Line, RiStickyNoteLine } from "react-icons/ri";
import { VscDebugStart, VscDebugStop, VscSplitHorizontal, VscSplitVertical } from "react-icons/vsc";
import { RxExit, RxLightningBolt, RxOpenInNewWindow } from "react-icons/rx";
import { HiOutlinePaintBrush, HiSun } from "react-icons/hi2";
import { TfiReload } from "react-icons/tfi";
import { HiOutlineCog, HiOutlineDuplicate } from "react-icons/hi";
import { CiCalendarDate } from "react-icons/ci";

import { IconRegistryContext } from "./IconRegistryContext";
import type { IconBaseProps } from "./Icon/IconNative";
import { ApiIcon } from "./Icon/ApiIcon";
import { AttachmentIcon } from "./Icon/Attach";
import { BindingIcon } from "./Icon/Binding";
import { BoardIcon } from "./Icon/BoardIcon";
import { BoxIcon } from "./Icon/BoxIcon";
import { CheckIcon } from "./Icon/CheckIcon";
import { ChevronLeftIcon } from "./Icon/ChevronLeft";
import { ChevronRightIcon } from "./Icon/ChevronRight";
import { CodeFileIcon } from "./Icon/CodeFileIcon";
import { CodeSandboxIcon } from "./Icon/CodeSandbox";
import { CompactListIcon } from "./Icon/CompactListIcon";
import { ContentCopyIcon } from "./Icon/ContentCopyIcon";
import { DatabaseIcon } from "./Icon/DatabaseIcon";
import { DocFileIcon } from "./Icon/DocFileIcon";
import { DocIcon } from "./Icon/DocIcon";
import { DotMenuHorizontalIcon } from "./Icon/DotMenuHorizontalIcon";
import { DotMenuIcon } from "./Icon/DotMenuIcon";
import { EmailIcon } from "./Icon/EmailIcon";
import { EmptyFolderIcon } from "./Icon/EmptyFolderIcon";
import { ExpressionIcon } from "./Icon/ExpressionIcon";
import { FillPlusCircleIcon } from "./Icon/FillPlusCricleIcon";
import { FilterIcon } from "./Icon/FilterIcon";
import { FolderIcon } from "./Icon/FolderIcon";
import { GlobeIcon } from "./Icon/GlobeIcon";
import { HomeIcon } from "./Icon/HomeIcon";
import { HyperLinkIcon } from "./Icon/HyperLinkIcon";
import { ImageFileIcon } from "./Icon/ImageFileIcon";
import { LinkIcon } from "./Icon/LinkIcon";
import { ListIcon } from "./Icon/ListIcon";
import { LooseListIcon } from "./Icon/LooseListIcon";
import { MoreOptionsIcon } from "./Icon/MoreOptionsIcon";
import { PDFIcon } from "./Icon/PDFIcon";
import { PenIcon } from "./Icon/PenIcon";
import { PhoneIcon } from "./Icon/PhoneIcon";
import { PhotoIcon } from "./Icon/PhotoIcon";
import { PlusIcon } from "./Icon/PlusIcon";
import { SearchIcon } from "./Icon/SearchIcon";
import { ShareIcon } from "./Icon/ShareIcon";
import { TrashIcon } from "./Icon/TrashIcon";
import { TxtIcon } from "./Icon/TxtIcon";
import { UnknownFileIcon } from "./Icon/UnknownFileIcon";
import { UnlinkIcon } from "./Icon/UnlinkIcon";
import { UserIcon } from "./Icon/UserIcon";
import { WarningIcon } from "./Icon/WarningIcon";
import { XlsIcon } from "./Icon/XlsIcon";
import { ErrorIcon } from "./Icon/ErrorIcon";
import { TrendingUpIcon } from "./Icon/TrendingUpIcon";
import { TrendingDownIcon } from "./Icon/TrendingDownIcon";
import { SortAscendingIcon } from "./Icon/SortAscendingIcon";
import { SortDescendingIcon } from "./Icon/SortDescendingIcon";
import { NoSortIcon } from "./Icon/NoSortIcon";
import { TrendingLevelIcon } from "./Icon/TrendingLevelIcon";
import { InspectIcon } from "./Icon/Inspect";
import { MoonIcon } from "./Icon/MoonIcon";
import { StarsIcon } from "./Icon/StarsIcon";
import { LightToDarkIcon } from "./Icon/LightToDark";
import { DarkToLightIcon } from "./Icon/DarkToLightIcon";
import { AdmonitionInfoIcon } from "./Icon/AdmonitionInfo";
import { AdmonitionWarningIcon } from "./Icon/AdmonitionWarning";
import { AdmonitionDangerIcon } from "./Icon/AdmonitionDanger";
import { AdmonitionNoteIcon } from "./Icon/AdmonitionNote";
import { AdmonitionTipIcon } from "./Icon/AdmonitionTip";
import TableInsertRowIcon from "./Icon/TableInsertRowIcon";
import TableDeleteRowIcon from "./Icon/TableDeleteRowIcon";
import TableInsertColumnIcon from "./Icon/TableInsertColumnIcon";
import TableDeleteColumnIcon from "./Icon/TableDeleteColumnIcon";

type IconRenderer<T extends IconBaseProps> = (props: T, ref: ForwardedRef<HTMLElement>) => React.ReactElement<T>;

type IconRegistryEntry = {
  renderer: IconRenderer<any>;
};

type CustomSvgIcon = {
  attributes: Record<string, any>;
  name: string;
};
export type IconRegistry = {
  getRegisteredIconNames: () => Array<string>;
  lookupIconRenderer: (name: string) => IconRegistryEntry | undefined;
  ensureCustomSvgIcon: (resourceName: string) => Promise<void>;
  customSvgs: Record<string, CustomSvgIcon>;
};

const pool = new Map<string, IconRegistryEntry>();

function registerIconRenderer(name: string | string[], renderer: IconRenderer<any>) {
  if (typeof name === "object") {
    name.forEach((n) => {
      pool.set(n, { renderer });
    });
  } else {
    pool.set(name.toLowerCase(), { renderer });
  }
}

registerIconRenderer("assign", (props: IconBaseProps) => <FiUser {...props} />);
registerIconRenderer("arrowup", (props: IconBaseProps) => <BsArrowUpShort {...props} />);
registerIconRenderer("arrowleft", (props: IconBaseProps) => <BsArrowLeftShort {...props} />);
registerIconRenderer("arrowright", (props: IconBaseProps) => <BsArrowRightShort {...props} />);
registerIconRenderer("pause", (props: IconBaseProps) => <BsPause {...props} />);
registerIconRenderer("play", (props: IconBaseProps) => <BsPlay {...props} />);
registerIconRenderer("date", (props: IconBaseProps) => <CiCalendarDate {...props} />);
registerIconRenderer("hamburger", (props: IconBaseProps) => <AiOutlineMenu {...props} />);
registerIconRenderer("send", (props: IconBaseProps) => <AiOutlineSend {...props} />);
registerIconRenderer("users", (props: IconBaseProps) => <FiUsers {...props} />);
registerIconRenderer("refresh", (props: IconBaseProps) => <FiRefreshCcw {...props} />);
registerIconRenderer("chevrondown", (props: IconBaseProps) => <FiChevronDown {...props} />);
registerIconRenderer("chevronup", (props: IconBaseProps) => <FiChevronUp {...props} />);
registerIconRenderer("chevronright", (props: IconBaseProps) => <ChevronRightIcon {...props} />);
registerIconRenderer("chevronleft", (props: IconBaseProps) => <ChevronLeftIcon {...props} />);
registerIconRenderer("doublechevrondown", (props: IconBaseProps) => <FiChevronsDown {...props} />);
registerIconRenderer("doublechevronup", (props: IconBaseProps) => <FiChevronsUp {...props} />);
registerIconRenderer("doublechevronright", (props: IconBaseProps) => <FiChevronsRight {...props} />);
registerIconRenderer("doublechevronleft", (props: IconBaseProps) => <FiChevronsLeft {...props} />);
registerIconRenderer("dotmenu", (props: IconBaseProps) => <DotMenuIcon {...props} />);
registerIconRenderer("dotmenuhorizontal", (props: IconBaseProps) => (
  <DotMenuHorizontalIcon {...props} />
));
registerIconRenderer("noresult", (props: IconBaseProps) => <FiSlash {...props} />);
registerIconRenderer("crm", (props: IconBaseProps) => <IoChatboxOutline {...props} />);
registerIconRenderer("chat", (props: IconBaseProps) => <IoChatboxOutline {...props} />);
registerIconRenderer("pencil", (props: IconBaseProps) => <IoPencil {...props} />);
registerIconRenderer("cube", (props: IconBaseProps) => <IoCubeOutline {...props} />);
registerIconRenderer("apps", (props: IconBaseProps) => <FiGrid {...props} />);
registerIconRenderer("permissions", (props: IconBaseProps) => <FiKey {...props} />);
registerIconRenderer("close", (props: IconBaseProps) => <FiX {...props} />);
registerIconRenderer("star", (props: IconBaseProps) => <FiStar {...props} />);
registerIconRenderer("help", (props: IconBaseProps) => <FiHelpCircle {...props} />);
registerIconRenderer("compactlist", (props: IconBaseProps) => <CompactListIcon {...props} />);
registerIconRenderer("copy", (props: IconBaseProps) => <ContentCopyIcon {...props} />);
registerIconRenderer("move", (props: IconBaseProps) => <FiClipboard {...props} />);
registerIconRenderer("rename", (props: IconBaseProps) => (
  <MdOutlineDriveFileRenameOutline {...props} />
));
registerIconRenderer("hyperlink", (props: IconBaseProps) => <HyperLinkIcon {...props} />);
registerIconRenderer("globe", (props: IconBaseProps) => <GlobeIcon {...props} />);
registerIconRenderer("link", (props: IconBaseProps) => <LinkIcon {...props} />);
registerIconRenderer("looseList", (props: IconBaseProps) => <LooseListIcon {...props} />);
registerIconRenderer("options", (props: IconBaseProps) => <MoreOptionsIcon {...props} />);
registerIconRenderer("search", (props: IconBaseProps) => <SearchIcon {...props} />);
registerIconRenderer("filter", (props: IconBaseProps) => <FilterIcon {...props} />);
registerIconRenderer("trash", (props: IconBaseProps) => <TrashIcon {...props} />);
registerIconRenderer("pen", (props: IconBaseProps) => <PenIcon {...props} />);
registerIconRenderer("email", (props: IconBaseProps) => <EmailIcon {...props} />);
registerIconRenderer("phone", (props: IconBaseProps) => <PhoneIcon {...props} />);
registerIconRenderer("home", (props: IconBaseProps) => <HomeIcon {...props} />);
registerIconRenderer("user", (props: IconBaseProps) => <UserIcon {...props} />);
registerIconRenderer("exit", (props: IconBaseProps) => <RxExit {...props} />);
registerIconRenderer("adduser", (props: IconBaseProps) => <FiUserPlus {...props} />);
registerIconRenderer("userminus", (props: IconBaseProps) => <FiUserMinus {...props} />);
registerIconRenderer("plus", (props: IconBaseProps) => <PlusIcon {...props} />);
registerIconRenderer("inspect", (props: IconBaseProps) => <InspectIcon {...props} />);
registerIconRenderer("plus-circle", (props: IconBaseProps) => <AiOutlinePlusCircle {...props} />);
registerIconRenderer("filledplus", (props: IconBaseProps) => <FillPlusCircleIcon {...props} />);
registerIconRenderer("darktolight", (props: IconBaseProps) => <DarkToLightIcon {...props} />);
registerIconRenderer("lighttodark", (props: IconBaseProps) => <LightToDarkIcon {...props} />);
registerIconRenderer("checkmark", (props: IconBaseProps) => <CheckIcon {...props} />);
registerIconRenderer("valid", (props: IconBaseProps) => <FiCheckCircle {...props} />);
registerIconRenderer("info", (props: IconBaseProps) => <FiAlertOctagon {...props} />);
registerIconRenderer("error", (props: IconBaseProps) => <ErrorIcon {...props} />);
registerIconRenderer("warning", (props: IconBaseProps) => <WarningIcon {...props} />);
registerIconRenderer("board", (props: IconBaseProps) => <BoardIcon {...props} />);
registerIconRenderer("list", (props: IconBaseProps) => <ListIcon {...props} />);
registerIconRenderer("folder", (props: IconBaseProps) => <FolderIcon {...props} />);
registerIconRenderer("folder-outline", (props: IconBaseProps) => <FiFolder {...props} />);
registerIconRenderer("emptyfolder", (props: IconBaseProps) => <EmptyFolderIcon {...props} />);
registerIconRenderer("pdf", (props: IconBaseProps) => <PDFIcon {...props} />);
registerIconRenderer("txt", (props: IconBaseProps) => <TxtIcon {...props} />);
registerIconRenderer("doc", (props: IconBaseProps) => <DocIcon {...props} />);
registerIconRenderer("docx", (props: IconBaseProps) => <DocIcon {...props} />);
registerIconRenderer("doc-outline", (props: IconBaseProps) => <DocFileIcon {...props} />);
registerIconRenderer("conf", (props: IconBaseProps) => <GrDocumentConfig {...props} />);
registerIconRenderer("code", (props: IconBaseProps) => <CodeFileIcon {...props} />);
registerIconRenderer("codesandbox", (props: IconBaseProps) => <CodeSandboxIcon {...props} />);
registerIconRenderer("box", (props: IconBaseProps) => <BoxIcon {...props} />);
registerIconRenderer(["xls", "xlsx"], (props: IconBaseProps) => <XlsIcon {...props} />);
registerIconRenderer(
  ["jpg", "jpeg", "png", "webp", "svg", "gif", "tif", "ppt", "pptx"],
  (props: IconBaseProps) => <ImageFileIcon {...props} />,
);
registerIconRenderer("unknownfile", (props: IconBaseProps) => <UnknownFileIcon {...props} />);
registerIconRenderer("photo", (props: IconBaseProps) => <PhotoIcon {...props} />);
registerIconRenderer("previous", (props: IconBaseProps) => <GrPrevious {...props} />);
registerIconRenderer("next", (props: IconBaseProps) => <GrNext {...props} />);
registerIconRenderer("like", (props: IconBaseProps) => <AiOutlineLike {...props} />);
registerIconRenderer("reply", (props: IconBaseProps) => <BsReply {...props} />);
registerIconRenderer("attach", (props: IconBaseProps) => <AttachmentIcon {...props} />);
registerIconRenderer("attach2", (props: IconBaseProps) => <RiAttachment2 {...props} />);
registerIconRenderer("emoji", (props: IconBaseProps) => <GrEmoji {...props} />);
registerIconRenderer("message", (props: IconBaseProps) => <RiMessage2Line {...props} />);
registerIconRenderer("upload", (props: IconBaseProps) => <FiUpload {...props} />);
registerIconRenderer("split-vertical", (props: IconBaseProps) => <VscSplitVertical {...props} />);
registerIconRenderer("split-horizontal", (props: IconBaseProps) => (
  <VscSplitHorizontal {...props} />
));
registerIconRenderer("swap", (props: IconBaseProps) => <IoSwapVertical {...props} />);
registerIconRenderer("download", (props: IconBaseProps) => <FiDownload {...props} />);
registerIconRenderer("note", (props: IconBaseProps) => <RiStickyNoteLine {...props} />);
registerIconRenderer("binding", (props: IconBaseProps) => <BindingIcon {...props} />);
registerIconRenderer("database", (props: IconBaseProps) => <DatabaseIcon {...props} />);
registerIconRenderer("unlink", (props: IconBaseProps) => <UnlinkIcon {...props} />);
registerIconRenderer("api", (props: IconBaseProps) => <ApiIcon {...props} />);
registerIconRenderer("expression", (props: IconBaseProps) => <ExpressionIcon {...props} />);
registerIconRenderer("chat", (props: IconBaseProps) => <BsChatDots {...props} />);
registerIconRenderer("hash", (props: IconBaseProps) => <BsHash {...props} />);
registerIconRenderer("drive", (props: IconBaseProps) => <FiHardDrive {...props} />);
registerIconRenderer("lock", (props: IconBaseProps) => <FiLock {...props} />);
registerIconRenderer("start", (props: IconBaseProps) => <VscDebugStart {...props} />);
registerIconRenderer("stop", (props: IconBaseProps) => <VscDebugStop {...props} />);
registerIconRenderer("restart", (props: IconBaseProps) => <TfiReload {...props} />);
registerIconRenderer("duplicate", (props: IconBaseProps) => <HiOutlineDuplicate {...props} />);
registerIconRenderer("connect", (props: IconBaseProps) => <RxLightningBolt {...props} />);
registerIconRenderer("cog", (props: IconBaseProps) => <HiOutlineCog {...props} />);
registerIconRenderer("sun", (props: IconBaseProps) => <HiSun {...props} />);
registerIconRenderer("moon", (props: IconBaseProps) => <MoonIcon {...props} />);
registerIconRenderer("stars", (props: IconBaseProps) => <StarsIcon {...props} />);
registerIconRenderer("share", (props: IconBaseProps) => <ShareIcon {...props} />);
registerIconRenderer("new-window", (props: IconBaseProps) => <RxOpenInNewWindow {...props} />);
registerIconRenderer("paint", (props: IconBaseProps) => <HiOutlinePaintBrush {...props} />);
registerIconRenderer("palette", (props: IconBaseProps) => <MdOutlinePalette {...props} />);
registerIconRenderer("trending-up", (props: IconBaseProps) => <TrendingUpIcon {...props} />);
registerIconRenderer("trending-down", (props: IconBaseProps) => <TrendingDownIcon {...props} />);
registerIconRenderer("trending-level", (props: IconBaseProps) => <TrendingLevelIcon {...props} />);
registerIconRenderer("sortasc", (props: IconBaseProps) => <SortAscendingIcon {...props} />);
registerIconRenderer("sortdesc", (props: IconBaseProps) => <SortDescendingIcon {...props} />);
registerIconRenderer("nosort", (props: IconBaseProps) => <NoSortIcon {...props} />);

registerIconRenderer("admonition_info", (props: IconBaseProps) => (
  <AdmonitionInfoIcon {...props} />
));
registerIconRenderer("admonition_warning", (props: IconBaseProps) => (
  <AdmonitionWarningIcon {...props} />
));
registerIconRenderer("admonition_danger", (props: IconBaseProps) => (
  <AdmonitionDangerIcon {...props} />
));
registerIconRenderer("admonition_note", (props: IconBaseProps) => (
  <AdmonitionNoteIcon {...props} />
));
registerIconRenderer("admonition_tip", (props: IconBaseProps) => <AdmonitionTipIcon {...props} />);

// --- IDE extras (temporary)
registerIconRenderer("arrowdown", (props: IconBaseProps) => <BsArrowDownShort {...props} />);
registerIconRenderer("square", (props: IconBaseProps) => <BsSquare {...props} />);
registerIconRenderer("squarehalf", (props: IconBaseProps) => <BsSquareHalf {...props} />);
registerIconRenderer("squarefill", (props: IconBaseProps) => <BsSquareFill {...props} />);

registerIconRenderer("table-insert-row", (props) => <TableInsertRowIcon {...props} />);
registerIconRenderer("table-delete-row", (props) => <TableDeleteRowIcon {...props} />);
registerIconRenderer("table-insert-column", (props) => <TableInsertColumnIcon {...props} />);
registerIconRenderer("table-delete-column", (props) => <TableDeleteColumnIcon {...props} />);

registerIconRenderer("eye", (props) => <IoEyeOutline {...props} />);
registerIconRenderer("eye-off", (props) => <IoEyeOffOutline {...props} />);

export function IconProvider({ children }: { children: ReactNode }) {
  const getRegisteredIconNames = useCallback(() => {
    return Array.from(pool.keys());
  }, []);

  const lookupIconRenderer = useCallback((name: string): IconRegistryEntry | undefined => {
    return pool.get(name);
  }, []);

  const [customSvgs, setCustomSvgs] = useState<
    Record<string, { name: string; attributes: Record<string, any> }>
  >({});
  const attachedResources = useRef<Record<string, boolean>>({});
  const spriteRootRef = useRef<SVGSVGElement>(null);

  const ensureCustomSvgIcon = useCallback(async (resourceUrl: string) => {
    if (attachedResources.current[resourceUrl]) {
      return;
    }
    const icon = await (await fetch(resourceUrl)).text();
    const div = document.createElement("div");
    div.style.display = "none";
    div.innerHTML = icon;

    const attrs: Record<string, any> = {};
    for (let i = 0; i < div.children[0].attributes.length; i++) {
      const attr = div.children[0].attributes[i];
      if (attr.nodeName !== "class") {
        attrs[attr.nodeName] = attr.nodeValue;
      }
    }

    Object.keys(attrs).forEach((key) => {
      div.children[0].removeAttribute(key);
    });

    const d = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
    d.innerHTML = div.children[0].innerHTML;
    d.id = resourceUrl;
    d.setAttributeNS(null, "viewBox", attrs["viewBox"]);

    if (!attachedResources.current[resourceUrl]) {
      spriteRootRef.current!.appendChild(d);
      attachedResources.current[resourceUrl] = true;
    }
    const customIcon = {
      name: resourceUrl,
      attributes: attrs,
    };
    setCustomSvgs((prev) => {
      return {
        ...prev,
        [resourceUrl]: customIcon,
      };
    });
  }, []);

  const contextValue = useMemo(() => {
    return {
      getRegisteredIconNames,
      lookupIconRenderer,
      ensureCustomSvgIcon,
      customSvgs,
    };
  }, [customSvgs, ensureCustomSvgIcon, getRegisteredIconNames, lookupIconRenderer]);

  return (
    <IconRegistryContext.Provider value={contextValue}>
      {children}
      <svg style={{ display: "none" }} ref={spriteRootRef}></svg>
    </IconRegistryContext.Provider>
  );
}

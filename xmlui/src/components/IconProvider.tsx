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
import { ChevronsRightIcon } from "./Icon/ChevronsRight";
import { ChevronsLeftIcon } from "./Icon/ChevronsLeft";
import { ICON_NAMES } from "./icons-abstractions";
import {GoSidebarCollapse} from "react-icons/go";

type IconRenderer<T extends IconBaseProps> = (
  props: T,
  ref: ForwardedRef<HTMLElement>,
) => React.ReactElement<T>;

export type IconRegistryEntry = {
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

registerIconRenderer(ICON_NAMES.ASSIGN, (props: IconBaseProps) => <FiUser {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_UP, (props: IconBaseProps) => <BsArrowUpShort {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_LEFT, (props: IconBaseProps) => <BsArrowLeftShort {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_RIGHT, (props: IconBaseProps) => <BsArrowRightShort {...props} />);
registerIconRenderer(ICON_NAMES.PAUSE, (props: IconBaseProps) => <BsPause {...props} />);
registerIconRenderer(ICON_NAMES.PLAY, (props: IconBaseProps) => <BsPlay {...props} />);
registerIconRenderer(ICON_NAMES.DATE, (props: IconBaseProps) => <CiCalendarDate {...props} />);
registerIconRenderer(ICON_NAMES.HAMBURGER, (props: IconBaseProps) => <AiOutlineMenu {...props} />);
registerIconRenderer(ICON_NAMES.SEND, (props: IconBaseProps) => <AiOutlineSend {...props} />);
registerIconRenderer(ICON_NAMES.USERS, (props: IconBaseProps) => <FiUsers {...props} />);
registerIconRenderer(ICON_NAMES.REFRESH, (props: IconBaseProps) => <FiRefreshCcw {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_DOWN, (props: IconBaseProps) => <FiChevronDown {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_UP, (props: IconBaseProps) => <FiChevronUp {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_RIGHT, (props: IconBaseProps) => <ChevronRightIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_LEFT, (props: IconBaseProps) => <ChevronLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRONS_RIGHT, (props: IconBaseProps) => <ChevronsRightIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRONS_LEFT, (props: IconBaseProps) => <ChevronsLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_DOWN, (props: IconBaseProps) => <FiChevronsDown {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_UP, (props: IconBaseProps) => <FiChevronsUp {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_RIGHT, (props: IconBaseProps) => (
  <FiChevronsRight {...props} />
));
registerIconRenderer(ICON_NAMES.SIDEBAR_COLLAPSE, (props: IconBaseProps) => <GoSidebarCollapse {...props} />)
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_LEFT, (props: IconBaseProps) => <FiChevronsLeft {...props} />);
registerIconRenderer(ICON_NAMES.DOT_MENU, (props: IconBaseProps) => <DotMenuIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOT_MENU_HORIZONTAL, (props: IconBaseProps) => (
  <DotMenuHorizontalIcon {...props} />
));
registerIconRenderer(ICON_NAMES.NO_RESULT, (props: IconBaseProps) => <FiSlash {...props} />);
registerIconRenderer(ICON_NAMES.CRM, (props: IconBaseProps) => <IoChatboxOutline {...props} />);
registerIconRenderer(ICON_NAMES.CHAT, (props: IconBaseProps) => <IoChatboxOutline {...props} />);
registerIconRenderer(ICON_NAMES.PENCIL, (props: IconBaseProps) => <IoPencil {...props} />);
registerIconRenderer(ICON_NAMES.CUBE, (props: IconBaseProps) => <IoCubeOutline {...props} />);
registerIconRenderer(ICON_NAMES.APPS, (props: IconBaseProps) => <FiGrid {...props} />);
registerIconRenderer(ICON_NAMES.PERMISSIONS, (props: IconBaseProps) => <FiKey {...props} />);
registerIconRenderer(ICON_NAMES.CLOSE, (props: IconBaseProps) => <FiX {...props} />);
registerIconRenderer(ICON_NAMES.STAR, (props: IconBaseProps) => <FiStar {...props} />);
registerIconRenderer(ICON_NAMES.HELP, (props: IconBaseProps) => <FiHelpCircle {...props} />);
registerIconRenderer(ICON_NAMES.COMPACT_LIST, (props: IconBaseProps) => <CompactListIcon {...props} />);
registerIconRenderer(ICON_NAMES.COPY, (props: IconBaseProps) => <ContentCopyIcon {...props} />);
registerIconRenderer(ICON_NAMES.MOVE, (props: IconBaseProps) => <FiClipboard {...props} />);
registerIconRenderer(ICON_NAMES.RENAME, (props: IconBaseProps) => (
  <MdOutlineDriveFileRenameOutline {...props} />
));
registerIconRenderer(ICON_NAMES.HYPERLINK, (props: IconBaseProps) => <HyperLinkIcon {...props} />);
registerIconRenderer(ICON_NAMES.GLOBE, (props: IconBaseProps) => <GlobeIcon {...props} />);
registerIconRenderer(ICON_NAMES.LINK, (props: IconBaseProps) => <LinkIcon {...props} />);
registerIconRenderer(ICON_NAMES.LOOSE_LIST, (props: IconBaseProps) => <LooseListIcon {...props} />);
registerIconRenderer(ICON_NAMES.OPTIONS, (props: IconBaseProps) => <MoreOptionsIcon {...props} />);
registerIconRenderer(ICON_NAMES.SEARCH, (props: IconBaseProps) => <SearchIcon {...props} />);
registerIconRenderer(ICON_NAMES.FILTER, (props: IconBaseProps) => <FilterIcon {...props} />);
registerIconRenderer(ICON_NAMES.TRASH, (props: IconBaseProps) => <TrashIcon {...props} />);
registerIconRenderer(ICON_NAMES.PEN, (props: IconBaseProps) => <PenIcon {...props} />);
registerIconRenderer(ICON_NAMES.EMAIL, (props: IconBaseProps) => <EmailIcon {...props} />);
registerIconRenderer(ICON_NAMES.PHONE, (props: IconBaseProps) => <PhoneIcon {...props} />);
registerIconRenderer(ICON_NAMES.HOME, (props: IconBaseProps) => <HomeIcon {...props} />);
registerIconRenderer(ICON_NAMES.USER, (props: IconBaseProps) => <UserIcon {...props} />);
registerIconRenderer(ICON_NAMES.EXIT, (props: IconBaseProps) => <RxExit {...props} />);
registerIconRenderer(ICON_NAMES.ADD_USER, (props: IconBaseProps) => <FiUserPlus {...props} />);
registerIconRenderer(ICON_NAMES.USER_MINUS, (props: IconBaseProps) => <FiUserMinus {...props} />);
registerIconRenderer(ICON_NAMES.PLUS, (props: IconBaseProps) => <PlusIcon {...props} />);
registerIconRenderer(ICON_NAMES.INSPECT, (props: IconBaseProps) => <InspectIcon {...props} />);
registerIconRenderer(ICON_NAMES.PLUS_CIRCLE, (props: IconBaseProps) => <AiOutlinePlusCircle {...props} />);
registerIconRenderer(ICON_NAMES.FILLED_PLUS, (props: IconBaseProps) => <FillPlusCircleIcon {...props} />);
registerIconRenderer(ICON_NAMES.DARK_TO_LIGHT, (props: IconBaseProps) => <DarkToLightIcon {...props} />);
registerIconRenderer(ICON_NAMES.LIGHT_TO_DARK, (props: IconBaseProps) => <LightToDarkIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHECKMARK, (props: IconBaseProps) => <CheckIcon {...props} />);
registerIconRenderer(ICON_NAMES.VALID, (props: IconBaseProps) => <FiCheckCircle {...props} />);
registerIconRenderer(ICON_NAMES.INFO, (props: IconBaseProps) => <FiAlertOctagon {...props} />);
registerIconRenderer(ICON_NAMES.ERROR, (props: IconBaseProps) => <ErrorIcon {...props} />);
registerIconRenderer(ICON_NAMES.WARNING, (props: IconBaseProps) => <WarningIcon {...props} />);
registerIconRenderer(ICON_NAMES.BOARD, (props: IconBaseProps) => <BoardIcon {...props} />);
registerIconRenderer(ICON_NAMES.LIST, (props: IconBaseProps) => <ListIcon {...props} />);
registerIconRenderer(ICON_NAMES.FOLDER, (props: IconBaseProps) => <FolderIcon {...props} />);
registerIconRenderer(ICON_NAMES.FOLDER_OUTLINE, (props: IconBaseProps) => <FiFolder {...props} />);
registerIconRenderer(ICON_NAMES.EMPTY_FOLDER, (props: IconBaseProps) => <EmptyFolderIcon {...props} />);
registerIconRenderer(ICON_NAMES.PDF, (props: IconBaseProps) => <PDFIcon {...props} />);
registerIconRenderer(ICON_NAMES.TXT, (props: IconBaseProps) => <TxtIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOC, (props: IconBaseProps) => <DocIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOCX, (props: IconBaseProps) => <DocIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOC_OUTLINE, (props: IconBaseProps) => <DocFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.CONF, (props: IconBaseProps) => <GrDocumentConfig {...props} />);
registerIconRenderer(ICON_NAMES.CODE, (props: IconBaseProps) => <CodeFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.CODE_SANDBOX, (props: IconBaseProps) => <CodeSandboxIcon {...props} />);
registerIconRenderer(ICON_NAMES.BOX, (props: IconBaseProps) => <BoxIcon {...props} />);
registerIconRenderer(ICON_NAMES.XLS as unknown as string[], (props: IconBaseProps) => <XlsIcon {...props} />);
registerIconRenderer(ICON_NAMES.IMAGE_FILES as unknown as string[], (props: IconBaseProps) => <ImageFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.UNKNOWN_FILE, (props: IconBaseProps) => <UnknownFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.PHOTO, (props: IconBaseProps) => <PhotoIcon {...props} />);
registerIconRenderer(ICON_NAMES.PREVIOUS, (props: IconBaseProps) => <GrPrevious {...props} />);
registerIconRenderer(ICON_NAMES.NEXT, (props: IconBaseProps) => <GrNext {...props} />);
registerIconRenderer(ICON_NAMES.LIKE, (props: IconBaseProps) => <AiOutlineLike {...props} />);
registerIconRenderer(ICON_NAMES.REPLY, (props: IconBaseProps) => <BsReply {...props} />);
registerIconRenderer(ICON_NAMES.ATTACH, (props: IconBaseProps) => <AttachmentIcon {...props} />);
registerIconRenderer(ICON_NAMES.ATTACH2, (props: IconBaseProps) => <RiAttachment2 {...props} />);
registerIconRenderer(ICON_NAMES.EMOJI, (props: IconBaseProps) => <GrEmoji {...props} />);
registerIconRenderer(ICON_NAMES.MESSAGE, (props: IconBaseProps) => <RiMessage2Line {...props} />);
registerIconRenderer(ICON_NAMES.UPLOAD, (props: IconBaseProps) => <FiUpload {...props} />);
registerIconRenderer(ICON_NAMES.SPLIT_VERTICAL, (props: IconBaseProps) => <VscSplitVertical {...props} />);
registerIconRenderer(ICON_NAMES.SPLIT_HORIZONTAL, (props: IconBaseProps) => (
  <VscSplitHorizontal {...props} />
));
registerIconRenderer(ICON_NAMES.SWAP, (props: IconBaseProps) => <IoSwapVertical {...props} />);
registerIconRenderer(ICON_NAMES.DOWNLOAD, (props: IconBaseProps) => <FiDownload {...props} />);
registerIconRenderer(ICON_NAMES.NOTE, (props: IconBaseProps) => <RiStickyNoteLine {...props} />);
registerIconRenderer(ICON_NAMES.BINDING, (props: IconBaseProps) => <BindingIcon {...props} />);
registerIconRenderer(ICON_NAMES.DATABASE, (props: IconBaseProps) => <DatabaseIcon {...props} />);
registerIconRenderer(ICON_NAMES.UNLINK, (props: IconBaseProps) => <UnlinkIcon {...props} />);
registerIconRenderer(ICON_NAMES.API, (props: IconBaseProps) => <ApiIcon {...props} />);
registerIconRenderer(ICON_NAMES.EXPRESSION, (props: IconBaseProps) => <ExpressionIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHAT, (props: IconBaseProps) => <BsChatDots {...props} />);
registerIconRenderer(ICON_NAMES.HASH, (props: IconBaseProps) => <BsHash {...props} />);
registerIconRenderer(ICON_NAMES.DRIVE, (props: IconBaseProps) => <FiHardDrive {...props} />);
registerIconRenderer(ICON_NAMES.LOCK, (props: IconBaseProps) => <FiLock {...props} />);
registerIconRenderer(ICON_NAMES.START, (props: IconBaseProps) => <VscDebugStart {...props} />);
registerIconRenderer(ICON_NAMES.STOP, (props: IconBaseProps) => <VscDebugStop {...props} />);
registerIconRenderer(ICON_NAMES.RESTART, (props: IconBaseProps) => <TfiReload {...props} />);
registerIconRenderer(ICON_NAMES.DUPLICATE, (props: IconBaseProps) => <HiOutlineDuplicate {...props} />);
registerIconRenderer(ICON_NAMES.CONNECT, (props: IconBaseProps) => <RxLightningBolt {...props} />);
registerIconRenderer(ICON_NAMES.COG, (props: IconBaseProps) => <HiOutlineCog {...props} />);
registerIconRenderer(ICON_NAMES.SUN, (props: IconBaseProps) => <HiSun {...props} />);
registerIconRenderer(ICON_NAMES.MOON, (props: IconBaseProps) => <MoonIcon {...props} />);
registerIconRenderer(ICON_NAMES.STARS, (props: IconBaseProps) => <StarsIcon {...props} />);
registerIconRenderer(ICON_NAMES.SHARE, (props: IconBaseProps) => <ShareIcon {...props} />);
registerIconRenderer(ICON_NAMES.NEW_WINDOW, (props: IconBaseProps) => <RxOpenInNewWindow {...props} />);
registerIconRenderer(ICON_NAMES.PAINT, (props: IconBaseProps) => <HiOutlinePaintBrush {...props} />);
registerIconRenderer(ICON_NAMES.PALETTE, (props: IconBaseProps) => <MdOutlinePalette {...props} />);
registerIconRenderer(ICON_NAMES.TRENDING_UP, (props: IconBaseProps) => <TrendingUpIcon {...props} />);
registerIconRenderer(ICON_NAMES.TRENDING_DOWN, (props: IconBaseProps) => <TrendingDownIcon {...props} />);
registerIconRenderer(ICON_NAMES.TRENDING_LEVEL, (props: IconBaseProps) => <TrendingLevelIcon {...props} />);
registerIconRenderer(ICON_NAMES.SORT_ASC, (props: IconBaseProps) => <SortAscendingIcon {...props} />);
registerIconRenderer(ICON_NAMES.SORT_DESC, (props: IconBaseProps) => <SortDescendingIcon {...props} />);
registerIconRenderer(ICON_NAMES.NO_SORT, (props: IconBaseProps) => <NoSortIcon {...props} />);

registerIconRenderer(ICON_NAMES.ADMONITION_INFO, (props: IconBaseProps) => (
  <AdmonitionInfoIcon {...props} />
));
registerIconRenderer(ICON_NAMES.ADMONITION_WARNING, (props: IconBaseProps) => (
  <AdmonitionWarningIcon {...props} />
));
registerIconRenderer(ICON_NAMES.ADMONITION_DANGER, (props: IconBaseProps) => (
  <AdmonitionDangerIcon {...props} />
));
registerIconRenderer(ICON_NAMES.ADMONITION_NOTE, (props: IconBaseProps) => (
  <AdmonitionNoteIcon {...props} />
));
registerIconRenderer(ICON_NAMES.ADMONITION_TIP, (props: IconBaseProps) => <AdmonitionTipIcon {...props} />);

// --- IDE extras (temporary)
registerIconRenderer(ICON_NAMES.ARROW_DOWN, (props: IconBaseProps) => <BsArrowDownShort {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE, (props: IconBaseProps) => <BsSquare {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE_HALF, (props: IconBaseProps) => <BsSquareHalf {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE_FILL, (props: IconBaseProps) => <BsSquareFill {...props} />);

registerIconRenderer(ICON_NAMES.TABLE_INSERT_ROW, (props) => <TableInsertRowIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_DELETE_ROW, (props) => <TableDeleteRowIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_INSERT_COLUMN, (props) => <TableInsertColumnIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_DELETE_COLUMN, (props) => <TableDeleteColumnIcon {...props} />);

registerIconRenderer(ICON_NAMES.EYE, (props) => <IoEyeOutline {...props} />);
registerIconRenderer(ICON_NAMES.EYE_OFF, (props) => <IoEyeOffOutline {...props} />);

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

import type { ForwardedRef, ReactNode } from "react";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { extraCharRegex, IconRegistryContext, svgAttributeMap } from "./IconRegistryContext";
import type { IconBaseProps } from "./Icon/IconNative";
import { FiAlertOctagonIcon } from "./Icon/FiAlertOctagonIcon";
import { FiCheckCircleIcon } from "./Icon/FiCheckCircleIcon";
import { FiChevronDownIcon } from "./Icon/FiChevronDownIcon";
import { FiChevronUpIcon } from "./Icon/FiChevronUpIcon";
import { FiClipboardIcon } from "./Icon/FiClipboardIcon";
import { FiDownloadIcon } from "./Icon/FiDownloadIcon";
import { FiFolderIcon } from "./Icon/FiFolderIcon";
import { FiGridIcon } from "./Icon/FiGridIcon";
import { FiHardDriveIcon } from "./Icon/FiHardDriveIcon";
import { FiHelpCircleIcon } from "./Icon/FiHelpCircleIcon";
import { FiKeyIcon } from "./Icon/FiKeyIcon";
import { FiLockIcon } from "./Icon/FiLockIcon";
import { FiRefreshCcwIcon } from "./Icon/FiRefreshCcwIcon";
import { FiSlashIcon } from "./Icon/FiSlashIcon";
import { FiStarIcon } from "./Icon/FiStarIcon";
import { FiUploadIcon } from "./Icon/FiUploadIcon";
import { FiUserIcon } from "./Icon/FiUserIcon";
import { FiUserMinusIcon } from "./Icon/FiUserMinusIcon";
import { FiUserPlusIcon } from "./Icon/FiUserPlusIcon";
import { FiUsersIcon } from "./Icon/FiUsersIcon";
import { FiXIcon } from "./Icon/FiXIcon";
import { FiChevronsRightIcon } from "./Icon/FiChevronsRightIcon";
import { FiChevronsLeftIcon } from "./Icon/FiChevronsLeftIcon";
import { FiChevronsDownIcon } from "./Icon/FiChevronsDownIcon";
import { FiChevronsUpIcon } from "./Icon/FiChevronsUpIcon";
import { AiOutlineLikeIcon } from "./Icon/AiOutlineLikeIcon";
import { AiOutlineMenuIcon } from "./Icon/AiOutlineMenuIcon";
import { AiOutlinePlusCircleIcon } from "./Icon/AiOutlinePlusCircleIcon";
import { AiOutlineSendIcon } from "./Icon/AiOutlineSendIcon";
import { BsArrowDownShortIcon } from "./Icon/BsArrowDownShortIcon";
import { BsPauseIcon } from "./Icon/BsPauseIcon";
import { BsPlayIcon } from "./Icon/BsPlayIcon";
import { BsArrowLeftShortIcon } from "./Icon/BsArrowLeftShortIcon";
import { BsArrowRightShortIcon } from "./Icon/BsArrowRightShortIcon";
import { BsArrowUpShortIcon } from "./Icon/BsArrowUpShortIcon";
import { BsChatDotsIcon } from "./Icon/BsChatDotsIcon";
import { BsHashIcon } from "./Icon/BsHashIcon";
import { BsReplyIcon } from "./Icon/BsReplyIcon";
import { BsSquareIcon } from "./Icon/BsSquareIcon";
import { BsSquareFillIcon } from "./Icon/BsSquareFillIcon";
import { BsSquareHalfIcon } from "./Icon/BsSquareHalfIcon";
import { GrDocumentConfigIcon } from "./Icon/GrDocumentConfigIcon";
import { GrEmojiIcon } from "./Icon/GrEmojiIcon";
import { GrNextIcon } from "./Icon/GrNextIcon";
import { GrFormPreviousIcon } from "./Icon/GrFormPreviousIcon";
import { IoChatboxOutlineIcon } from "./Icon/IoChatboxOutlineIcon";
import { IoCubeOutlineIcon } from "./Icon/IoCubeOutlineIcon";
import { IoEyeOffOutlineIcon } from "./Icon/IoEyeOffOutlineIcon";
import { IoEyeOutlineIcon } from "./Icon/IoEyeOutlineIcon";
import { IoPencilIcon } from "./Icon/IoPencilIcon";
import { IoSwapVerticalIcon } from "./Icon/IoSwapVerticalIcon";
import { MdOutlineDriveFileRenameOutlineIcon } from "./Icon/MdOutlineDriveFileRenameOutlineIcon";
import { MdOutlinePaletteIcon } from "./Icon/MdOutlinePaletteIcon";
import { RiAttachment2Icon } from "./Icon/RiAttachment2Icon";
import { RiMessage2lineIcon } from "./Icon/RiMessage2lineIcon";
import { RiStickyNoteLineIcon } from "./Icon/RiStickyNoteLineIcon";
import { VscDebugStartIcon } from "./Icon/VscDebugStartIcon";
import { VscDebugStopIcon } from "./Icon/VscDebugStopIcon";
import { VscSplitHorizontalIcon } from "./Icon/VscSplitHorizontalIcon";
import { VscSplitVerticalIcon } from "./Icon/VscSplitVerticalIcon";
import { RxExitIcon } from "./Icon/RxExitIcon";
import { RxLightningBoltIcon } from "./Icon/RxLightningBoltIcon";
import { RxOpenInNewWindowIcon } from "./Icon/RxOpenInNewWindowIcon";
import { HiOutlinePaintBrushIcon } from "./Icon/HiOutlinePaintBrushIcon";
import { HiSunIcon } from "./Icon/HiSunIcon";
import { HiOutlineCogIcon } from "./Icon/HiOutlineCogIcon";
import { HiOutlineDuplicateIcon } from "./Icon/HiOutlineDuplicateIcon";
import { TfiReloadIcon } from "./Icon/TfiReloadIcon";
import { CiCalendarDateIcon } from "./Icon/CiCalendarDateIcon";
import { GoSidebarCollapseIcon } from "./Icon/GoSidebarCollapseIcon";
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
import { RefreshIcon } from "./Icon/RefreshIcon";
import { ICON_NAMES } from "./icons-abstractions";

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

registerIconRenderer(ICON_NAMES.ASSIGN, (props: IconBaseProps) => <FiUserIcon {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_UP, (props: IconBaseProps) => <BsArrowUpShortIcon {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_LEFT, (props: IconBaseProps) => <BsArrowLeftShortIcon {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_RIGHT, (props: IconBaseProps) => <BsArrowRightShortIcon {...props} />);
registerIconRenderer(ICON_NAMES.PAUSE, (props: IconBaseProps) => <BsPauseIcon {...props} />);
registerIconRenderer(ICON_NAMES.PLAY, (props: IconBaseProps) => <BsPlayIcon {...props} />);
registerIconRenderer(ICON_NAMES.DATE, (props: IconBaseProps) => <CiCalendarDateIcon {...props} />);
registerIconRenderer(ICON_NAMES.HAMBURGER, (props: IconBaseProps) => <AiOutlineMenuIcon {...props} />);
registerIconRenderer(ICON_NAMES.SEND, (props: IconBaseProps) => <AiOutlineSendIcon {...props} />);
registerIconRenderer(ICON_NAMES.USERS, (props: IconBaseProps) => <FiUsersIcon {...props} />);
registerIconRenderer(ICON_NAMES.REFRESH, (props: IconBaseProps) => <RefreshIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_DOWN, (props: IconBaseProps) => <FiChevronDownIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_UP, (props: IconBaseProps) => <FiChevronUpIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_RIGHT, (props: IconBaseProps) => <ChevronRightIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_LEFT, (props: IconBaseProps) => <ChevronLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRONS_RIGHT, (props: IconBaseProps) => <ChevronsRightIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRONS_LEFT, (props: IconBaseProps) => <ChevronsLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_DOWN, (props: IconBaseProps) => <FiChevronsDownIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_UP, (props: IconBaseProps) => <FiChevronsUpIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_RIGHT, (props: IconBaseProps) => (
  <FiChevronsRightIcon {...props} />
));
registerIconRenderer(ICON_NAMES.SIDEBAR_COLLAPSE, (props: IconBaseProps) => <GoSidebarCollapseIcon {...props} />)
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_LEFT, (props: IconBaseProps) => <FiChevronsLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOT_MENU, (props: IconBaseProps) => <DotMenuIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOT_MENU_HORIZONTAL, (props: IconBaseProps) => (
  <DotMenuHorizontalIcon {...props} />
));
registerIconRenderer(ICON_NAMES.NO_RESULT, (props: IconBaseProps) => <FiSlashIcon {...props} />);
registerIconRenderer(ICON_NAMES.CRM, (props: IconBaseProps) => <IoChatboxOutlineIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHAT, (props: IconBaseProps) => <IoChatboxOutlineIcon {...props} />);
registerIconRenderer(ICON_NAMES.PENCIL, (props: IconBaseProps) => <IoPencilIcon {...props} />);
registerIconRenderer(ICON_NAMES.CUBE, (props: IconBaseProps) => <IoCubeOutlineIcon {...props} />);
registerIconRenderer(ICON_NAMES.APPS, (props: IconBaseProps) => <FiGridIcon {...props} />);
registerIconRenderer(ICON_NAMES.PERMISSIONS, (props: IconBaseProps) => <FiKeyIcon {...props} />);
registerIconRenderer(ICON_NAMES.CLOSE, (props: IconBaseProps) => <FiXIcon {...props} />);
registerIconRenderer(ICON_NAMES.STAR, (props: IconBaseProps) => <FiStarIcon {...props} />);
registerIconRenderer(ICON_NAMES.HELP, (props: IconBaseProps) => <FiHelpCircleIcon {...props} />);
registerIconRenderer(ICON_NAMES.COMPACT_LIST, (props: IconBaseProps) => <CompactListIcon {...props} />);
registerIconRenderer(ICON_NAMES.COPY, (props: IconBaseProps) => <ContentCopyIcon {...props} />);
registerIconRenderer(ICON_NAMES.MOVE, (props: IconBaseProps) => <FiClipboardIcon {...props} />);
registerIconRenderer(ICON_NAMES.RENAME, (props: IconBaseProps) => (
  <MdOutlineDriveFileRenameOutlineIcon {...props} />
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
registerIconRenderer(ICON_NAMES.EXIT, (props: IconBaseProps) => <RxExitIcon {...props} />);
registerIconRenderer(ICON_NAMES.ADD_USER, (props: IconBaseProps) => <FiUserPlusIcon {...props} />);
registerIconRenderer(ICON_NAMES.USER_MINUS, (props: IconBaseProps) => <FiUserMinusIcon {...props} />);
registerIconRenderer(ICON_NAMES.PLUS, (props: IconBaseProps) => <PlusIcon {...props} />);
registerIconRenderer(ICON_NAMES.INSPECT, (props: IconBaseProps) => <InspectIcon {...props} />);
registerIconRenderer(ICON_NAMES.PLUS_CIRCLE, (props: IconBaseProps) => <AiOutlinePlusCircleIcon {...props} />);
registerIconRenderer(ICON_NAMES.FILLED_PLUS, (props: IconBaseProps) => <FillPlusCircleIcon {...props} />);
registerIconRenderer(ICON_NAMES.DARK_TO_LIGHT, (props: IconBaseProps) => <DarkToLightIcon {...props} />);
registerIconRenderer(ICON_NAMES.LIGHT_TO_DARK, (props: IconBaseProps) => <LightToDarkIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHECKMARK, (props: IconBaseProps) => <CheckIcon {...props} />);
registerIconRenderer(ICON_NAMES.VALID, (props: IconBaseProps) => <FiCheckCircleIcon {...props} />);
registerIconRenderer(ICON_NAMES.INFO, (props: IconBaseProps) => <FiAlertOctagonIcon {...props} />);
registerIconRenderer(ICON_NAMES.ERROR, (props: IconBaseProps) => <ErrorIcon {...props} />);
registerIconRenderer(ICON_NAMES.WARNING, (props: IconBaseProps) => <WarningIcon {...props} />);
registerIconRenderer(ICON_NAMES.BOARD, (props: IconBaseProps) => <BoardIcon {...props} />);
registerIconRenderer(ICON_NAMES.LIST, (props: IconBaseProps) => <ListIcon {...props} />);
registerIconRenderer(ICON_NAMES.FOLDER, (props: IconBaseProps) => <FolderIcon {...props} />);
registerIconRenderer(ICON_NAMES.FOLDER_OUTLINE, (props: IconBaseProps) => <FiFolderIcon {...props} />);
registerIconRenderer(ICON_NAMES.EMPTY_FOLDER, (props: IconBaseProps) => <EmptyFolderIcon {...props} />);
registerIconRenderer(ICON_NAMES.PDF, (props: IconBaseProps) => <PDFIcon {...props} />);
registerIconRenderer(ICON_NAMES.TXT, (props: IconBaseProps) => <TxtIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOC, (props: IconBaseProps) => <DocIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOCX, (props: IconBaseProps) => <DocIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOC_OUTLINE, (props: IconBaseProps) => <DocFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.CONF, (props: IconBaseProps) => <GrDocumentConfigIcon {...props} />);
registerIconRenderer(ICON_NAMES.CODE, (props: IconBaseProps) => <CodeFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.CODE_SANDBOX, (props: IconBaseProps) => <CodeSandboxIcon {...props} />);
registerIconRenderer(ICON_NAMES.BOX, (props: IconBaseProps) => <BoxIcon {...props} />);
registerIconRenderer(ICON_NAMES.XLS as unknown as string[], (props: IconBaseProps) => <XlsIcon {...props} />);
registerIconRenderer(ICON_NAMES.IMAGE_FILES as unknown as string[], (props: IconBaseProps) => <ImageFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.UNKNOWN_FILE, (props: IconBaseProps) => <UnknownFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.PHOTO, (props: IconBaseProps) => <PhotoIcon {...props} />);
registerIconRenderer(ICON_NAMES.PREVIOUS, (props: IconBaseProps) => <GrFormPreviousIcon {...props} />);
registerIconRenderer(ICON_NAMES.NEXT, (props: IconBaseProps) => <GrNextIcon {...props} />);
registerIconRenderer(ICON_NAMES.LIKE, (props: IconBaseProps) => <AiOutlineLikeIcon {...props} />);
registerIconRenderer(ICON_NAMES.REPLY, (props: IconBaseProps) => <BsReplyIcon {...props} />);
registerIconRenderer(ICON_NAMES.ATTACH, (props: IconBaseProps) => <AttachmentIcon {...props} />);
registerIconRenderer(ICON_NAMES.ATTACH2, (props: IconBaseProps) => <RiAttachment2Icon {...props} />);
registerIconRenderer(ICON_NAMES.EMOJI, (props: IconBaseProps) => <GrEmojiIcon {...props} />);
registerIconRenderer(ICON_NAMES.MESSAGE, (props: IconBaseProps) => <RiMessage2lineIcon {...props} />);
registerIconRenderer(ICON_NAMES.UPLOAD, (props: IconBaseProps) => <FiUploadIcon {...props} />);
registerIconRenderer(ICON_NAMES.SPLIT_VERTICAL, (props: IconBaseProps) => <VscSplitVerticalIcon {...props} />);
registerIconRenderer(ICON_NAMES.SPLIT_HORIZONTAL, (props: IconBaseProps) => (
  <VscSplitHorizontalIcon {...props} />
));
registerIconRenderer(ICON_NAMES.SWAP, (props: IconBaseProps) => <IoSwapVerticalIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOWNLOAD, (props: IconBaseProps) => <FiDownloadIcon {...props} />);
registerIconRenderer(ICON_NAMES.NOTE, (props: IconBaseProps) => <RiStickyNoteLineIcon {...props} />);
registerIconRenderer(ICON_NAMES.BINDING, (props: IconBaseProps) => <BindingIcon {...props} />);
registerIconRenderer(ICON_NAMES.DATABASE, (props: IconBaseProps) => <DatabaseIcon {...props} />);
registerIconRenderer(ICON_NAMES.UNLINK, (props: IconBaseProps) => <UnlinkIcon {...props} />);
registerIconRenderer(ICON_NAMES.API, (props: IconBaseProps) => <ApiIcon {...props} />);
registerIconRenderer(ICON_NAMES.EXPRESSION, (props: IconBaseProps) => <ExpressionIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHAT, (props: IconBaseProps) => <BsChatDotsIcon {...props} />);
registerIconRenderer(ICON_NAMES.HASH, (props: IconBaseProps) => <BsHashIcon {...props} />);
registerIconRenderer(ICON_NAMES.DRIVE, (props: IconBaseProps) => <FiHardDriveIcon {...props} />);
registerIconRenderer(ICON_NAMES.LOCK, (props: IconBaseProps) => <FiLockIcon {...props} />);
registerIconRenderer(ICON_NAMES.START, (props: IconBaseProps) => <VscDebugStartIcon {...props} />);
registerIconRenderer(ICON_NAMES.STOP, (props: IconBaseProps) => <VscDebugStopIcon {...props} />);
registerIconRenderer(ICON_NAMES.RESTART, (props: IconBaseProps) => <TfiReloadIcon {...props} />);
registerIconRenderer(ICON_NAMES.DUPLICATE, (props: IconBaseProps) => <HiOutlineDuplicateIcon {...props} />);
registerIconRenderer(ICON_NAMES.CONNECT, (props: IconBaseProps) => <RxLightningBoltIcon {...props} />);
registerIconRenderer(ICON_NAMES.COG, (props: IconBaseProps) => <HiOutlineCogIcon {...props} />);
registerIconRenderer(ICON_NAMES.SUN, (props: IconBaseProps) => <HiSunIcon {...props} />);
registerIconRenderer(ICON_NAMES.MOON, (props: IconBaseProps) => <MoonIcon {...props} />);
registerIconRenderer(ICON_NAMES.STARS, (props: IconBaseProps) => <StarsIcon {...props} />);
registerIconRenderer(ICON_NAMES.SHARE, (props: IconBaseProps) => <ShareIcon {...props} />);
registerIconRenderer(ICON_NAMES.NEW_WINDOW, (props: IconBaseProps) => <RxOpenInNewWindowIcon {...props} />);
registerIconRenderer(ICON_NAMES.PAINT, (props: IconBaseProps) => <HiOutlinePaintBrushIcon {...props} />);
registerIconRenderer(ICON_NAMES.PALETTE, (props: IconBaseProps) => <MdOutlinePaletteIcon {...props} />);
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
registerIconRenderer(ICON_NAMES.ARROW_DOWN, (props: IconBaseProps) => <BsArrowDownShortIcon {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE, (props: IconBaseProps) => <BsSquareIcon {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE_HALF, (props: IconBaseProps) => <BsSquareHalfIcon {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE_FILL, (props: IconBaseProps) => <BsSquareFillIcon {...props} />);

registerIconRenderer(ICON_NAMES.TABLE_INSERT_ROW, (props) => <TableInsertRowIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_DELETE_ROW, (props) => <TableDeleteRowIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_INSERT_COLUMN, (props) => <TableInsertColumnIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_DELETE_COLUMN, (props) => <TableDeleteColumnIcon {...props} />);

registerIconRenderer(ICON_NAMES.EYE, (props) => <IoEyeOutlineIcon {...props} />);
registerIconRenderer(ICON_NAMES.EYE_OFF, (props) => <IoEyeOffOutlineIcon {...props} />);

export function IconProvider({ children, icons }: { children: ReactNode, icons: Record<string, string> }) {
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

  useMemo(() => {
    if (!icons) return;

    Object.entries(icons).forEach(([iconName, svgData]) => {
      const iconKey = iconName.toLowerCase();
      
      // Skip if already registered
      if (pool.has(iconKey)) {
        return;
      }

      // Decode data URI if needed
      let decodedSvgData = svgData;
      if (svgData.startsWith('data:image/svg+xml,')) {
        decodedSvgData = decodeURIComponent(svgData.replace('data:image/svg+xml,', ''));
      } else if (svgData.startsWith('data:image/svg+xml;base64,')) {
        decodedSvgData = atob(svgData.replace('data:image/svg+xml;base64,', ''));
      }

      // Extract attributes from SVG data using regex (SSR-safe)
      // Only extract from the opening <svg> tag, not from inner content
      const svgTagMatch = decodedSvgData.match(/<svg([^>]*)>/);
      const svgTag = svgTagMatch?.[1] || '';
      
      // Pattern matches: attribute-name="value" or attribute-name='value'
      // Handles hyphens, colons, dots in attribute names (for data-, aria-, xlink:, etc.)
      const attributePattern = /([\w:.-]+)\s*=\s*["']([^"']*)["']/g;
      const extractedAttrs: Record<string, string> = {};
      let match: RegExpExecArray | null;
      
      while ((match = attributePattern.exec(svgTag)) !== null) {
        const [, attrName, attrValue] = match;
        extractedAttrs[attrName] = attrValue;
      }

      // Map extracted attributes to React-safe names
      const safeAttributes: Record<string, any> = {};
      Object.entries(extractedAttrs).forEach(([key, value]) => {
        let safeKey = key;
        
        // Keep data- and aria- attributes as-is
        if (/^(data-|aria-)/.test(key)) {
          safeKey = key;
        } else {
          // Convert to lowercase and remove special chars, then map to React prop name
          const normalizedKey = key.replace(extraCharRegex, "").toLowerCase();
          safeKey = svgAttributeMap[normalizedKey] || key;
        }
        
        // Skip class attribute (will use className from props)
        if (safeKey !== 'class' && safeKey !== 'className') {
          safeAttributes[safeKey] = value;
        }
      });

      // Extract inner content (everything between <svg> tags)
      // Remove comments from the SVG content
      const innerContent = decodedSvgData
        .replace(/<svg[^>]*>|<\/svg>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '');
      
      const viewBox = safeAttributes.viewBox || '0 0 24 24';
      const defaultFill = safeAttributes.fill;
      const defaultStroke = safeAttributes.stroke;
      const defaultStrokeWidth = safeAttributes.strokeWidth;

      // Register icon renderer immediately (works on server and client)
      registerIconRenderer(iconKey, (props: IconBaseProps) => {
        const size = props.size || safeAttributes.width || safeAttributes.height || 24;
        
        // Merge safe attributes with props (props take precedence)
        const mergedAttributes = {
          ...safeAttributes,
          width: size,
          height: size,
          viewBox,
          fill: props.color || defaultFill || 'currentColor',
          stroke: defaultStroke,
          strokeWidth: defaultStrokeWidth,
          xmlns: "http://www.w3.org/2000/svg",
          style: props.style,
          className: props.className,
        };

        // Remove undefined values
        Object.keys(mergedAttributes).forEach(key => {
          if (mergedAttributes[key] === undefined) {
            delete mergedAttributes[key];
          }
        });

        return (
          <svg
            {...mergedAttributes}
            dangerouslySetInnerHTML={{ __html: innerContent }}
          />
        );
      });
    });
  }, [icons]);

  const ensureCustomResourceSvgIcon = useCallback(async (resourceUrl: string) => {
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
      ensureCustomSvgIcon: ensureCustomResourceSvgIcon,
      customSvgs,
    };
  }, [customSvgs, ensureCustomResourceSvgIcon, getRegisteredIconNames, lookupIconRenderer]);

  return (
    <IconRegistryContext.Provider value={contextValue}>
      {children}
      <svg style={{ display: "none" }} ref={spriteRootRef}></svg>
    </IconRegistryContext.Provider>
  );
}

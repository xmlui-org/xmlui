import type { ForwardedRef, ReactNode } from "react";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { extraCharRegex, IconRegistryContext, svgAttributeMap } from "./IconRegistryContext";
import type { IconBaseProps } from "./Icon/IconNative";
import { InfoIcon } from "./Icon/InfoIcon";
import { ValidIcon } from "./Icon/ValidIcon";
import { ChevronDownIcon } from "./Icon/ChevronDownIcon";
import { ChevronUpIcon } from "./Icon/ChevronUpIcon";
import { ClipboardIcon } from "./Icon/ClipboardIcon";
import { DownloadIcon } from "./Icon/DownloadIcon";
import { FolderOutlineIcon } from "./Icon/FolderOutlineIcon";
import { GridIcon } from "./Icon/GridIcon";
import { DriveIcon } from "./Icon/DriveIcon";
import { HelpIcon } from "./Icon/HelpIcon";
import { KeyIcon } from "./Icon/KeyIcon";
import { LockIcon } from "./Icon/LockIcon";
import { NoResultIcon } from "./Icon/NoResultIcon";
import { StarIcon } from "./Icon/StarIcon";
import { UploadIcon } from "./Icon/UploadIcon";
import { AssignIcon } from "./Icon/AssignIcon";
import { UserMinusIcon } from "./Icon/UserMinusIcon";
import { UserPlusIcon } from "./Icon/UserPlusIcon";
import { UsersIcon } from "./Icon/UsersIcon";
import { CloseIcon } from "./Icon/CloseIcon";
import { DoubleChevronsRightIcon } from "./Icon/DoubleChevronsRightIcon";
import { DoubleChevronsLeftIcon } from "./Icon/DoubleChevronsLeftIcon";
import { ChevronsDownIcon } from "./Icon/ChevronsDownIcon";
import { ChevronsUpIcon } from "./Icon/ChevronsUpIcon";
import { LikeIcon } from "./Icon/LikeIcon";
import { MenuIcon } from "./Icon/MenuIcon";
import { PlusCircleIcon } from "./Icon/PlusCircleIcon";
import { SendIcon } from "./Icon/SendIcon";
import { ArrowDownIcon } from "./Icon/ArrowDownIcon";
import { PauseIcon } from "./Icon/PauseIcon";
import { PlayIcon } from "./Icon/PlayIcon";
import { ArrowLeftIcon } from "./Icon/ArrowLeftIcon";
import { ArrowRightIcon } from "./Icon/ArrowRightIcon";
import { ArrowUpIcon } from "./Icon/ArrowUpIcon";
import { ChatDotsIcon } from "./Icon/ChatDotsIcon";
import { HashIcon } from "./Icon/HashIcon";
import { ReplyIcon } from "./Icon/ReplyIcon";
import { SquareIcon } from "./Icon/SquareIcon";
import { SquareFillIcon } from "./Icon/SquareFillIcon";
import { SquareHalfIcon } from "./Icon/SquareHalfIcon";
import { FileConfigIcon } from "./Icon/FileConfigIcon";
import { EmojiIcon } from "./Icon/EmojiIcon";
import { NextIcon } from "./Icon/NextIcon";
import { PreviousIcon } from "./Icon/PreviousIcon";
import { ChatboxIcon } from "./Icon/ChatboxIcon";
import { CubeIcon } from "./Icon/CubeIcon";
import { EyeOffIcon } from "./Icon/EyeOffIcon";
import { EyeIcon } from "./Icon/EyeIcon";
import { PencilIcon } from "./Icon/PencilIcon";
import { SwapIcon } from "./Icon/SwapIcon";
import { RenameIcon } from "./Icon/RenameIcon";
import { PaletteIcon } from "./Icon/PaletteIcon";
import { Attachment2Icon } from "./Icon/Attachment2Icon";
import { MessageIcon } from "./Icon/MessageIcon";
import { StickyNoteIcon } from "./Icon/StickyNoteIcon";
import { DebugStartIcon } from "./Icon/DebugStartIcon";
import { DebugStopIcon } from "./Icon/DebugStopIcon";
import { SplitHorizontalIcon } from "./Icon/SplitHorizontalIcon";
import { SplitVerticalIcon } from "./Icon/SplitVerticalIcon";
import { ExitIcon } from "./Icon/ExitIcon";
import { ConnectIcon } from "./Icon/ConnectIcon";
import { NewWindowIcon } from "./Icon/NewWindowIcon";
import { PaintIcon } from "./Icon/PaintIcon";
import { SunIcon } from "./Icon/SunIcon";
import { SettingsIcon } from "./Icon/SettingsIcon";
import { DuplicateIcon } from "./Icon/DuplicateIcon";
import { RestartIcon } from "./Icon/RestartIcon";
import { CalendarIcon } from "./Icon/CalendarIcon";
import { SidebarCollapseIcon } from "./Icon/SidebarCollapseIcon";
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
import { CopyIcon } from "./Icon/CopyIcon";
import { DatabaseIcon } from "./Icon/DatabaseIcon";
import { DocFileIcon } from "./Icon/DocFileIcon";
import { DocIcon } from "./Icon/DocIcon";
import { EllipsisHorizontalIcon } from "./Icon/EllipsisHorizontalIcon";
import { EllipsisVerticalIcon } from "./Icon/EllipsisVerticalIcon";
import { EmailIcon } from "./Icon/EmailIcon";
import { EmptyFolderIcon } from "./Icon/EmptyFolderIcon";
import { ExpressionIcon } from "./Icon/ExpressionIcon";
import { FilledPlusIcon } from "./Icon/FilledPlusIcon";
import { FilterIcon } from "./Icon/FilterIcon";
import { FolderIcon } from "./Icon/FolderIcon";
import { GlobeIcon } from "./Icon/GlobeIcon";
import { HomeIcon } from "./Icon/HomeIcon";
import { HyperLinkIcon } from "./Icon/HyperLinkIcon";
import { ImageFileIcon } from "./Icon/ImageFileIcon";
import { LinkIcon } from "./Icon/LinkIcon";
import { ListIcon } from "./Icon/ListIcon";
import { LooseListIcon } from "./Icon/LooseListIcon";
import { OptionsIcon } from "./Icon/OptionsIcon";
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

registerIconRenderer(ICON_NAMES.ASSIGN, (props: IconBaseProps) => <AssignIcon {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_UP, (props: IconBaseProps) => <ArrowUpIcon {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_LEFT, (props: IconBaseProps) => <ArrowLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.ARROW_RIGHT, (props: IconBaseProps) => <ArrowRightIcon {...props} />);
registerIconRenderer(ICON_NAMES.PAUSE, (props: IconBaseProps) => <PauseIcon {...props} />);
registerIconRenderer(ICON_NAMES.PLAY, (props: IconBaseProps) => <PlayIcon {...props} />);
registerIconRenderer(ICON_NAMES.DATE, (props: IconBaseProps) => <CalendarIcon {...props} />);
registerIconRenderer(ICON_NAMES.HAMBURGER, (props: IconBaseProps) => <MenuIcon {...props} />);
registerIconRenderer(ICON_NAMES.SEND, (props: IconBaseProps) => <SendIcon {...props} />);
registerIconRenderer(ICON_NAMES.USERS, (props: IconBaseProps) => <UsersIcon {...props} />);
registerIconRenderer(ICON_NAMES.REFRESH, (props: IconBaseProps) => <RefreshIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_DOWN, (props: IconBaseProps) => <ChevronDownIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_UP, (props: IconBaseProps) => <ChevronUpIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_RIGHT, (props: IconBaseProps) => <ChevronRightIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRON_LEFT, (props: IconBaseProps) => <ChevronLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRONS_RIGHT, (props: IconBaseProps) => <ChevronsRightIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHEVRONS_LEFT, (props: IconBaseProps) => <ChevronsLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_DOWN, (props: IconBaseProps) => <ChevronsDownIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_UP, (props: IconBaseProps) => <ChevronsUpIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_RIGHT, (props: IconBaseProps) => (
  <DoubleChevronsRightIcon {...props} />
));
registerIconRenderer(ICON_NAMES.SIDEBAR_COLLAPSE, (props: IconBaseProps) => <SidebarCollapseIcon {...props} />)
registerIconRenderer(ICON_NAMES.DOUBLE_CHEVRON_LEFT, (props: IconBaseProps) => <DoubleChevronsLeftIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOT_MENU, (props: IconBaseProps) => <EllipsisVerticalIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOT_MENU_HORIZONTAL, (props: IconBaseProps) => (
  <EllipsisHorizontalIcon {...props} />
));
registerIconRenderer(ICON_NAMES.NO_RESULT, (props: IconBaseProps) => <NoResultIcon {...props} />);
registerIconRenderer(ICON_NAMES.CRM, (props: IconBaseProps) => <ChatboxIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHAT, (props: IconBaseProps) => <ChatboxIcon {...props} />);
registerIconRenderer(ICON_NAMES.PENCIL, (props: IconBaseProps) => <PencilIcon {...props} />);
registerIconRenderer(ICON_NAMES.CUBE, (props: IconBaseProps) => <CubeIcon {...props} />);
registerIconRenderer(ICON_NAMES.APPS, (props: IconBaseProps) => <GridIcon {...props} />);
registerIconRenderer(ICON_NAMES.PERMISSIONS, (props: IconBaseProps) => <KeyIcon {...props} />);
registerIconRenderer(ICON_NAMES.CLOSE, (props: IconBaseProps) => <CloseIcon {...props} />);
registerIconRenderer(ICON_NAMES.STAR, (props: IconBaseProps) => <StarIcon {...props} />);
registerIconRenderer(ICON_NAMES.HELP, (props: IconBaseProps) => <HelpIcon {...props} />);
registerIconRenderer(ICON_NAMES.COMPACT_LIST, (props: IconBaseProps) => <CompactListIcon {...props} />);
registerIconRenderer(ICON_NAMES.COPY, (props: IconBaseProps) => <CopyIcon {...props} />);
registerIconRenderer(ICON_NAMES.MOVE, (props: IconBaseProps) => <ClipboardIcon {...props} />);
registerIconRenderer(ICON_NAMES.RENAME, (props: IconBaseProps) => (
  <RenameIcon {...props} />
));
registerIconRenderer(ICON_NAMES.HYPERLINK, (props: IconBaseProps) => <HyperLinkIcon {...props} />);
registerIconRenderer(ICON_NAMES.GLOBE, (props: IconBaseProps) => <GlobeIcon {...props} />);
registerIconRenderer(ICON_NAMES.LINK, (props: IconBaseProps) => <LinkIcon {...props} />);
registerIconRenderer(ICON_NAMES.LOOSE_LIST, (props: IconBaseProps) => <LooseListIcon {...props} />);
registerIconRenderer(ICON_NAMES.OPTIONS, (props: IconBaseProps) => <OptionsIcon {...props} />);
registerIconRenderer(ICON_NAMES.SEARCH, (props: IconBaseProps) => <SearchIcon {...props} />);
registerIconRenderer(ICON_NAMES.FILTER, (props: IconBaseProps) => <FilterIcon {...props} />);
registerIconRenderer(ICON_NAMES.TRASH, (props: IconBaseProps) => <TrashIcon {...props} />);
registerIconRenderer(ICON_NAMES.PEN, (props: IconBaseProps) => <PenIcon {...props} />);
registerIconRenderer(ICON_NAMES.EMAIL, (props: IconBaseProps) => <EmailIcon {...props} />);
registerIconRenderer(ICON_NAMES.PHONE, (props: IconBaseProps) => <PhoneIcon {...props} />);
registerIconRenderer(ICON_NAMES.HOME, (props: IconBaseProps) => <HomeIcon {...props} />);
registerIconRenderer(ICON_NAMES.USER, (props: IconBaseProps) => <UserIcon {...props} />);
registerIconRenderer(ICON_NAMES.EXIT, (props: IconBaseProps) => <ExitIcon {...props} />);
registerIconRenderer(ICON_NAMES.ADD_USER, (props: IconBaseProps) => <UserPlusIcon {...props} />);
registerIconRenderer(ICON_NAMES.USER_MINUS, (props: IconBaseProps) => <UserMinusIcon {...props} />);
registerIconRenderer(ICON_NAMES.PLUS, (props: IconBaseProps) => <PlusIcon {...props} />);
registerIconRenderer(ICON_NAMES.INSPECT, (props: IconBaseProps) => <InspectIcon {...props} />);
registerIconRenderer(ICON_NAMES.PLUS_CIRCLE, (props: IconBaseProps) => <PlusCircleIcon {...props} />);
registerIconRenderer(ICON_NAMES.FILLED_PLUS, (props: IconBaseProps) => <FilledPlusIcon {...props} />);
registerIconRenderer(ICON_NAMES.DARK_TO_LIGHT, (props: IconBaseProps) => <DarkToLightIcon {...props} />);
registerIconRenderer(ICON_NAMES.LIGHT_TO_DARK, (props: IconBaseProps) => <LightToDarkIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHECKMARK, (props: IconBaseProps) => <CheckIcon {...props} />);
registerIconRenderer(ICON_NAMES.VALID, (props: IconBaseProps) => <ValidIcon {...props} />);
registerIconRenderer(ICON_NAMES.INFO, (props: IconBaseProps) => <InfoIcon {...props} />);
registerIconRenderer(ICON_NAMES.ERROR, (props: IconBaseProps) => <ErrorIcon {...props} />);
registerIconRenderer(ICON_NAMES.WARNING, (props: IconBaseProps) => <WarningIcon {...props} />);
registerIconRenderer(ICON_NAMES.BOARD, (props: IconBaseProps) => <BoardIcon {...props} />);
registerIconRenderer(ICON_NAMES.LIST, (props: IconBaseProps) => <ListIcon {...props} />);
registerIconRenderer(ICON_NAMES.FOLDER, (props: IconBaseProps) => <FolderIcon {...props} />);
registerIconRenderer(ICON_NAMES.FOLDER_OUTLINE, (props: IconBaseProps) => <FolderOutlineIcon {...props} />);
registerIconRenderer(ICON_NAMES.EMPTY_FOLDER, (props: IconBaseProps) => <EmptyFolderIcon {...props} />);
registerIconRenderer(ICON_NAMES.PDF, (props: IconBaseProps) => <PDFIcon {...props} />);
registerIconRenderer(ICON_NAMES.TXT, (props: IconBaseProps) => <TxtIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOC, (props: IconBaseProps) => <DocIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOCX, (props: IconBaseProps) => <DocIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOC_OUTLINE, (props: IconBaseProps) => <DocFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.CONF, (props: IconBaseProps) => <FileConfigIcon {...props} />);
registerIconRenderer(ICON_NAMES.CODE, (props: IconBaseProps) => <CodeFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.CODE_SANDBOX, (props: IconBaseProps) => <CodeSandboxIcon {...props} />);
registerIconRenderer(ICON_NAMES.BOX, (props: IconBaseProps) => <BoxIcon {...props} />);
registerIconRenderer(ICON_NAMES.XLS as unknown as string[], (props: IconBaseProps) => <XlsIcon {...props} />);
registerIconRenderer(ICON_NAMES.IMAGE_FILES as unknown as string[], (props: IconBaseProps) => <ImageFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.UNKNOWN_FILE, (props: IconBaseProps) => <UnknownFileIcon {...props} />);
registerIconRenderer(ICON_NAMES.PHOTO, (props: IconBaseProps) => <PhotoIcon {...props} />);
registerIconRenderer(ICON_NAMES.PREVIOUS, (props: IconBaseProps) => <PreviousIcon {...props} />);
registerIconRenderer(ICON_NAMES.NEXT, (props: IconBaseProps) => <NextIcon {...props} />);
registerIconRenderer(ICON_NAMES.LIKE, (props: IconBaseProps) => <LikeIcon {...props} />);
registerIconRenderer(ICON_NAMES.REPLY, (props: IconBaseProps) => <ReplyIcon {...props} />);
registerIconRenderer(ICON_NAMES.ATTACH, (props: IconBaseProps) => <AttachmentIcon {...props} />);
registerIconRenderer(ICON_NAMES.ATTACH2, (props: IconBaseProps) => <Attachment2Icon {...props} />);
registerIconRenderer(ICON_NAMES.EMOJI, (props: IconBaseProps) => <EmojiIcon {...props} />);
registerIconRenderer(ICON_NAMES.MESSAGE, (props: IconBaseProps) => <MessageIcon {...props} />);
registerIconRenderer(ICON_NAMES.UPLOAD, (props: IconBaseProps) => <UploadIcon {...props} />);
registerIconRenderer(ICON_NAMES.SPLIT_VERTICAL, (props: IconBaseProps) => <SplitVerticalIcon {...props} />);
registerIconRenderer(ICON_NAMES.SPLIT_HORIZONTAL, (props: IconBaseProps) => (
  <SplitHorizontalIcon {...props} />
));
registerIconRenderer(ICON_NAMES.SWAP, (props: IconBaseProps) => <SwapIcon {...props} />);
registerIconRenderer(ICON_NAMES.DOWNLOAD, (props: IconBaseProps) => <DownloadIcon {...props} />);
registerIconRenderer(ICON_NAMES.NOTE, (props: IconBaseProps) => <StickyNoteIcon {...props} />);
registerIconRenderer(ICON_NAMES.BINDING, (props: IconBaseProps) => <BindingIcon {...props} />);
registerIconRenderer(ICON_NAMES.DATABASE, (props: IconBaseProps) => <DatabaseIcon {...props} />);
registerIconRenderer(ICON_NAMES.UNLINK, (props: IconBaseProps) => <UnlinkIcon {...props} />);
registerIconRenderer(ICON_NAMES.API, (props: IconBaseProps) => <ApiIcon {...props} />);
registerIconRenderer(ICON_NAMES.EXPRESSION, (props: IconBaseProps) => <ExpressionIcon {...props} />);
registerIconRenderer(ICON_NAMES.CHAT, (props: IconBaseProps) => <ChatDotsIcon {...props} />);
registerIconRenderer(ICON_NAMES.HASH, (props: IconBaseProps) => <HashIcon {...props} />);
registerIconRenderer(ICON_NAMES.DRIVE, (props: IconBaseProps) => <DriveIcon {...props} />);
registerIconRenderer(ICON_NAMES.LOCK, (props: IconBaseProps) => <LockIcon {...props} />);
registerIconRenderer(ICON_NAMES.START, (props: IconBaseProps) => <DebugStartIcon {...props} />);
registerIconRenderer(ICON_NAMES.STOP, (props: IconBaseProps) => <DebugStopIcon {...props} />);
registerIconRenderer(ICON_NAMES.RESTART, (props: IconBaseProps) => <RestartIcon {...props} />);
registerIconRenderer(ICON_NAMES.DUPLICATE, (props: IconBaseProps) => <DuplicateIcon {...props} />);
registerIconRenderer(ICON_NAMES.CONNECT, (props: IconBaseProps) => <ConnectIcon {...props} />);
registerIconRenderer(ICON_NAMES.COG, (props: IconBaseProps) => <SettingsIcon {...props} />);
registerIconRenderer(ICON_NAMES.SUN, (props: IconBaseProps) => <SunIcon {...props} />);
registerIconRenderer(ICON_NAMES.MOON, (props: IconBaseProps) => <MoonIcon {...props} />);
registerIconRenderer(ICON_NAMES.STARS, (props: IconBaseProps) => <StarsIcon {...props} />);
registerIconRenderer(ICON_NAMES.SHARE, (props: IconBaseProps) => <ShareIcon {...props} />);
registerIconRenderer(ICON_NAMES.NEW_WINDOW, (props: IconBaseProps) => <NewWindowIcon {...props} />);
registerIconRenderer(ICON_NAMES.PAINT, (props: IconBaseProps) => <PaintIcon {...props} />);
registerIconRenderer(ICON_NAMES.PALETTE, (props: IconBaseProps) => <PaletteIcon {...props} />);
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
registerIconRenderer(ICON_NAMES.ARROW_DOWN, (props: IconBaseProps) => <ArrowDownIcon {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE, (props: IconBaseProps) => <SquareIcon {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE_HALF, (props: IconBaseProps) => <SquareHalfIcon {...props} />);
registerIconRenderer(ICON_NAMES.SQUARE_FILL, (props: IconBaseProps) => <SquareFillIcon {...props} />);

registerIconRenderer(ICON_NAMES.TABLE_INSERT_ROW, (props) => <TableInsertRowIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_DELETE_ROW, (props) => <TableDeleteRowIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_INSERT_COLUMN, (props) => <TableInsertColumnIcon {...props} />);
registerIconRenderer(ICON_NAMES.TABLE_DELETE_COLUMN, (props) => <TableDeleteColumnIcon {...props} />);

registerIconRenderer(ICON_NAMES.EYE, (props) => <EyeIcon {...props} />);
registerIconRenderer(ICON_NAMES.EYE_OFF, (props) => <EyeOffIcon {...props} />);

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
        const {
          size: propSize,
          color,
          style,
          className,
          children: _children,
          ...eventAndDataProps
        } = props;
        const size = propSize || safeAttributes.width || safeAttributes.height || 24;

        // Merge safe attributes with props (props take precedence)
        const mergedAttributes = {
          ...safeAttributes,
          width: size,
          height: size,
          viewBox,
          fill: color || defaultFill || 'currentColor',
          stroke: defaultStroke,
          strokeWidth: defaultStrokeWidth,
          xmlns: "http://www.w3.org/2000/svg",
          style,
          className,
          ...eventAndDataProps,
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
    attachedResources.current[resourceUrl] = true;
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
    d.setAttributeNS(null, "viewBox", attrs["viewBox"] ?? "0 0 24 24");

    spriteRootRef.current!.appendChild(d);
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

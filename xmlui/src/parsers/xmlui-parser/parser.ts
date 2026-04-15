import { Node } from "./syntax-node";
import type { ScannerErrorCallback } from "./scanner";
import type { ScannerDiagnosticMessage, ParserDiagPositionless, ParserDiag } from "./diagnostics";
import { CharacterCodes } from "./CharacterCodes";
import { createScanner } from "./scanner";
import { SyntaxKind, getSyntaxKindStrRepr } from "./syntax-kind";
import { tagNameNodesWithoutErrorsMatch } from "./utils";
import { ErrCodesParser, DIAGS_PARSER } from "./diagnostics";
import { DocumentCursor } from "../../language-server/base/text-document";

type IncompleteNode = {
  children: Node[];
  kind: SyntaxKind;
};

type StackFrame = {
  node: IncompleteNode;
  errors: ParserDiag[];
  scriptCount: number;
  isCompoundComponent?: boolean;
  compoundCompName?: string;
  namespaces?: Map<string, string>;
  hasNonHelperChildren?: boolean;
};

class ParseStack {
  private readonly frames: StackFrame[];
  private readonly cursor: DocumentCursor;

  constructor(cursor: DocumentCursor) {
    this.frames = [];
    this.cursor = cursor;
  }

  get node(): IncompleteNode {
    return this.currentFrame.node;
  }

  allErrors(): ParserDiag[] {
    return this.frames[0].errors;
  }

  /** start a new node. Any new tokens or nodes will be put into it's children list from that point. Each call to this should be paired with a `completeNode` */
  startNode(kind: SyntaxKind): void {
    this.frames.push({
      node: {
        kind,
        children: [],
      },
      scriptCount: 0,
      errors: [],
    });
  }

  completeNode(kind: SyntaxKind): Node {
    if (this.frames.length < 2) {
      throw new Error("Cannot complete the root stack frame");
    }

    const completedFrame = this.frames.pop()!;
    const completedNode = createNode(kind, completedFrame.node.children!);
    const parentFrame = this.currentFrame;
    parentFrame.node.children!.push(completedNode);
    if (completedFrame.errors.length > 0) {
      parentFrame.errors.push(...completedFrame.errors);
    }
    return completedNode;
  }

  abandonNode(): void {
    if (this.frames.length < 2) {
      throw new Error("Cannot abandon the root stack frame");
    }

    const abandonedFrame = this.frames.pop()!;
    const parentFrame = this.currentFrame;
    parentFrame.node.children!.push(...abandonedFrame.node.children!);
    if (abandonedFrame.errors.length > 0) {
      parentFrame.errors.push(...abandonedFrame.errors);
    }
  }

  pushToken(node: Node): void {
    this.node.children!.push(node);
  }

  /** Tracks script tags within the current frame. Emits multipleScriptTags if a second script
   * is encountered. Should only be called from parseFile and parseContentList. */
  incScriptTagCount(node: Node): void {
    if (this.currentFrame.scriptCount === 1) {
      const diag = DIAGS_PARSER.multipleScriptTags;
      const { contextPos, contextEnd } = this.cursor.getSurroundingContext(node.pos, node.end, 1);
      const err: ParserDiag = {
        code: diag.code,
        message: diag.message,
        pos: node.pos,
        end: node.end,
        contextPos,
        contextEnd,
      };
      this.pushError(err);
    }
    this.currentFrame.scriptCount++;
  }

  pushError(error: ParserDiag): void {
    this.currentFrame.errors.push(error);
  }

  /** Walks all ancestor frames (excluding the current frame) looking for a compound component
   * name. Returns the name of the nearest ancestor compound component, or undefined. */
  hasCompoundCompAncestor(): boolean {
    for (let i = this.frames.length - 2; i >= 0; i--) {
      if (this.frames[i].isCompoundComponent) {
        return true;
      }
    }
    return false;
  }

  /** Initialises the namespace map on the current frame. Called once per ElementNode after
   * attribute parsing. */
  initCurrentNamespaces(): void {
    this.currentFrame.namespaces = new Map();
  }

  setIsCompoundComponent(): void {
    this.currentFrame.isCompoundComponent = true;
  }

  isChildOfCompoundComponent(): boolean {
    for (let i = this.frames.length - 2; i >= 0; --i) {
      const frame = this.frames[i];
      if (frame.node.kind === SyntaxKind.ElementNode) {
        if (frame.isCompoundComponent) {
          return true;
        }
        return false;
      }
    }
    return false;
  }

  // todo: this seems wrong, why are we storing the keys as the map values
  /** Adds a namespace prefix to the current frame's namespace map.
   * Returns false if the key already exists (caller should emit duplXmlns). */
  addCurrentNamespace(key: string): boolean {
    const map = this.currentFrame.namespaces!;
    if (map.has(key)) {
      return false;
    }
    map.set(key, key);
    return true;
  }

  /** Resolves a namespace prefix by walking ancestor frames from innermost outward.
   * Returns true if the prefix is declared in any ancestor, false otherwise. */
  resolveNamespace(prefix: string): boolean {
    for (let i = this.frames.length - 1; i >= 0; i--) {
      if (this.frames[i].namespaces?.has(prefix)) {
        return true;
      }
    }
    return false;
  }

  /** Assumes the closestElementNode is a compound component */
  setHasNonHelper(): void {
    const frame = this.closesetElementNodeFrameAncestor();
    frame.hasNonHelperChildren = true;
  }

  hasNonHelperChildren(): boolean {
    return Boolean(this.currentFrame?.hasNonHelperChildren);
  }

  closesetElementNodeFrameAncestor(): StackFrame | null {
    for (let i = this.frames.length - 2; i >= 0; i--) {
      if (this.frames[i].node.kind === SyntaxKind.ElementNode) {
        return this.frames[i];
      }
    }
    return null;
  }

  InRootElement(): boolean {
    let count = 0;
    for (const frame of this.frames) {
      if (frame.node.kind === SyntaxKind.ElementNode) {
        count++;
        if (count > 1) break;
      }
    }
    return count === 1;
  }

  private get currentFrame(): StackFrame {
    return this.frames[this.frames.length - 1]!;
  }
}

export type GetText = (n: Node, ignoreTrivia?: boolean) => string;

export type ParseResult = { node: Node; errors: ParserDiag[] };

const RECOVER_FILE = [SyntaxKind.CData, SyntaxKind.Script, SyntaxKind.OpenNodeStart] as const;
const RECOVER_OPEN_TAG = [
  SyntaxKind.OpenNodeStart,
  SyntaxKind.NodeEnd,
  SyntaxKind.NodeClose,
  SyntaxKind.CloseNodeStart,
  SyntaxKind.CData,
  SyntaxKind.Script,
] as const;
const RECOVER_ATTR = [SyntaxKind.Identifier, ...RECOVER_OPEN_TAG] as const;
const RECOVER_CONTENT_LIST = [
  SyntaxKind.TextNode,
  SyntaxKind.CData,
  SyntaxKind.Script,
  SyntaxKind.OpenNodeStart,
  SyntaxKind.CloseNodeStart,
] as const;
const RECOVER_CLOSE_TAG = [
  SyntaxKind.NodeEnd,
  SyntaxKind.OpenNodeStart,
  SyntaxKind.CloseNodeStart,
  SyntaxKind.CData,
  SyntaxKind.Script,
] as const;

const COMPOUND_COMPONENT_NAME = "Component";
const HELPERS_WITH_NAME_VALUE_ONLY = new Set([
  "property",
  "template",
  "event",
  "variable",
  "method",
  "global",
]);
const HELPER_NAMES = new Set([
  "property",
  "template",
  "event",
  "variable",
  "global",
  "loaders",
  "uses",
  "method",
  "item",
  "field",
]);
const ON_PREFIX_REGEX = /^on[A-Z]/;
const UPPERCASE_REGEX = /^[A-Z]/;

export function createXmlUiParser(source: string): {
  parse: () => ParseResult;
  getText: GetText;
} {
  return {
    parse: () => parseXmlUiMarkup(source),
    getText: (n: { pos?: number; start?: number; end: number }, ignoreTrivia: boolean = true) =>
      source.substring(ignoreTrivia ? (n.pos ?? n.start ?? 0) : (n.start ?? n.pos ?? 0), n.end),
  };
}

export function parseXmlUiMarkup(text: string): ParseResult {
  const cursor = new DocumentCursor(text);
  const stack = new ParseStack(cursor);
  let peekedToken: Node | undefined;
  let errFromScanner: { message: ScannerDiagnosticMessage; prefixLength: number } | undefined =
    undefined;

  const onScannerErr: ScannerErrorCallback = function (message, length) {
    errFromScanner = {
      message,
      prefixLength: length,
    };
  };
  const scanner = createScanner(false, text, onScannerErr);
  const fileContentListNode = parseFile();
  return { node: fileContentListNode, errors: stack.allErrors() };

  function getText(n: Node, ignoreTrivia: boolean = true) {
    return text.substring(ignoreTrivia ? n.pos : n.start, n.end);
  }

  function parseFile(): Node {
    stack.startNode(SyntaxKind.ContentListNode);
    while (true) {
      const token = peekInContent();
      switch (token.kind) {
        case SyntaxKind.EndOfFileToken:
          bumpAny();
          const fileContentListNode = createNode(SyntaxKind.ContentListNode, stack.node.children!);
          validateSingleRootElement(fileContentListNode);
          return fileContentListNode;
        case SyntaxKind.CData:
          bumpAny();
          break;
        case SyntaxKind.Script:
          stack.incScriptTagCount(bumpAny());
          break;
        case SyntaxKind.OpenNodeStart:
          parseOpeningTag();
          break;

        case SyntaxKind.TextNode:
          bumpAny();
          break;
        case SyntaxKind.CloseNodeStart: {
          const errNode = errNodeUntil(RECOVER_FILE);
          errorAt(DIAGS_PARSER.unexpectedCloseTag, errNode!.pos, errNode!.end);
          break;
        }
        default:
          const errNode = errNodeUntil(RECOVER_FILE);
          errorAt(DIAGS_PARSER.expTagOpen, errNode!.pos, errNode!.end);
          break;
      }
    }
  }

  function parseContentList() {
    stack.startNode(SyntaxKind.ContentListNode);
    loop: while (true) {
      const token = peekInContent();
      switch (token.kind) {
        case SyntaxKind.TextNode:
        case SyntaxKind.CData:
          bumpAny();
          break;
        case SyntaxKind.Script:
          stack.incScriptTagCount(bumpAny());
          break;
        case SyntaxKind.OpenNodeStart:
          parseOpeningTag();
          break;
        case SyntaxKind.CloseNodeStart:
        case SyntaxKind.EndOfFileToken:
          break loop;
        default:
          const errNode = errNodeUntil(RECOVER_CONTENT_LIST);
          errorAt(DIAGS_PARSER.expTagOpen, errNode!.pos, errNode!.end);
          break;
      }
    }
    if (stack.node.children && stack.node.children.length > 0) {
      stack.completeNode(SyntaxKind.ContentListNode);
    } else {
      stack.abandonNode();
    }
  }

  function parseOpeningTag() {
    stack.startNode(SyntaxKind.ElementNode);
    bump(SyntaxKind.OpenNodeStart);
    let errInName = true;
    let openTagNameNode: Node | null = null;
    if (at(SyntaxKind.Identifier)) {
      const tagNameParseRes = parseOpeningTagName();
      errInName = tagNameParseRes.errInName;
      openTagNameNode = tagNameParseRes.node;
    } else {
      const errNode = errNodeUntil(RECOVER_OPEN_TAG);
      if (errNode) {
        errorAt(DIAGS_PARSER.expTagName, errNode.pos, errNode.end);
      } else {
        error(DIAGS_PARSER.expTagName);
      }
    }

    if (!errInName) {
      parseAttrList();
    }

    const openTagNameText = openTagNameNode
      ? getTagNameNodeLastIdentifier(openTagNameNode)
      : undefined;

    if (!errInName && openTagNameNode) {
      // Check for namespace prefix on the tag name (TagNameNode with 3 children = ns:Name)
      if (openTagNameNode.children!.length === 3) {
        if (stack.InRootElement()) {
          // Root element cannot have a namespace prefix
          errorAt(
            DIAGS_PARSER.rootCompNoNamespace,
            openTagNameNode.pos,
            openTagNameNode.children![0].end,
          );
        } else {
          const prefix = getText(openTagNameNode.children![0]);
          if (!stack.resolveNamespace(prefix)) {
            errorAt(
              DIAGS_PARSER.nsNotFound(prefix),
              openTagNameNode.pos,
              openTagNameNode.children![0].end,
            );
          }
        }
      }

      // Initialise the namespace map for this frame and collect xmlns declarations
      stack.initCurrentNamespaces();
      const attrListNode = stack.node.children!.find(
        (c) => c.kind === SyntaxKind.AttributeListNode,
      );
      if (attrListNode) {
        for (const attr of attrListNode.children ?? []) {
          const segmented = segmentAttr(attr);
          if (segmented.namespace === "xmlns") {
            const key = segmented.unsegmentedName;
            const rawValue = segmented.value ?? "";
            const parts = rawValue.split(":");
            if (parts.length > 2) {
              errorAt(
                DIAGS_PARSER.nsValueIncorrect(
                  rawValue,
                  "Namespace cannot contain multiple ':' (colon).",
                ),
                attr.pos,
                attr.end,
              );
            } else if (parts.length === 2 && parts[0] !== "component-ns") {
              errorAt(DIAGS_PARSER.nsSchemeIncorrect(rawValue, "component-ns"), attr.pos, attr.end);
            } else {
              const nsValue = parts.length === 2 ? parts[1] : rawValue;
              if (nsValue.includes("#")) {
                errorAt(
                  DIAGS_PARSER.nsValueIncorrect(nsValue, "Namespace cannot contain character '#'."),
                  attr.pos,
                  attr.end,
                );
              }
            }
            if (!stack.addCurrentNamespace(key)) {
              errorAt(DIAGS_PARSER.duplXmlns(key), attr.pos, attr.end);
            }
          }
        }
      }
    }

    if (openTagNameText === COMPOUND_COMPONENT_NAME) {
      stack.setIsCompoundComponent();
    }

    if (stack.isChildOfCompoundComponent() && openTagNameText) {
      if (!HELPER_NAMES.has(openTagNameText)) {
        stack.setHasNonHelper();
      }
    }

    switch (peek().kind) {
      case SyntaxKind.NodeClose: {
        bumpAny();
        validateElementNode(openTagNameNode, openTagNameText);
        stack.completeNode(SyntaxKind.ElementNode);
        return;
      }

      case SyntaxKind.NodeEnd: {
        bumpAny();
        parseContentList();
        parseClosingTag(openTagNameNode, errInName);
        validateElementNode(openTagNameNode, openTagNameText);
        stack.completeNode(SyntaxKind.ElementNode);
        return;
      }

      default: {
        stack.completeNode(SyntaxKind.ElementNode);
        error(DIAGS_PARSER.expEndOrClose);
        return;
      }
    }
  }

  function parseOpeningTagName(): { node: Node; errInName: boolean } {
    stack.startNode(SyntaxKind.TagNameNode);
    const identNode = bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon) && !eat(SyntaxKind.Identifier)) {
      const nameNodeWithColon = stack.completeNode(SyntaxKind.TagNameNode);
      const namespaceName = getText(identNode);
      errorAt(
        DIAGS_PARSER.expTagNameAfterNamespace(namespaceName),
        nameNodeWithColon.pos,
        nameNodeWithColon.end,
      );
      errNodeUntil([SyntaxKind.Identifier, ...RECOVER_OPEN_TAG]);
      return { node: nameNodeWithColon, errInName: true };
    } else {
      return { node: stack.completeNode(SyntaxKind.TagNameNode), errInName: false };
    }
  }

  function parseAttrList() {
    stack.startNode(SyntaxKind.AttributeListNode);
    const attrNames: { ns?: string; name: string }[] = [];

    loop: while (true) {
      switch (peek().kind) {
        case SyntaxKind.EndOfFileToken:
        // same as RECOVER_OPEN_TAG
        case SyntaxKind.OpenNodeStart:
        case SyntaxKind.NodeEnd:
        case SyntaxKind.NodeClose:
        case SyntaxKind.CloseNodeStart:
        case SyntaxKind.CData:
        case SyntaxKind.Script:
          break loop;

        default:
          parseAttr(attrNames);
      }
    }

    if (stack.node.children!.length === 0) {
      stack.abandonNode();
    } else {
      stack.completeNode(SyntaxKind.AttributeListNode);
    }
  }

  function parseAttr(attrNames: { ns?: string; name: string }[]) {
    stack.startNode(SyntaxKind.AttributeNode);
    if (at(SyntaxKind.Identifier)) {
      parseAttrName(attrNames);
    } else {
      const errNode = errNodeUntil(RECOVER_ATTR);
      if (errNode) {
        if (at(SyntaxKind.Equal)) {
          errorAt(DIAGS_PARSER.expAttrNameBeforeEq, errNode.pos, errNode.end);
        } else {
          errorAt(DIAGS_PARSER.expAttrName, errNode.pos, errNode.end);
        }
        stack.completeNode(SyntaxKind.AttributeNode);
      } else {
        stack.abandonNode();
        error(DIAGS_PARSER.expAttrName);
      }
      return;
    }

    if (eat(SyntaxKind.Equal)) {
      if (!eat(SyntaxKind.StringLiteral)) {
        const errNode = errNodeUntil(RECOVER_ATTR);
        if (errNode) {
          errorAt(DIAGS_PARSER.expAttrStr, errNode.pos, errNode.end);
        } else {
          error(DIAGS_PARSER.expAttrStr);
        }
      }
    }

    stack.completeNode(SyntaxKind.AttributeNode);
  }

  function parseAttrName(attrNames: { ns?: string; name: string }[]) {
    let nameIdent = peek();
    let nsIdent = undefined;

    stack.startNode(SyntaxKind.AttributeKeyNode);
    bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon)) {
      if (at(SyntaxKind.Identifier)) {
        nsIdent = nameIdent;
        nameIdent = bump(SyntaxKind.Identifier);
      } else {
        const namespaceName = getText(nameIdent);
        const errNode = errNodeUntil([
          SyntaxKind.Equal,
          SyntaxKind.Identifier,
          ...RECOVER_OPEN_TAG,
        ]);

        if (errNode) {
          errorAt(DIAGS_PARSER.expAttrNameAfterNamespace(namespaceName), errNode.pos, errNode.end);
        } else {
          error(DIAGS_PARSER.expAttrNameAfterNamespace(namespaceName));
        }
      }
    }
    checkAttrName(attrNames, { nsIdent, nameIdent });
    stack.completeNode(SyntaxKind.AttributeKeyNode);
  }

  function parseClosingTag(openTagName: Node | null, skipNameMatching: boolean) {
    if (eat(SyntaxKind.CloseNodeStart)) {
      if (at(SyntaxKind.Identifier)) {
        const closeTagName = parseClosingTagName();
        if (!skipNameMatching) {
          const namesMismatch =
            openTagName !== null &&
            !tagNameNodesWithoutErrorsMatch(openTagName, closeTagName, getText);
          if (namesMismatch) {
            const msg = DIAGS_PARSER.tagNameMismatch(getText(openTagName!), getText(closeTagName));
            errorAt(msg, closeTagName.pos, closeTagName.end);
          }
        }
      } else {
        const errNode = errNodeUntil(RECOVER_CLOSE_TAG);
        if (errNode) {
          errorAt(DIAGS_PARSER.expTagNameAfterCloseStart, errNode.pos, errNode.end);
        } else {
          error(DIAGS_PARSER.expTagNameAfterCloseStart);
        }
      }
      if (!eat(SyntaxKind.NodeEnd)) {
        error(DIAGS_PARSER.expEnd);
      }
    } else {
      if (openTagName) {
        errorAt(
          DIAGS_PARSER.expCloseStartWithName(getText(openTagName)),
          openTagName.pos,
          openTagName.end,
        );
      } else {
        error(DIAGS_PARSER.expCloseStart);
      }
    }
  }

  function parseClosingTagName(): Node {
    stack.startNode(SyntaxKind.TagNameNode);
    const identNode = bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon) && !eat(SyntaxKind.Identifier)) {
      const nameNodeWithColon = stack.completeNode(SyntaxKind.TagNameNode);
      errorAt(
        DIAGS_PARSER.expTagNameAfterNamespace(getText(identNode)),
        nameNodeWithColon.pos,
        nameNodeWithColon.end,
      );
      errNodeUntil(RECOVER_OPEN_TAG);
      return nameNodeWithColon;
    } else {
      return stack.completeNode(SyntaxKind.TagNameNode);
    }
  }

  type AttrName = {
    ns?: string;
    name: string;
  };

  /** emits errors when the attribute name is incorrect. Otherwise adds the attribute name to the list of valid names*/
  function checkAttrName(
    attrNames: AttrName[],
    { nameIdent, nsIdent }: { nameIdent: Node; nsIdent?: Node },
  ) {
    const attrName = getText(nameIdent);
    const attrNs = nsIdent && getText(nsIdent);
    const attrKeyMatches = ({ ns, name }: AttrName) => name === attrName && ns === attrNs;
    const isDuplicate = attrNames.findIndex(attrKeyMatches) !== -1;
    const nameStartsWithUppercase = "A" <= attrName[0] && attrName[0] <= "Z";
    const faultyName = isDuplicate || nameStartsWithUppercase;

    //TODO: account for the namespace as well
    if (isDuplicate) {
      errorAt(DIAGS_PARSER.duplAttr(attrName), nameIdent.pos, nameIdent.end);
    }
    if (!nsIdent && nameStartsWithUppercase) {
      errorAt(DIAGS_PARSER.uppercaseAttr(attrName), nameIdent.pos, nameIdent.end);
    }
    if (!faultyName) {
      attrNames.push({ name: attrName, ns: attrNs });
    }
  }

  type SegmentedAttr = {
    namespace?: string;
    startSegment?: string;
    name?: string;
    value?: string;
    unsegmentedName: string;
    node: Node;
  };

  function validateElementNode(tagNameNode: Node, tagNameText: string) {
    const errReportNode = tagNameNode ?? stack.node.children![0];

    if (!tagNameText) {
      return;
    }

    if (tagNameText === COMPOUND_COMPONENT_NAME) {
      validateCompoundComponentNode(errReportNode);
      return;
    }

    if (tagNameText === "global" && stack.isChildOfCompoundComponent()) {
      errorAt(DIAGS_PARSER.globalNotAllowedInComponent, errReportNode.pos, errReportNode.end);
    }

    if (stack.isChildOfCompoundComponent() && tagNameText) {
      if (tagNameText === "uses" || tagNameText === "loaders") {
        errorAt(DIAGS_PARSER.invalidNodeName(tagNameText), errReportNode.pos, errReportNode.end);
      }
    }

    if (HELPERS_WITH_NAME_VALUE_ONLY.has(tagNameText)) {
      const attrs = getElementAttrs(stack.node).map(segmentAttr);
      validateNameValueAttributes(errReportNode, tagNameText, attrs);
      if (tagNameText === "event") {
        const eventNameAttr = attrs.find(
          (attr) => !attr.namespace && !attr.startSegment && attr.name === "name",
        );
        if (eventNameAttr?.value && ON_PREFIX_REGEX.test(eventNameAttr.value)) {
          errorAt(
            DIAGS_PARSER.eventNoOnPrefix(eventNameAttr.value),
            eventNameAttr.node.pos,
            eventNameAttr.node.end,
          );
        }
      }
    }

    if (tagNameText === "uses") {
      validateUsesElement(errReportNode);
    }

    if (tagNameText === "item") {
      validateItemElement();
    }

    if (tagNameText === "property" || tagNameText === "template") {
      validateFieldItemChildren();
    }
  }

  function validateCompoundComponentNode(errReportNode: Node) {
    if (stack.hasCompoundCompAncestor()) {
      errorAt(DIAGS_PARSER.nestedCompDefs, errReportNode.pos, errReportNode.end);
      return;
    }

    const element = stack.node;

    const attrs = getElementAttrs(element).map(segmentAttr);
    const nameAttr = attrs.find(
      (attr) => !attr.namespace && !attr.startSegment && attr.name === "name",
    );
    if (!nameAttr?.value) {
      errorAt(DIAGS_PARSER.compDefNameExp, errReportNode.pos, errReportNode.end);
      return;
    } else if (!UPPERCASE_REGEX.test(nameAttr.value)) {
      errorAt(DIAGS_PARSER.compDefNameUppercase, nameAttr.node.pos, nameAttr.node.end);
      return;
    }

    if (!stack.hasNonHelperChildren()) {
      errorAt(DIAGS_PARSER.compDefNesedElem, errReportNode.pos, errReportNode.end);
    }

    for (const attr of attrs) {
      if (attr.namespace === "xmlns") {
        continue;
      }

      if (attr.startSegment) {
        if (attr.startSegment === "global") {
          errorAt(DIAGS_PARSER.globalNotAllowedInComponent, attr.node.pos, attr.node.end);
        } else if (attr.startSegment !== "method" && attr.startSegment !== "var") {
          errorAt(
            DIAGS_PARSER.invalidReusableCompAttr(attr.unsegmentedName),
            attr.node.pos,
            attr.node.end,
          );
        }
        continue;
      }

      if (attr.name !== "name" && attr.name !== "codeBehind") {
        errorAt(
          DIAGS_PARSER.invalidReusableCompAttr(attr.name ?? attr.unsegmentedName),
          attr.node.pos,
          attr.node.end,
        );
      }
    }
  }

  function validateNameValueAttributes(
    errReportNode: Node,
    elementName: string,
    attrs: SegmentedAttr[],
  ) {
    const invalidAttr = attrs.find(
      (attr) =>
        attr.namespace !== undefined ||
        attr.startSegment !== undefined ||
        (attr.name !== "name" && attr.name !== "value"),
    );

    if (invalidAttr) {
      errorAt(
        DIAGS_PARSER.onlyNameValueAttrs(elementName),
        invalidAttr.node.pos,
        invalidAttr.node.end,
      );
      return;
    }

    const nameAttr = attrs.find((attr) => attr.name === "name");
    if (!nameAttr?.value) {
      errorAt(DIAGS_PARSER.nameAttrRequired(elementName), errReportNode.pos, errReportNode.end);
    }
  }

  function validateUsesElement(errReportNode: Node) {
    const attrs = getElementAttrs(stack.node).map(segmentAttr);
    const valueAttr = attrs.find(
      (attr) => !attr.namespace && !attr.startSegment && attr.name === "value",
    );
    if (!valueAttr?.value || attrs.length !== 1) {
      errorAt(DIAGS_PARSER.usesValueOnly, errReportNode.pos, errReportNode.end);
    }
  }

  function validateItemElement() {
    const attrs = getElementAttrs(stack.node).map(segmentAttr);
    const nameAttr = attrs.find(
      (attr) => !attr.namespace && !attr.startSegment && attr.name === "name",
    );
    if (nameAttr) {
      errorAt(DIAGS_PARSER.cantHaveNameAttr("item"), nameAttr.node.pos, nameAttr.node.end);
    }
  }

  function validateFieldItemChildren() {
    const children = getElementChildren(stack.node);
    const hasNestedComponent = children.some((child) => {
      if (child.kind !== SyntaxKind.ElementNode) {
        return false;
      }
      const childName = getElementName(child);
      return childName ? UPPERCASE_REGEX.test(childName) : false;
    });

    if (hasNestedComponent) {
      return;
    }

    let nestedElementType: "field" | "item" | undefined;

    for (const child of children) {
      if (child.kind !== SyntaxKind.ElementNode) {
        continue;
      }

      const childName = getElementName(child);
      if (!childName) {
        continue;
      }

      if (childName !== "field" && childName !== "item") {
        errorAt(DIAGS_PARSER.onlyFieldOrItemChild, child.pos, child.end);
        continue;
      }

      if (!nestedElementType) {
        nestedElementType = childName;
      } else if (nestedElementType !== childName) {
        errorAt(DIAGS_PARSER.cannotMixFieldItem, child.pos, child.end);
      }
    }
  }

  function validateSingleRootElement(fileContentListNode: Node) {
    const children = fileContentListNode.children ?? [];
    // --- Check that the nodes contains exactly only a single component root element before the EoF token
    if (children[0].kind !== SyntaxKind.ElementNode) {
      errorAt(DIAGS_PARSER.singleRootElem, children[0].pos, children[0].end);
    }
    if (children.length > 2) {
      errorAt(DIAGS_PARSER.singleRootElem, children[1].pos, children[1].end);
    }
  }

  function segmentAttr(attr: Node): SegmentedAttr {
    const keyNode = attr.children?.[0];
    const keyChildren = keyNode?.children ?? [];
    const hasNamespace = keyChildren.length === 3;
    const namespace = hasNamespace ? getText(keyChildren[0]) : undefined;
    const unsegmentedName =
      keyChildren.length > 0 ? getText(keyChildren[keyChildren.length - 1]) : "";

    const segments = unsegmentedName.split(".");
    let startSegment: string | undefined;
    let name: string | undefined;
    if (segments.length === 2) {
      startSegment = segments[0];
      name = segments[1];
    } else {
      name = unsegmentedName;
    }

    const valueNode = attr.children?.[2];
    let value: string | undefined;
    if (valueNode && valueNode.kind === SyntaxKind.StringLiteral) {
      const valueText = getText(valueNode);
      value = valueText.length >= 2 ? valueText.substring(1, valueText.length - 1) : "";
    }

    return {
      namespace,
      startSegment,
      name,
      value,
      unsegmentedName,
      node: attr,
    };
  }

  function getElementName(element: Node): string | undefined {
    const tagNameNode = element.children?.find((c) => c.kind === SyntaxKind.TagNameNode);
    if (!tagNameNode || !tagNameNode.children || tagNameNode.children.length === 0) {
      return undefined;
    }
    return getText(tagNameNode.children[tagNameNode.children.length - 1]);
  }

  function getTagNameNodeLastIdentifier(tagNameNode: Node): string {
    return getText(tagNameNode.children![tagNameNode.children!.length - 1]);
  }

  function getElementAttrs(element: IncompleteNode): Node[] {
    return element.children?.find((c) => c.kind === SyntaxKind.AttributeListNode)?.children ?? [];
  }

  function getElementChildren(element: IncompleteNode): Node[] {
    return element.children?.find((c) => c.kind === SyntaxKind.ContentListNode)?.children ?? [];
  }

  function error({ code, message }: ParserDiagPositionless) {
    const { pos, end } = peek();

    const { contextPos, contextEnd } = cursor.getSurroundingContext(pos, end, 1);

    stack.pushError({
      code,
      message,
      pos,
      end,
      contextPos,
      contextEnd,
    });
  }

  function errorAt({ code, message }: ParserDiagPositionless, pos: number, end: number) {
    const { contextPos, contextEnd } = cursor.getSurroundingContext(pos, end, 1);

    stack.pushError({
      code,
      message,
      pos,
      end,
      contextPos,
      contextEnd,
    });
  }

  /**
   *
   * @param tokens that won't be consumed
   * @returns the error node with the consumed tokens, or null if there were no tokens consumed
   */
  function errNodeUntil(tokens: readonly SyntaxKind[]): Node | null {
    stack.startNode(SyntaxKind.ErrorNode);
    advance(tokens);
    if (stack.node.children!.length === 0) {
      stack.abandonNode();
      return null;
    } else {
      return stack.completeNode(SyntaxKind.ErrorNode);
    }
  }

  function advance(to: readonly SyntaxKind[]) {
    for (
      let token = peek();
      token.kind !== SyntaxKind.EndOfFileToken && !to.includes(token.kind);
      bumpAny(), token = peek()
    ) {}
  }

  function eat(kind: SyntaxKind): boolean {
    const kindMatched = at(kind);
    if (kindMatched) {
      bumpAny();
    }
    return kindMatched;
  }

  function at(kindToCheck: SyntaxKind): boolean {
    return peek().kind === kindToCheck;
  }

  function peek(inContent: boolean = false) {
    if (peekedToken !== undefined) {
      return peekedToken;
    }
    peekedToken = collectToken(inContent);
    return peekedToken;
  }

  function peekInContent(): Node {
    const token = peek(true);
    if (
      token.kind === SyntaxKind.EndOfFileToken ||
      token.kind === SyntaxKind.OpenNodeStart ||
      token.kind === SyntaxKind.Script ||
      token.kind === SyntaxKind.CData ||
      token.kind === SyntaxKind.CloseNodeStart
    ) {
      return token;
    }

    const trivia = token.triviaBefore;
    const triviaLength = trivia?.length ?? 0;
    let i = 0;
    let leadingComments = [];
    let firstNonCommentTriviaIdx: number = -1;
    for (; i < triviaLength; ++i) {
      if (trivia![i].kind === SyntaxKind.CommentTrivia) {
        leadingComments.push(trivia![i]);
      } else {
        firstNonCommentTriviaIdx = i;
        break;
      }
    }

    let secondCommentGroupStartIdx = -1;
    for (; i < triviaLength; ++i) {
      if (trivia![i].kind === SyntaxKind.CommentTrivia) {
        secondCommentGroupStartIdx = i;
        break;
      }
    }

    let pos: number;
    if (leadingComments.length > 0) {
      pos = leadingComments[leadingComments.length - 1].end;
    } else if (firstNonCommentTriviaIdx !== -1) {
      pos = trivia![firstNonCommentTriviaIdx].pos;
    } else {
      pos = token.start;
    }
    let triviaBefore = undefined;
    if (leadingComments.length > 0) {
      triviaBefore = leadingComments;
    }

    let kind = SyntaxKind.TextNode;
    let end: number = -1;
    if (secondCommentGroupStartIdx !== -1) {
      end = trivia![secondCommentGroupStartIdx].pos;
      scanner.resetTokenState(end);
    } else {
      while (true) {
        const nextChar = scanner.peekChar();
        if (nextChar === null || nextChar === CharacterCodes.lessThan) {
          break;
        }
        scanner.scanChar();
      }
      end = scanner.getTokenEnd();
    }

    peekedToken = new Node(kind, pos, end, triviaBefore);
    return peekedToken;
  }

  /** Same as bumpAny, but with an assertion of the token that was bumped over.
   * Makes the code more redundant, but also more defensive*/
  function bump(kind: SyntaxKind) {
    const token = bumpAny();
    if (token.kind !== kind) {
      throw new Error(
        `expected ${getSyntaxKindStrRepr(kind)}, bumped a ${getSyntaxKindStrRepr(token.kind)}`,
      );
    }
    return token;
  }

  function bumpAny(): Node {
    if (peekedToken) {
      stack.pushToken(peekedToken);
      const bumpedToken = peekedToken;
      peekedToken = undefined;
      return bumpedToken;
    }
    const token = collectToken(false);
    stack.pushToken(token);
    return token;
  }

  function collectToken(inContent: boolean): Node {
    let kind: SyntaxKind;
    let triviaCollected: Node[] = [];
    let start: number | null = null;
    while (true) {
      kind = scanner.scan();
      if (start === null) {
        start = scanner.getTokenStart();
      }
      //handle error from scanner
      if (errFromScanner !== undefined) {
        let err: ParserDiagPositionless;
        if (errFromScanner.message.code === ErrCodesParser.invalidChar) {
          err = DIAGS_PARSER.invalidChar(scanner.getTokenText());
        } else {
          err = errFromScanner.message;
        }

        const pos = scanner.getTokenStart();
        const triviaBefore = triviaCollected.length > 0 ? triviaCollected : undefined;

        triviaCollected = [];
        if (inContent && err.code === ErrCodesParser.invalidChar) {
          errFromScanner = undefined;
          return new Node(kind, pos, scanner.getTokenEnd(), triviaBefore);
        }

        const badPrefixEnd = pos + errFromScanner.prefixLength;
        const token = new Node(kind, pos, badPrefixEnd, triviaBefore);

        scanner.resetTokenState(badPrefixEnd);
        stack.startNode(SyntaxKind.ErrorNode);
        stack.pushToken(token);

        const { contextPos, contextEnd } = cursor.getSurroundingContext(pos, badPrefixEnd, 0);
        stack.pushError({
          code: err.code,
          message: err.message,
          pos,
          end: badPrefixEnd,
          contextPos,
          contextEnd,
        });
        stack.completeNode(SyntaxKind.ErrorNode);

        errFromScanner = undefined;
        return collectToken(inContent);
      }

      switch (kind) {
        case SyntaxKind.CommentTrivia:
        case SyntaxKind.NewLineTrivia:
        case SyntaxKind.WhitespaceTrivia:
          triviaCollected.push(new Node(kind, scanner.getTokenStart(), scanner.getTokenEnd()));
          break;

        default:
          return new Node(
            kind,
            scanner.getTokenStart(),
            scanner.getTokenEnd(),
            triviaCollected.length > 0 ? triviaCollected : undefined,
          );
      }
    }
  }
}

function createNode(kind: SyntaxKind, children: Node[]): Node {
  const firstChild = children[0];
  const lastChild = children[children.length - 1];
  return new Node(kind, firstChild.pos, lastChild.end, undefined, children);
}

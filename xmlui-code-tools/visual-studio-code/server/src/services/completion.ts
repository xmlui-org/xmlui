import { CompletionItem } from 'vscode-languageserver';
import { GetText, ParseResult } from '../xmlui-parser/parser';
import { findTokenAtPos } from '../xmlui-parser/utils';
import { SyntaxKind } from '../xmlui-parser/syntax-kind';
import { Node } from '../xmlui-parser/syntax-node';

export function handleCompleteion(
  { node }: ParseResult,
  position: number,
  getText: (n: Node) => string,
): CompletionItem[] {
  const findRes = findTokenAtPos(node, position);
  if (findRes === undefined) {
    return [];
  }

  if (findRes.chainBeforePos === undefined) {
    return [];
  }
  const kindBefore =
    findRes.chainBeforePos[findRes.chainBeforePos.length - 1].kind;
  switch (kindBefore) {
    case SyntaxKind.OpenNodeStart:
      return componentNames;
    case SyntaxKind.CloseNodeStart:
      return matchingTagName(findRes as FindTokenSuccessHasBefore, getText);
    default:
      return [];
  }
}

type FindTokenSuccessHasBefore = {
  chainAtPos: Node[];
  chainBeforePos: Node[];
  sharedParents: number;
};

function matchingTagName(
  { chainAtPos, chainBeforePos, sharedParents }: FindTokenSuccessHasBefore,
  getText: GetText,
): CompletionItem[] {
  let parentBefore;
  if (chainBeforePos.length > 1) {
    parentBefore = chainBeforePos[chainBeforePos.length - 2];
  } else if (sharedParents! > 0) {
    parentBefore = chainAtPos[sharedParents! - 1];
  } else {
    return componentNames;
  }

  if (parentBefore.kind === SyntaxKind.ElementNode) {
    const nameNode = parentBefore.children!.find(
      (c) => c.kind === SyntaxKind.TagNameNode,
    );
    if (nameNode === undefined) {
      return componentNames;
    }
    const colonIdx = nameNode.children!.findIndex(
      (c) => c.kind === SyntaxKind.Colon,
    );
    let nameSpace: string | undefined = undefined;
    let nameIdentSearchSpace = nameNode.children!;
    let name: string | undefined = undefined;
    if (colonIdx !== -1) {
      nameIdentSearchSpace = nameNode.children!.slice(colonIdx + 1);
      const nameSpaceIdx = nameNode.children!.findIndex(
        (c) => c.kind === SyntaxKind.Identifier,
      );
      if (nameSpaceIdx < colonIdx) {
        nameSpace = getText(nameNode.children![nameSpaceIdx]);
      }
    }
    const nameIdent = nameIdentSearchSpace.find(
      (c) => c.kind === SyntaxKind.Identifier,
    );
    if (nameIdent === undefined) {
      return componentNames;
    }
    name = getText(nameIdent);
    const value = nameSpace !== undefined ? nameSpace + ':' + name : name;
    return [{ label: value }];
  }
  return [];
}

const componentNames: CompletionItem[] = [
  { label: 'ApiBinding' },
  { label: 'App' },
  { label: 'AppHeader' },
  { label: 'Avatar' },
  { label: 'Badge' },
  { label: 'Button' },
  { label: 'Card' },
  { label: 'ChangeListener' },
  { label: 'Chart' },
  { label: 'Checkbox' },
  { label: 'ChildrenSlot' },
  { label: 'CHStack' },
  { label: 'Combobox' },
  { label: 'ContentSeparator' },
  { label: 'CVStack' },
  { label: 'DataSource' },
  { label: 'DatePicker' },
  { label: 'DropdownMenu' },
  { label: 'EmojiSelector' },
  { label: 'FileInput' },
  { label: 'FileUploadDropZone' },
  { label: 'FlowLayout' },
  { label: 'Footer' },
  { label: 'Form' },
  { label: 'FormItem' },
  { label: 'FormSection' },
  { label: 'Fragment' },
  { label: 'H1' },
  { label: 'H2' },
  { label: 'H3' },
  { label: 'H4' },
  { label: 'H5' },
  { label: 'H6' },
  { label: 'Heading' },
  { label: 'HStack' },
  { label: 'Icon' },
  { label: 'Image' },
  { label: 'Items' },
  { label: 'Link' },
  { label: 'List' },
  { label: 'Logo' },
  { label: 'Markdown' },
  { label: 'MenuItem' },
  { label: 'MenuSeparator' },
  { label: 'ModalDialog' },
  { label: 'MultiCombobox' },
  { label: 'MultiSelect' },
  { label: 'NavGroup' },
  { label: 'NavLink' },
  { label: 'NavPanel' },
  { label: 'NoResults' },
  { label: 'NumberBox' },
  { label: 'PageMetaTitle' },
  { label: 'Pages' },
  { label: 'Pdf' },
  { label: 'PositionedContainer' },
  { label: 'ProgressBar' },
  { label: 'Queue' },
  { label: 'RadioGroup' },
  { label: 'RadioGroupOption' },
  { label: 'RealTimeAdapter' },
  { label: 'RouteContent' },
  { label: 'Select' },
  { label: 'SelectionStore' },
  { label: 'SpaceFiller' },
  { label: 'Spinner' },
  { label: 'Splitter' },
  { label: 'Stack' },
  { label: 'StickyBox' },
  { label: 'SubMenuItem' },
  { label: 'Switch' },
  { label: 'Table' },
  { label: 'TableColumnDef' },
  { label: 'Text' },
  { label: 'TextArea' },
  { label: 'TextBox' },
  { label: 'Theme' },
  { label: 'ThemeChangerButton' },
  { label: 'Tree' },
  { label: 'VStack' },
  { label: 'event' },
  { label: 'prop' },
  { label: 'var' },
  { label: 'script' },
];

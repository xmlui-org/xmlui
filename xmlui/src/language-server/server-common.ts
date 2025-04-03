import type {
  Connection,
  InitializeParams,
	TextDocumentPositionParams,
	InitializeResult,
  HoverParams,
} from 'vscode-languageserver';
import {
  MarkupKind,
  TextDocumentSyncKind,
  DidChangeConfigurationNotification,
  TextDocuments,
  ProposedFeatures,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

// import { collectedComponentMetadata } from "./xmlui-metadata.mjs";
import type {XmluiCompletionItem} from "./services/completion";
import { handleCompletion, handleCompletionResolve} from "./services/completion";
import {handleHover} from "./services/hover";
import { createXmlUiParser, type GetText, type ParseResult } from '../parsers/xmlui-parser/parser';
import { ComponentMetadataCollection } from '../components/collectedComponentMetadata';

const U = "Button"
const collectedComponentMetadata: ComponentMetadataCollection = {
  Button: {
    description: "Button is an interactive element that triggers an action when clicked.",
    status: "stable",
    props: {
      autoFocus: {
        description: "Indicates if the button should receive focus when the page loads.",
        isRequired: !1,
        type: "boolean",
        defaultValue: !1
      },
      variant: {
        description: "The button variant determines the level of emphasis the button should possess.",
        isRequired: !1,
        type: "string",
      },
      themeColor: {
        description: "Sets the button color scheme defined in the application theme.",
        isRequired: !1,
        type: "string",
      },
      size: {
        description: "Sets the size of the button.",
        isRequired: !1,
        type: "string",
      },
      label: {
        description: `This property is an optional string to set a label for the ${U}. If no label is specified and an icon is set, the ${U} will modify its styling to look like a small icon button. When the ${U} has nested children, it will display them and ignore the value of the \`label\` prop.`,
        type: "string"
      },
      type: {
        description: `This optional string describes how the ${U} appears in an HTML context. You rarely need to set this property explicitly.`,
        valueType: "string",
      },
      enabled: {
        description: "The value of this property indicates whether the button accepts actions (`true`) or does not react to them (`false`).",
        type: "boolean",
        defaultValue: !0
      },
      icon: {
        description: `This string value denotes an icon name. The framework will render an icon if XMLUI recognizes the icon by its name. If no label is specified and an icon is set, the ${U} displays only that icon.`,
        type: "string"
      },
      iconPosition: {
        description: `This optional string determines the location of the icon in the ${U}.`,
        type: "string",
      },
      contentPosition: {
        description: `This optional value determines how the label and icon (or nested children) should be placedinside the ${U} component.`,
        type: "string",
      }
    },
    defaultThemeVars: {
      [`width-${U}`]: "fit-content",
      [`height-${U}`]: "fit-content",
      [`borderRadius-${U}`]: "$borderRadius",
      [`fontSize-${U}`]: "$fontSize-small",
      [`fontWeight-${U}`]: "$fontWeight-medium",
      [`backgroundColor-${U}-primary`]: "$color-primary-500",
      [`backgroundColor-${U}-attention`]: "$backgroundColor-attention",
      [`borderColor-${U}-attention`]: "$color-attention",
      [`backgroundColor-${U}--disabled`]: "$backgroundColor--disabled",
      [`borderColor-${U}--disabled`]: "$borderColor--disabled",
      [`borderStyle-${U}`]: "solid",
      [`textColor-${U}--disabled`]: "$textColor--disabled",
      [`outlineColor-${U}--focus`]: "$outlineColor--focus",
      [`borderWidth-${U}`]: "1px",
      [`outlineWidth-${U}--focus`]: "$outlineWidth--focus",
      [`outlineStyle-${U}--focus`]: "$outlineStyle--focus",
      [`outlineOffset-${U}--focus`]: "$outlineOffset--focus",
      [`paddingHorizontal-${U}-xs`]: "$space-1",
      [`paddingVertical-${U}-xs`]: "$space-0_5",
      [`paddingHorizontal-${U}-sm`]: "$space-4",
      [`paddingVertical-${U}-sm`]: "$space-2",
      [`paddingHorizontal-${U}-md`]: "$space-4",
      [`paddingVertical-${U}-md`]: "$space-3",
      [`paddingHorizontal-${U}-lg`]: "$space-5",
      [`paddingVertical-${U}-lg`]: "$space-4",
      light: {
        [`textColor-${U}`]: "$color-surface-950",
        [`textColor-${U}-solid`]: "$color-surface-50",
        [`borderColor-${U}-primary`]: "$color-primary-500",
        [`backgroundColor-${U}-primary--hover`]: "$color-primary-400",
        [`backgroundColor-${U}-primary--active`]: "$color-primary-500",
        [`backgroundColor-${U}-primary-outlined--hover`]: "$color-primary-50",
        [`backgroundColor-${U}-primary-outlined--active`]: "$color-primary-100",
        [`borderColor-${U}-primary-outlined`]: "$color-primary-600",
        [`borderColor-${U}-primary-outlined--hover`]: "$color-primary-500",
        [`textColor-${U}-primary-outlined`]: "$color-primary-900",
        [`textColor-${U}-primary-outlined--hover`]: "$color-primary-950",
        [`textColor-${U}-primary-outlined--active`]: "$color-primary-900",
        [`backgroundColor-${U}-primary-ghost--hover`]: "$color-primary-50",
        [`backgroundColor-${U}-primary-ghost--active`]: "$color-primary-100",
        [`borderColor-${U}-secondary`]: "$color-secondary-100",
        [`backgroundColor-${U}-secondary`]: "$color-secondary-500",
        [`backgroundColor-${U}-secondary--hover`]: "$color-secondary-400",
        [`backgroundColor-${U}-secondary--active`]: "$color-secondary-500",
        [`backgroundColor-${U}-secondary-outlined--hover`]: "$color-secondary-50",
        [`backgroundColor-${U}-secondary-outlined--active`]: "$color-secondary-100",
        [`backgroundColor-${U}-secondary-ghost--hover`]: "$color-secondary-100",
        [`backgroundColor-${U}-secondary-ghost--active`]: "$color-secondary-100",
        [`backgroundColor-${U}-attention--hover`]: "$color-danger-400",
        [`backgroundColor-${U}-attention--active`]: "$color-danger-500",
        [`backgroundColor-${U}-attention-outlined--hover`]: "$color-danger-50",
        [`backgroundColor-${U}-attention-outlined--active`]: "$color-danger-100",
        [`backgroundColor-${U}-attention-ghost--hover`]: "$color-danger-50",
        [`backgroundColor-${U}-attention-ghost--active`]: "$color-danger-100"
      },
      dark: {
        [`textColor-${U}`]: "$color-surface-50",
        [`textColor-${U}-solid`]: "$color-surface-50",
        [`borderColor-${U}-primary`]: "$color-primary-500",
        [`backgroundColor-${U}-primary--hover`]: "$color-primary-600",
        [`backgroundColor-${U}-primary--active`]: "$color-primary-500",
        [`backgroundColor-${U}-primary-outlined--hover`]: "$color-primary-900",
        [`backgroundColor-${U}-primary-outlined--active`]: "$color-primary-950",
        [`borderColor-${U}-primary-outlined`]: "$color-primary-600",
        [`borderColor-${U}-primary-outlined--hover`]: "$color-primary-500",
        [`textColor-${U}-primary-outlined`]: "$color-primary-100",
        [`textColor-${U}-primary-outlined--hover`]: "$color-primary-50",
        [`textColor-${U}-primary-outlined--active`]: "$color-primary-100",
        [`backgroundColor-${U}-primary-ghost--hover`]: "$color-primary-900",
        [`backgroundColor-${U}-primary-ghost--active`]: "$color-primary-950",
        [`borderColor-${U}-secondary`]: "$color-secondary-500",
        [`backgroundColor-${U}-secondary`]: "$color-secondary-500",
        [`backgroundColor-${U}-secondary--hover`]: "$color-secondary-400",
        [`backgroundColor-${U}-secondary--active`]: "$color-secondary-500",
        [`backgroundColor-${U}-secondary-outlined--hover`]: "$color-secondary-600",
        [`backgroundColor-${U}-secondary-outlined--active`]: "$color-secondary-500",
        [`backgroundColor-${U}-secondary-ghost--hover`]: "$color-secondary-900",
        [`backgroundColor-${U}-secondary-ghost--active`]: "$color-secondary-950",
        [`backgroundColor-${U}-attention--hover`]: "$color-danger-400",
        [`backgroundColor-${U}-attention--active`]: "$color-danger-500",
        [`backgroundColor-${U}-attention-outlined--hover`]: "$color-danger-900",
        [`backgroundColor-${U}-attention-outlined--active`]: "$color-danger-950",
        [`backgroundColor-${U}-attention-ghost--hover`]: "$color-danger-900",
        [`backgroundColor-${U}-attention-ghost--active`]: "$color-danger-950"
      }
    }
  }
}

export function start(connection: Connection){
  // Also include all preview / proposed LSP features.
  // Create a simple text document manager.
  const documents = new TextDocuments(TextDocument);

  let hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;
  let hasDiagnosticRelatedInformationCapability = false;

  connection.onInitialize((params: InitializeParams) => {
    connection.console.log("initing!")
    const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: ["<", "/"],
			},

			hoverProvider: true,
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
  });

  connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
  });

  connection.onCompletion(async ({ position, textDocument }: TextDocumentPositionParams) => {
    connection.console.log(`Received request completion`);
    const document = documents.get(textDocument.uri);
    if (!document) {
      return [];
    }
    const parseResult = parseDocument(document);
    return handleCompletion({ parseResult: parseResult.parseResult, getText: parseResult.getText, metaByComp: collectedComponentMetadata }, document.offsetAt(position));
  });

  connection.onCompletionResolve((completionItem: XmluiCompletionItem) => {
    return handleCompletionResolve({metaByComp: collectedComponentMetadata, item: completionItem})
  });

  connection.onHover(({ position, textDocument }: HoverParams) => {
    connection.console.log(`Received request hover`);
    const document = documents.get(textDocument.uri);
    if (!document) {
      return null;
    }

    const { parseResult, getText } = parseDocument(document);
    const ctx = {
      parseResult,
      getText,
      metaByComp: collectedComponentMetadata
    }
    const hoverRes = handleHover(ctx, document.offsetAt(position));
    if (hoverRes === null){
      return null;
    }
    const { value, range } = hoverRes;
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value,
      },
      range: {
        start: document.positionAt(range.pos),
        end: document.positionAt(range.end),
      },
    };
  });

  const parsedDocuments = new Map();
  function parseDocument(document: TextDocument): {
    parseResult: ParseResult;
    getText: GetText;
  } {
    const parseForDoc = parsedDocuments.get(document.uri);
    if (parseForDoc !== undefined) {
      if (parseForDoc.version === document.version) {
        return {
          parseResult: parseForDoc.parseResult,
          getText: parseForDoc.getText,
        };
      }
    }
    const parser = createXmlUiParser(document.getText());
    const parseResult = parser.parse();
    parsedDocuments.set(document.uri, {
      parseResult,
      version: document.version,
      getText: parser.getText,
    });
    return { parseResult, getText: parser.getText };
  }

  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  console.log("starting to listen")
  connection.listen();
}

import {
  createXmlUiParser,
  type GetText,
  type ParseResult,
} from "../../parsers/xmlui-parser/parser";
import { type DocumentUri, TextDocument } from "./text-document";

// base the implementation on Roc's PackageEnv and ModuleState structs. PackageEnv will be the Project and ModuleState is more like the documents

export interface DocumentStore {
  /**
   * Returns the document for the given URI. Returns undefined if
   * the document is not managed by this instance.
   *
   * @param uri The text document's URI to retrieve.
   * @return the text document or `undefined`.
   */
  get(uri: DocumentUri): TextDocument | undefined;
  /**
   * Returns all text documents managed by this instance.
   *
   * @return all text documents.
   */
  all(): TextDocument[];
  /**
   * Returns the URIs of all text documents managed by this instance.
   *
   * @return the URI's of all text documents.
   */
  keys(): DocumentUri[];
}

class SimpleDocumentStore implements DocumentStore {
  private documents: Record<DocumentUri, TextDocument>;

  constructor(fileContentByUri: Record<DocumentUri, string>) {
    this.documents = {};
    for (const uri in fileContentByUri) {
      const doc = TextDocument.create(uri, "xmlui", 0, fileContentByUri[uri]);

      this.documents[uri] = doc;
    }
  }

  get(uri: DocumentUri): TextDocument | undefined {
    return this.documents[uri];
  }

  all(): TextDocument[] {
    return Object.values(this.documents);
  }

  keys(): DocumentUri[] {
    return Object.keys(this.documents);
  }
}

export class Project {
  constructor(public documents: DocumentStore) {
    this.documents = documents;
  }

  public static fromFileContets(contentByUri: Record<DocumentUri, string>) {
    return new Project(new SimpleDocumentStore(contentByUri));
  }
}

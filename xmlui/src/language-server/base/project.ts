import { type DocumentUri } from "./text-document";
import type { MetadataProvider } from "../services/common/metadata-utils";
import { SimpleDocumentStore, type DocumentStore } from "./document-store";

export class Project {
  constructor(
    public documents: DocumentStore,
    public metadataProvider: MetadataProvider,
  ) {
    this.documents = documents;
    this.metadataProvider = metadataProvider;
  }

  public static fromFileContets(
    contentByUri: Record<DocumentUri, string>,
    metadataProvider: MetadataProvider,
  ) {
    return new Project(new SimpleDocumentStore(contentByUri), metadataProvider);
  }
}

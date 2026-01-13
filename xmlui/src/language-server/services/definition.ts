import { type Location, type LocationLink } from "vscode-languageserver";
import type { Project } from "../base/project";
import type { DocumentUri, Position } from "../base/text-document";

export function handleDefinition(
  project: Project,
  uri: DocumentUri,
  offset: Position,
): Location | LocationLink[] | null {
  throw new Error("Function not implemented.");
}

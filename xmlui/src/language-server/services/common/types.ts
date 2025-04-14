import type { ComponentMetadata } from "../../../abstractions/ComponentDefs"

type RestrictedComponentMetadata = Pick<ComponentMetadata, "description" | "status" | "props" | "events" | "apis" | "contextVars" | "allowArbitraryProps" | "shortDescription">

export type ComponentMetadataCollection = Record<string, RestrictedComponentMetadata>

import generatedSnapshot from "./xmlui-metadata-generated.js";
import type { ComponentMetadata } from "../abstractions/ComponentDefs";

export const generatedMetadataRegistry: Record<string, ComponentMetadata> =
  generatedSnapshot as Record<string, ComponentMetadata>;

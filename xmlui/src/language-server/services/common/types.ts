import type { ComponentMetadata } from "../../../abstractions/ComponentDefs"

type RestrictedComponentMetadata = Pick<ComponentMetadata, "description" | "status" | "props" | "events" | "apis" | "contextVars" | "allowArbitraryProps" | "shortDescription">

export type ComponentMetadataCollection = Record<string, RestrictedComponentMetadata>

export class MetadataProvider {
    constructor(private readonly metadataCollection: ComponentMetadataCollection) {}

    componentNames(): string[] {
        return Object.keys(this.metadataCollection);
    }

    getComponent(componentName: string): ComponentMetadataProvider | null {
      const providerData = this.metadataCollection[componentName];
      if (!providerData) {
        return null;
      }

      return new ComponentMetadataProvider(providerData);
    }
}

class ComponentMetadataProvider {
    constructor(private readonly metadata: RestrictedComponentMetadata) {}

    getProp(name: string) {
        return this.metadata.props[name];
    }

    getAllAttributes(): string[] {
      const attrNames = [];
      for (const key of Object.keys(this.metadata.props)){
        attrNames.push({name: key, kind: "prop"});
      }
      for (const key of Object.keys(this.metadata.events)){
        attrNames.push({name: key, kind: "event"});
      }
      for (const key of Object.keys(this.metadata.apis)){
        attrNames.push({name: key, kind: "api"});
      }
      add other props here
      return attrNames;
    }

    get events(): Record<string, string> {
        return this.metadata.events;
    }

    get apis(): Record<string, string> {
        return this.metadata.apis;
    }

    get contextVars(): Record<string, string> {
        return this.metadata.contextVars;
    }

    get allowArbitraryProps(): boolean {
        return this.metadata.allowArbitraryProps;
    }

    get shortDescription(): string {
        return this.metadata.shortDescription;
    }

    getMetadata(): RestrictedComponentMetadata {
        return this.metadata;
    }
}

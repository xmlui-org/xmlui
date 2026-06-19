export type StandaloneExtension = Record<string, unknown>;

export class StandaloneExtensionManager {
  private readonly extensions: StandaloneExtension[] = [];

  registerExtension(extensionOrExtensions: StandaloneExtension | StandaloneExtension[] | undefined): void {
    if (!extensionOrExtensions) {
      return;
    }
    const extensions = Array.isArray(extensionOrExtensions) ? extensionOrExtensions : [extensionOrExtensions];
    this.extensions.push(...extensions);
  }

  listExtensions(): StandaloneExtension[] {
    return [...this.extensions];
  }
}


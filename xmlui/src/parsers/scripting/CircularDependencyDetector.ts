/**
 * Detects circular dependencies in module imports.
 * Maintains a stack of modules currently being resolved.
 */
export class CircularDependencyDetector {
  /**
   * Stack to track imports currently being resolved
   */
  private static importStack: string[] = [];

  /**
   * Adds a module to the import stack
   * @param modulePath The module path being resolved
   */
  static push(modulePath: string): void {
    this.importStack.push(modulePath);
  }

  /**
   * Removes the most recent module from the import stack
   * @returns The removed module path or undefined if stack is empty
   */
  static pop(): string | undefined {
    return this.importStack.pop();
  }

  /**
   * Checks if a module is currently being resolved (circular import)
   * @param modulePath The module path to check
   * @returns The circular import chain if detected, or null
   */
  static checkCircular(modulePath: string): string[] | null {
    const index = this.importStack.indexOf(modulePath);
    if (index !== -1) {
      // Circular import detected - return the chain
      return [...this.importStack.slice(index), modulePath];
    }
    return null;
  }

  /**
   * Resets the import stack (call this when starting a fresh parse)
   */
  static reset(): void {
    this.importStack = [];
  }

  /**
   * Gets the current import stack (useful for debugging)
   * @returns A copy of the current import stack
   */
  static getStack(): string[] {
    return [...this.importStack];
  }

  /**
   * Gets the depth of the import stack
   * @returns Number of modules currently being resolved
   */
  static getDepth(): number {
    return this.importStack.length;
  }
}

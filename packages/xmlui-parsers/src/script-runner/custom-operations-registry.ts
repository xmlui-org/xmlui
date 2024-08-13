/**
 * Represents a registry for custom operations
 */
import type { ICustomOperations } from "./ICustomOperations";

/**
 * Represents the registry of custom operations
 */
interface ICustomOperationsRegistry {
  /**
   * Gets the operation object for the specified type
   * @param key Type key
   * @return Operations object, if found; otherwise, undefined
   */
  getOperationsObjectByKey(key: string): ICustomOperations | undefined;

  /**
   * Gets all registered custom operations
   */
  getAllOperations(): Map<string, ICustomOperations>;
}

/**
 * Represents a registry for custom operations
 */
class CustomOperationsRegistry implements ICustomOperationsRegistry {
  // --- Stores the register objects by their type ID
  private _registry = new Map<string, ICustomOperations>();

  /**
   * Registers the specified calculator
   * @param key Custom data object type
   * @param calculator Calculator instance
   */
  register(key: string, calculator: ICustomOperations): void {
    this._registry.set(key, calculator);
  }

  /**
   * Gets the operation object for the specified type
   * @param key Type key
   * @return Operations object, if found; otherwise, undefined
   */
  getOperationsObjectByKey(key: string): ICustomOperations | undefined {
    return this._registry.get(key);
  }

  /**
   * Gets all registered custom operations
   */
  getAllOperations(): Map<string, ICustomOperations> {
    return new Map<string, ICustomOperations>(this._registry);
  }
}

// --- Register supported types
const internalRegistry = new CustomOperationsRegistry();

/**
 * The singleton instance of our registry
 */
export const customOperationsRegistry: ICustomOperationsRegistry = internalRegistry;

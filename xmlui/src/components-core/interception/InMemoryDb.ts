import type { IDatabase, TableDescriptor } from "./abstractions";

export class InMemoryDb implements IDatabase {
  [key: string]: unknown;

  constructor(
    private tables: Array<TableDescriptor> | undefined,
    private initialData: Record<string, any[]> | (() => Promise<Record<string, any[]>>) = {},
    private config?: any,
  ) {}

  getItems(collectionName: string): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  getItem(collectionName: string, predicate: (item: any) => Promise<boolean>): Promise<any> {
    throw new Error("Method not implemented.");
  }
  getItemById(collectionName: string, id: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  deleteItems(collectionName: string, predicate: (item: any) => Promise<boolean>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  insertItem(collectionName: string, item: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
  updateItem(collectionName: string, item: any): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async initialize() {}
}
